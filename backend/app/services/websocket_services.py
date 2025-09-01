# websocket_services.py
from fastapi import WebSocket, WebSocketDisconnect
import asyncio, websockets, json
from app.services import indicators, api_services, utils
import pandas as pd

UPBIT_WS = "wss://api.upbit.com/websocket/v1"
last_data = {}
candles = {}
last_trade_ts = {}

async def start_stream():
    asyncio.create_task(run_upbit_ws("KRW-BTC"))
    return {"status": "started"}

async def run_upbit_ws(code: str):
    sub = [
        {"ticket": "server"},
        {"type": "ticker", "codes": [code]}
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

async def backend_websocket(websocket: WebSocket, code: str, type: str):
    # Upbit REST API 용 포맷 맞추기
    if type.startswith("minutes"):
        type = type.replace("minutes", "minutes/")

    await websocket.accept()
    print("connected")

    try:
        # 초기 과거 데이터 불러오기
        raw_candles = await api_services.get_candle_data(type, code, 200)
        df = pd.DataFrame([{
            "time": utils.round_time(c["timestamp"],type),   # 업비트 REST timestamp = UTC 기준
            "open": c["opening_price"],
            "high": c["high_price"],
            "low": c["low_price"],
            "close": c["trade_price"],
            "volume": c["candle_acc_trade_volume"],
        } for c in raw_candles])
        df = df.sort_values("time")
        df = indicators.add_indicators(df)
        candles[code] = df

        # 연결 직후 최신 캔들 1개 먼저 보내기
        last_row = utils.clean_dict(df.iloc[-1].to_dict())
        await websocket.send_json(last_row)

        # last_data 채워질 때까지 대기
        while code not in last_data:
            await asyncio.sleep(0.2)

        # 실시간 데이터 루프
        while True:
            await asyncio.sleep(0.2)

            raw = last_data[code]
            trade_ts = raw["trade_timestamp"]   # 초 단위 (UTC)
            price = raw["trade_price"]
            trade_volume = raw["trade_volume"]
            last_trade_ts[code] = raw["trade_timestamp"]

            ts = utils.round_time(trade_ts, type)
            df = candles[code]
            # 시간축 역행이면 무시

            if not df.empty and df.iloc[-1]["time"] == ts:
                # 기존 캔들 업데이트
                df.at[df.index[-1], "high"] = max(df.iloc[-1]["high"], price)
                df.at[df.index[-1], "low"] = min(df.iloc[-1]["low"], price)
                df.at[df.index[-1], "close"] = price
                df.at[df.index[-1], "volume"] += trade_volume
            else:
                # 새로운 캔들 추가
                df.loc[len(df)] = {
                    "time": ts,
                    "open": price,
                    "high": price,
                    "low": price,
                    "close": price,
                    "volume": trade_volume,
                }

            # 증분 지표 업데이트
            df = indicators.update_indicators(df)
            candles[code] = df

            # 최신 row 전송
            last_row = utils.clean_dict(df.iloc[-1].to_dict())
            raw = utils.clean_dict(raw)
            payload = {**raw, **last_row}
            await websocket.send_json(payload)

    except WebSocketDisconnect:
        print("disconnected")
    except Exception as e:
        print("error in websocket:", e)
