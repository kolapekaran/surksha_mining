import json

def get_dashboard_stats():
    try:
        with open("logs.txt", "r") as f:
            lines = f.readlines()

        total = len(lines)
        fire_count = sum(1 for l in lines if '"fire": true' in l)

        return {
            "total_events": total,
            "fire_alerts": fire_count,
            "status": "ACTIVE"
        }

    except:
        return {
            "total_events": 0,
            "fire_alerts": 0,
            "status": "NO DATA"
        }