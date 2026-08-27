"""Prediction engine. Clinical scoring lives in model.clinical; artifacts load lazily."""

from __future__ import annotations

import logging

import pandas as pd

from config.clinical_constants import RISK_LEVEL_THRESHOLDS as RISK_THRESHOLDS
from model.clinical import (
    clinical_assessment,
    clinical_probability_floor,
    clinical_severity_score,
    extract_top_clinical_risk_factors,
    normalize_patient_data,
    parse_numeric,
)
from model.loader import load_artifacts, load_feature_names

logger = logging.getLogger(__name__)

REQUIRED_FEATURES = load_feature_names()


def predict(patient_data: dict) -> dict:
    """
    patient_data: dict with all feature keys
    Returns: { risk_level, probability, features_used, top_clinical_factors }
    """
    try:
        model, scaler, feature_names = load_artifacts()
        patient_data = normalize_patient_data(patient_data)

        input_values = [parse_numeric(patient_data.get(feat)) for feat in feature_names]
        input_frame = pd.DataFrame([input_values], columns=feature_names)
        input_scaled = scaler.transform(input_frame)

        model_probability = model.predict_proba(input_scaled)[0][1]
        severity_score = clinical_severity_score(patient_data)
        probability = max(model_probability, clinical_probability_floor(severity_score))

        if probability >= RISK_THRESHOLDS["high"]:
            risk_level = "High"
        elif probability >= RISK_THRESHOLDS["medium"]:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        result = {
            "risk_level": risk_level,
            "probability": round(float(probability) * 100, 2),
            "message": get_message(risk_level),
            "clinical_assessment": clinical_assessment(
                patient_data,
                model_probability,
                probability,
                severity_score,
            ),
            "top_clinical_factors": extract_top_clinical_risk_factors(patient_data, num_factors=5),
        }

        logger.info("Prediction generated: %s risk at %s%%", risk_level, result["probability"])
        return result

    except Exception as exc:
        logger.error("Prediction error: %s", exc, exc_info=True)
        raise


def get_message(risk_level: str) -> str:
    messages = {
        "High": "High risk of CKD readmission. Immediate lifestyle changes recommended.",
        "Medium": "Moderate risk. Monitor regularly and follow diet guidelines.",
        "Low": "Low risk. Maintain healthy habits and schedule routine checkups.",
    }
    return messages[risk_level]


if __name__ == "__main__":
    sample_patient = {
        "Age": 65,
        "age": 65,
        "Gender": 1,
        "gender": 1,
        "BMI": 28.5,
        "Smoking": 1,
        "SystolicBP": 145,
        "blood_pressure_systolic": 145,
        "DiastolicBP": 90,
        "blood_pressure_diastolic": 90,
        "FastingBloodSugar": 110.0,
        "HbA1c": 7.2,
        "SerumCreatinine": 2.1,
        "serum_creatinine": 2.1,
        "BUNLevels": 25.0,
        "GFR": 45.0,
        "egfr": 45.0,
        "ProteinInUrine": 0.5,
        "ACR": 35.0,
        "SerumElectrolytesSodium": 138.0,
        "SerumElectrolytesPotassium": 4.5,
        "HemoglobinLevels": 11.0,
        "hemoglobin": 11.0,
        "CholesterolTotal": 210.0,
        "diabetes": 0,
        "Diabetes": 0,
        "hypertension": 1,
        "Hypertension": 1,
        "prior_admissions": 1,
        "PriorAdmissions": 1,
        "length_of_stay": 5,
        "LengthOfStay": 5,
        "comorbidity_count": 2,
        "ComorbidityCount": 2,
        "ckd_stage": 3,
        "PreviousAcuteKidneyInjury": 1,
        "Edema": 1,
    }

    result = predict(sample_patient)
    print("Prediction Result:")
    print(f"  Risk Level  : {result['risk_level']}")
    print(f"  Probability : {result['probability']}%")
    print(f"  Message     : {result['message']}")
