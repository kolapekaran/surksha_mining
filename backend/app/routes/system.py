from fastapi import APIRouter

router = APIRouter(tags=["system"])

_alerts: list[dict] = []
_cameras = [{"id": "cctv-1", "name": "Primary Camera", "online": True}]


@router.get("/api/workers")
def workers():
    return []


@router.get("/api/workers/{worker_id}/score")
def worker_score(worker_id: str):
    return {"workerId": worker_id, "score": 0, "source": "NO_RECORDED_DATA"}


@router.get("/api/alerts")
def alerts():
    return _alerts


@router.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for item in _alerts:
        if str(item.get("id")) == str(alert_id):
            item["resolved"] = True
    return {"ok": True, "alertId": alert_id}


@router.get("/api/cameras")
def cameras():
    return _cameras


@router.get("/api/reports")
def reports():
    return []


@router.get("/api/heatmap")
def heatmap():
    return {"points": []}


@router.get("/api/replay")
def replay():
    return []


@router.get("/api/replay/{incident_id}")
def replay_detail(incident_id: str):
    return {"incidentId": incident_id, "events": []}


@router.post("/api/chatbot")
def chatbot(payload: dict):
    message = str(payload.get("message", "")).strip()
    return {
        "message": "Training assistant endpoint is connected. Follow your site's approved safety procedures and supervisor instructions.",
        "received": message,
        "source": "SURAKSHA_BACKEND",
    }
