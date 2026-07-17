import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(r"e:\CKD\ckd-readmission\backend")))
load_dotenv(r"e:\CKD\ckd-readmission\backend\.env")

from services.groq_service import get_ai_suggestions

data = {
    'GFR': 45,
    'SerumCreatinine': 2.0,
    'BUNLevels': 30,
    'SerumElectrolytesPotassium': 5.5,
    'SerumElectrolytesSodium': 130,
    'ProteinInUrine': 1.0,
    'SystolicBP': 140,
    'HemoglobinLevels': 10.0,
    'Diabetes': 'Yes',
    'Smoking': 'Yes'
}

res = get_ai_suggestions("High", 80.0, data)
print("Result:")
import json
print(json.dumps(res, indent=2))
