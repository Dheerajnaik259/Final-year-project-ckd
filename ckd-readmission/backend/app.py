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

# CORS: restrict to known origins; fall back to permissive in local dev only
_default_origins = "http://localhost:5173,http://127.0.0.1:5173,https://ckd-risk.vercel.app"
allowed_origins = os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
CORS(app, resources={r"/*": {"origins": allowed_origins}})

from routes.predict import predict_bp
from routes.history import history_bp

app.register_blueprint(predict_bp)
app.register_blueprint(history_bp)

@app.route("/", methods=["GET"])
def index():
    logger.info("Index request")
    return {"message": "CKD Readmission Predictor Backend", "status": "running", "endpoints": {"/health": "Health check", "/predict": "Predict readmission risk"}}, 200

@app.route("/health", methods=["GET"])
def health():
    logger.info("Health check request")
    return {"status": "ok", "message": "CKD Backend is running"}, 200

if __name__ == "__main__":
    is_dev = os.getenv("FLASK_ENV", "production").lower() == "development"
    logger.info("Starting CKD Readmission Predictor Backend on port 5000")
    app.run(debug=is_dev, host="0.0.0.0", port=5000, use_reloader=False)