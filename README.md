# CKD Readmission Risk Predictor

A full-stack application for estimating chronic kidney disease (CKD) hospital readmission risk from patient vitals, laboratory values, and clinical history.

The system combines a **Flask** backend, a **React** frontend, a **hybrid machine learning model** (Random Forest + XGBoost ensemble with 91.75% accuracy), **SHAP explainability**, and **Groq-powered AI recommendations** for personalised clinical guidance.

---

## Key Features

- **Multi-step patient intake form** — vitals, lab values, and history collected in three guided steps
- **Hybrid ML model** — weighted soft voting ensemble (Random Forest + XGBoost) with 91.75% accuracy
- **AI-powered recommendations** — Groq LLaMA 3.3-70B generates personalised clinical guidance with rule-based fallback
- **SHAP explainability** — top clinical factors driving each prediction are surfaced to the clinician
- **Interactive result charts** — risk gauge, severity meter, SHAP bar chart, and KFRE visualisation built with pure SVG
- **CKD clinical context** — eGFR stage, albuminuria category, KDIGO risk view, and KFRE kidney failure estimates
- **Clinical flags** — automatic alerts for hyperkalemia, anemia, low sodium, advanced CKD, and hypertensive crisis
- **Robust error handling** — graceful fallbacks at every layer (model, API, UI)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, CSS3 (responsive, dark mode) |
| Backend | Flask, Flask-CORS, Python 3.11+ |
| ML | Scikit-learn, XGBoost, SHAP, Imbalanced-learn (SMOTE) |
| AI Recommendations | Groq API (LLaMA 3.3-70B) |
| Visualisation | Matplotlib, Seaborn (training), SVG charts (frontend) |
| Validation | Pydantic, Zod |

---

## Model Performance

| Metric | Score |
|---|---|
| Accuracy | **91.75%** |
| ROC-AUC | **0.9727** |
| Precision (Readmission) | 0.91 |
| Recall (Readmission) | 0.93 |
| 5-Fold CV Mean | 90.64% |
| Inference Time | <100ms |

---

## Model Visualisations

### Confusion Matrix

![Confusion Matrix](docs/images/confusion_matrix.png)

The model correctly classifies 308 non-readmission and 315 readmission cases, with only 32 false positives and 24 false negatives.

### ROC-AUC Curve

![ROC-AUC Curve](docs/images/roc_auc_curve.png)

An AUC of 0.9727 demonstrates strong discrimination between readmission and non-readmission classes.

### SHAP Feature Importance

![SHAP Feature Importance](docs/images/shap_feature_importance.png)

Prior admissions, comorbidity count, and serum creatinine are the strongest predictors of readmission risk.

### Class Distribution (Before & After SMOTE)

![Class Distribution](docs/images/class_distribution.png)

The original dataset has severe class imbalance (1697 vs 303). SMOTE balances the classes to ensure fair model training.

### Cross-Validation Accuracy

![Cross-Validation Scores](docs/images/cv_scores.png)

5-Fold stratified cross-validation scores range from 89.13% to 91.90%, demonstrating consistent generalisation.

---

## System Architecture

```
┌─────────────────┐
│   React UI      │  (http://localhost:5173)
│   Multi-step    │
│   Patient Form  │
└────────┬────────┘
         │ POST /predict
         ▼
┌─────────────────────────────────────┐
│  Flask Backend (port 5000)          │
│  ├─ Input Validation (Pydantic)     │
│  ├─ Feature Normalisation (Scaler)  │
│  ├─ Hybrid ML Ensemble (91.75%)     │
│  ├─ Clinical Severity Guardrails    │
│  ├─ SHAP Feature Extraction         │
│  └─ AI Recommendation Engine        │
└────────┬────────────────────────────┘
         │ API Call
         ▼
┌─────────────────────────────────────┐
│  Groq LLaMA 3.3-70B (External)     │
│  Personalised Recommendations       │
│  (with rule-based fallback)         │
└─────────────────────────────────────┘
```

---

## Project Structure

