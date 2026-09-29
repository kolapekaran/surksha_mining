"""Unified SURAKSHA FastAPI entry point.

Run from the backend directory with:
    uvicorn main:app --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai_safety_system.ml_service.api.ml_api import router as ml_router
from ai_safety_system.simulation.api.simulation_api import app as simulation_app

app = FastAPI(title="SURAKSHA Mining Safety API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": "SURAKSHA", "status": "online", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "suraksha-api"}


app.include_router(ml_router)
app.mount("/simulation", simulation_app)
