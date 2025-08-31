import { ISeriesApi } from "lightweight-charts";

// 차트 시리즈 타입
export interface ChartSeriesProps {
  candleSeries: ISeriesApi<"Candlestick">;
  sma5Series: ISeriesApi<"Line">;
  sma20Series: ISeriesApi<"Line">;
  bbUpperSeries: ISeriesApi<"Line">;
  bbMiddleSeries: ISeriesApi<"Line">;
  bbLowerSeries: ISeriesApi<"Line">;
  macdSeries: ISeriesApi<"Line">;
  signalSeries: ISeriesApi<"Line">;
  macdHistSeries: ISeriesApi<"Histogram">;
  rsiSeries: ISeriesApi<"Line">;
  rsi7Series: ISeriesApi<"Line">;
}

// 과거 데이터 타입
export interface PrevCandleProps {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  time: number;
  unit: number;
  sma5: number | null;
  sma20: number | null;
  ema12: number | null;
  ema26: number | null;
  macd: number | null;
  signal: number | null;
  rsi14: number | null;
  rsi7: number | null;
  bb_lower: number | null;
  bb_middle: number | null;
  bb_upper: number | null;
}

export interface CurrentCandleProps {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_date_kst: string;
  trade_time_kst: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: "RISE" | "FALL" | "EVEN";
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
  volume: number;
  time: number;
  bb_lower: number | null;
  bb_middle: number | null;
  bb_upper: number | null;
  macd: number | null;
  signal: number | null;
  sma5: number | null;
  sma20: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  rsi7: number | null;
}
