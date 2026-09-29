# SURAKSHA Mining Safety Platform

## Integration audit (2026-09-29)

This repository currently contains separate frontend and backend projects. The audit is in progress; this file records verified findings and does not claim that the applications are already unified.

### Verified project components

- `safety-ai-frontend/`: React 19 + Vite frontend. Its navigation currently exposes Home, Camera Monitoring, Dashboard, Reports, and Simulation.
- `safety-game-frontend/safety-game-frontend/`: React 18 + TypeScript + Vite training frontend. It contains modules for fire, PPE, risk, fatigue, machinery, and electrical safety, plus scenario training and a simulator.
- `backend/app/`: FastAPI application entry point that includes analyze and dashboard routers.
- `backend/ai_safety_system/`: separate FastAPI entry point mounting a simulation application.

### Integration risks confirmed from source

- The main frontend's Vite proxy currently targets `http://127.0.0.1:5000`; the backend entry point alone does not establish which port is used in the actual launch command.
- The main frontend's `src/main.jsx` wraps `App` in `AppProvider`, while `App.jsx` also wraps its content in `AppProvider`. This creates nested app contexts and should be consolidated.
- The game frontend is an independent application. Its source currently labels the experience as a frontend learning demonstration, with local-only/demo data and mock simulation outputs. Its displayed training metrics/certificates are static demo records.
- The main backend's `/api/analyze` route calls several service modules, but model behavior, persistence, and completeness still need inspection.
- The second backend entry point exposes a simulation mount; its sample `/simulate` route uses hard-coded demonstration inputs. It is not yet verified as a production simulation API.
- The root `backend/requirements.txt` exists but is empty.

### Current status

Repository metadata and selected source files were retrieved through the connected GitHub integration. The repository reports approximately 694 MB of GitHub size. The available GitHub connector in this session can fetch known text-file paths, but did not provide a repository tree/listing or a way to retrieve a complete source archive and binary model weights. GitHub code search returned no matches in this audit. Therefore a full dependency/model inventory, local build/test run, and complete ZIP cannot honestly be claimed from the files available so far.

### Integration principles

- Keep `main` unchanged; integration work is isolated on `suraksha-integration`.
- Treat camera output as ML only when an available model is actually loaded and inference succeeds.
- Label mock scenario outputs as simulations/demonstrations, never as validated safety predictions.
- Missing model weights and database configuration must produce explicit unavailable/offline states.
- Validate training content and emergency-response wording against applicable site procedures and qualified safety personnel before operational use.

### Next steps

1. Retrieve a complete repository checkout (for example, by cloning the repository locally) so the full source tree and any accessible model assets can be inspected.
2. Consolidate the two FastAPI generations based on their complete imports, service dependencies, and tests.
3. Integrate the game into the main React navigation and replace only those local demo flows that can be backed by real APIs.
4. Inventory and connect actual model artifacts, then test each inference path.
5. Run frontend builds, backend tests, and end-to-end API checks before packaging.
