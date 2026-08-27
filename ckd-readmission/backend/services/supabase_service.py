"""
Supabase service for persisting predictions and retrieving history.
Gracefully degrades if Supabase is not configured — the app never breaks.
"""

import os
import logging
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_client = None


def _get_client():
    """Lazy-initialise the Supabase client."""
    global _client
    if _client is not None:
        return _client

    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase not configured (SUPABASE_URL / SUPABASE_KEY missing)")
        return None

    try:
        from supabase import create_client
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialised: %s", SUPABASE_URL)
        return _client
    except Exception as exc:
        logger.error("Failed to initialise Supabase client: %s", exc)
        return None


def save_prediction(patient_data: Dict, result: Dict) -> Optional[str]:
    """
    Insert a prediction record into Supabase.
    Returns the prediction UUID on success, None on failure.
    """
    client = _get_client()
    if client is None:
        return None

    try:
        assessment = result.get("clinical_assessment", {})

        row = {
            "patient_age": int(patient_data.get("age", patient_data.get("Age", 0))),
            "patient_gender": int(patient_data.get("gender", patient_data.get("Gender", 0))),
            "risk_level": result.get("risk_level", "Unknown"),
            "probability": float(result.get("probability", 0)),
            "ckd_stage": assessment.get("ckd_stage", {}).get("code", ""),
            "kdigo_risk": assessment.get("kdigo_risk", ""),
            "severity_score": int(assessment.get("severity_score", 0)),
            "top_factors": result.get("top_clinical_factors", []),
            "clinical_recommendation": result.get("clinical_recommendation", {}),
            "patient_data": patient_data,
            "full_result": result,
        }

        response = client.table("predictions").insert(row).execute()

        if response.data and len(response.data) > 0:
            prediction_id = response.data[0].get("id")
            logger.info("Prediction saved to Supabase: %s", prediction_id)
            return prediction_id

        logger.warning("Supabase insert returned no data")
        return None

    except Exception as exc:
        logger.error("Failed to save prediction to Supabase: %s", exc, exc_info=True)
        return None


def get_predictions(limit: int = 20, offset: int = 0) -> List[Dict]:
    """
    Fetch recent predictions, newest first.
    Returns empty list if Supabase is unavailable.
    """
    client = _get_client()
    if client is None:
        return []

    try:
        response = (
            client.table("predictions")
            .select(
                "id, created_at, patient_age, patient_gender, "
                "risk_level, probability, ckd_stage, kdigo_risk, severity_score"
            )
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return response.data or []

    except Exception as exc:
        logger.error("Failed to fetch predictions: %s", exc)
        return []


def get_prediction_by_id(prediction_id: str) -> Optional[Dict]:
    """
    Fetch full details of a single prediction by UUID.
    Returns None if not found or Supabase is unavailable.
    """
    client = _get_client()
    if client is None:
        return None

    try:
        response = (
            client.table("predictions")
            .select("*")
            .eq("id", prediction_id)
            .single()
            .execute()
        )
        return response.data

    except Exception as exc:
        logger.error("Failed to fetch prediction %s: %s", prediction_id, exc)
        return None
