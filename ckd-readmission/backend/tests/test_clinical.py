from __future__ import annotations

import pytest

from config.paths import resolve_model_path
from model.clinical import (
    clinical_probability_floor,
    clinical_severity_score,
    kdigo_risk_level,
    kfre_4_variable,
    parse_numeric,
)
from schemas.patient import PayloadValidationError, parse_patient_payload
from services.groq_recommendation import GroqRecommendationGenerator


def _high_risk_patient() -> dict:
    return {
        "Age": 72,
        "age": 72,
        "Gender": 1,
        "gender": 1,
        "BMI": 31,
        "SystolicBP": 168,
        "blood_pressure_systolic": 168,
        "DiastolicBP": 96,
        "blood_pressure_diastolic": 96,
        "SerumCreatinine": 3.8,
        "serum_creatinine": 3.8,
        "GFR": 18,
        "egfr": 18,
        "BUNLevels": 48,
        "HbA1c": 8.1,
        "FastingBloodSugar": 180,
        "HemoglobinLevels": 8.8,
        "hemoglobin": 8.8,
        "ProteinInUrine": 1.4,
        "ACR": 420,
        "SerumElectrolytesPotassium": 5.8,
        "SerumElectrolytesSodium": 132,
        "CholesterolTotal": 240,
        "Diabetes": 1,
        "diabetes": 1,
        "Hypertension": 1,
        "hypertension": 1,
        "PriorAdmissions": 3,
        "prior_admissions": 3,
        "LengthOfStay": 8,
        "length_of_stay": 8,
        "ComorbidityCount": 4,
        "comorbidity_count": 4,
        "Smoking": 1,
        "PreviousAcuteKidneyInjury": 1,
        "Edema": 1,
    }


def test_parse_numeric_yes_no():
    assert parse_numeric("yes") == 1.0
    assert parse_numeric("female") == 0.0


def test_clinical_severity_score_is_elevated_for_advanced_ckd():
    score = clinical_severity_score(_high_risk_patient())
    assert score >= 12
    assert clinical_probability_floor(score) == 0.70


def test_kdigo_very_high_for_g5_a3():
    assert kdigo_risk_level("G5", "A3") == "Very high"


def test_kfre_applicable_when_egfr_below_60():
    result = kfre_4_variable(_high_risk_patient())
    assert result["applicable"] is True
    assert result["risk_2_year"] > 0


def test_payload_accepts_legacy_and_api_aliases():
    parsed = parse_patient_payload(_high_risk_patient())
    assert parsed["age"] == 72
    assert parsed["GFR"] == 18
    assert parsed["ckd_stage"] == 4


def test_payload_rejects_out_of_range_age():
    payload = _high_risk_patient()
    payload["Age"] = 200
    payload["age"] = 200
    with pytest.raises(PayloadValidationError):
        parse_patient_payload(payload)


def test_payload_rejects_missing_required_feature():
    payload = _high_risk_patient()
    del payload["hemoglobin"]
    del payload["HemoglobinLevels"]
    with pytest.raises(PayloadValidationError):
        parse_patient_payload(payload)


def test_groq_fallback_without_api_key(monkeypatch):
    monkeypatch.setattr("services.groq_recommendation.GROQ_API_KEY", None)
    generator = GroqRecommendationGenerator(api_key=None)
    result = generator.generate(
        risk_score=0.8,
        risk_level="High",
        risk_percentage=80,
        top_shap_features=[],
        patient_data=_high_risk_patient(),
    )
    assert result["urgency_level"] == "Critical"
    assert result["immediate_actions"]


def test_resolve_model_path_stays_inside_repo(tmp_path, monkeypatch):
    downloads = tmp_path / "Downloads"
    downloads.mkdir()
    (downloads / "ckd_hybrid_model.pkl").write_bytes(b"not-a-model")
    monkeypatch.setenv("USERPROFILE", str(tmp_path))
    monkeypatch.setenv("HOME", str(tmp_path))
    path = resolve_model_path()
    if path is not None:
        assert "Downloads" not in path.parts
