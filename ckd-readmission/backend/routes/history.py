from flask import Blueprint, jsonify, request
import logging

from services.supabase_service import get_predictions, get_prediction_by_id

logger = logging.getLogger(__name__)
history_bp = Blueprint("history", __name__)


@history_bp.route("/history", methods=["GET"])
def list_predictions():
    """Return paginated list of recent predictions."""
    try:
        limit = min(int(request.args.get("limit", 20)), 100)
        offset = max(int(request.args.get("offset", 0)), 0)
    except (ValueError, TypeError):
        limit, offset = 20, 0

    predictions = get_predictions(limit=limit, offset=offset)
    return jsonify({"predictions": predictions, "count": len(predictions)}), 200


@history_bp.route("/history/<prediction_id>", methods=["GET"])
def get_prediction_detail(prediction_id):
    """Return full details for a single prediction."""
    prediction = get_prediction_by_id(prediction_id)

    if prediction is None:
        return jsonify({"error": "Prediction not found"}), 404

    return jsonify(prediction), 200
