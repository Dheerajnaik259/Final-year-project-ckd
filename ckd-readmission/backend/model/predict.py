import pickle
import json
import math
import numpy as np
import pandas as pd
import logging
from pathlib import Path
import os

logger = logging.getLogger(__name__)

# Load model, scaler, features
model_dir = Path(__file__).parent
downloads_dir = Path(os.path.expanduser("~")) / "Downloads"

# Try to load ckd_hybrid_model.pkl from Downloads first, then fall back to local
hybrid_model_paths = [
    downloads_dir / "ckd_hybrid_model.pkl",
    model_dir / "ckd_hybrid_model.pkl"
]

# Fall back to ckd_model.pkl if hybrid not found
fallback_model_paths = [
    model_dir / "ckd_model.pkl"
]

model = None
model_path = None

# Try hybrid model first
for path in hybrid_model_paths:
    if path.exists():
        try:
            with open(path, "rb") as f:
                model = pickle.load(f)
            model_path = path
            logger.info(f"Loaded hybrid model from: {path}")
            break
        except Exception as e:
            logger.warning(f"Failed to load hybrid model from {path}: {e}")
            continue

# Fall back to original model if hybrid not found
if model is None:
    for path in fallback_model_paths:
        if path.exists():
            try:
                with open(path, "rb") as f:
                    model = pickle.load(f)
                model_path = path
                logger.info(f"Loaded fallback model from: {path}")
                break
            except Exception as e:
                logger.warning(f"Failed to load fallback model from {path}: {e}")
                continue

if model is None:
    raise FileNotFoundError(
        f"No model found. Tried: {hybrid_model_paths + fallback_model_paths}"
    )

# Load scaler
if (model_dir / "scaler.pkl").exists():
    with open(model_dir / "scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
else:
    raise FileNotFoundError(f"Scaler not found at {model_dir / 'scaler.pkl'}")

# Load feature names
if (model_dir / "feature_names.json").exists():
    with open(model_dir / "feature_names.json", "r") as f:
        feature_names = json.load(f)
else:
    raise FileNotFoundError(f"Feature names not found at {model_dir / 'feature_names.json'}")

REQUIRED_FEATURES = feature_names


def parse_numeric(value, default: float = 0.0) -> float:
    """Convert frontend/API values to numeric values the model can consume."""
    if value is None or value == "":
        return default

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"yes", "y", "true"}:
            return 1.0
        if normalized in {"no", "n", "false"}:
            return 0.0
        if normalized == "male":
            return 1.0
        if normalized == "female":
            return 0.0

    return float(value)


def normalize_patient_data(patient_data: dict) -> dict:
    normalized = dict(patient_data)

    diabetes = parse_numeric(normalized.get("Diabetes"), default=0.0)
    if diabetes > 0:
        normalized["AntidiabeticMedications"] = max(
            parse_numeric(normalized.get("AntidiabeticMedications"), default=0.0),
            1.0,
        )

    return normalized


def clinical_severity_score(patient_data: dict) -> int:
    score = 0

    gfr = parse_numeric(patient_data.get("GFR"))
    if 0 < gfr < 15:
        score += 4
    elif 0 < gfr < 30:
        score += 3
    elif 0 < gfr < 45:
        score += 2
    elif 0 < gfr < 60:
        score += 1

    creatinine = parse_numeric(patient_data.get("SerumCreatinine"))
    if creatinine > 3.5:
        score += 3
    elif creatinine > 2.0:
        score += 2
    elif creatinine > 1.5:
        score += 1

    bun = parse_numeric(patient_data.get("BUNLevels"))
    if bun > 40:
        score += 2
    elif bun > 25:
        score += 1

    protein = parse_numeric(patient_data.get("ProteinInUrine"))
    if protein > 1.0:
        score += 2
    elif protein > 0.3:
        score += 1

    potassium = parse_numeric(patient_data.get("SerumElectrolytesPotassium"))
    if potassium > 5.5:
        score += 2
    elif potassium > 5.0:
        score += 1

    sodium = parse_numeric(patient_data.get("SerumElectrolytesSodium"))
    if 0 < sodium < 130:
        score += 2
    elif 0 < sodium < 135:
        score += 1

    hemoglobin = parse_numeric(patient_data.get("HemoglobinLevels"))
    if 0 < hemoglobin < 9:
        score += 2
    elif 0 < hemoglobin < 11:
        score += 1

    systolic_bp = parse_numeric(patient_data.get("SystolicBP"))
    if systolic_bp > 160:
        score += 2
    elif systolic_bp > 140:
        score += 1

    has_diabetes = any(
        parse_numeric(patient_data.get(field)) > 0
        for field in ("Diabetes", "FamilyHistoryDiabetes", "AntidiabeticMedications")
    )
    if has_diabetes:
        score += 1

    if parse_numeric(patient_data.get("Smoking")) > 0:
        score += 1
    if parse_numeric(patient_data.get("PreviousAcuteKidneyInjury")) > 0:
        score += 2
    if parse_numeric(patient_data.get("Edema")) > 0:
        score += 1

    return score


