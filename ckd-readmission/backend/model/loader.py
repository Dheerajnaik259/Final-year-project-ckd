from __future__ import annotations

import json
import logging
import pickle
from functools import lru_cache
from typing import Any

from config.paths import FEATURE_NAMES_NAME, MODEL_DIR, SCALER_NAME, resolve_model_path

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def load_feature_names() -> list[str]:
    path = MODEL_DIR / FEATURE_NAMES_NAME
    if not path.exists():
        raise FileNotFoundError(f"Feature names not found at {path}")
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache(maxsize=1)
def load_artifacts() -> tuple[Any, Any, list[str]]:
    model_path = resolve_model_path()
    if model_path is None:
        raise FileNotFoundError(
            "No model artifact found. Train with backend/model/Train.py so "
            f"{MODEL_DIR / 'ckd_hybrid_model.pkl'} exists, or set CKD_MODEL_PATH."
        )

    scaler_path = MODEL_DIR / SCALER_NAME
    if not scaler_path.exists():
        raise FileNotFoundError(f"Scaler not found at {scaler_path}")

    with open(model_path, "rb") as handle:
        model = pickle.load(handle)
    with open(scaler_path, "rb") as handle:
        scaler = pickle.load(handle)

    feature_names = load_feature_names()
    logger.info("Loaded model artifacts from %s", model_path)
    return model, scaler, feature_names
