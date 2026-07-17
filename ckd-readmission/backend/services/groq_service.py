import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def get_ai_suggestions(risk_level: str, probability: float, patient_data: dict) -> dict:
    if not GROQ_API_KEY:
        return {
            "urgent": "Groq suggestions unavailable (API key missing).",
            "food": [],
            "water": [],
            "lifestyle": []
        }

    prompt = f"""You are a clinical dietitian specializing in Chronic Kidney Disease (CKD).

Patient Data:
- Risk Level: {risk_level} ({probability}% readmission probability)
- GFR: {patient_data.get('GFR')} mL/min
- Serum Creatinine: {patient_data.get('SerumCreatinine')} mg/dL
- BUN: {patient_data.get('BUNLevels')} mg/dL
- Potassium: {patient_data.get('SerumElectrolytesPotassium')} mEq/L
- Sodium: {patient_data.get('SerumElectrolytesSodium')} mEq/L
- Protein in Urine: {patient_data.get('ProteinInUrine')} g/day
- Urine ACR: {patient_data.get('ACR')} mg/g
- Systolic BP: {patient_data.get('SystolicBP')} mmHg
- Hemoglobin: {patient_data.get('HemoglobinLevels')} g/dL
- Diabetes: {patient_data.get('Diabetes')}
- Smoking: {patient_data.get('Smoking')}

Return ONLY a JSON object (no markdown, no explanation) with this exact structure:
{{
  "urgent": "one urgent action sentence based on risk level",
  "food": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "water": ["tip 1", "tip 2", "tip 3"],
  "lifestyle": ["tip 1", "tip 2", "tip 3"]
}}

Make recommendations STRICTLY specific to the patient's out-of-range lab values and risk level provided above. Do not provide generic or dummy recommendations."""

    try:
        client = Groq(api_key=GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=600,
        )
        text = chat_completion.choices[0].message.content
        text = text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "urgent": "Unable to parse AI suggestions.",
            "food": [],
            "water": [],
            "lifestyle": []
        }
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {
            "urgent": "Unable to generate specific AI suggestions (Service Error).",
            "food": [],
            "water": [],
            "lifestyle": []
        }