def clinical_probability_floor(score: int) -> float:
    if score >= 12:
        return 0.70
    if score >= 9:
        return 0.60
    if score >= 6:
        return 0.40
    return 0.0


def ckd_gfr_stage(gfr: float) -> dict:
    if gfr <= 0:
        return {"code": "Unknown", "label": "eGFR not available", "range": "N/A"}
    if gfr >= 90:
        return {"code": "G1", "label": "Normal or high kidney function", "range": ">=90"}
    if gfr >= 60:
        return {"code": "G2", "label": "Mildly decreased kidney function", "range": "60-89"}
    if gfr >= 45:
        return {"code": "G3a", "label": "Mildly to moderately decreased kidney function", "range": "45-59"}
    if gfr >= 30:
        return {"code": "G3b", "label": "Moderately to severely decreased kidney function", "range": "30-44"}
    if gfr >= 15:
        return {"code": "G4", "label": "Severely decreased kidney function", "range": "15-29"}
    return {"code": "G5", "label": "Kidney failure range", "range": "<15"}


def albuminuria_category(acr: float) -> dict:
    if acr <= 0:
        return {
            "code": "Unknown",
            "label": "Urine ACR not available",
            "range": "Enter ACR in mg/g",
        }
    if acr < 30:
        return {"code": "A1", "label": "Normal to mildly increased albuminuria", "range": "<30 mg/g"}
    if acr <= 300:
        return {"code": "A2", "label": "Moderately increased albuminuria", "range": "30-300 mg/g"}
    return {"code": "A3", "label": "Severely increased albuminuria", "range": ">300 mg/g"}


def kdigo_risk_level(gfr_stage: str, albuminuria: str) -> str:
    risk_matrix = {
        "G1": {"A1": "Low", "A2": "Moderately increased", "A3": "High"},
        "G2": {"A1": "Low", "A2": "Moderately increased", "A3": "High"},
        "G3a": {"A1": "Moderately increased", "A2": "High", "A3": "Very high"},
        "G3b": {"A1": "High", "A2": "Very high", "A3": "Very high"},
        "G4": {"A1": "High", "A2": "Very high", "A3": "Very high"},
        "G5": {"A1": "Very high", "A2": "Very high", "A3": "Very high"},
    }
    if gfr_stage == "Unknown" or albuminuria == "Unknown":
        return "Needs ACR for full KDIGO risk"
    return risk_matrix.get(gfr_stage, {}).get(albuminuria, "Needs review")


def kfre_4_variable(patient_data: dict) -> dict:
    age = parse_numeric(patient_data.get("Age"))
    male = 1.0 if parse_numeric(patient_data.get("Gender")) == 1 else 0.0
    gfr = parse_numeric(patient_data.get("GFR"))
    acr = parse_numeric(patient_data.get("ACR"))

    if not (age > 0 and 0 < gfr < 60 and acr > 0):
        return {
            "applicable": False,
            "reason": "KFRE needs age, sex, eGFR <60, and urine ACR in mg/g.",
        }

    linear_predictor = (
        -0.2201 * ((age / 10.0) - 7.036)
        + 0.2467 * (male - 0.5642)
        - 0.5567 * ((gfr / 5.0) - 7.222)
        + 0.4510 * (math.log(acr) - 5.137)
    )

    risk_2_year = 1 - math.pow(0.9832, math.exp(linear_predictor))
    risk_5_year = 1 - math.pow(0.9365, math.exp(linear_predictor))

    return {
        "applicable": True,
        "risk_2_year": round(risk_2_year * 100, 2),
        "risk_5_year": round(risk_5_year * 100, 2),
        "calibration": "4-variable KFRE, non-North America baseline",
        "outcome": "Kidney failure risk, not readmission risk",
    }


def validation_warnings(patient_data: dict) -> list:
    ranges = {
        "Age": (18, 100, "years"),
        "BMI": (10, 60, "kg/m2"),
        "SystolicBP": (70, 260, "mmHg"),
        "DiastolicBP": (40, 160, "mmHg"),
        "SerumCreatinine": (0.2, 15, "mg/dL"),
        "GFR": (1, 150, "mL/min/1.73m2"),
        "BUNLevels": (2, 200, "mg/dL"),
        "HbA1c": (3, 16, "%"),
        "FastingBloodSugar": (40, 600, "mg/dL"),
        "HemoglobinLevels": (3, 20, "g/dL"),
        "ProteinInUrine": (0, 20, "g/day"),
        "ACR": (0, 5000, "mg/g"),
        "SerumElectrolytesPotassium": (2, 8, "mEq/L"),
        "SerumElectrolytesSodium": (110, 170, "mEq/L"),
        "CholesterolTotal": (50, 500, "mg/dL"),
    }

    warnings = []
    for field, (low, high, unit) in ranges.items():
        value = parse_numeric(patient_data.get(field))
        if value < low or value > high:
            warnings.append(f"{field} value {value:g} is outside the expected range ({low}-{high} {unit}).")
    return warnings


