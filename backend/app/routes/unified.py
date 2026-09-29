"""Unified API endpoints for the SURAKSHA React clients."""
from functools import lru_cache
from pathlib import Path
from typing import Any
import json, sqlite3
from datetime import datetime, timezone
import cv2
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

router = APIRouter()
BACKEND_DIR = Path(__file__).resolve().parents[2]
ML_ROOT = BACKEND_DIR / "ai_safety_system" / "ml_service"
MODEL_PATHS = {"fire_smoke": ML_ROOT / "models" / "fire_smoke.pt", "ppe": ML_ROOT / "models" / "ppe_model.pt"}

@lru_cache(maxsize=4)
def _load_yolo(model_path: str):
    from ultralytics import YOLO
    return YOLO(model_path)

def _model_status() -> dict[str, str]:
    status = {}
    for key, path in MODEL_PATHS.items():
        if not path.is_file():
            status[key] = "MODEL UNAVAILABLE"
        else:
            try:
                import ultralytics
                status[key] = "ML READY"
            except ImportError:
                status[key] = "OFFLINE: ultralytics dependency missing"
    status.update({"fatigue":"MODEL UNAVAILABLE","machinery":"MODEL UNAVAILABLE","electrical":"MODEL UNAVAILABLE","risk":"MODEL AVAILABLE; isolated artifact not auto-loaded"})
    return status

@router.get("/health")
def health():
    return {"status":"online","service":"SURAKSHA unified API","models":_model_status(),"mode":"ML available per model status; simulation is separate"}

