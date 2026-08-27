from __future__ import annotations

import math

from config.clinical_constants import (
    BUN_SEVERITY,
    CLINICAL_FLAGS,
    CLINICAL_MARKERS,
    CREATININE_SEVERITY,
    FIELD_RANGES,
    GFR_SEVERITY,
    HEMOGLOBIN_SEVERITY,
    KDIGO_RISK_MATRIX,
    KFRE,
    POTASSIUM_SEVERITY,
    PROBABILITY_FLOORS,
    PROTEIN_SEVERITY,
    SEVERITY_POINTS,
    SODIUM_SEVERITY,
    SYSTOLIC_SEVERITY,
)


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
    if 0 < gfr < GFR_SEVERITY["kidney_failure"]:
        score += SEVERITY_POINTS["gfr_kidney_failure"]
    elif 0 < gfr < GFR_SEVERITY["severe"]:
        score += SEVERITY_POINTS["gfr_severe"]
    elif 0 < gfr < GFR_SEVERITY["moderate"]:
        score += SEVERITY_POINTS["gfr_moderate"]
    elif 0 < gfr < GFR_SEVERITY["mild"]:
        score += SEVERITY_POINTS["gfr_mild"]

    creatinine = parse_numeric(patient_data.get("SerumCreatinine"))
    if creatinine > CREATININE_SEVERITY["severe"]:
        score += SEVERITY_POINTS["creatinine_severe"]
    elif creatinine > CREATININE_SEVERITY["moderate"]:
        score += SEVERITY_POINTS["creatinine_moderate"]
    elif creatinine > CREATININE_SEVERITY["mild"]:
        score += SEVERITY_POINTS["creatinine_mild"]

    bun = parse_numeric(patient_data.get("BUNLevels"))
    if bun > BUN_SEVERITY["high"]:
        score += SEVERITY_POINTS["bun_high"]
    elif bun > BUN_SEVERITY["elevated"]:
        score += SEVERITY_POINTS["bun_elevated"]

    protein = parse_numeric(patient_data.get("ProteinInUrine"))
    if protein > PROTEIN_SEVERITY["high"]:
        score += SEVERITY_POINTS["protein_high"]
    elif protein > PROTEIN_SEVERITY["elevated"]:
        score += SEVERITY_POINTS["protein_elevated"]

    potassium = parse_numeric(patient_data.get("SerumElectrolytesPotassium"))
    if potassium > POTASSIUM_SEVERITY["high"]:
        score += SEVERITY_POINTS["potassium_high"]
    elif potassium > POTASSIUM_SEVERITY["elevated"]:
        score += SEVERITY_POINTS["potassium_elevated"]

    sodium = parse_numeric(patient_data.get("SerumElectrolytesSodium"))
    if 0 < sodium < SODIUM_SEVERITY["very_low"]:
        score += SEVERITY_POINTS["sodium_very_low"]
    elif 0 < sodium < SODIUM_SEVERITY["low"]:
        score += SEVERITY_POINTS["sodium_low"]

    hemoglobin = parse_numeric(patient_data.get("HemoglobinLevels"))
    if 0 < hemoglobin < HEMOGLOBIN_SEVERITY["severe"]:
        score += SEVERITY_POINTS["hemoglobin_severe"]
    elif 0 < hemoglobin < HEMOGLOBIN_SEVERITY["low"]:
        score += SEVERITY_POINTS["hemoglobin_low"]

    systolic_bp = parse_numeric(patient_data.get("SystolicBP"))
    if systolic_bp > SYSTOLIC_SEVERITY["severe"]:
        score += SEVERITY_POINTS["systolic_severe"]
    elif systolic_bp > SYSTOLIC_SEVERITY["elevated"]:
        score += SEVERITY_POINTS["systolic_elevated"]

    has_diabetes = any(
        parse_numeric(patient_data.get(field)) > 0
        for field in ("Diabetes", "FamilyHistoryDiabetes", "AntidiabeticMedications")
    )
    if has_diabetes:
        score += SEVERITY_POINTS["diabetes"]

    if parse_numeric(patient_data.get("Smoking")) > 0:
        score += SEVERITY_POINTS["smoking"]
    if parse_numeric(patient_data.get("PreviousAcuteKidneyInjury")) > 0:
        score += SEVERITY_POINTS["previous_aki"]
    if parse_numeric(patient_data.get("Edema")) > 0:
        score += SEVERITY_POINTS["edema"]

    return score


