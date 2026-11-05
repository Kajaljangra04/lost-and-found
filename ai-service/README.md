# Findora AI service

The existing FastAPI service provides SentenceTransformer text similarity and CLIP image similarity. The backend calls `/match` for optional semantic ranking when `AI_SERVICE_URL` is configured; its conventional fuzzy matcher remains available when the service is offline.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

Health check: `GET /health`.
