import json
from pathlib import Path

_CONFIG_PATH = Path(__file__).resolve().parents[2] / "shared" / "clinical_config.json"

with _CONFIG_PATH.open("r", encoding="utf-8") as handle:
    CLINICAL_CONFIG = json.load(handle)

VALIDATION_RANGES = CLINICAL_CONFIG["validation_ranges"]
FIELD_ALIASES = CLINICAL_CONFIG["field_aliases"]
RISK_LEVEL_THRESHOLDS = CLINICAL_CONFIG["risk_level"]
PROBABILITY_FLOORS = CLINICAL_CONFIG["probability_floors"]
CLINICAL_MARKERS = CLINICAL_CONFIG["clinical_markers"]
KFRE_COEFFICIENTS = CLINICAL_CONFIG["kfre"]

GFR_STAGE_CUTOFFS = (
    (90, "G1", "Normal or high kidney function", ">=90"),
    (60, "G2", "Mildly decreased kidney function", "60-89"),
    (45, "G3a", "Mildly to moderately decreased kidney function", "45-59"),
    (30, "G3b", "Moderately to severely decreased kidney function", "30-44"),
    (15, "G4", "Severely decreased kidney function", "15-29"),
)

GFR_STAGE_FAILURE = ("G5", "Kidney failure range", "<15")

ALBUMINURIA_A1_MAX = 30
ALBUMINURIA_A2_MAX = 300

KDIGO_RISK_MATRIX = {
    "G1": {"A1": "Low", "A2": "Moderately increased", "A3": "High"},
    "G2": {"A1": "Low", "A2": "Moderately increased", "A3": "High"},
    "G3a": {"A1": "Moderately increased", "A2": "High", "A3": "Very high"},
    "G3b": {"A1": "High", "A2": "Very high", "A3": "Very high"},
    "G4": {"A1": "High", "A2": "Very high", "A3": "Very high"},
    "G5": {"A1": "Very high", "A2": "Very high", "A3": "Very high"},
}

SEVERITY_GFR = ((15, 4), (30, 3), (45, 2), (60, 1))
SEVERITY_CREATININE = ((3.5, 3), (2.0, 2), (1.5, 1))
SEVERITY_BUN = ((40, 2), (25, 1))
SEVERITY_PROTEIN = ((1.0, 2), (0.3, 1))
SEVERITY_POTASSIUM = ((5.5, 2), (5.0, 1))
SEVERITY_SODIUM = ((130, 2), (135, 1))
SEVERITY_HEMOGLOBIN = ((9, 2), (11, 1))
SEVERITY_SYSTOLIC = ((160, 2), (140, 1))

FLAG_POTASSIUM = 5.5
FLAG_GFR = 30
FLAG_BP_CRISIS_SYS = 180
FLAG_BP_CRISIS_DIA = 120
FLAG_HTN_SYS = 140
FLAG_HTN_DIA = 90
FLAG_HEMOGLOBIN = 10
FLAG_SODIUM = 135
FLAG_ACR = 300
