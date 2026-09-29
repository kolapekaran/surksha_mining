from fastapi import FastAPI
from app.routes import analyze, dashboard   # ✅ correct import

app = FastAPI()

# Routes include
app.include_router(analyze.router, prefix="/api")
app.include_router(dashboard.router, prefix="/dashboard")


@app.get("/")
def root():
    return {"message": "Backend running 🚀"}