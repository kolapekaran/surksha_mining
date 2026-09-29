from fastapi import FastAPI

# ✅ FIXED IMPORT
from ai_safety_system.simulation.api.simulation_api import app as simulation_app

app = FastAPI()

@app.get("/")
def home():
    return {"status": "AI Safety Backend Running"}

app.mount("/simulation", simulation_app)