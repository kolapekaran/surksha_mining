import json
from datetime import datetime

def log_incident(data):
    with open("logs.txt", "a") as f:
        log = {
            "time": str(datetime.now()),
            "data": data
        }
        f.write(json.dumps(log) + "\n")