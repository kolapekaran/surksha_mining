# SURAKSHA integrated development setup

This branch wires the existing React safety-monitoring UI to the FastAPI service and adds the existing safety-training frontend as a navigation tab. The training UI currently runs as a separate Vite development server embedded in the monitoring UI; it is not yet a single production build.

## Requirements
- Python 3.10+ (PyTorch/Ultralytics compatibility depends on the selected Python and platform)
- Node.js and npm
- Git LFS is not currently required for inference because the checked-in ML model files are small, but the repository also contains a very large dataset and experiment outputs.

## Start the backend
From the repository root:

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health endpoint: `http://127.0.0.1:8000/health`

Image inference endpoint: `POST http://127.0.0.1:8000/detect/all` with multipart field `file`. It invokes the available fire/smoke and PPE model inference functions. Fatigue is explicitly a placeholder. PPE currently reports the existing model's helmet detection only; do not interpret it as full PPE compliance.

## Start the monitoring frontend
In a second terminal:

```bash
cd safety-ai-frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies API paths to `http://127.0.0.1:8000`. Set `VITE_BACKEND_ORIGIN` if the API runs elsewhere.

## Start the training frontend
In a third terminal:

```bash
cd safety-game-frontend/safety-game-frontend
npm ci
npm run dev
```

The training tab embeds `http://localhost:5174`. Override this with `VITE_GAME_URL` when needed.

## Current integration limits
- The main monitoring API and ML image endpoint are connected, but other frontend service calls must be checked against their corresponding backend routes before being considered operational.
- The game is embedded from a separate development server; production deployment needs a shared build/hosting strategy and backend persistence wiring for game progress.
- The current fatigue implementation is a placeholder. Machinery/electrical detection scripts in the source tree include camera/GUI-specific code and are not imported into the server inference route.
- Model outputs and any simulation/demo data must be presented with their correct status; do not use this system as a substitute for approved site safety procedures.
