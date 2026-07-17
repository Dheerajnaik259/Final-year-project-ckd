import requests
import os

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/ckd-suggestions")


def get_ai_suggestions(risk_level: str, probability: float, patient_data: dict) -> dict:
    """
    Sends patient risk data to n8n webhook.
    n8n calls Claude AI and returns food & water suggestions.
    """
    try:
        payload = {
            "risk_level": risk_level,
            "probability": probability,
            "creatinine": patient_data.get("SerumCreatinine"),
            "gfr": patient_data.get("GFR"),
            "potassium": patient_data.get("SerumElectrolytesPotassium"),
            "sodium": patient_data.get("SerumElectrolytesSodium"),
            "hemoglobin": patient_data.get("HemoglobinLevels"),
            "bp_systolic": patient_data.get("SystolicBP"),
            "protein_urine": patient_data.get("ProteinInUrine"),
            "bun": patient_data.get("BUNLevels"),
        }

        response = requests.post(
            N8N_WEBHOOK_URL,
            json=payload,
            timeout=15
        )

        if response.status_code == 200:
            return response.json()
        else:
            return default_suggestions(risk_level)

    except Exception:
        # If n8n is down, return default suggestions
        return default_suggestions(risk_level)


def default_suggestions(risk_level: str) -> dict:
    """Fallback suggestions if n8n is unavailable"""
    base = {
        "food": [
            "Limit potassium-rich foods (bananas, potatoes, oranges)",
            "Reduce sodium intake — avoid processed/salty foods",
            "Limit protein to 0.6–0.8g per kg body weight",
            "Avoid phosphorus-rich foods (dairy, nuts, dark cola)",
        ],
        "water": [
            "Limit fluid intake to 1.5–2 liters per day",
            "Monitor urine output daily",
            "Avoid alcohol and sugary drinks",
        ],
        "lifestyle": [
            "Take medications on time",
            "Monitor blood pressure daily",
            "Schedule regular checkups",
        ]
    }

    if risk_level == "High":
        base["urgent"] = "⚠️ High risk detected. Please consult your doctor immediately."
    elif risk_level == "Medium":
        base["urgent"] = "⚡ Moderate risk. Follow diet strictly and monitor weekly."
    else:
        base["urgent"] = "✅ Low risk. Maintain healthy habits."

    return base
