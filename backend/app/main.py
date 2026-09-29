from fastapi import FastAPI
from app.routes import analyze, dashboard, ml_detect

app = FastAPI(title="SURAKSHA Safety API", version="1.0.0")

app.include_router(analyze.router, prefix="/api")
app.include_router(dashboard.router, prefix="/dashboard")
app.include_router(ml_detect.router)


@app.get("/")
def root():
    return {"message": "SURAKSHA backend running"}


@app.get("/health")
def health():
    return {"status": "online", "service": "suraksha-api"}
