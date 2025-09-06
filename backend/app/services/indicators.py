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
    df["macd_hist"] = df["macd"] - df["signal"]
    df["rsi14"] = ta.momentum.RSIIndicator(df["close"], window=14).rsi()
    df["rsi7"] = ta.momentum.RSIIndicator(df["close"], window=7).rsi()

    bb = ta.volatility.BollingerBands(close=df["close"], window=20, window_dev=2)
    df["bb_middle"] = bb.bollinger_mavg()
    df["bb_upper"] = bb.bollinger_hband()
    df["bb_lower"] = bb.bollinger_lband()

    return df


def update_indicators(df: pd.DataFrame):
    """실시간 캔들 1개 업데이트용 (O(1) 증분 계산 + RSI는 rolling으로 보정)"""
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
    df.at[i, "macd_hist"] = df.at[i, "macd"] - df.at[i, "signal"] 
    
    # === RSI14 (rolling 계산으로 안정화) ===
    if len(df) >= 14:
        last14 = df["close"].iloc[-14:]
        delta = last14.diff().dropna()
        gain = delta.clip(lower=0).mean()
        loss = -delta.clip(upper=0).mean()
        rs = gain / loss if loss != 0 else 0
        df.at[i, "rsi14"] = 100 - (100 / (1 + rs))
    else:
        df.at[i, "rsi14"] = None

    # === RSI7 (rolling 계산) ===
    if len(df) >= 7:
        last7 = df["close"].iloc[-7:]
        delta7 = last7.diff().dropna()
        gain7 = delta7.clip(lower=0).mean()
        loss7 = -delta7.clip(upper=0).mean()
        rs7 = gain7 / loss7 if loss7 != 0 else 0
        df.at[i, "rsi7"] = 100 - (100 / (1 + rs7))
    else:
        df.at[i, "rsi7"] = None

    # === Bollinger Bands ===
    last20 = df["close"].iloc[-20:]
    mid = last20.mean()
    std = last20.std()
    df.at[i, "bb_middle"] = mid
    df.at[i, "bb_upper"] = mid + 2 * std
    df.at[i, "bb_lower"] = mid - 2 * std

    return df
