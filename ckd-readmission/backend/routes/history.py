from flask import Blueprint, jsonify, request
import logging

from services.supabase_service import get_predictions, get_prediction_by_id

logger = logging.getLogger(__name__)
history_bp = Blueprint("history", __name__)


@history_bp.route("/history", methods=["GET"])
def list_predictions():
    """Return paginated list of recent predictions."""
    try:
        limit = min(int(request.args.get("limit", 20)), 100)
        offset = max(int(request.args.get("offset", 0)), 0)
    except (ValueError, TypeError):
        limit, offset = 20, 0

    predictions = get_predictions(limit=limit, offset=offset)
    return jsonify({"predictions": predictions, "count": len(predictions)}), 200


@history_bp.route("/history/<prediction_id>", methods=["GET"])
def get_prediction_detail(prediction_id):
    """Return full details for a single prediction."""
    prediction = get_prediction_by_id(prediction_id)

    if prediction is None:
        return jsonify({"error": "Prediction not found"}), 404

    # If full_result is stored, return it formatted for ResultCard
    if "full_result" in prediction and prediction["full_result"]:
        full_res = dict(prediction["full_result"])
        full_res["prediction_id"] = prediction["id"]
        full_res["created_at"] = prediction["created_at"]
        return jsonify(full_res), 200

    # Fallback formatting for older entries
    fallback = {
        "prediction_id": prediction["id"],
        "created_at": prediction.get("created_at"),
        "risk_level": prediction.get("risk_level", "Unknown"),
        "probability": prediction.get("probability", 0),
        "message": f"{prediction.get('risk_level', 'Unknown')} risk CKD readmission assessment.",
        "top_clinical_factors": prediction.get("top_factors", []),
        "clinical_recommendation": prediction.get("clinical_recommendation", {}),
        "clinical_assessment": {
            "ckd_stage": {"code": prediction.get("ckd_stage", "Unknown")},
            "kdigo_risk": prediction.get("kdigo_risk", "N/A"),
            "severity_score": prediction.get("severity_score", 0),
        },
    }
    return jsonify(fallback), 200
