# api_services.py
import json
import requests
import redis
import pandas as pd
from app.services import indicators, utils
from app.config.settings import settings
from app.repository import trading_repository

import jwt
import uuid
import hashlib
from urllib.parse import urlencode

access_key = settings.access_key
secret_key = settings.secret_key


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
        "time": utils.round_time(c["candle_date_time_utc"], type),

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

async def make_order(code, price, type, db):

    print(f"[{code}] {type} 주문했음!")
    await trading_repository.create_trading_log(code, price, type, db )
    # 계좌가 없어서 이걸 못하네 코발 ㅠㅠ
    # url = "https://api.upbit.com/v1/accounts"
    # payload = {
    #     "access_key": access_key,
    #     "nonce": str(uuid.uuid4())
    # }
    # jwt_token = jwt.encode(payload, secret_key)
    # headers = {"Authorization": f"Bearer {jwt_token}"}

    # res = requests.get(url, headers=headers)
    # print("Status:", res.status_code)
    # print("Response:", res.text)