# trading_services.py
from fastapi import WebSocket, WebSocketDisconnect
import asyncio, websockets, json

UPBIT_WS = "wss://api.upbit.com/websocket/v1"
last_data = {}  # 종목별 최신 데이터 저장

async def start_stream():
    asyncio.create_task(run_upbit_ws("KRW-BTC")) 
    return {"status": "started"}

async def run_upbit_ws(code: str):
    sub = [
        {"ticket":"server"},
        {"type":"ticker","codes":[code]}
    ]
    global last_data
    while True:
        try:
            async with websockets.connect(UPBIT_WS) as websocket:
                await websocket.send(json.dumps(sub))
                while True:
                    data = await websocket.recv()
                    last_data[code] = json.loads(data)
        except Exception as e:
            print(f"reconnecting upbit:", e)
            await asyncio.sleep(1)

async def backend_websocket(websocket: WebSocket, code: str):
    await websocket.accept()
    try:
        # 최초 접속 시 최신 데이터 있으면 한 번 보내주기
        if code in last_data:
            await websocket.send_json(last_data[code])

        # 이후에는 주기적으로 최신 값 전달
        while True:
            await asyncio.sleep(0.2)  # 200ms마다 push
            if code in last_data:
                await websocket.send_json(last_data[code])

    except WebSocketDisconnect:
        print(f"disconnected")
    except Exception as e:
        print(f"error in connecting", e)
    finally:
        await websocket.close()