def clinical_flags(patient_data: dict) -> list:
    flags = []
    gfr = parse_numeric(patient_data.get("GFR"))
    potassium = parse_numeric(patient_data.get("SerumElectrolytesPotassium"))
    systolic_bp = parse_numeric(patient_data.get("SystolicBP"))
    diastolic_bp = parse_numeric(patient_data.get("DiastolicBP"))
    hemoglobin = parse_numeric(patient_data.get("HemoglobinLevels"))
    sodium = parse_numeric(patient_data.get("SerumElectrolytesSodium"))
    acr = parse_numeric(patient_data.get("ACR"))

    if potassium >= 5.5:
        flags.append("High potassium flag: potassium is 5.5 mEq/L or above.")
    if 0 < gfr < 30:
        flags.append("Advanced CKD flag: eGFR is below 30.")
    if systolic_bp >= 180 or diastolic_bp >= 120:
        flags.append("Severe blood pressure flag: BP is in crisis range.")
    elif systolic_bp >= 140 or diastolic_bp >= 90:
        flags.append("Hypertension flag: BP is above usual treatment target.")
    if 0 < hemoglobin < 10:
        flags.append("Anemia flag: hemoglobin is below 10 g/dL.")
    if 0 < sodium < 135:
        flags.append("Low sodium flag: sodium is below 135 mEq/L.")
    if acr >= 300:
        flags.append("Severe albuminuria flag: ACR is above 300 mg/g.")

    return flags


def clinical_assessment(patient_data: dict, model_probability: float, probability: float, severity_score: int) -> dict:
    gfr_stage = ckd_gfr_stage(parse_numeric(patient_data.get("GFR")))
    albuminuria = albuminuria_category(parse_numeric(patient_data.get("ACR")))
    floor = clinical_probability_floor(severity_score)

    return {
        "ckd_stage": gfr_stage,
        "albuminuria": albuminuria,
        "kdigo_risk": kdigo_risk_level(gfr_stage["code"], albuminuria["code"]),
        "severity_score": severity_score,
        "model_probability": round(model_probability * 100, 2),
        "clinical_floor": round(floor * 100, 2),
        "final_probability": round(probability * 100, 2),
        "kfre": kfre_4_variable(patient_data),
        "clinical_flags": clinical_flags(patient_data),
        "validation_warnings": validation_warnings(patient_data),
        "note": "Clinical context is for project decision-support only and does not replace clinician review.",
    }


def extract_top_clinical_risk_factors(patient_data: dict, num_factors: int = 5) -> list:
    """
    Extract top clinical risk factors contributing to readmission based on:
    1. Out-of-range clinical values
    2. Clinical severity scoring
    
    Returns list of dicts with: feature, value, impact (0.0-1.0)
    """
    risk_factors = []
    
    # Define clinical risk factors with scoring weights
    clinical_markers = {
        "SerumCreatinine": {
            "normal_range": (0.6, 1.2),
            "value": parse_numeric(patient_data.get("SerumCreatinine")),
            "weight": 0.25  # High importance
        },
        "GFR": {
            "normal_range": (60, 150),
            "value": parse_numeric(patient_data.get("GFR")),
            "weight": 0.25,
            "inverse": True  # Lower is worse
        },
        "SerumElectrolytesPotassium": {
            "normal_range": (3.5, 5.0),
            "value": parse_numeric(patient_data.get("SerumElectrolytesPotassium")),
            "weight": 0.15
        },
        "BUNLevels": {
            "normal_range": (7, 20),
            "value": parse_numeric(patient_data.get("BUNLevels")),
            "weight": 0.15
        },
        "HemoglobinLevels": {
            "normal_range": (12, 17),
            "value": parse_numeric(patient_data.get("HemoglobinLevels")),
            "weight": 0.10,
            "inverse": True
        },
        "ProteinInUrine": {
            "normal_range": (0, 0.15),
            "value": parse_numeric(patient_data.get("ProteinInUrine")),
            "weight": 0.10
        },
        "ACR": {
            "normal_range": (0, 30),
            "value": parse_numeric(patient_data.get("ACR")),
            "weight": 0.10
        },
        "SystolicBP": {
            "normal_range": (90, 130),
            "value": parse_numeric(patient_data.get("SystolicBP")),
            "weight": 0.08
        }
    }
    
    # Calculate deviation score for each marker
    for feature_name, marker_info in clinical_markers.items():
        value = marker_info["value"]
        normal_min, normal_max = marker_info["normal_range"]
        weight = marker_info["weight"]
        is_inverse = marker_info.get("inverse", False)
        
        if value <= 0:
            continue  # Skip missing values
        
        # Calculate how far from normal range
        if value < normal_min:
            deviation = (normal_min - value) / normal_min if normal_min != 0 else 0
        elif value > normal_max:
            deviation = (value - normal_max) / normal_max if normal_max != 0 else 0
        else:
            deviation = 0
        
        if is_inverse:
            deviation = max(0, 1 - (value / normal_max))
        
        # Impact score combines weight and deviation
        impact_score = min(weight * (1 + abs(deviation)), 1.0)
        
        if deviation > 0 or impact_score > 0.05:
            risk_factors.append({
                "feature": feature_name,
                "value": round(value, 2),
                "impact": round(impact_score, 3)
            })
    
    # Sort by impact and return top N
    risk_factors.sort(key=lambda x: x["impact"], reverse=True)
    return risk_factors[:num_factors]


