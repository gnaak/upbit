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