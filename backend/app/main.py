from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import analyze, dashboard, unified

app = FastAPI(
    title="SURAKSHA Mining Safety API",
    version="1.0.0",
    description="Unified API for safety monitoring, training simulations and scenario learning.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analyze.router, prefix="/api", tags=["legacy-analysis"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(unified.router, tags=["unified"])

@app.get("/")
def root():
    return {"message": "SURAKSHA API running", "docs": "/docs"}
