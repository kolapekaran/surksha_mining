# SURAKSHA Backend

## Unified API

The integration entry point is `main.py` at the backend root. From this directory, install dependencies and start it:

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r ai_safety_system/ml_service/requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- `GET /` and `GET /health`: API health.
- `GET /status`: configured model files and integration status.
- `POST /detect/all`: upload an image using multipart field `file`; runs the current fire and helmet-presence inference functions; ppe: true means no helmet was detected, not a complete PPE compliance audit.
- `/simulation`: existing simulation application.

ML inference requires the configured model files and compatible runtime dependencies. Fatigue inference is explicitly reported as unavailable until its model inference implementation is integrated. An inference error returns HTTP 503 rather than fabricated detections.

For the React/Vite frontend, run it from `safety-ai-frontend` using `npm install` and `npm run dev`. Its development proxy targets this backend on port 8000.

This API currently connects the existing camera-frame inference and simulation services. Other frontend panels that request workers, alerts, reports, heatmaps, replay, chatbot, or persistent progress still need corresponding backend endpoints and data storage before they can be considered live-connected.
