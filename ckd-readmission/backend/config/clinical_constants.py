import json
from pathlib import Path

_CONFIG_PATH = Path(__file__).resolve().parents[2] / "shared" / "clinical_config.json"

with _CONFIG_PATH.open("r", encoding="utf-8") as handle:
    CLINICAL_CONFIG = json.load(handle)

VALIDATION_RANGES = CLINICAL_CONFIG["validation_ranges"]
FIELD_ALIASES = CLINICAL_CONFIG["field_aliases"]
API_TO_LEGACY_FIELDS = FIELD_ALIASES
RISK_LEVEL_THRESHOLDS = CLINICAL_CONFIG["risk_level"]
CLINICAL_MARKERS = CLINICAL_CONFIG["clinical_markers"]
KFRE_COEFFICIENTS = CLINICAL_CONFIG["kfre"]

FIELD_RANGES = {
    key: (val["min"], val["max"], val.get("unit", ""))
    for key, val in VALIDATION_RANGES.items()
}

PROBABILITY_FLOORS = {
    item["min_score"]: item["floor"]
    for item in CLINICAL_CONFIG.get("probability_floors", [])
}

GFR_SEVERITY = {"kidney_failure": 15, "severe": 30, "moderate": 45, "mild": 60}
CREATININE_SEVERITY = {"severe": 3.5, "moderate": 2.0, "mild": 1.5}
BUN_SEVERITY = {"high": 40, "elevated": 25}
PROTEIN_SEVERITY = {"high": 1.0, "elevated": 0.3}
POTASSIUM_SEVERITY = {"high": 5.5, "elevated": 5.0}
SODIUM_SEVERITY = {"very_low": 130, "low": 135}
HEMOGLOBIN_SEVERITY = {"severe": 9, "low": 11}
SYSTOLIC_SEVERITY = {"severe": 160, "elevated": 140}

SEVERITY_POINTS = {
    "gfr_kidney_failure": 4,
    "gfr_severe": 3,
    "gfr_moderate": 2,
    "gfr_mild": 1,
    "creatinine_severe": 3,
    "creatinine_moderate": 2,
    "creatinine_mild": 1,
    "bun_high": 2,
    "bun_elevated": 1,
    "protein_high": 2,
    "protein_elevated": 1,
    "potassium_high": 2,
    "potassium_elevated": 1,
    "sodium_very_low": 2,
    "sodium_low": 1,
    "hemoglobin_severe": 2,
    "hemoglobin_low": 1,
    "systolic_severe": 2,
    "systolic_elevated": 1,
    "diabetes": 1,
    "smoking": 1,
    "previous_aki": 1,
    "edema": 1,
}

CLINICAL_FLAGS = {
    "potassium_high": 5.5,
    "gfr_advanced": 30,
    "bp_crisis_sys": 180,
    "bp_crisis_dia": 120,
    "hypertension_sys": 140,
    "hypertension_dia": 90,
    "anemia": 10,
    "hyponatremia": 135,
    "severe_albuminuria": 300,
}

KFRE = {
    "max_gfr": 60,
    "age_coef": KFRE_COEFFICIENTS.get("age_coef", -0.2201),
    "age_center": KFRE_COEFFICIENTS.get("age_center", 7.036),
    "male_coef": KFRE_COEFFICIENTS.get("male_coef", 0.2467),
    "male_center": KFRE_COEFFICIENTS.get("male_center", 0.5642),
    "gfr_coef": KFRE_COEFFICIENTS.get("gfr_coef", -0.5567),
    "gfr_center": KFRE_COEFFICIENTS.get("gfr_center", 7.222),
    "acr_coef": KFRE_COEFFICIENTS.get("acr_coef", 0.451),
    "acr_center": KFRE_COEFFICIENTS.get("acr_center", 5.137),
    "survival_2y": KFRE_COEFFICIENTS.get("baseline_2_year", 0.9832),
    "survival_5y": KFRE_COEFFICIENTS.get("baseline_5_year", 0.9365),
}

KDIGO_RISK_MATRIX = {
    "G1": {"A1": "Low", "A2": "Moderately increased", "A3": "High"},
    "G2": {"A1": "Low", "A2": "Moderately increased", "A3": "High"},
    "G3a": {"A1": "Moderately increased", "A2": "High", "A3": "Very high"},
    "G3b": {"A1": "High", "A2": "Very high", "A3": "Very high"},
    "G4": {"A1": "High", "A2": "Very high", "A3": "Very high"},
    "G5": {"A1": "Very high", "A2": "Very high", "A3": "Very high"},
}
