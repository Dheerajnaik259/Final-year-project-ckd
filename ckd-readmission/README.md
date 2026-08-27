# CKD Readmission Risk Predictor

A full-stack final year project for estimating chronic kidney disease readmission risk from patient vitals, laboratory values, and selected history inputs.

The application combines a Flask backend, a React frontend, a hybrid machine learning model (Random Forest + XGBoost), and Groq-powered AI recommendations. The latest version features an ensemble approach with 91.75% accuracy, SHAP explainability, and personalized clinical guidance.

## Overview

This project is designed as a decision-support prototype for academic use. It predicts readmission risk for CKD patients and presents the result alongside supporting clinical context and AI-generated recommendations to make the output easier to interpret during clinical reviews and presentations.

## Key Features

- **Multi-step patient intake form** for vitals, lab values, and history inputs
- **Hybrid ML model** (Random Forest + XGBoost weighted voting) with 91.75% accuracy
- **AI-powered recommendations** using Groq LLaMA 3.3-70B
- **SHAP explainability** showing top clinical factors driving predictions
- **CKD clinical context** including eGFR stage, albuminuria category, and KDIGO-style risk view
- **KFRE** 2-year and 5-year kidney failure estimates when applicable
- **Clinical flags** for severe findings (hyperkalemia, anemia, low sodium, advanced CKD)
- **Robust error handling** with graceful fallbacks
- **Real-time predictions** with <100ms inference time

## Tech Stack

- **Frontend**: React 18, Vite, CSS3 (responsive design)
- **Backend**: Flask, Flask-CORS
- **ML**: Scikit-learn, XGBoost, SHAP, Imbalanced-learn (SMOTE)
- **AI Recommendations**: Groq API (LLaMA 3.3-70B)
- **Data**: Pandas, NumPy
- **Database**: CSV-based (ckd_clinical_data.csv)

## Models Used

### 1. Primary Prediction Model 🎯
**Hybrid Weighted Voting Ensemble**
- **Components**:
  - Random Forest: 200 trees, max_depth=10 (50% weight)
  - XGBoost: 200 trees, max_depth=6 (50% weight)
- **Ensemble Method**: Soft voting (probability-based)
- **Class Balancing**: SMOTE (handles class imbalance)
- **Training Data**: 2,000 CKD patient records
- **Performance**:
  - Accuracy: **91.75%**
  - ROC-AUC: **0.9727**
  - Precision: 0.92 | Recall: 0.93
  - 5-Fold Cross-Validation: 87.2-88.3%

### 2. AI Recommendation Engine 🤖
**Groq LLaMA 3.3-70B**
- **Purpose**: Generate personalized clinical recommendations
- **Temperature**: 0.3 (clinical precision, not creative)
- **Input**: Patient labs, risk level, top 5 clinical factors
- **Output**: {summary, immediate_actions, lifestyle_advice, follow_up, urgency_level}
- **Fallback**: Rule-based recommendations if API fails

### 3. Feature Importance & Explainability 📊
**SHAP (SHapley Additive exPlanations)**
- **Base Model**: XGBoost learner
- **Purpose**: Identify which clinical factors drive predictions
- **Output**: SHAP feature importance saved in shap_importance.csv

### 4. Data Preprocessing ⚙️
**StandardScaler**
- **Purpose**: Normalize all 13 features (mean=0, std=1)
- **Artifacts**: scaler.pkl
- **Ensures**: Consistent model input across predictions

## Project Structure

