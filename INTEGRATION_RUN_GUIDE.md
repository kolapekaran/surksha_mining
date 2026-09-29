# SURAKSHA integration branch: run guide

This branch adds a unified FastAPI API surface while retaining legacy endpoints. It does not yet merge the standalone training-game UI into the main React app.

## Requirements

- Python 3.10+ (Python 3.11 is recommended)
- Node.js 20.19+ or 22.12+ for the repository's Vite 8 frontend
- Git

## Backend

From the repository root:

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run API tests from the `backend/` directory with `python -m pytest -q`.\n\nAPI docs: http://127.0.0.1:8000/docs
Health: http://127.0.0.1:8000/health

The unified API includes:
- `GET /health` — backend and per-model availability
- `POST /detect/all` — image upload inference using available YOLO weights
- `POST /api/simulation/run` — clearly labelled illustrative training calculation
- `GET /game/missions` and `GET /game/scenarios/{mission_id}` — scenario metadata
- `POST /game/complete` — validates a completion payload but does not persist it

Legacy `/api/analyze` and `/dashboard/` routes remain mounted for compatibility. Some legacy services may still use fixed or synthetic inputs and should not be treated as live detection.

## Frontend

In another terminal:

```bash
cd safety-ai-frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies API requests to the FastAPI service on port 8000.

## ML status and limitations

The repository tree includes `backend/ai_safety_system/ml_service/models/fire_smoke.pt`, `ppe_model.pt`, and `risk_model.pkl`. The repository tree confirms these artifact files exist: `fire_smoke.pt` (about 6.2 MB), `ppe_model.pt` (about 6.3 MB), and `risk_model.pkl` (about 83 KB). The unified image endpoint currently loads the two YOLO files lazily and caches loaded models. Risk model deserialization is intentionally not automatic. Fatigue, machinery and electrical detection do not have a verified unified image inference implementation and are reported unavailable.

Install the listed Python requirements before starting the API. Model loading/inference requires compatible PyTorch/Ultralytics and hardware. If the weights are missing from a local checkout, place trusted trained files in `backend/ai_safety_system/ml_service/models/` using the documented filenames. Do not rename unrelated training checkpoints without checking their class labels and intended domain.

## Simulation and training data

Simulation outputs are educational estimates only and are not a physical fire-spread model, safety certification or operational hazard prediction. Follow approved site emergency procedures and qualified safety guidance.

Game completion currently returns a validated response but is not saved to a database. Do not treat it as durable training progress. No database credentials or production database are configured by this change.

## Verification

This integration branch has been edited through GitHub's source API. It has not been checked out in a local build environment in this session, so dependency installation, startup, model inference and end-to-end browser flows remain unverified. Run the commands above and test against site-approved procedures before any real-world use.


## Standalone training-game frontend

The existing game is a separate React 18 + TypeScript Vite app; it is not yet mounted inside the main Safety AI navigation. It is configured to run on port 5174 and proxy API paths to FastAPI:

```bash
cd safety-game-frontend/safety-game-frontend
npm install
npm run dev
```

Open http://localhost:5174. The proxy makes the unified API reachable from the game origin. The current game UI still contains local demonstration content; proxy configuration alone does not connect its progress, mission catalog, or detection screens to the backend.
