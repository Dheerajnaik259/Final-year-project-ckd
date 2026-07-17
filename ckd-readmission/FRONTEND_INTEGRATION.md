# Frontend Integration

This file documents the current React-to-Flask prediction contract.

## Prediction Flow

1. `frontend/src/components/PatientForm.jsx` collects the three-step intake.
2. The form builds a normalized payload with both clinical UI aliases and model-required snake_case keys.
3. `frontend/src/services/api.js` posts the payload to `POST /predict`.
4. `frontend/src/components/ResultCard.jsx` displays risk, CKD context, flags, suggestions, and the Groq clinical recommendation.

## Required Model Fields

The backend model validates these fields:

```text
age
gender
blood_pressure_systolic
blood_pressure_diastolic
serum_creatinine
egfr
hemoglobin
diabetes
hypertension
prior_admissions
length_of_stay
comorbidity_count
ckd_stage
```

The backend also accepts legacy/frontend aliases such as `Age`, `SystolicBP`, `GFR`, and `HemoglobinLevels`. The form sends both sets to support model scoring and clinical context rendering.

## Frontend Alias Mapping

| UI field | API/model field |
| --- | --- |
| Age | age |
| Gender | gender |
| SystolicBP | blood_pressure_systolic |
| DiastolicBP | blood_pressure_diastolic |
| SerumCreatinine | serum_creatinine |
| GFR | egfr |
| HemoglobinLevels | hemoglobin |
| Diabetes | diabetes |
| Hypertension | hypertension |
| PriorAdmissions | prior_admissions |
| LengthOfStay | length_of_stay |
| ComorbidityCount | comorbidity_count |

`ckd_stage` is derived from eGFR:

| eGFR | ckd_stage |
| --- | --- |
| >= 90 | 1 |
| 60-89 | 2 |
| 30-59 | 3 |
| 15-29 | 4 |
| < 15 | 5 |

## Example Payload

```json
{
  "Age": 68,
  "Gender": 1,
  "BMI": 31,
  "SystolicBP": 160,
  "DiastolicBP": 95,
  "Hypertension": 1,
  "SerumCreatinine": 3.2,
  "GFR": 22,
  "BUNLevels": 45,
  "HbA1c": 8.1,
  "FastingBloodSugar": 180,
  "HemoglobinLevels": 9.5,
  "ProteinInUrine": 1.8,
  "ACR": 450,
  "SerumElectrolytesPotassium": 5.8,
  "SerumElectrolytesSodium": 132,
  "CholesterolTotal": 240,
  "Smoking": 1,
  "Diabetes": 1,
  "PriorAdmissions": 2,
  "LengthOfStay": 7,
  "ComorbidityCount": 4,
  "FamilyHistoryKidneyDisease": 1,
  "age": 68,
  "gender": 1,
  "blood_pressure_systolic": 160,
  "blood_pressure_diastolic": 95,
  "serum_creatinine": 3.2,
  "egfr": 22,
  "hemoglobin": 9.5,
  "diabetes": 1,
  "hypertension": 1,
  "prior_admissions": 2,
  "length_of_stay": 7,
  "comorbidity_count": 4,
  "ckd_stage": 4
}
```

## Response Fields Used By The Frontend

```json
{
  "risk_level": "High",
  "probability": 70,
  "message": "High risk of CKD readmission. Immediate lifestyle changes recommended.",
  "clinical_assessment": {
    "ckd_stage": {},
    "albuminuria": {},
    "kdigo_risk": "Very high",
    "severity_score": 16,
    "kfre": {},
    "clinical_flags": [],
    "validation_warnings": []
  },
  "top_clinical_factors": [],
  "clinical_recommendation": {
    "summary": "",
    "immediate_actions": [],
    "lifestyle_advice": [],
    "follow_up": "",
    "urgency_level": "Critical"
  },
  "suggestions": {
    "urgent": "",
    "food": [],
    "water": [],
    "lifestyle": []
  }
}
```

## Files Involved

- `frontend/src/components/PatientForm.jsx`
- `frontend/src/services/api.js`
- `frontend/src/components/ResultCard.jsx`
- `frontend/src/components/RecommendationCard.jsx`
- `frontend/src/components/RecommendationCard.css`
- `backend/routes/predict.py`
- `backend/model/predict.py`
