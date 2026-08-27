"""
Classification providers.

The diagnosis engine is swappable: the local ONNX model today, a hosted
crop-health API (Plantix, Kindwise) once credentials exist. Every provider
returns the same normalised Diagnosis, so the frontend never has to know
which one answered.

Select with the APOLLO_PROVIDER env var: "local" (default), "plantix".
"""

from __future__ import annotations

import io
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from PIL import Image, ImageOps

# PlantVillage class list. "Crop___Condition", 38 entries, index-aligned to the
# model's output layer. Do not reorder.
CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
    'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy',
    'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]


def split_label(raw: str) -> Tuple[str, str]:
    """'Corn_(maize)___Common_rust_' -> ('Corn (maize)', 'Common rust')."""
    crop, _, condition = raw.partition('___')
    if not condition:
        crop, condition = '', raw
    tidy = lambda s: ' '.join(s.replace('_', ' ').split())
    condition = tidy(condition)
    return tidy(crop), (condition[:1].upper() + condition[1:]) if condition else ''


# ---------------------------------------------------------------------------
# Normalised result
# ---------------------------------------------------------------------------

# How the engine rates its own answer.
DIAGNOSED = "diagnosed"        # confident: show the result
UNCERTAIN = "uncertain"        # plausible leaf, weak evidence: show, but hedge
UNRECOGNISED = "unrecognised"  # not a leaf this engine can read: show nothing


@dataclass
class Candidate:
    crop: str
    condition: str
    probability: float
    raw_label: str

    def as_dict(self) -> Dict[str, Any]:
        return {
            "crop": self.crop,
            "condition": self.condition,
            "probability": self.probability,
            "raw_label": self.raw_label,
            "is_healthy": self.condition.lower() == "healthy",
        }


@dataclass
class Diagnosis:
    status: str
    provider: str
    candidates: List[Candidate] = field(default_factory=list)
    signals: Dict[str, Any] = field(default_factory=dict)
    advice: Optional[str] = None
    all_probs: Optional[Dict[str, float]] = None

    @property
    def top(self) -> Optional[Candidate]:
        return self.candidates[0] if self.candidates else None

    def as_dict(self) -> Dict[str, Any]:
        top = self.top
        payload: Dict[str, Any] = {
            "status": self.status,
            "provider": self.provider,
            "crop": top.crop if top else None,
            "condition": top.condition if top else None,
            "is_healthy": (top.condition.lower() == "healthy") if top else None,
            "confidence": top.probability if top else 0.0,
            "candidates": [c.as_dict() for c in self.candidates],
            "signals": self.signals,
            "advice": self.advice,
        }
        # Back-compatible keys for the original /predict contract.
        payload["class"] = top.raw_label if top else "Unknown"
        payload["all_probs"] = self.all_probs or {}
        return payload


# ---------------------------------------------------------------------------
# Local ONNX provider
# ---------------------------------------------------------------------------

def _softmax(z: np.ndarray) -> np.ndarray:
    e = np.exp(z - z.max())
    return e / e.sum()


