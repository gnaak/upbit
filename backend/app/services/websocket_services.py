# websocket_services.py
from fastapi import WebSocket, WebSocketDisconnect
import asyncio, websockets, json, math
import pandas as pd
from app.services import indicators, api_services

UPBIT_WS = "wss://api.upbit.com/websocket/v1"
last_data = {}
candles = {}
last_trade_ts = {}

# NaN/Infinity → None 변환 (키는 유지)
def clean_dict(d: dict):
    clean = {}
    for k, v in d.items():
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            clean[k] = None
            continue
        if v is None:
            clean[k] = None
            continue
        clean[k] = v
    return clean

def round_time(trade_ts: int, type: str) -> int:
    dt = pd.to_datetime(trade_ts, unit="s")  # UTC 기준 datetime

    if type.startswith("minutes/"):
        unit = int(type.split("/")[1])
        minute = (dt.minute // unit) * unit
        dt = dt.replace(minute=minute, second=0, microsecond=0)
        return int(dt.timestamp())

    elif type == "days":
        dt_kst = dt + pd.Timedelta(hours=9)
        dt_kst = dt_kst.normalize()  # 한국시간 자정
        return int((dt_kst - pd.Timedelta(hours=9)).timestamp())

    elif type == "weeks":
        dt_kst = dt + pd.Timedelta(hours=9)
        monday_kst = dt_kst - pd.Timedelta(days=dt_kst.weekday())
        monday_kst = monday_kst.normalize()
        return int((monday_kst - pd.Timedelta(hours=9)).timestamp())

    elif type == "months":
        dt_kst = dt + pd.Timedelta(hours=9)
        first_day_kst = dt_kst.replace(day=1).normalize()
        return int((first_day_kst - pd.Timedelta(hours=9)).timestamp())

    elif type == "years":
        dt_kst = dt + pd.Timedelta(hours=9)
        first_day_kst = dt_kst.replace(month=1, day=1).normalize()
        return int((first_day_kst - pd.Timedelta(hours=9)).timestamp())

    # fallback → 1분
    return (trade_ts // 60) * 60

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
            "time": c["timestamp"] // 1000,   # 업비트 REST timestamp = UTC 기준
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
        last_row = clean_dict(df.iloc[-1].to_dict())
        await websocket.send_json(last_row)

        # last_data 채워질 때까지 대기
        while code not in last_data:
            await asyncio.sleep(0.1)

        # 실시간 데이터 루프
        while True:
            await asyncio.sleep(0.2)

            raw = last_data[code]
            trade_ts = raw["trade_timestamp"] // 1000  # 초 단위 (UTC)
            price = raw["trade_price"]
            trade_volume = raw["trade_volume"]
            last_trade_ts[code] = raw["trade_timestamp"]

            ts = round_time(trade_ts, type)
            df = candles[code]

            # 시간축 역행이면 무시
            if not df.empty and ts < df.iloc[-1]["time"]:
                continue

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
            last_row = clean_dict(df.iloc[-1].to_dict())
            payload = {**raw, **last_row}
            await websocket.send_json(payload)

    except WebSocketDisconnect:
        print("disconnected")
    except Exception as e:
        print("error in websocket:", e)
