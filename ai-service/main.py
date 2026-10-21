from functools import lru_cache
from datetime import datetime
from io import BytesIO
import ipaddress
import re
import socket
from urllib.parse import urlparse

import requests
import torch
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from PIL import Image
from sentence_transformers import SentenceTransformer
from transformers import CLIPModel, CLIPProcessor

app = FastAPI(title="Lost and Found Research AI", version="0.2.0")

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CLIP_MODEL_NAME = "openai/clip-vit-base-patch32"
IMAGE_TIMEOUT = 8
MAX_IMAGE_BYTES = 8 * 1024 * 1024


@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer(MODEL_NAME)


@lru_cache(maxsize=1)
def get_clip():
    model = CLIPModel.from_pretrained(CLIP_MODEL_NAME)
    processor = CLIPProcessor.from_pretrained(CLIP_MODEL_NAME)
    model.eval()
    return model, processor


class Item(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=3000)
    category: str = Field(default="", max_length=100)
    location: str = Field(default="", max_length=300)
    date: str = ""
    image_url: str = Field(default="", max_length=2000)


class MatchRequest(BaseModel):
    lost: Item
    found: Item


def make_text(item: Item) -> str:
    return (
        f"Item name: {item.name}. "
        f"Category: {item.category}. "
        f"Description: {item.description}."
    )


def lexical_similarity(a: str, b: str) -> float:
    words_a = set(a.lower().split())
    words_b = set(b.lower().split())
    if not words_a or not words_b:
        return 0.0
    return len(words_a & words_b) / len(words_a | words_b)


def date_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    try:
        date_a = datetime.fromisoformat(a.replace("Z", "+00:00")).date()
        date_b = datetime.fromisoformat(b.replace("Z", "+00:00")).date()
        days = abs((date_a - date_b).days)
        return round(max(0.0, 1.0 - days / 30.0), 4)
    except ValueError:
        return 1.0 if a[:10] == b[:10] else 0.0


def _public_http_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()

        # Narrow local-development exception: only generated WebP filenames
        # served by the local application. No query, fragment, or redirects
        # to another URL are permitted by this allowlist.
        if (
            parsed.scheme == "http"
            and host in ("localhost", "127.0.0.1")
            and parsed.port == 5001
            and not parsed.query
            and not parsed.fragment
            and re.fullmatch(r"/uploads/[0-9a-f]{32}\.webp", parsed.path)
        ):
            return True

        # All other remote image URLs must use public HTTPS.
        if parsed.scheme != "https" or not host:
            return False
        if host == "localhost" or host.endswith(".localhost") or host.endswith(".local"):
            return False

        addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        return bool(addresses) and all(
            ipaddress.ip_address(result[4][0]).is_global
            for result in addresses
        )
    except (ValueError, OSError, socket.gaierror):
        return False



def load_image(url: str):
    if not url:
        return None

    current_url = url

    for _ in range(5):
        if not _public_http_url(current_url):
            raise ValueError("Image URL or redirect target must be a public HTTPS URL")

        response = requests.get(
            current_url,
            timeout=IMAGE_TIMEOUT,
            stream=True,
            headers={"User-Agent": "LostAndFoundResearchAI/0.2"},
            allow_redirects=False,
        )

        if response.status_code in (301, 302, 303, 307, 308):
            location = response.headers.get("Location")
            response.close()

            if not location:
                raise ValueError("Image redirect has no destination")

            from urllib.parse import urljoin
            current_url = urljoin(current_url, location)
            continue

        try:
            response.raise_for_status()
            content_type = response.headers.get("Content-Type", "").lower()

            if not content_type.startswith("image/"):
                raise ValueError("URL did not return an image")

            length = response.headers.get("Content-Length")
            if length and int(length) > MAX_IMAGE_BYTES:
                raise ValueError("Image exceeds size limit")

            chunks = []
            size = 0

            for chunk in response.iter_content(65536):
                size += len(chunk)
                if size > MAX_IMAGE_BYTES:
                    raise ValueError("Image exceeds size limit")
                chunks.append(chunk)

            image = Image.open(BytesIO(b"".join(chunks))).convert("RGB")
            image.thumbnail((1024, 1024))
            return image
        finally:
            response.close()

    raise ValueError("Too many image redirects")

