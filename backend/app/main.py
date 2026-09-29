from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import analyze, dashboard
from ai_safety_system.ml_service.api.ml_api import app as ml_app

app = FastAPI(title="SURAKSHA Safety API", version="1.0.0")

# Vite proxies API calls in development. CORS also permits a separately hosted
# frontend when FRONTEND_ORIGIN is configured in the environment.
import os
frontend_origin = os.getenv("FRONTEND_ORIGIN")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin] if frontend_origin else ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(dashboard.router, prefix="/dashboard")
app.mount("/detect", ml_app)

@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok", "service": "suraksha-api", "ml_endpoint": "/detect/all"}