def clinical_probability_floor(score: int) -> float:
    for threshold, floor in sorted(PROBABILITY_FLOORS.items(), reverse=True):
        if score >= threshold:
            return floor
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
    if gfr_stage == "Unknown" or albuminuria == "Unknown":
        return "Needs ACR for full KDIGO risk"
    return KDIGO_RISK_MATRIX.get(gfr_stage, {}).get(albuminuria, "Needs review")


def kfre_4_variable(patient_data: dict) -> dict:
    age = parse_numeric(patient_data.get("Age"))
    male = 1.0 if parse_numeric(patient_data.get("Gender")) == 1 else 0.0
    gfr = parse_numeric(patient_data.get("GFR"))
    acr = parse_numeric(patient_data.get("ACR"))

    if not (age > 0 and 0 < gfr < KFRE["max_gfr"] and acr > 0):
        return {
            "applicable": False,
            "reason": "KFRE needs age, sex, eGFR <60, and urine ACR in mg/g.",
        }

    linear_predictor = (
        KFRE["age_coef"] * ((age / 10.0) - KFRE["age_center"])
        + KFRE["male_coef"] * (male - KFRE["male_center"])
        + KFRE["gfr_coef"] * ((gfr / 5.0) - KFRE["gfr_center"])
        + KFRE["acr_coef"] * (math.log(acr) - KFRE["acr_center"])
    )

    risk_2_year = 1 - math.pow(KFRE["survival_2y"], math.exp(linear_predictor))
    risk_5_year = 1 - math.pow(KFRE["survival_5y"], math.exp(linear_predictor))

    return {
        "applicable": True,
        "risk_2_year": round(risk_2_year * 100, 2),
        "risk_5_year": round(risk_5_year * 100, 2),
        "calibration": "4-variable KFRE, non-North America baseline",
        "outcome": "Kidney failure risk, not readmission risk",
    }


def validation_warnings(patient_data: dict) -> list:
    warnings = []
    for field, (low, high, unit) in FIELD_RANGES.items():
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

    if potassium >= CLINICAL_FLAGS["potassium_high"]:
        flags.append("High potassium flag: potassium is 5.5 mEq/L or above.")
    if 0 < gfr < CLINICAL_FLAGS["gfr_advanced"]:
        flags.append("Advanced CKD flag: eGFR is below 30.")
    if systolic_bp >= CLINICAL_FLAGS["bp_crisis_sys"] or diastolic_bp >= CLINICAL_FLAGS["bp_crisis_dia"]:
        flags.append("Severe blood pressure flag: BP is in crisis range.")
    elif systolic_bp >= CLINICAL_FLAGS["hypertension_sys"] or diastolic_bp >= CLINICAL_FLAGS["hypertension_dia"]:
        flags.append("Hypertension flag: BP is above usual treatment target.")
    if 0 < hemoglobin < CLINICAL_FLAGS["anemia"]:
        flags.append("Anemia flag: hemoglobin is below 10 g/dL.")
    if 0 < sodium < CLINICAL_FLAGS["hyponatremia"]:
        flags.append("Low sodium flag: sodium is below 135 mEq/L.")
    if acr >= CLINICAL_FLAGS["severe_albuminuria"]:
        flags.append("Severe albuminuria flag: ACR is above 300 mg/g.")

    return flags


def clinical_assessment(
    patient_data: dict, model_probability: float, probability: float, severity_score: int
) -> dict:
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
    risk_factors = []

    for feature_name, marker_info in CLINICAL_MARKERS.items():
        value = parse_numeric(patient_data.get(feature_name))
        normal_min, normal_max = marker_info["normal_range"]
        weight = marker_info["weight"]
        is_inverse = marker_info.get("inverse", False)

        if value <= 0:
            continue

        if value < normal_min:
            deviation = (normal_min - value) / normal_min if normal_min != 0 else 0
        elif value > normal_max:
            deviation = (value - normal_max) / normal_max if normal_max != 0 else 0
        else:
            deviation = 0

        if is_inverse:
            deviation = max(0, 1 - (value / normal_max))

        impact_score = min(weight * (1 + abs(deviation)), 1.0)

        if deviation > 0 or impact_score > 0.05:
            risk_factors.append(
                {
                    "feature": feature_name,
                    "value": round(value, 2),
                    "impact": round(impact_score, 3),
                }
            )

    risk_factors.sort(key=lambda item: item["impact"], reverse=True)
    return risk_factors[:num_factors]
