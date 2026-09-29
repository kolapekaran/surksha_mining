from fastapi import FastAPI, File, UploadFile
import numpy as np
import cv2

app = FastAPI()

@app.post("/detect/all")   # ✅ EXACT PATH
async def detect_all(file: UploadFile = File(...)):
    contents = await file.read()
    npimg = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    return {
        "fire": False,
        "ppe": False,
        "fatigue": False
    }

@app.get("/status")   # dashboard ke liye
def get_status():
    return {
        "fire": False,
        "ppe": True,
        "fatigue": False
    }