class LocalOnnxProvider:
    """
    ResNet-18 over PlantVillage, exported to ONNX.

    PlantVillage is 70k lab photographs of single detached leaves on uniform
    backgrounds, and the head is a softmax over exactly 38 classes. Given a
    drone, a tractor or an aerial field shot, the network still has to spend
    all its probability mass on those 38 options, so it returns a confident
    disease. Max-softmax cannot catch this: measured on this checkpoint, an
    aerial field photo scored 0.997 while a genuine tomato leaf scored 0.999.

    The energy score does separate them. E(x) = logsumexp(logits) reflects the
    unnormalised magnitude of the evidence rather than its distribution across
    classes, so it collapses on inputs the network has no support for
    (Liu et al., Energy-based Out-of-distribution Detection, NeurIPS 2020).
    Measured on the bundled fixtures: real leaves 14.3-17.7, non-leaves
    1.5-8.9. The default thresholds sit inside that gap.

    Those bounds come from nine images. Treat them as a working default, not a
    calibrated constant, and re-fit them against a real labelled set before
    leaning on them in production. Both are env-tunable.
    """

    name = "local-onnx"

    # Energy above CONFIDENT -> diagnose. Below UNCERTAIN -> refuse. Between -> hedge.
    ENERGY_CONFIDENT = float(os.getenv("APOLLO_ENERGY_CONFIDENT", "12.0"))
    ENERGY_UNCERTAIN = float(os.getenv("APOLLO_ENERGY_UNCERTAIN", "9.0"))

    def __init__(self, session):
        self.session = session
        self.input_name = session.get_inputs()[0].name
        self.output_name = session.get_outputs()[0].name
        shape = session.get_inputs()[0].shape
        # Trust the model's own declared spatial size rather than hardcoding 256.
        self.size = shape[2] if isinstance(shape[2], int) else 256

    def _logits(self, img: Image.Image) -> np.ndarray:
        arr = np.array(img.convert("RGB").resize((self.size, self.size))).astype(np.float32) / 255.0
        tensor = np.expand_dims(arr.transpose(2, 0, 1), axis=0)
        return self.session.run([self.output_name], {self.input_name: tensor})[0][0]

    @staticmethod
    def _views(img: Image.Image) -> List[Image.Image]:
        """Cheap test-time views. A real leaf reads the same from any of them."""
        w, h = img.size
        cw, ch = int(w * 0.8), int(h * 0.8)
        crop = img.crop(((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch))
        return [img, ImageOps.mirror(img), ImageOps.flip(img), crop]

    def diagnose(self, image_bytes: bytes) -> Diagnosis:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        logits = self._logits(img)
        probs = _softmax(logits)

        # Energy = logsumexp(logits), computed in the shifted form for stability.
        energy = float(np.log(np.exp(logits - logits.max()).sum()) + logits.max())

        # Agreement across views: a secondary signal, reported but not gating.
        top1 = int(np.argmax(probs))
        view_preds = [int(np.argmax(self._logits(v))) for v in self._views(img)]
        agreement = view_preds.count(top1) / len(view_preds)

        if energy >= self.ENERGY_CONFIDENT:
            status = DIAGNOSED
        elif energy >= self.ENERGY_UNCERTAIN:
            status = UNCERTAIN
        else:
            status = UNRECOGNISED

        order = np.argsort(probs)[::-1][:3]
        candidates = []
        for i in order:
            crop, condition = split_label(CLASSES[i])
            candidates.append(Candidate(crop, condition, float(probs[i]), CLASSES[i]))

        return Diagnosis(
            status=status,
            provider=self.name,
            candidates=candidates,
            signals={
                "energy": round(energy, 2),
                "view_agreement": round(agreement, 2),
                "thresholds": {
                    "confident": self.ENERGY_CONFIDENT,
                    "uncertain": self.ENERGY_UNCERTAIN,
                },
            },
            all_probs={cls: float(p) for cls, p in zip(CLASSES, probs)},
        )


# ---------------------------------------------------------------------------
# Plantix provider
# ---------------------------------------------------------------------------

class PlantixProvider:
    """
    Plantix Crop Health API.

    Plantix has no self-serve signup: access runs through their sales team and
    onboarding takes 4-6 weeks, so there is no public schema to code against.
    The documented behaviour is a REST endpoint that takes a crop photo and
    returns JSON with a diagnosis, a confidence and treatment guidance across
    69 crops and 950+ conditions.

    The response mapping below is therefore a best guess over the field names
    such an API plausibly uses. It is deliberately defensive and reads several
    aliases per field. When the real credentials arrive, set
    PLANTIX_DEBUG_RESPONSE=1, POST one image, read the logged payload and
    correct _parse. That is the only function that should need touching.
    """

    name = "plantix"

    def __init__(self) -> None:
        self.api_key = os.getenv("PLANTIX_API_KEY")
        self.url = os.getenv("PLANTIX_API_URL", "https://api.plantix.net/v2/image_analysis")
        self.debug = os.getenv("PLANTIX_DEBUG_RESPONSE") == "1"
        if not self.api_key:
            raise RuntimeError(
                "PLANTIX_API_KEY is not set. Plantix access is granted through their "
                "sales team; until you have a key, run with APOLLO_PROVIDER=local."
            )

    def diagnose(self, image_bytes: bytes) -> Diagnosis:
        import httpx

        response = httpx.post(
            self.url,
            headers={"Api-Key": self.api_key, "Accept": "application/json"},
            files={"image": ("crop.jpg", image_bytes, "image/jpeg")},
            timeout=30.0,
        )
        response.raise_for_status()
        payload = response.json()

        if self.debug:
            print(f"[plantix] raw response: {payload}")

        return self._parse(payload)

    def _parse(self, payload: Dict[str, Any]) -> Diagnosis:
        """Map Plantix's payload onto Diagnosis. Verify against a real response."""
        first = lambda d, *keys: next((d[k] for k in keys if isinstance(d, dict) and d.get(k) is not None), None)

        predictions = first(payload, "predictions", "results", "diagnoses", "data") or []
        if isinstance(predictions, dict):
            predictions = [predictions]

        candidates: List[Candidate] = []
        for item in predictions[:3]:
            if not isinstance(item, dict):
                continue
            condition = first(item, "peat_id", "name", "disease", "label", "common_name") or "Unknown"
            crop = first(item, "crop", "crop_name", "plant") or ""
            prob = first(item, "confidence", "probability", "score") or 0.0
            candidates.append(Candidate(str(crop), str(condition), float(prob), str(condition)))

        if not candidates:
            return Diagnosis(status=UNRECOGNISED, provider=self.name, signals={"raw": payload})

        # Plantix reports >90% accuracy on field photos and returns its own
        # confidence, so the local energy heuristic does not apply here.
        top = candidates[0]
        status = DIAGNOSED if top.probability >= 0.6 else UNCERTAIN

        return Diagnosis(
            status=status,
            provider=self.name,
            candidates=candidates,
            advice=first(payload, "treatment", "advice", "recommendation"),
            signals={"source": "plantix-confidence"},
        )


# ---------------------------------------------------------------------------
# Selection
# ---------------------------------------------------------------------------

def build_provider(onnx_session=None):
    """Return the configured provider, falling back to local on any failure."""
    choice = os.getenv("APOLLO_PROVIDER", "local").strip().lower()

    if choice == "plantix":
        try:
            return PlantixProvider()
        except Exception as e:
            print(f"Plantix provider unavailable ({e}); falling back to local model.")

    if onnx_session is None:
        return None
    return LocalOnnxProvider(onnx_session)