def image_similarity(url_a: str, url_b: str):
    if not url_a or not url_b:
        return None
    image_a = load_image(url_a)
    image_b = load_image(url_b)
    if image_a is None or image_b is None:
        return None

    model, processor = get_clip()
    inputs = processor(images=[image_a, image_b], return_tensors="pt")
    with torch.inference_mode():
        outputs = model.vision_model(
            pixel_values=inputs["pixel_values"],
            return_dict=True,
        )
        features = model.visual_projection(outputs.pooler_output)
        features = F.normalize(features, p=2, dim=-1)
        cosine = F.cosine_similarity(
            features[0].unsqueeze(0), features[1].unsqueeze(0)
        ).item()

    # CLIP cosine is a similarity signal, not a probability.
    return round(max(0.0, min(1.0, cosine)), 4)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "lost-found-ai",
        "text_model": MODEL_NAME,
        "image_model": CLIP_MODEL_NAME,
    }


@app.post("/match")
def match_items(payload: MatchRequest):
    try:
        model = get_model()
        embeddings = model.encode(
            [make_text(payload.lost), make_text(payload.found)],
            convert_to_tensor=True,
            normalize_embeddings=True,
        )
        cosine = F.cosine_similarity(
            embeddings[0].unsqueeze(0),
            embeddings[1].unsqueeze(0),
        ).item()
        text_score = max(0.0, min(1.0, cosine))
        location_score = lexical_similarity(
            payload.lost.location, payload.found.location
        )
        time_score = date_similarity(payload.lost.date, payload.found.date)

        return {
            "text_similarity": round(text_score, 4),
            "location_similarity": round(location_score, 4),
            "date_similarity": round(time_score, 4),
            "combined_score": round(
                0.70 * text_score + 0.15 * location_score + 0.15 * time_score,
                4,
            ),
            "model": MODEL_NAME,
            "ranking_method": "text and baseline context",
            "disclaimer": "Scores are experimental ranking signals, not probabilities or proof of ownership.",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Matching service unavailable: {type(exc).__name__}",
        ) from exc


@app.post("/match/image")
def match_images(payload: MatchRequest):
    try:
        score = image_similarity(
            payload.lost.image_url, payload.found.image_url
        )
        return {
            "image_similarity": score,
            "model": CLIP_MODEL_NAME if score is not None else None,
            "available": score is not None,
            "disclaimer": "Visual similarity is an experimental signal, not proof that two images show the same physical object.",
        }
    except Exception as exc:
        import logging
        logging.exception("Image matching failed")
        raise HTTPException(
            status_code=422,
            detail=f"Image matching failed: {type(exc).__name__}: {str(exc)}",
        ) from exc


@app.post("/match/multimodal")
def match_multimodal(payload: MatchRequest):
    try:
        model = get_model()
        embeddings = model.encode(
            [make_text(payload.lost), make_text(payload.found)],
            convert_to_tensor=True,
            normalize_embeddings=True,
        )
        cosine = F.cosine_similarity(
            embeddings[0].unsqueeze(0), embeddings[1].unsqueeze(0)
        ).item()
        text_score = max(0.0, min(1.0, cosine))
        location_score = lexical_similarity(
            payload.lost.location, payload.found.location
        )
        time_score = date_similarity(payload.lost.date, payload.found.date)
        visual_score = image_similarity(
            payload.lost.image_url, payload.found.image_url
        )

        if visual_score is None:
            combined = (
                0.70 * text_score
                + 0.15 * location_score
                + 0.15 * time_score
            )
            method = "text and baseline context; image unavailable"
        else:
            combined = (
                0.50 * text_score
                + 0.25 * visual_score
                + 0.15 * location_score
                + 0.10 * time_score
            )
            method = "experimental fixed-weight multimodal fusion"

        return {
            "text_similarity": round(text_score, 4),
            "image_similarity": visual_score,
            "location_similarity": round(location_score, 4),
            "date_similarity": round(time_score, 4),
            "combined_score": round(combined, 4),
            "text_model": MODEL_NAME,
            "image_model": CLIP_MODEL_NAME if visual_score is not None else None,
            "ranking_method": method,
            "disclaimer": "Scores are experimental ranking signals, not probabilities or proof of ownership.",
        }
    except Exception as exc:
        import logging
        logging.exception("Multimodal matching failed")
        raise HTTPException(
            status_code=422,
            detail=f"Multimodal matching failed: {type(exc).__name__}: {str(exc)}",
        ) from exc
