from flask import Flask
from flask_cors import CORS
import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Ensure backend directory is in path for imports
sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

app = Flask(__name__)
CORS(app)

from routes.predict import predict_bp

app.register_blueprint(predict_bp)

@app.route("/", methods=["GET"])
def index():
    logger.info("Index request")
    return {"message": "CKD Readmission Predictor Backend", "status": "running", "endpoints": {"/health": "Health check", "/predict": "Predict readmission risk"}}, 200

@app.route("/health", methods=["GET"])
def health():
    logger.info("Health check request")
    return {"status": "ok", "message": "CKD Backend is running"}, 200

if __name__ == "__main__":
    logger.info("Starting CKD Readmission Predictor Backend on port 5000")
    app.run(debug=True, port=5000)