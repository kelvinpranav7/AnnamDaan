# Models

Drop trained weights here:

- `food_safety.h5` — MobileNetV2 fine-tuned on a 3-class dataset:
  `fresh`, `slightly_stale`, `unsafe`. Input size **224×224×3**, scaled to [0,1].

When `food_safety.h5` is missing, `cnn/model.py` falls back to a brightness
heuristic so the API stays functional during development.
