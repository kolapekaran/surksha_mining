print("🚀 RUN FILE STARTED")

import uvicorn
from api.simulation_api import app   # ✅ correct import

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8001,
        reload=False
    )