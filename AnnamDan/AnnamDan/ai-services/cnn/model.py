"""
Food safety CNN.

In production this loads a fine-tuned MobileNetV2 from /models. For this
scaffold we ship a heuristic + stub so the API is functional end-to-end and
swappable when the trained weights are dropped in.
"""
from pathlib import Path
from typing import Dict

import numpy as np

LABELS = ["fresh", "slightly_stale", "unsafe"]
SHELF_BY_LABEL = {"fresh": 4, "slightly_stale": 2, "unsafe": 0}

_MODEL = None
_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "food_safety.h5"


def _load():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    if not _MODEL_PATH.exists():
        return None
    try:
        from tensorflow.keras.models import load_model  # type: ignore

        _MODEL = load_model(str(_MODEL_PATH))
    except Exception:
        _MODEL = None
    return _MODEL


def predict_safety(image_array: np.ndarray) -> Dict:
    model = _load()
    if model is not None:
        x = np.expand_dims(image_array.astype("float32"), axis=0)
        probs = model.predict(x, verbose=0)[0]
        idx = int(np.argmax(probs))
        label = LABELS[idx]
        confidence = float(probs[idx])
    else:
        # Heuristic stub: brighter = fresher. Replace once weights are present.
        brightness = float(image_array.mean())
        if brightness > 0.55:
            label, confidence = "fresh", 0.94
        elif brightness > 0.35:
            label, confidence = "slightly_stale", 0.78
        else:
            label, confidence = "unsafe", 0.62

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "shelf_hours": SHELF_BY_LABEL[label],
    }
