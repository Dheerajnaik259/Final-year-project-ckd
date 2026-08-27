"""Artifact locations. Models live in the repo (or CKD_MODEL_PATH), never ~/Downloads."""

from __future__ import annotations

import os
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent.parent / "model"

HYBRID_MODEL_NAME = "ckd_hybrid_model.pkl"
FALLBACK_MODEL_NAME = "ckd_model.pkl"
SCALER_NAME = "scaler.pkl"
FEATURE_NAMES_NAME = "feature_names.json"


def resolve_model_path() -> Path | None:
    """Return the first existing model artifact, preferring an explicit env override."""
    env_path = os.getenv("CKD_MODEL_PATH")
    candidates = []
    if env_path:
        candidates.append(Path(env_path))
    candidates.extend(
        [
            MODEL_DIR / HYBRID_MODEL_NAME,
            MODEL_DIR / FALLBACK_MODEL_NAME,
        ]
    )
    for path in candidates:
        if path.exists():
            return path
    return None