def predict(patient_data: dict) -> dict:
    """
    patient_data: dict with all feature keys
    Returns: { risk_level, probability, features_used, top_clinical_factors }
    """
    try:
        patient_data = normalize_patient_data(patient_data)

        # Build input array in correct order
        input_values = [parse_numeric(patient_data.get(feat)) for feat in feature_names]
        input_frame = pd.DataFrame([input_values], columns=feature_names)

        # Scale
        input_scaled = scaler.transform(input_frame)

        # Predict
        model_probability = model.predict_proba(input_scaled)[0][1]
        severity_score = clinical_severity_score(patient_data)
        probability = max(model_probability, clinical_probability_floor(severity_score))

        # Risk level
        if probability >= 0.70:
            risk_level = "High"
        elif probability >= 0.40:
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
        
        logger.info(f"Prediction generated: {risk_level} risk at {result['probability']}%")
        return result
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise


def get_message(risk_level: str) -> str:
    messages = {
        "High": "High risk of CKD readmission. Immediate lifestyle changes recommended.",
        "Medium": "Moderate risk. Monitor regularly and follow diet guidelines.",
        "Low": "Low risk. Maintain healthy habits and schedule routine checkups."
    }
    return messages[risk_level]


# ─── Test Example ──────────────────────────────────────────────────
if __name__ == "__main__":
    sample_patient = {
        "Age": 65,
        "Gender": 1,
        "Ethnicity": 0,
        "SocioeconomicStatus": 1,
        "EducationLevel": 2,
        "BMI": 28.5,
        "Smoking": 1,
        "AlcoholConsumption": 2.0,
        "PhysicalActivity": 3.0,
        "DietQuality": 4.0,
        "SleepQuality": 6.0,
        "FamilyHistoryKidneyDisease": 1,
        "FamilyHistoryHypertension": 1,
        "FamilyHistoryDiabetes": 0,
        "PreviousAcuteKidneyInjury": 1,
        "UrinaryTractInfections": 1,
        "SystolicBP": 145,
        "DiastolicBP": 90,
        "FastingBloodSugar": 110.0,
        "HbA1c": 7.2,
        "SerumCreatinine": 2.1,
        "BUNLevels": 25.0,
        "GFR": 45.0,
        "ProteinInUrine": 0.5,
        "ACR": 35.0,
        "SerumElectrolytesSodium": 138.0,
        "SerumElectrolytesPotassium": 4.5,
        "SerumElectrolytesCalcium": 9.0,
        "SerumElectrolytesPhosphorus": 4.0,
        "HemoglobinLevels": 11.0,
        "CholesterolTotal": 210.0,
        "CholesterolLDL": 130.0,
        "CholesterolHDL": 45.0,
        "CholesterolTriglycerides": 180.0,
        "ACEInhibitors": 1,
        "Diuretics": 0,
        "NSAIDsUse": 0.0,
        "Statins": 1,
        "AntidiabeticMedications": 0,
        "Edema": 1,
        "FatigueLevels": 6.0,
        "NauseaVomiting": 2.0,
        "MuscleCramps": 3.0,
        "Itching": 4.0,
        "QualityOfLifeScore": 55.0,
        "HeavyMetalsExposure": 0,
        "OccupationalExposureChemicals": 0,
        "WaterQuality": 1,
        "MedicalCheckupsFrequency": 2.0,
        "MedicationAdherence": 7.0,
        "HealthLiteracy": 5.0
    }

    result = predict(sample_patient)
    print("Prediction Result:")
    print(f"  Risk Level  : {result['risk_level']}")
    print(f"  Probability : {result['probability']}%")
    print(f"  Message     : {result['message']}")
