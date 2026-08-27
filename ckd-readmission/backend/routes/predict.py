from flask import Blueprint, request, jsonify
from auth.jwt_guard import require_auth
from model.predict import predict
from schemas.patient import PayloadValidationError, parse_patient_payload
from services.groq_service import get_ai_suggestions
from services.groq_recommendation import get_recommendation
from services.supabase_service import save_prediction
import logging

logger = logging.getLogger(__name__)
predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
@require_auth
def predict_route():
    try:
        request_data = request.json
        if not request_data:
            logger.warning("Prediction request with no data")
            return jsonify({"error": "No data provided"}), 400

        try:
            patient_data = parse_patient_payload(request_data)
        except PayloadValidationError as exc:
            logger.warning("Invalid prediction payload: %s", exc)
            return jsonify({"error": str(exc), "details": exc.errors}), 400

        logger.info("Processing prediction for patient data")
        ml_result = predict(patient_data)
        logger.info("Prediction result: %s (%s%%)", ml_result["risk_level"], ml_result["probability"])

        top_clinical_factors = ml_result.get("top_clinical_factors", [])

        clinical_recommendation = get_recommendation(
            risk_score=ml_result["probability"] / 100.0,
            risk_level=ml_result["risk_level"],
            risk_percentage=ml_result["probability"],
            top_shap_features=top_clinical_factors,
            patient_data=patient_data,
        )
        logger.info(
            "Clinical recommendation generated: %s urgency",
            clinical_recommendation["urgency_level"],
        )

        suggestions = get_ai_suggestions(
            risk_level=ml_result["risk_level"],
            probability=ml_result["probability"],
            patient_data=patient_data,
        )
        logger.info("Using Groq for AI suggestions")

        response_data = {
            "risk_level": ml_result["risk_level"],
            "probability": ml_result["probability"],
            "message": ml_result["message"],
            "clinical_assessment": ml_result["clinical_assessment"],
            "top_clinical_factors": top_clinical_factors,
            "clinical_recommendation": clinical_recommendation,
            "suggestions": suggestions,
        }

        # Save to Supabase (non-blocking — failures are logged, never returned)
        user_id = request_data.get("user_id")
        prediction_id = save_prediction(patient_data, response_data, user_id=user_id)
        if prediction_id:
            response_data["prediction_id"] = prediction_id

        return jsonify(response_data), 200

    except Exception as exc:
        logger.error("Prediction error: %s", exc, exc_info=True)
        return jsonify({"error": str(exc)}), 500
