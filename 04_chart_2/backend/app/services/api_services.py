# api_services.py
import json
import requests
import redis
import pandas as pd
from app.services import indicators

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# 업비트 캔들 데이터 조회 + 보조지표 계산
async def get_candle_data(type: str, code: str, count: int = 200):
    # key = f"candle:{type}:{code}:{count}"
    # cached = r.get(key)
    # if cached:
    #     return json.loads(cached)

    url = f"https://api.upbit.com/v1/candles/{type}"
    params = {"market": code, "count": count}
    headers = {"Accept": "application/json"}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    data = response.json()

    df = pd.DataFrame([{
        "market": c["market"],
        "candle_date_time_utc": c["candle_date_time_utc"],
        "candle_date_time_kst": c["candle_date_time_kst"],
        "opening_price": c["opening_price"],
        "high_price": c["high_price"],
        "low_price": c["low_price"],
        "trade_price": c["trade_price"],
        "timestamp": c["timestamp"],
        "candle_acc_trade_price": c["candle_acc_trade_price"],
        "candle_acc_trade_volume": c["candle_acc_trade_volume"],
        "unit": c.get("unit", 1),
        "time": int(pd.to_datetime(c["candle_date_time_utc"]).timestamp()),

        # indicators 계산용 컬럼
        "open": c["opening_price"],
        "high": c["high_price"],
        "low": c["low_price"],
        "close": c["trade_price"],
        "volume": c["candle_acc_trade_volume"],
    } for c in data])

    # 시간순 정렬
    df = df.sort_values("timestamp")

    # 보조지표 추가
    df = indicators.add_indicators(df)

    # JSON 직렬화 안전 처리 (NaN → None)
    result = []
    for row in df.to_dict(orient="records"):
        clean_row = {k: (None if pd.isna(v) else v) for k, v in row.items()}
        result.append(clean_row)

    # Redis 캐싱 (60초)
    # r.setex(key, 60, json.dumps(result))
    return result
