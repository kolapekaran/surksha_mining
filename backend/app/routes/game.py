from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/game", tags=["training-game"])

MISSIONS = [
    {"id": "fire", "name": "Factory Fire Safety", "objective": "A fire starts beside the production line. Choose the safest response.", "reward": 150},
    {"id": "ppe", "name": "PPE Checkpoint", "objective": "Select every item required before entering the workshop.", "reward": 120},
    {"id": "emergency", "name": "Emergency Response", "objective": "A fire alarm sounds. Choose the correct first actions.", "reward": 200},
    {"id": "hazards", "name": "Hazard Detection", "objective": "Identify hazards in the work area.", "reward": 100},
    {"id": "spill", "name": "Chemical Spill Response", "objective": "A container is leaking near a walkway. Select the safe response.", "reward": 130},
    {"id": "electrical", "name": "Electrical Lockout", "objective": "A damaged cable is near a machine. Choose safe controls.", "reward": 140},
    {"id": "exit", "name": "Emergency Exit Drill", "objective": "Smoke is approaching. Choose safe evacuation actions.", "reward": 150},
    {"id": "time", "name": "Time Attack", "objective": "Identify hazards quickly and safely.", "reward": 250},
]

SCENARIOS = {
    "fire": {"actions": ["Raise alarm and report the fire", "Ignore it and finish the task", "Warn workers and isolate the area"], "correct": [0, 2]},
    "ppe": {"actions": ["Safety helmet", "Protective vest", "Safety gloves", "Eye protection", "Open-toe sandals"], "correct": [0, 1, 2, 3]},
    "emergency": {"actions": ["Raise the alarm and stop work", "Use the nearest marked exit", "Return to collect personal items"], "correct": [0, 1]},
    "hazards": {"actions": ["Fire near the work area", "Chemical spill", "Damaged electrical cable", "Clear marked exit"], "correct": [0, 1, 2]},
    "spill": {"actions": ["Keep people away and report the spill", "Touch liquid to identify it", "Use the site spill procedure if trained"], "correct": [0, 2]},
    "electrical": {"actions": ["Keep clear and report the damage", "Handle cable while equipment is live", "Isolate equipment through the approved procedure"], "correct": [0, 2]},
    "exit": {"actions": ["Use a clear marked exit", "Use the elevator", "Follow the site evacuation route"], "correct": [0, 2]},
    "time": {"actions": ["Fire", "Chemical spill", "Electrical hazard", "Blocked exit", "Missing PPE"], "correct": [0, 1, 2, 3, 4]},
}

_profile = {"xp": 0, "level": 1, "streak": 0, "badges": 0, "completed": []}


@router.get("/profile")
def profile():
    return _profile


@router.get("/missions")
def missions():
    return MISSIONS


@router.get("/scenarios/{mission_id}")
def scenario(mission_id: str):
    if mission_id not in SCENARIOS:
        return {"error": "Unknown mission"}
    mission = next((m for m in MISSIONS if m["id"] == mission_id), None)
    return {"mission": mission, **SCENARIOS[mission_id]}


@router.post("/complete")
def complete(payload: dict):
    mission_id = payload.get("mission_id")
    safe = bool(payload.get("safe"))
    score = max(0, int(payload.get("score", 0)))
    if mission_id and safe and mission_id not in _profile["completed"]:
        mission = next((m for m in MISSIONS if m["id"] == mission_id), None)
        reward = int((mission or {}).get("reward", 0))
        _profile["xp"] += reward + score
        _profile["completed"].append(mission_id)
        _profile["badges"] = len(_profile["completed"]) // 2
        _profile["level"] = 1 + _profile["xp"] // 500
    return {"profile": _profile, "mission_id": mission_id, "safe": safe, "score": score}


@router.post("/simulate")
def simulate(payload: dict):
    intensity = max(0, min(100, int(payload.get("intensity", 50))))
    people = max(0, int(payload.get("people", 5)))
    exits = max(0, int(payload.get("exits", 2)))
    risk = max(0, min(100, round(25 + intensity * 0.5 + people * 1.5 - exits * 5)))
    return {"risk": risk, "label": "HIGH" if risk >= 70 else "MEDIUM" if risk >= 40 else "LOW", "source": "SIMULATION"}
