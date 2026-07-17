from flask import Blueprint, request, jsonify
from model.predict import predict, REQUIRED_FEATURES, parse_numeric
from services.groq_service import get_ai_suggestions
from services.groq_recommendation import get_recommendation
import logging

logger = logging.getLogger(__name__)
predict_bp = Blueprint('predict', __name__)


API_TO_LEGACY_FIELDS = {
    "age": "Age",
    "gender": "Gender",
    "blood_pressure_systolic": "SystolicBP",
    "blood_pressure_diastolic": "DiastolicBP",
    "serum_creatinine": "SerumCreatinine",
    "egfr": "GFR",
    "hemoglobin": "HemoglobinLevels",
    "diabetes": "Diabetes",
    "hypertension": "Hypertension",
    "prior_admissions": "PriorAdmissions",
    "length_of_stay": "LengthOfStay",
    "comorbidity_count": "ComorbidityCount",
}


def derive_ckd_stage(gfr_value):
    gfr = parse_numeric(gfr_value)
    if gfr >= 90:
        return 1
    if gfr >= 60:
        return 2
    if gfr >= 30:
        return 3
    if gfr >= 15:
        return 4
    return 5


def normalize_request_payload(raw_data):
    patient_data = dict(raw_data)

    for api_field, legacy_field in API_TO_LEGACY_FIELDS.items():
        api_value = patient_data.get(api_field)
        legacy_value = patient_data.get(legacy_field)

        if (api_value is None or api_value == "") and legacy_value not in (None, ""):
            patient_data[api_field] = legacy_value

        if (legacy_value is None or legacy_value == "") and api_value not in (None, ""):
            patient_data[legacy_field] = api_value

    if patient_data.get("ckd_stage") in (None, ""):
        gfr_value = patient_data.get("egfr", patient_data.get("GFR"))
        patient_data["ckd_stage"] = derive_ckd_stage(gfr_value)

    return patient_data


@predict_bp.route("/predict", methods=["POST"])
def predict_route():
    try:
        request_data = request.json
        if not request_data:
            logger.warning("Prediction request with no data")
            return jsonify({"error": "No data provided"}), 400

        patient_data = normalize_request_payload(request_data)

        # Validate required fields
        missing_fields = [f for f in REQUIRED_FEATURES if f not in patient_data or patient_data[f] == ""]
        if missing_fields:
            logger.warning(f"Missing required fields: {missing_fields}")
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Validate numeric values
        invalid_fields = []
        for field in REQUIRED_FEATURES:
            try:
                parse_numeric(patient_data[field])
            except (ValueError, TypeError):
                invalid_fields.append(field)
        
        if invalid_fields:
            logger.warning(f"Invalid numeric values: {invalid_fields}")
            return jsonify({"error": f"Invalid numeric values in: {', '.join(invalid_fields)}"}), 400

        logger.info(f"Processing prediction for patient data")
        ml_result = predict(patient_data)
        logger.info(f"Prediction result: {ml_result['risk_level']} ({ml_result['probability']}%)")

        # Get top clinical factors from ML result
        top_clinical_factors = ml_result.get("top_clinical_factors", [])
        
        # Generate clinical recommendation using Groq
        clinical_recommendation = get_recommendation(
            risk_score=ml_result['probability'] / 100.0,  # Convert to 0-1 scale
            risk_level=ml_result['risk_level'],
            risk_percentage=ml_result['probability'],
            top_shap_features=top_clinical_factors,
            patient_data=patient_data
        )
        logger.info(f"Clinical recommendation generated: {clinical_recommendation['urgency_level']} urgency")

        # n8n is on hold for now - use Groq for suggestions
        suggestions = get_ai_suggestions(
            risk_level=ml_result["risk_level"],
            probability=ml_result["probability"],
            patient_data=patient_data
        )
        logger.info("Using Groq for AI suggestions")

        return jsonify({
            "risk_level": ml_result["risk_level"],
            "probability": ml_result["probability"],
            "message": ml_result["message"],
            "clinical_assessment": ml_result["clinical_assessment"],
            "top_clinical_factors": top_clinical_factors,
            "clinical_recommendation": clinical_recommendation,
            "suggestions": suggestions
        }), 200

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

