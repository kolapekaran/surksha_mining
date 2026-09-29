# SURAKSHA Mining Safety Platform — Integration Audit

## Current architecture

- **Frontend:** `frontend/` (React + Vite)
- **Training game:** integrated at `frontend/src/safety-game/` and rendered by the main frontend
- **Backend:** `backend/app/` (FastAPI)
- **ML runtime:** `backend/ai_safety_system/ml_service/`
- **Production detection endpoint:** `POST /detect/all`
- **Simulation/game endpoints:** served by the unified FastAPI router

## Verified integration paths

1. Vite proxies `/api`, `/health`, and `/detect` to FastAPI on port 8000.
2. The frontend calls `/health` for backend/model status.
3. Camera frames are uploaded to `/detect/all` as multipart images.
4. The unified backend loads the tracked Fire/Smoke and PPE YOLO models lazily from the ML model directory.
5. Training/game UI is part of the active frontend rather than a second frontend application.
6. Game progress is persisted by the backend in local SQLite when completion endpoints are used.

## Deliberately unavailable capabilities

Fatigue, machinery and electrical image models are not claimed as production inference paths unless corresponding verified model artifacts and inference implementations are present. The API reports these states explicitly rather than fabricating detections.

## Repository hygiene

The obsolete standalone training frontend, tracked dependency directories, Python bytecode/cache files, local environment file, temporary runner file and runtime log were removed from the active tree. The active frontend is the only frontend application retained.

## Verification note

The GitHub integration can inspect source and repository metadata, but it cannot replace a local browser/build environment for full end-to-end execution. Before deployment, run the documented frontend build, backend test suite and a live `/health` + `/detect/all` smoke test with the production model files.
