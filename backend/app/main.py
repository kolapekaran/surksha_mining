from fastapi import FastAPI

from app.core.cors import configure_cors
from app.routes import analyze, dashboard, ml, system, game

app = FastAPI(
    title="SURAKSHA Safety Intelligence API",
    version="2.0.0",
    description="Unified backend for safety monitoring, ML inference, simulation and training.",
)

configure_cors(app)

app.include_router(analyze.router, prefix="/api")
app.include_router(dashboard.router, prefix="/dashboard")
app.include_router(ml.router)
app.include_router(system.router)
app.include_router(game.router)


@app.get("/")
def root():
    return {
        "name": "SURAKSHA",
        "status": "running",
        "services": ["frontend", "fastapi", "ml", "training-game"],
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "surksha-backend"}
