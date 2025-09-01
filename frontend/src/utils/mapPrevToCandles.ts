import { CandlestickData, Time } from "lightweight-charts";
import { PrevCandleProps } from "@/types/types";

const mapPrevToCandles = (
  prevData: PrevCandleProps[],
): CandlestickData<Time>[] => {
  return prevData.map((candle) => ({
    time: candle.time as Time,
    open: candle.opening_price,
    high: candle.high_price,
    low: candle.low_price,
    close: candle.trade_price,
  }));
};

export default mapPrevToCandles;