```
ckd-readmission/
├── backend/
│   ├── app.py                              # Flask app entry point
│   ├── requirements.txt                    # Python dependencies
│   ├── .env.example                        # Environment variables template
│   ├── model/
│   │   ├── Train.py                        # Model training + plot generation
│   │   ├── predict.py                      # Prediction engine
│   │   ├── ckd_hybrid_model.pkl            # Trained hybrid model
│   │   ├── scaler.pkl                      # Feature normalisation
│   │   ├── feature_names.json              # 13 model features
│   │   ├── shap_importance.csv             # SHAP feature importance
│   │   ├── ckd_clinical_data.csv           # Training data (2,000 records)
│   │   ├── Chronic_Kidney_Dsease_data.csv  # Extended clinical dataset
│   │   └── plots/                          # Generated training visualisations
│   │       ├── confusion_matrix.png
│   │       ├── roc_auc_curve.png
│   │       ├── shap_feature_importance.png
│   │       ├── class_distribution.png
│   │       └── cv_scores.png
│   ├── routes/
│   │   └── predict.py                      # /predict endpoint
│   ├── services/
│   │   ├── groq_recommendation.py          # AI recommendation generation
│   │   └── groq_service.py                 # Groq API wrapper
│   ├── config/
│   │   ├── paths.py                        # Model artifact paths
│   │   └── clinical_constants.py           # Clinical thresholds
│   ├── schemas/
│   │   └── patient.py                      # Pydantic validation schemas
│   ├── auth/
│   │   └── jwt_guard.py                    # JWT authentication guard
│   └── tests/
│       └── test_clinical.py                # Clinical logic tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientForm.jsx             # Multi-step intake form
│   │   │   ├── PatientForm.css
│   │   │   ├── ResultCard.jsx              # Results display
│   │   │   ├── ResultCard.css
│   │   │   ├── RiskCharts.jsx              # Interactive SVG charts
│   │   │   ├── RiskCharts.css
│   │   │   ├── RecommendationCard.jsx      # AI recommendations
│   │   │   └── RecommendationCard.css
│   │   ├── services/
│   │   │   └── api.js                      # Backend API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── shared/
│   └── clinical_config.json                # Shared clinical constants
├── docs/
│   └── images/                             # README visualisation images
├── dummy_entries.md                        # Sample test patient profiles
└── README.md
```

---

## How It Works

1. **Patient Data Entry** — clinician enters patient data via the 3-step React form (demographics, labs, history)
2. **API Request** — frontend sends `POST /predict` with patient data
3. **Input Validation** — backend validates and normalises all 13 features
4. **Ensemble Prediction** — hybrid RF + XGBoost model predicts readmission probability
5. **Clinical Guardrails** — severity scoring applies clinical floors so severe cases are never under-scored
6. **SHAP Analysis** — top 5 clinical risk factors driving the prediction are extracted
7. **AI Recommendations** — Groq LLaMA generates personalised clinical guidance (with fallback)
8. **Interactive Display** — frontend renders risk level, charts, clinical context, and action items

**Inference Time:** ~100ms model prediction + 2–4s Groq API (with graceful fallback)

---

