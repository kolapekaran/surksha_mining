# SURAKSHA integration branch: run guide

This branch uses one React + Vite frontend (`safety-ai-frontend/`) and one FastAPI backend (`backend/`). The training game source is integrated into the main frontend under `safety-ai-frontend/src/safety-game/`; it is rendered directly in the dashboard without an iframe.

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
- `POST /game/complete` — validates and saves a completion to a local SQLite database (requires a browser-generated learner ID)
- `GET /game/progress/{learner_id}` — returns saved mission scores, completion counts, and the latest selected decisions

Legacy `/api/analyze` and `/dashboard/` routes remain mounted for compatibility. Some legacy services may still use fixed or synthetic inputs and should not be treated as live detection.

## Frontend

In another terminal:

```bash
cd safety-ai-frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies API requests to the FastAPI service on port 8000. The **Safety Training Game** navigation item renders the integrated game component inside the main React app. All frontend features run on port 5173.

## ML status and limitations

The repository tree includes `backend/ai_safety_system/ml_service/models/fire_smoke.pt`, `ppe_model.pt`, and `risk_model.pkl`. The repository tree confirms these artifact files exist: `fire_smoke.pt` (about 6.2 MB), `ppe_model.pt` (about 6.3 MB), and `risk_model.pkl` (about 83 KB). The unified image endpoint currently loads the two YOLO files lazily and caches loaded models. Risk model deserialization is intentionally not automatic. Fatigue, machinery and electrical detection do not have a verified unified image inference implementation and are reported unavailable.

Install the listed Python requirements before starting the API. Model loading/inference requires compatible PyTorch/Ultralytics and hardware. If the weights are missing from a local checkout, place trusted trained files in `backend/ai_safety_system/ml_service/models/` using the documented filenames. Do not rename unrelated training checkpoints without checking their class labels and intended domain.

## Simulation and training data

Simulation outputs are educational estimates only and are not a physical fire-spread model, safety certification or operational hazard prediction. Follow approved site emergency procedures and qualified safety guidance.

Successful game completions are saved in `backend/data/suraksha_progress.sqlite3` using Python's built-in SQLite support. The standalone game creates a browser-local learner ID and uses it to retrieve progress across sessions on the same browser. This is local persistence, not account-based identity: clearing browser storage creates a new learner ID, and the API has no authentication or authorization. Do not use this implementation for sensitive learner records or as a production student-account system. Local progress may be lost if the backend data directory is removed.

## Verification

This integration branch has been edited through GitHub's source API. It has not been checked out in a local build environment in this session, so dependency installation, startup, model inference and end-to-end browser flows remain unverified. Run the commands above and test against site-approved procedures before any real-world use.


## Unified frontend layout

The active frontend is `safety-ai-frontend/`. The training-game component, data and styles now live under `safety-ai-frontend/src/safety-game/` and are mounted by `src/screens/safetytraining.jsx`. Install dependencies in this frontend with `npm install`, then run `npm run dev` and open http://localhost:5173. The single Vite dev server proxies API requests to FastAPI on port 8000. The game still uses local mission descriptions, action scoring, dashboards and simulator content; backend mission catalog and progress endpoints are connected, but not every screen is dynamically backend-driven.