@router.post("/detect/all")
async def detect_all(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload a supported image file.")
    raw = await file.read(12 * 1024 * 1024 + 1)
    if not raw: raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    if len(raw) > 12 * 1024 * 1024: raise HTTPException(status_code=413, detail="Image must be no larger than 12 MB.")
    image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None: raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")
    output={"source":"ML","detections":[],"models":_model_status(),"available":[]}
    for key,path in MODEL_PATHS.items():
        if not path.is_file(): continue
        try:
            model=_load_yolo(str(path))
            for prediction in model.predict(source=image,verbose=False,conf=0.35):
                names,boxes=prediction.names,prediction.boxes
                if boxes is None: continue
                for box in boxes:
                    cid=int(box.cls[0].item()); conf=float(box.conf[0].item()); xyxy=[int(v) for v in box.xyxy[0].tolist()]
                    label=str(names.get(cid,cid) if isinstance(names,dict) else names[cid])
                    output["detections"].append({"domain":key,"label":label,"confidence":round(conf,4),"box":{"x1":xyxy[0],"y1":xyxy[1],"x2":xyxy[2],"y2":xyxy[3]}})
            output["available"].append(key)
        except ImportError as exc: output["models"][key]=f"OFFLINE: {exc.name or 'ML dependency missing'}"
        except Exception as exc: output["models"][key]=f"INFERENCE ERROR: {type(exc).__name__}"
    if not output["available"]:
        raise HTTPException(status_code=503,detail={"message":"No detection model is currently available for inference.","models":output["models"]})
    output["summary"]={"count":len(output["detections"]),"fire_or_smoke":any(d["domain"]=="fire_smoke" for d in output["detections"]),"ppe_objects":sum(d["domain"]=="ppe" for d in output["detections"])}
    output["fire"]=output["summary"]["fire_or_smoke"]; output["ppe"]=output["summary"]["ppe_objects"]>0
    return output

class SimulationRequest(BaseModel):
    params: dict[str,Any]=Field(default_factory=dict)

@router.post("/api/simulation/run")
def run_simulation(payload:SimulationRequest):
    params=payload.params
    try:
        intensity=max(0,min(100,float(params.get("intensity",50)))); people=max(0,min(1000,int(params.get("people",8)))); exits=max(0,min(100,int(params.get("exits",2))))
    except (TypeError,ValueError): raise HTTPException(status_code=422,detail="intensity, people and exits must be numeric.")
    congestion=min(30,people*2) if exits==0 else min(30,max(0,people/exits-2)*3)
    score=int(round(min(100,intensity*0.65+congestion+(15 if exits==0 else 0))))
    level="CRITICAL" if score>=80 else "HIGH" if score>=60 else "MODERATE" if score>=35 else "LOW"
    return {"mode":"SIMULATION","validated_for_operations":False,"risk":score,"label":level,"inputs":{"intensity":intensity,"people":people,"exits":exits},"recommendation":"Follow the site's emergency plan, raise the alarm, and use the designated safe evacuation route. Do not re-enter.","note":"Illustrative training calculation only; not a real-time hazard forecast or site-specific procedure."}

MISSIONS=[{"id":"fire-01","module":"fire","title":"Fire in Production Area","objective":"Identify hazards and choose a safe response.","mode":"TRAINING"},{"id":"ppe-01","module":"ppe","title":"PPE Check: Workshop Entry","objective":"Spot missing and incorrectly worn equipment.","mode":"TRAINING"},{"id":"gas-01","module":"risk","title":"Gas Leak: Confined Space","objective":"Recognize exposure and access risks.","mode":"TRAINING"},{"id":"machine-01","module":"machinery","title":"Machinery Proximity","objective":"Identify the zone boundary and safe next step.","mode":"TRAINING"}]
@router.get("/game/missions")
def game_missions(): return {"missions":MISSIONS,"persistence":"SESSION ONLY; no database configured"}
@router.get("/game/scenarios/{mission_id}")
def game_scenario(mission_id:str):
    for mission in MISSIONS:
        if mission["id"]==mission_id: return {**mission,"briefing":"Educational scenario. Follow local site procedures and supervisor instructions.","persistence":"SESSION ONLY"}
    raise HTTPException(status_code=404,detail="Scenario not found.")

PROGRESS_DB=BACKEND_DIR/"data"/"suraksha_progress.sqlite3"
def _progress_connection():
    PROGRESS_DB.parent.mkdir(parents=True,exist_ok=True); c=sqlite3.connect(PROGRESS_DB,timeout=10); c.row_factory=sqlite3.Row
    c.execute("CREATE TABLE IF NOT EXISTS mission_progress (learner_id TEXT NOT NULL, mission_id TEXT NOT NULL, best_score INTEGER NOT NULL, completions INTEGER NOT NULL DEFAULT 1, last_decisions TEXT NOT NULL DEFAULT '[]', updated_at TEXT NOT NULL, PRIMARY KEY (learner_id, mission_id))")
    return c
class CompletionRequest(BaseModel):
    learner_id:str=Field(min_length=8,max_length=80,pattern=r"^[A-Za-z0-9_-]+$")
    mission_id:str
    score:int=Field(ge=0,le=100)
    decisions:list[str]=Field(default_factory=list,max_length=30)
@router.get("/game/progress/{learner_id}")
def game_progress(learner_id:str):
    if not 8<=len(learner_id)<=80 or not all(ch.isalnum() or ch in "_-" for ch in learner_id): raise HTTPException(status_code=422,detail="Invalid learner ID.")
    with _progress_connection() as c: rows=c.execute("SELECT mission_id,best_score,completions,last_decisions,updated_at FROM mission_progress WHERE learner_id=? ORDER BY updated_at DESC",(learner_id,)).fetchall()
    return {"learner_id":learner_id,"progress":[{"mission_id":r["mission_id"],"best_score":r["best_score"],"completions":r["completions"],"last_decisions":json.loads(r["last_decisions"]),"updated_at":r["updated_at"]} for r in rows],"persistence":"LOCAL SQLITE DATABASE; no account authentication"}
@router.post("/game/complete")
def complete_game(payload:CompletionRequest):
    if payload.mission_id not in {m["id"] for m in MISSIONS}: raise HTTPException(status_code=404,detail="Scenario not found.")
    now=datetime.now(timezone.utc).isoformat()
    with _progress_connection() as c:
        c.execute("INSERT INTO mission_progress (learner_id,mission_id,best_score,completions,last_decisions,updated_at) VALUES (?,?,?,1,?,?) ON CONFLICT(learner_id,mission_id) DO UPDATE SET best_score=MAX(mission_progress.best_score,excluded.best_score),completions=mission_progress.completions+1,last_decisions=excluded.last_decisions,updated_at=excluded.updated_at",(payload.learner_id,payload.mission_id,payload.score,json.dumps(payload.decisions),now))
    return {"status":"completed","learner_id":payload.learner_id,"mission_id":payload.mission_id,"score":payload.score,"decisions_recorded":len(payload.decisions),"persistence":"SAVED TO LOCAL SQLITE; no account authentication"}
@router.get("/api/workers")
def workers(): return [{"id":"worker-001","name":"Training Worker","online":True,"score":0}]
@router.get("/api/workers/{worker_id}/score")
def worker_score(worker_id:str): return {"worker_id":worker_id,"score":0,"status":"NO RECORDED EVENTS"}
@router.get("/api/alerts")
def alerts(): return []
@router.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(alert_id:str): return {"status":"resolved","alert_id":alert_id}
@router.get("/api/cameras")
def cameras(): return [{"id":"camera-001","name":"Browser Camera","online":True,"source":"CLIENT"}]
@router.get("/api/reports")
def reports(): return []
@router.get("/api/heatmap")
def heatmap(): return []
@router.get("/api/simulation/history")
def simulation_history(): return []
@router.get("/api/replay")
def replay_list(): return []
@router.get("/api/replay/{incident_id}")
def replay_detail(incident_id:str): raise HTTPException(status_code=404,detail=f"Replay {incident_id} not found.")
@router.post("/api/chatbot")
def chatbot(payload:dict[str,Any]): return {"reply":"Use the site's emergency plan and supervisor instructions for operational decisions.","echo":str(payload.get("message","")).strip()}
