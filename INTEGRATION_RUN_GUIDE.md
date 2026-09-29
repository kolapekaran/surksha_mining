# SURAKSHA Mining Safety — Run Guide

## Architecture

This repository uses one active React/Vite frontend and one FastAPI backend. The training game is integrated into the frontend at `frontend/src/safety-game/`.

## Backend

From the repository root:

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\\Scripts\\Activate.ps1
# macOS/Linux
# source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Key endpoints:

- `GET /health` — backend and ML availability
- `POST /detect/all` — Fire/Smoke and PPE image inference
- `POST /api/simulation/run` — training simulation
- `GET /game/missions` — training mission catalog
- `GET /game/scenarios/{mission_id}` — scenario details
- `POST /game/complete` — save a training completion
- `GET /game/progress/{learner_id}` — retrieve local training progress

## Frontend

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies backend requests to `http://127.0.0.1:8000`.

## ML

Tracked runtime models are under `backend/ai_safety_system/ml_service/models/`. The unified detection endpoint loads the Fire/Smoke and PPE YOLO models lazily. Other safety domains remain explicitly unavailable until verified model artifacts and inference implementations are connected.

## Important

Simulation and training results are educational. They are not operational hazard forecasts, safety certification, or a substitute for approved site procedures and qualified safety personnel.
