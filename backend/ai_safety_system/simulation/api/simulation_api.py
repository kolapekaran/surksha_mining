from fastapi import FastAPI

# ✅ FINAL CORRECT IMPORT
from ai_safety_system.simulation.simulation_engine import run_simulation

app = FastAPI()

@app.get("/")
def home():
    return {"status": "Simulation API running"}

@app.get("/simulate")
def simulate():
    data = {
        "helmet": False,
        "vest": False,
        "fatigue": True,
        "fire": True
    }

    return run_simulation(data)