from fastapi import WebSocket

connections = []

async def connect(ws: WebSocket):
    await ws.accept()
    connections.append(ws)

async def broadcast(data):
    for ws in connections:
        await ws.send_json(data)