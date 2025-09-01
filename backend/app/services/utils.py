import pandas as pd
import math

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

def round_time(trade_ts, type: str) -> int:
    # 정수(초)인 경우
    if isinstance(trade_ts, (int, float)):
        dt = pd.to_datetime(trade_ts, unit="ms", utc=True)
    else:
        # 문자열 ISO datetime인 경우
        dt = pd.to_datetime(trade_ts, utc=True)


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