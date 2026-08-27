"""
Groq-powered clinical recommendation generator for CKD readmission predictor.
Generates personalized clinical recommendations based on prediction results and SHAP feature importance.
"""

import os
import json
import logging
from typing import Dict, List, Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class GroqRecommendationGenerator:
    """Generate clinical recommendations using Groq API with fallback support."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with Groq API key."""
        self.api_key = api_key or GROQ_API_KEY
        self.client = Groq(api_key=self.api_key) if self.api_key else None
    
    def generate(
        self,
        risk_score: float,
        risk_level: str,
        risk_percentage: float,
        top_shap_features: List[Dict],
        patient_data: Dict,
    ) -> Dict:
        """
        Generate personalized clinical recommendations.
        
        Args:
            risk_score: Float between 0-1 (model probability)
            risk_level: "High", "Medium", or "Low"
            risk_percentage: Float (0-100) percentage form
            top_shap_features: List of top contributing features with impact values
                e.g., [{"feature": "serum_creatinine", "value": 6.5, "impact": 0.34}]
            patient_data: Dict with all 13+ clinical features
        
        Returns:
            Dict with keys: summary, immediate_actions, lifestyle_advice, follow_up, urgency_level
        """
        try:
            if not self.api_key or not self.client:
                logger.warning("Groq API key missing, using fallback recommendations")
                res = self._fallback_recommendation(risk_level, patient_data)
            else:
                prompt = self._build_prompt(
                    risk_level,
                    risk_percentage,
                    top_shap_features,
                    patient_data
                )
                res = self._call_groq(prompt)
                if not res:
                    logger.warning("Groq returned empty response, using fallback")
                    res = self._fallback_recommendation(risk_level, patient_data)

            # Guarantee urgency_level aligns directly with calculated ML risk_level
            if risk_level in ("Medium", "Moderate") and res.get("urgency_level") not in ("Medium", "Critical"):
                res["urgency_level"] = "Medium"
            elif risk_level == "High" and res.get("urgency_level") not in ("High", "Critical"):
                res["urgency_level"] = "High"
            elif risk_level == "Low" and res.get("urgency_level") not in ("Low", "Medium"):
                res["urgency_level"] = "Low"

            return res

        except Exception as e:
            logger.error(f"Groq recommendation error: {str(e)}", exc_info=True)
            res = self._fallback_recommendation(risk_level, patient_data)
            res["urgency_level"] = "Medium" if risk_level in ("Medium", "Moderate") else risk_level
            return res
    
    def _build_prompt(
        self,
        risk_level: str,
        risk_percentage: float,
        top_shap_features: List[Dict],
        patient_data: Dict,
    ) -> str:
        """Build the clinical prompt for Groq."""
        
        # Format SHAP features
        feature_impact_str = "\n".join([
            f"  - {f['feature']}: {f['value']} (impact: {f['impact']:.2%})"
            for f in top_shap_features[:5]  # Top 5 features
        ])
        
        # Clinical context
        clinical_context = f"""
Patient Clinical Profile:
- Readmission Risk: {risk_percentage:.1f}% ({risk_level})
- GFR (eGFR): {patient_data.get('GFR', 'N/A')} mL/min/1.73m²
- Serum Creatinine: {patient_data.get('SerumCreatinine', 'N/A')} mg/dL
- BUN: {patient_data.get('BUNLevels', 'N/A')} mg/dL
- Urine Albumin-Creatinine Ratio (ACR): {patient_data.get('ACR', 'N/A')} mg/g
- Blood Pressure (Systolic): {patient_data.get('SystolicBP', 'N/A')} mmHg
- Potassium: {patient_data.get('SerumElectrolytesPotassium', 'N/A')} mEq/L
- Hemoglobin: {patient_data.get('HemoglobinLevels', 'N/A')} g/dL
- Diabetes: {'Yes' if patient_data.get('Diabetes') else 'No'}
- Smoking: {'Yes' if patient_data.get('Smoking') else 'No'}
- Previous Acute Kidney Injury: {'Yes' if patient_data.get('PreviousAcuteKidneyInjury') else 'No'}

Top Contributing Risk Factors (by ML model impact):
{feature_impact_str}
"""
        
        prompt = f"""You are an experienced nephrologist providing personalized clinical guidance for a CKD patient at risk of hospital readmission.

{clinical_context}

Generate a structured clinical recommendation that is:
- SPECIFIC to this patient's lab values and risk level
- ACTIONABLE with concrete steps they can take
- EVIDENCE-BASED for CKD management
- Written in professional but patient-understandable language

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{{
  "summary": "2-3 sentence clinical summary addressing their specific risk factors and readmission risk",
  "immediate_actions": [
    "action 1 - specific to their top risk factors",
    "action 2",
    "action 3"
  ],
  "lifestyle_advice": [
    "advice 1 - specific dietary, activity, or behavioral recommendation",
    "advice 2",
    "advice 3"
  ],
  "follow_up": "Specific follow-up schedule and monitoring points based on risk level and labs",
  "urgency_level": "Critical", "High", "Medium", or "Low" (must match the patient's overall risk_level unless acute clinical crisis flags are present)
}}

IMPORTANT: Make all recommendations specific to their out-of-range lab values and risk factors from above. Do NOT provide generic recommendations."""
        
        return prompt
    
    def _call_groq(self, prompt: str) -> Optional[Dict]:
        """Call Groq API and parse response."""
        try:
            message = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=1000,
            )
            
            response_text = message.choices[0].message.content.strip()
            
            # Clean up response (remove markdown code blocks if present)
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            # Parse JSON
            result = json.loads(response_text)
            
            # Validate required fields
            required_fields = ["summary", "immediate_actions", "lifestyle_advice", "follow_up", "urgency_level"]
            if not all(field in result for field in required_fields):
                logger.warning("Groq response missing required fields")
                return None
            
            logger.info(f"Groq recommendation generated successfully. Urgency: {result.get('urgency_level')}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Groq JSON response: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Groq API call failed: {str(e)}")
            return None
    
    def _fallback_recommendation(self, risk_level: str, patient_data: Dict) -> Dict:
        """
        Generate rule-based fallback recommendations when Groq API is unavailable.
        Ensures the app never breaks if API fails.
        """
        logger.info(f"Generating fallback recommendation for {risk_level} risk")
        
        # Parse numeric values
        def safe_float(val, default=0):
            try:
                return float(val) if val else default
            except (ValueError, TypeError):
                return default
        
        gfr = safe_float(patient_data.get('GFR'))
        creatinine = safe_float(patient_data.get('SerumCreatinine'))
        potassium = safe_float(patient_data.get('SerumElectrolytesPotassium'))
        systolic_bp = safe_float(patient_data.get('SystolicBP'))
        hemoglobin = safe_float(patient_data.get('HemoglobinLevels'))
        
        has_diabetes = safe_float(patient_data.get('Diabetes')) > 0
        has_previous_aki = safe_float(patient_data.get('PreviousAcuteKidneyInjury')) > 0
        
        # Rule-based recommendations based on risk level
        fallback_db = {
            "High": {
                "summary": "Your kidney function shows significant decline with elevated readmission risk. Immediate medical supervision and lifestyle modifications are critical to prevent further deterioration and potential hospitalization.",
                "immediate_actions": [
                    "Schedule urgent nephrologist appointment within 3-5 days",
                    "Monitor blood pressure daily and keep a log",
                    "Begin strict fluid and sodium restriction (aim for <2g sodium/day)",
                    "Review all medications with your healthcare provider for kidney safety"
                ],
                "lifestyle_advice": [
                    "Follow a renal diet: limit potassium, phosphorus, and sodium intake",
                    "Maintain gentle exercise (30 min walking) 3-4 times per week",
                    "Avoid NSAIDs completely; use acetaminophen for pain instead",
                    "Stay well-hydrated but monitor fluid intake as directed"
                ],
                "follow_up": "Weekly telehealth check-ins, monthly lab work, and urgent visits if experiencing fatigue, shortness of breath, or chest pain",
                "urgency_level": "Critical"
            },
            "Medium": {
                "summary": "Your kidney function shows moderate decline with moderate readmission risk. Proactive management including regular monitoring and dietary modifications can slow progression and reduce hospital visits.",
                "immediate_actions": [
                    "Schedule nephrologist appointment within 1-2 weeks",
                    "Begin home blood pressure monitoring (target <130/80 mmHg)",
                    "Start reducing sodium intake gradually to <2.3g per day",
                    "Increase physical activity: aim for 150 minutes of moderate activity per week"
                ],
                "lifestyle_advice": [
                    "Follow DASH or renal diet depending on kidney function stage",
                    "Limit red meat intake; choose fish and plant-based proteins",
                    "Reduce potassium if GFR <30: avoid bananas, oranges, potatoes",
                    "Maintain healthy weight (BMI 20-25) with balanced nutrition"
                ],
                "follow_up": "Quarterly clinic visits, 3-month lab work, and home monitoring for any swelling, weight gain, or increased fatigue",
                "urgency_level": "Medium"
            },
            "Low": {
                "summary": "Your kidney function is relatively stable with low readmission risk. Maintain current lifestyle and preventive care to preserve kidney health for the long term.",
                "immediate_actions": [
                    "Schedule routine check-up with nephrologist every 6 months",
                    "Continue current medications as prescribed",
                    "Maintain current healthy habits and activity level",
                    "Track any new symptoms or changes in urination patterns"
                ],
                "lifestyle_advice": [
                    "Maintain a balanced diet with moderate protein intake",
                    "Continue regular exercise: 150-300 minutes of moderate activity per week",
                    "Manage stress through meditation, yoga, or other relaxation techniques",
                    "Avoid smoking and limit alcohol to moderate levels"
                ],
                "follow_up": "Regular 6-month clinic visits, annual lab work, and routine monitoring for any changes in kidney function",
                "urgency_level": "Low"
            }
        }
        
        return fallback_db.get(risk_level, fallback_db["Medium"])


def get_recommendation(
    risk_score: float,
    risk_level: str,
    risk_percentage: float,
    top_shap_features: List[Dict],
    patient_data: Dict,
) -> Dict:
    """
    Convenience function to generate recommendations.
    
    Example:
        recommendation = get_recommendation(
            risk_score=0.78,
            risk_level="High",
            risk_percentage=78.0,
            top_shap_features=[
                {"feature": "serum_creatinine", "value": 6.5, "impact": 0.34},
                {"feature": "gfr", "value": 25.0, "impact": 0.28},
            ],
            patient_data={...}
        )
    """
    generator = GroqRecommendationGenerator()
    return generator.generate(
        risk_score=risk_score,
        risk_level=risk_level,
        risk_percentage=risk_percentage,
        top_shap_features=top_shap_features,
        patient_data=patient_data,
    )
