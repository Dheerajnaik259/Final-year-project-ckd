from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, ValidationError, field_validator, model_validator

from config.clinical_constants import API_TO_LEGACY_FIELDS, FIELD_RANGES
from config.paths import FEATURE_NAMES_NAME, MODEL_DIR


def load_required_features() -> list[str]:
    import json

    path = MODEL_DIR / FEATURE_NAMES_NAME
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


REQUIRED_FEATURES = load_required_features()


class PayloadValidationError(ValueError):
    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__("; ".join(errors))


class PatientPayload(BaseModel):
    """Incoming predict payload. Accepts API snake_case and legacy PascalCase keys."""

    model_config = ConfigDict(extra="allow")

    age: float | None = None
    Age: float | None = None
    gender: float | None = None
    Gender: float | None = None
    blood_pressure_systolic: float | None = None
    SystolicBP: float | None = None
    blood_pressure_diastolic: float | None = None
    DiastolicBP: float | None = None
    serum_creatinine: float | None = None
    SerumCreatinine: float | None = None
    egfr: float | None = None
    GFR: float | None = None
    hemoglobin: float | None = None
    HemoglobinLevels: float | None = None
    diabetes: float | None = None
    Diabetes: float | None = None
    hypertension: float | None = None
    Hypertension: float | None = None
    prior_admissions: float | None = None
    PriorAdmissions: float | None = None
    length_of_stay: float | None = None
    LengthOfStay: float | None = None
    comorbidity_count: float | None = None
    ComorbidityCount: float | None = None
    ckd_stage: float | None = None
    BMI: float | None = None
    BUNLevels: float | None = None
    HbA1c: float | None = None
    FastingBloodSugar: float | None = None
    ProteinInUrine: float | None = None
    ACR: float | None = None
    SerumElectrolytesPotassium: float | None = None
    SerumElectrolytesSodium: float | None = None
    CholesterolTotal: float | None = None

    @field_validator("*", mode="before")
    @classmethod
    def empty_to_none(cls, value: Any) -> Any:
        if value == "":
            return None
        return value

    @model_validator(mode="after")
    def fill_aliases_and_validate(self) -> "PatientPayload":
        data = self.to_patient_dict()
        for api_field, legacy_field in API_TO_LEGACY_FIELDS.items():
            api_value = data.get(api_field)
            legacy_value = data.get(legacy_field)
            if api_value is None and legacy_value is not None:
                setattr(self, api_field, legacy_value)
            if legacy_value is None and api_value is not None:
                setattr(self, legacy_field, api_value)

        if self.diabetes is None and self.Diabetes is None:
            self.diabetes = 0.0
            self.Diabetes = 0.0
        if self.hypertension is None and self.Hypertension is None:
            self.hypertension = 0.0
            self.Hypertension = 0.0

        if self.ckd_stage is None:
            gfr_value = self.egfr if self.egfr is not None else self.GFR
            if gfr_value is not None:
                self.ckd_stage = _derive_ckd_stage(gfr_value)

        merged = self.to_patient_dict()
        range_errors: list[str] = []
        for field, (low, high, unit) in FIELD_RANGES.items():
            value = merged.get(field)
            if value is None:
                continue
            if value < low or value > high:
                range_errors.append(
                    f"{field} value {value:g} is outside the expected range ({low}-{high} {unit})."
                )
        if range_errors:
            raise PayloadValidationError(range_errors)

        missing = [feature for feature in REQUIRED_FEATURES if merged.get(feature) in (None, "")]
        if missing:
            raise PayloadValidationError([f"Missing required fields: {', '.join(missing)}"])
        return self

    def to_patient_dict(self) -> dict[str, Any]:
        extras = getattr(self, "__pydantic_extra__", None) or {}
        return {**self.model_dump(), **extras}


def parse_patient_payload(raw: dict[str, Any]) -> dict[str, Any]:
    try:
        payload = PatientPayload.model_validate(raw)
    except PayloadValidationError:
        raise
    except ValidationError as exc:
        messages = []
        for error in exc.errors():
            location = ".".join(str(part) for part in error.get("loc", []))
            messages.append(f"{location}: {error.get('msg')}")
        raise PayloadValidationError(messages) from exc
    return payload.to_patient_dict()


def _derive_ckd_stage(gfr_value: float) -> int:
    gfr = float(gfr_value)
    if gfr >= 90:
        return 1
    if gfr >= 60:
        return 2
    if gfr >= 30:
        return 3
    if gfr >= 15:
        return 4
    return 5
