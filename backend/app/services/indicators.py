# indicators.py

import pandas as pd
import ta

def add_indicators(df: pd.DataFrame):
    df["sma5"] = df["close"].rolling(window=5).mean()
    df["sma20"] = df["close"].rolling(window=20).mean()
    df["ema12"] = df["close"].ewm(span=12, adjust=False).mean()
    df["ema26"] = df["close"].ewm(span=26, adjust=False).mean()
    df["macd"] = df["ema12"] - df["ema26"]
    df["signal"] = df["macd"].ewm(span=9, adjust=False).mean()
    df["rsi14"] = ta.momentum.RSIIndicator(df["close"], window=14).rsi()
    df["rsi7"] = ta.momentum.RSIIndicator(df["close"], window=7).rsi()

    bb = ta.volatility.BollingerBands(close=df["close"], window=20, window_dev=2)
    df["bb_middle"] = bb.bollinger_mavg()
    df["bb_upper"] = bb.bollinger_hband()
    df["bb_lower"] = bb.bollinger_lband()

    return df


def update_indicators(df: pd.DataFrame):
    """실시간 캔들 1개 업데이트용 (O(1) 증분 계산)"""
    if len(df) < 20:
        return df

    i = df.index[-1]         # 마지막 row 인덱스
    price = df["close"].iloc[-1]

    # === SMA ===
    if len(df) >= 5:
        df.at[i, "sma5"] = df["close"].iloc[-5:].mean()
    else:
        df.at[i, "sma5"] = None
    df.at[i, "sma20"] = df["close"].iloc[-20:].mean()

    # === EMA ===
    prev_ema12 = df["ema12"].iloc[-2]
    prev_ema26 = df["ema26"].iloc[-2]
    alpha12 = 2 / (12 + 1)
    alpha26 = 2 / (26 + 1)
    df.at[i, "ema12"] = alpha12 * price + (1 - alpha12) * prev_ema12
    df.at[i, "ema26"] = alpha26 * price + (1 - alpha26) * prev_ema26

    # === MACD & Signal ===
    df.at[i, "macd"] = df.at[i, "ema12"] - df.at[i, "ema26"]
    prev_signal = df["signal"].iloc[-2]
    alpha9 = 2 / (9 + 1)
    df.at[i, "signal"] = alpha9 * df.at[i, "macd"] + (1 - alpha9) * prev_signal

    # === RSI14 ===
    change = price - df["close"].iloc[-2]
    gain = max(change, 0)
    loss = -min(change, 0)

    prev_avg_gain = df["rsi14"].iloc[-2]  # 기존 rsi 기반 평균값 활용
    if pd.notna(prev_avg_gain):
        # 이전 평균값 기반 증분 업데이트
        prev_gain = df["close"].diff().clip(lower=0).iloc[-15:-1].mean()
        prev_loss = -df["close"].diff().clip(upper=0).iloc[-15:-1].mean()
        avg_gain = (prev_gain * 13 + gain) / 14
        avg_loss = (prev_loss * 13 + loss) / 14
        rs = avg_gain / avg_loss if avg_loss != 0 else 0
        df.at[i, "rsi14"] = 100 - (100 / (1 + rs))
    else:
        df.at[i, "rsi14"] = None

    # === RSI7 ===
    prev_gain7 = df["close"].diff().clip(lower=0).iloc[-8:-1].mean()
    prev_loss7 = -df["close"].diff().clip(upper=0).iloc[-8:-1].mean()
    avg_gain7 = (prev_gain7 * 6 + gain) / 7
    avg_loss7 = (prev_loss7 * 6 + loss) / 7
    rs7 = avg_gain7 / avg_loss7 if avg_loss7 != 0 else 0
    df.at[i, "rsi7"] = 100 - (100 / (1 + rs7))

    # === Bollinger Bands ===
    last20 = df["close"].iloc[-20:]
    mid = last20.mean()
    std = last20.std()
    df.at[i, "bb_middle"] = mid
    df.at[i, "bb_upper"] = mid + 2 * std
    df.at[i, "bb_lower"] = mid - 2 * std

    return df