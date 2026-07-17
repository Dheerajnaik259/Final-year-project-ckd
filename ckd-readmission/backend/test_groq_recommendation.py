"""
Test file for Groq recommendation integration.
Run this to verify the clinical recommendation generation works correctly.
"""

import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from services.groq_recommendation import get_recommendation

# Sample patient data
SAMPLE_PATIENT = {
    "Age": 65,
    "Gender": 1,
    "Ethnicity": 0,
    "SocioeconomicStatus": 1,
    "EducationLevel": 2,
    "BMI": 28.5,
    "Smoking": 1,
    "AlcoholConsumption": 2.0,
    "PhysicalActivity": 3.0,
    "DietQuality": 4.0,
    "SleepQuality": 6.0,
    "FamilyHistoryKidneyDisease": 1,
    "FamilyHistoryHypertension": 1,
    "FamilyHistoryDiabetes": 0,
    "PreviousAcuteKidneyInjury": 1,
    "UrinaryTractInfections": 1,
    "SystolicBP": 145,
    "DiastolicBP": 90,
    "FastingBloodSugar": 110.0,
    "HbA1c": 7.2,
    "SerumCreatinine": 2.1,
    "BUNLevels": 25.0,
    "GFR": 45.0,
    "ProteinInUrine": 0.5,
    "ACR": 35.0,
    "SerumElectrolytesSodium": 138.0,
    "SerumElectrolytesPotassium": 4.5,
    "SerumElectrolytesCalcium": 9.0,
    "SerumElectrolytesPhosphorus": 4.0,
    "HemoglobinLevels": 11.0,
    "CholesterolTotal": 210.0,
    "CholesterolLDL": 130.0,
    "CholesterolHDL": 45.0,
    "CholesterolTriglycerides": 180.0,
    "ACEInhibitors": 1,
    "Diuretics": 0,
    "NSAIDsUse": 0.0,
    "Statins": 1,
    "AntidiabeticMedications": 0,
    "Edema": 1,
    "FatigueLevels": 6.0,
    "NauseaVomiting": 2.0,
    "MuscleCramps": 3.0,
    "Itching": 4.0,
    "QualityOfLifeScore": 55.0,
    "HeavyMetalsExposure": 0,
    "OccupationalExposureChemicals": 0,
    "WaterQuality": 1,
    "MedicalCheckupsFrequency": 2.0,
    "MedicationAdherence": 7.0,
    "Diabetes": 0
}

# Sample top clinical factors (as would be returned from predict())
SAMPLE_FACTORS = [
    {"feature": "SerumCreatinine", "value": 2.1, "impact": 0.28},
    {"feature": "GFR", "value": 45.0, "impact": 0.25},
    {"feature": "SerumElectrolytesPotassium", "value": 4.5, "impact": 0.12},
    {"feature": "BUNLevels", "value": 25.0, "impact": 0.10},
    {"feature": "HemoglobinLevels", "value": 11.0, "impact": 0.08},
]


def test_groq_recommendation():
    """Test Groq recommendation generation."""
    
    print("=" * 70)
    print("Testing Groq Clinical Recommendation Generator")
    print("=" * 70)
    
    # Test High Risk
    print("\n\n--- TEST 1: HIGH RISK PATIENT ---")
    recommendation = get_recommendation(
        risk_score=0.78,
        risk_level="High",
        risk_percentage=78.0,
        top_shap_features=SAMPLE_FACTORS,
        patient_data=SAMPLE_PATIENT
    )
    
    print("\nRecommendation Response:")
    print(json.dumps(recommendation, indent=2))
    
    # Validate response structure
    required_fields = ["summary", "immediate_actions", "lifestyle_advice", "follow_up", "urgency_level"]
    assert all(field in recommendation for field in required_fields), "Missing required fields!"
    assert isinstance(recommendation["immediate_actions"], list), "immediate_actions should be a list"
    assert isinstance(recommendation["lifestyle_advice"], list), "lifestyle_advice should be a list"
    assert recommendation["urgency_level"] in ["Critical", "High", "Medium", "Low"], "Invalid urgency level"
    
    print("\n✅ Response structure is valid!")
    
    
    # Test Medium Risk
    print("\n\n--- TEST 2: MEDIUM RISK PATIENT ---")
    recommendation_medium = get_recommendation(
        risk_score=0.55,
        risk_level="Medium",
        risk_percentage=55.0,
        top_shap_features=SAMPLE_FACTORS,
        patient_data=SAMPLE_PATIENT
    )
    
    print("\nRecommendation Response:")
    print(json.dumps(recommendation_medium, indent=2))
    
    
    # Test Low Risk
    print("\n\n--- TEST 3: LOW RISK PATIENT ---")
    recommendation_low = get_recommendation(
        risk_score=0.25,
        risk_level="Low",
        risk_percentage=25.0,
        top_shap_features=SAMPLE_FACTORS,
        patient_data=SAMPLE_PATIENT
    )
    
    print("\nRecommendation Response:")
    print(json.dumps(recommendation_low, indent=2))
    
    
    print("\n\n" + "=" * 70)
    print("✅ All tests passed! Groq recommendation generator is working.")
    print("=" * 70)


if __name__ == "__main__":
    test_groq_recommendation()