```text
ckd-readmission/
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- pytest.ini
|   |-- auth/
|   |   `-- jwt_guard.py                # Optional JWT on /predict
|   |-- config/
|   |   |-- clinical_constants.py       # KDIGO/KFRE/severity thresholds
|   |   `-- paths.py                    # Repo-local model artifact paths
|   |-- schemas/
|   |   `-- patient.py                  # Pydantic request validation
|   |-- model/
|   |   |-- Train.py
|   |   |-- clinical.py                 # Guardrails, KFRE, flags (no pickle)
|   |   |-- loader.py                   # Load .pkl from model/ or CKD_MODEL_PATH
|   |   |-- predict.py
|   |   |-- ckd_hybrid_model.pkl
|   |   |-- scaler.pkl
|   |   |-- feature_names.json
|   |   |-- shap_importance.csv
|   |   |-- ckd_clinical_data.csv
|   |   `-- Chronic_Kidney_Dsease_data.csv
|   |-- routes/
|   |   `-- predict.py
|   |-- services/
|   |   |-- groq_recommendation.py
|   |   |-- groq_service.py
|   |   `-- n8n_service.py
|   `-- tests/
|       `-- test_clinical.py
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- PatientForm.jsx
|   |   |   |-- ResultCard.jsx
|   |   |   `-- RecommendationCard.jsx
|   |   |-- pages/
|   |   |   |-- Home.jsx
|   |   |   `-- Results.jsx
|   |   |-- services/
|   |   |   `-- api.js
|   |   `-- validation/
|   |       |-- patientSchema.js        # Zod range validation
|   |       `-- patientSchema.test.js
|   |-- package.json
|   `-- vite.config.js
`-- README.md
```

## How It Works

1. **Patient Data Entry**: User enters patient data via the 3-step React form (demographics, labs, history)
2. **API Request**: Frontend sends POST request to `/predict` with patient data
3. **Feature Processing**: Backend normalizes 13 features using StandardScaler
4. **Ensemble Prediction**: Hybrid RF+XGBoost model predicts readmission risk
5. **Clinical Assessment**: Backend extracts top 5 clinical risk factors using SHAP
6. **AI Recommendations**: Groq LLaMA generates personalized clinical guidance
7. **Response**: Backend returns prediction, factors, and AI recommendations
8. **Display**: Frontend renders risk level, clinical context, and action items

**Inference Time**: ~100ms model prediction + 2-4s Groq API (with graceful fallback)

## Local Setup & Quick Start

### Prerequisites

- Python 3.11 or later
- Groq API key (free tier available at [groq.com](https://groq.com))

### Option 1: Quick Start (Pre-built Frontend)

```bash
# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. Set up environment variables
cd backend
copy .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Start backend server
python app.py
# Backend runs on http://localhost:5000

# 4. Start frontend (in another terminal)
cd frontend
python -m http.server 5173 --directory dist
# Frontend runs on http://localhost:5173
```

### Option 2: Development Setup (Build Frontend)

Requires Node.js 18+ and npm

```bash
# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Environment Variables

**Backend** (`backend/.env`):
```env
FLASK_ENV=development
FLASK_DEBUG=True
GROQ_API_KEY=your_groq_api_key_here
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://127.0.0.1:5000
```

### Training the Model

To retrain the model with new data:

```bash
cd backend/model
# Update ckd_clinical_data.csv with your data
python Train.py
```

This generates:
- `ckd_hybrid_model.pkl` - Trained model
- `scaler.pkl` - Feature scaler
- `feature_names.json` - Feature names
- `shap_importance.csv` - Feature importance

## API Endpoints

### `GET /`

Backend information and available endpoints.

Response:
```json
{
  "message": "CKD Readmission Predictor Backend",
  "status": "running",
  "endpoints": {
    "/health": "Health check",
    "/predict": "Predict readmission risk"
  }
}
```

### `GET /health`

Simple health check from Flask service.

Response:
```json
{
  "status": "ok",
  "message": "CKD Backend is running"
}
```

### `POST /predict`

Predicts readmission risk with clinical recommendations.

**Required Fields** (13 features):
```
age, gender, blood_pressure_systolic, blood_pressure_diastolic,
serum_creatinine, egfr, hemoglobin, diabetes, hypertension,
prior_admissions, length_of_stay, comorbidity_count, ckd_stage
```

**Example Request**:
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

**Example Response**:
```json
{
  "risk_level": "High",
  "probability": 0.87,
  "message": "Patient has HIGH risk of readmission",
  "clinical_assessment": "...",
  "top_clinical_factors": [
    {"feature": "serum_creatinine", "value": 3.2, "impact_score": 25},
    {"feature": "egfr", "value": 22, "impact_score": 25},
    {"feature": "age", "value": 68, "impact_score": 15},
    {"feature": "length_of_stay", "value": 7, "impact_score": 15},
    {"feature": "comorbidity_count", "value": 4, "impact_score": 15}
  ],
  "clinical_recommendation": {
    "summary": "High-risk patient requires intensive monitoring...",
    "immediate_actions": ["Schedule nephrology follow-up within 48 hours", "..."],
    "lifestyle_advice": ["Strict fluid intake <1.5L daily", "..."],
    "follow_up": "Daily phone calls for next 7 days",
    "urgency_level": "Critical"
  }
}
```

## Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | 91.75% |
| ROC-AUC | 0.9727 |
| Precision (High Risk) | 0.91 |
| Recall (High Risk) | 0.93 |
| 5-Fold CV Mean | 87.58% |
| Inference Time | <100ms |

## System Architecture

```
┌─────────────┐
│   React UI  │  (http://localhost:5173)
└──────┬──────┘
       │ POST /predict
       ▼
┌─────────────────────────────────┐
│  Flask Backend (port 5000)      │
│  ├─ Feature Normalization       │
│  ├─ Hybrid ML Model (91.75%)    │
│  ├─ SHAP Feature Extraction     │
│  └─ AI Recommendation Engine    │
└──────┬──────────────────────────┘
       │ API Call
       ▼
┌─────────────────────────────────┐
│  Groq LLaMA 3.3-70B             │  (External)
│  (Personalized Recommendations) │  (with fallback)
└─────────────────────────────────┘
```

Example response:

```json
{
  "risk_level": "High",
  "probability": 70.0,
  "message": "High risk of CKD readmission. Immediate lifestyle changes recommended.",
  "clinical_assessment": {
    "ckd_stage": {
      "code": "G4",
      "label": "Severely decreased kidney function",
      "range": "15-29"
    },
    "albuminuria": {
      "code": "A3",
      "label": "Severely increased albuminuria",
      "range": ">300 mg/g"
    },
    "kdigo_risk": "Very high",
    "severity_score": 16,
    "model_probability": 69.08,
    "clinical_floor": 70.0,
    "final_probability": 70.0,
    "kfre": {
      "applicable": true,
      "risk_2_year": 13.78,
      "risk_5_year": 43.67,
      "calibration": "4-variable KFRE, non-North America baseline",
      "outcome": "Kidney failure risk, not readmission risk"
    },
    "clinical_flags": [
      "High potassium flag: potassium is 5.5 mEq/L or above.",
      "Advanced CKD flag: eGFR is below 30."
    ],
    "validation_warnings": [],
    "note": "Clinical context is for project decision-support only and does not replace clinician review."
  },
  "clinical_recommendation": {
    "summary": "AI-generated clinical recommendation summary",
    "immediate_actions": [],
    "lifestyle_advice": [],
    "follow_up": "AI-generated follow-up plan",
    "urgency_level": "Critical"
  },
  "suggestions": {
    "urgent": "AI-generated summary sentence",
    "food": [],
    "water": [],
    "lifestyle": []
  }
}
```

## Model Notes

- The classifier is trained from the dataset in [backend/model/Chronic_Kidney_Dsease_data.csv](backend/model/Chronic_Kidney_Dsease_data.csv).
- The project uses a rule-derived severity target during training.
- The app combines model output with clinical guardrails so obviously severe cases are not under-scored.
- The measured project test accuracy is approximately `98.66%` on the current internal balanced split.

That accuracy should be interpreted carefully because it reflects this project's own dataset and engineered labels, not external real-world clinical validation.

## Clinical Context Included in the App

- CKD G-stage based on eGFR
- Albuminuria A-category based on urine ACR
- KDIGO-style combined risk interpretation
- KFRE kidney failure estimate for eligible inputs
- Flags for major abnormalities
- Range warnings for implausible values

## Limitations

- This is an academic prototype, not a certified medical device.
- The model is not validated on real hospital readmission outcomes from external institutions.
- KFRE estimates kidney failure risk, which is different from hospital readmission risk.
- AI suggestions depend on Groq output quality and should be treated as supportive text only.

## Recommended Demo Inputs

Sample high-risk and low-risk patient profiles are available in [dummy_entries.md](dummy_entries.md).

## Future Improvements

- Train on real CKD readmission outcome data
- Perform external validation on hospital datasets
- Expand JWT/OAuth beyond the optional `JWT_SECRET` gate
- Add deployment documentation
- Include calibration and fairness analysis

## Disclaimer

This project is intended for academic demonstration and decision-support prototyping only. It must not be used as the sole basis for diagnosis, treatment, or real patient care decisions.
