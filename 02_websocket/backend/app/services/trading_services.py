# trading_services.py
import requests
import asyncio, websockets, json

async def start_stream():
    asyncio.create_task(run_upbit_ws()) 
    return {"status": "started"}

async def run_upbit_ws():
    uri = "wss://api.upbit.com/websocket/v1"
    async with websockets.connect(uri) as websocket:
        sub = [
            {"ticket":"server"},
            {"type":"ticker","codes":["KRW-BTC"]}
        ]
        await websocket.send(json.dumps(sub))
        while True:
            data = await websocket.recv()
            print(json.loads(data))