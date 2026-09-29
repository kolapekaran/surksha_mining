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
    valid = client.get("/game/scenarios/fire-01")
    assert valid.status_code == 200
    assert valid.json()["id"] == "fire-01"
    invalid = client.get("/game/scenarios/not-a-scenario")
    assert invalid.status_code == 404


def test_simulation_is_explicitly_educational_and_clamps_inputs():
    response = client.post(
        "/api/simulation/run",
        json={"params": {"intensity": 120, "people": 10, "exits": 0}},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "SIMULATION"
    assert body["validated_for_operations"] is False
    assert body["inputs"]["intensity"] == 100
    assert body["risk"] <= 100


def test_simulation_rejects_non_numeric_values():
    response = client.post(
        "/api/simulation/run",
        json={"params": {"intensity": "high", "people": 4, "exits": 2}},
    )
    assert response.status_code == 422


def test_completion_validates_mission_and_returns_nonpersistent_status():
    response = client.post(
        "/game/complete",
        json={"mission_id": "fire-01", "score": 80, "decisions": ["evacuate"]},
    )
    assert response.status_code == 200
    assert response.json()["persistence"].startswith("SESSION ONLY")
    invalid = client.post(
        "/game/complete",
        json={"mission_id": "missing", "score": 80, "decisions": []},
    )
    assert invalid.status_code == 404
