# SURAKSHA integration notes

This branch begins the API integration between the React camera frontend and the FastAPI backend.

## Development startup

1. From `backend/`, install dependencies with `python -m pip install -r requirements.txt`.
2. Start the API from the `backend/` directory with:
   `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
3. From `safety-ai-frontend/`, install dependencies with `npm install` and start with `npm run dev`.
4. The Vite development proxy forwards API requests to FastAPI on port 8000.

## API endpoints added on this branch

- `GET /` and `GET /health`: backend availability.
- `POST /detect/all`: accepts an image upload (multipart field `file`) and invokes the existing fire/PPE inference functions.

The inference endpoint returns an HTTP error if the image is invalid or ML inference cannot load/run. It does not silently turn inference failures into a safe result. Fatigue is currently a placeholder and is labelled `DEMO_PLACEHOLDER`; it is not a trained fatigue prediction.

## Known integration work still required

- Reconcile the legacy `app/services/ml_service.py` static/demo detection path with image-based inference.
- Align the frontend's interpretation of PPE model output: the current detector identifies helmet presence, which is not equivalent to verified PPE compliance or a PPE violation.
- Connect the Safety Game UI and its scenario/progress flows to persistent backend endpoints; its current interface is a separate frontend.
- Verify all model artifacts, runtime dependencies, API contracts, camera flow, and production build in a local environment.
- Keep secrets out of Git and provide environment configuration through local `.env` files.

All detection results require validation against representative site conditions and must not replace approved site safety procedures or supervisor directions.
