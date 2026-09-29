from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_health_reports_model_status_without_claiming_live_camera():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "online"
    assert body["models"]["fatigue"] == "MODEL UNAVAILABLE"

def test_game_missions_are_backend_served():
    response = client.get("/game/missions")
    assert response.status_code == 200
    missions = response.json()["missions"]
    assert len(missions) >= 1
    assert all({"id", "title", "objective"} <= set(m) for m in missions)

def test_game_scenario_and_unknown_scenario():
    assert client.get("/game/scenarios/fire-01").status_code == 200
    assert client.get("/game/scenarios/not-a-scenario").status_code == 404

def test_simulation_is_explicitly_educational_and_clamps_inputs():
    response = client.post("/api/simulation/run", json={"params":{"intensity":120,"people":10,"exits":0}})
    assert response.status_code == 200
    body=response.json()
    assert body["mode"]=="SIMULATION" and body["validated_for_operations"] is False
    assert body["inputs"]["intensity"]==100 and body["risk"]<=100

def test_simulation_rejects_non_numeric_values():
    response=client.post("/api/simulation/run",json={"params":{"intensity":"high","people":4,"exits":2}})
    assert response.status_code==422

def test_completion_persists_progress_and_validates_mission():
    response=client.post("/game/complete",json={"learner_id":"test-learner","mission_id":"fire-01","score":80,"decisions":["evacuate"]})
    assert response.status_code==200
    assert response.json()["persistence"].startswith("SAVED TO LOCAL SQLITE")
    assert client.post("/game/complete",json={"learner_id":"test-learner","mission_id":"missing","score":80,"decisions":[]}).status_code==404