## Setup & Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm (for frontend development)
- Groq API key (free tier available at [groq.com](https://groq.com))

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
copy .env.example .env         # then add your GROQ_API_KEY
python app.py                  # runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev                    # runs on http://localhost:5173
```

---

## Retraining the Model

To retrain the model with new or updated data:

```bash
cd backend/model
python Train.py
```

This generates:
- `ckd_hybrid_model.pkl` — trained ensemble model
- `scaler.pkl` — feature normalisation scaler
- `feature_names.json` — ordered feature names
- `shap_importance.csv` — SHAP feature importance scores
- `plots/` — 5 training visualisation images

---

## API Reference

### `GET /`

Returns backend status and available endpoints.

### `GET /health`

Health check. Returns `{"status": "ok"}`.

### `POST /predict`

Predicts readmission risk with clinical recommendations.

**Required Fields** (13 features):
```
age, gender, blood_pressure_systolic, blood_pressure_diastolic,
serum_creatinine, egfr, hemoglobin, diabetes, hypertension,
prior_admissions, length_of_stay, comorbidity_count, ckd_stage
```

**Example Request:**
```json
{
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

**Response:**
```json
{
  "risk_level": "High",
  "probability": 87.0,
  "message": "High risk of CKD readmission. Immediate lifestyle changes recommended.",
  "clinical_assessment": {
    "ckd_stage": { "code": "G4", "label": "Severely decreased kidney function", "range": "15-29" },
    "albuminuria": { "code": "A3", "label": "Severely increased albuminuria", "range": ">300 mg/g" },
    "kdigo_risk": "Very high",
    "severity_score": 16,
    "kfre": { "applicable": true, "risk_2_year": 13.78, "risk_5_year": 43.67 },
    "clinical_flags": [
      "Advanced CKD flag: eGFR is below 30.",
      "Anemia flag: hemoglobin is below 10 g/dL."
    ]
  },
  "top_clinical_factors": [
    { "feature": "SerumCreatinine", "value": 3.2, "impact": 0.25 },
    { "feature": "GFR", "value": 22, "impact": 0.25 }
  ],
  "clinical_recommendation": {
    "summary": "High-risk patient requires intensive monitoring...",
    "immediate_actions": ["Schedule nephrology follow-up within 48 hours"],
    "lifestyle_advice": ["Strict fluid intake <1.5L daily"],
    "follow_up": "Weekly telehealth check-ins",
    "urgency_level": "Critical"
  },
  "suggestions": {
    "urgent": "High risk detected. Consult your doctor immediately.",
    "food": ["Limit potassium-rich foods"],
    "water": ["Limit fluid intake to 1.5-2 litres per day"],
    "lifestyle": ["Monitor blood pressure daily"]
  }
}
```

---

## Clinical Context

The application provides the following clinical decision-support outputs alongside the readmission prediction:

- **CKD G-stage** based on eGFR (G1–G5)
- **Albuminuria A-category** based on urine ACR (A1–A3)
- **KDIGO combined risk** interpretation
- **KFRE** 2-year and 5-year kidney failure estimates (4-variable equation, non-North America baseline)
- **Clinical flags** for hyperkalemia, anemia, hypertensive crisis, advanced CKD, and severe albuminuria
- **Range validation warnings** for implausible input values

---

## Models Used

### Primary Prediction Model
**Hybrid Weighted Voting Ensemble**
- Random Forest: 200 trees, max_depth=10 (50% weight)
- XGBoost: 200 trees, max_depth=6 (50% weight)
- Ensemble method: soft voting (probability-based)
- Class balancing: SMOTE
- Training data: 2,000 CKD patient records

### AI Recommendation Engine
**Groq LLaMA 3.3-70B**
- Temperature: 0.3 (clinical precision)
- Input: patient labs, risk level, top 5 clinical factors
- Output: structured JSON with summary, actions, lifestyle advice, follow-up, urgency
- Fallback: comprehensive rule-based recommendations if API is unavailable

### Explainability
**SHAP (SHapley Additive exPlanations)**
- Uses XGBoost base learner for TreeExplainer
- Identifies which clinical factors drive each prediction

---

## Sample Patient Profiles & Demo Guide

Quick test values for **Low Risk**, **Medium Risk**, and **High Risk** clinical profiles are available in [ckd-readmission/dummy_entries.md](ckd-readmission/dummy_entries.md).

Use these entries during live demonstration to test different risk tiers:
- **Low Risk:** eGFR 98, Creatinine 0.8, 0 Prior Admissions (Probability < 25%)
- **Medium Risk:** eGFR 48, Creatinine 1.8, 1 Prior Admission (Probability ~40%)
- **High Risk:** eGFR 12, Creatinine 5.5, 4 Prior Admissions (Probability ≥ 70%)

---

## Limitations

- This is an academic prototype, not a certified medical device
- The model has not been validated on external real-world hospital readmission data
- KFRE estimates kidney failure risk, which is distinct from hospital readmission risk
- AI-generated suggestions depend on Groq output quality and should be treated as supportive text only

---

## Disclaimer

This project is intended for academic demonstration and clinical decision-support prototyping only. It must not be used as the sole basis for diagnosis, treatment, or real patient care decisions.
