import { CandlestickData, IChartApi, LogicalRange } from "lightweight-charts";

const setCandlePriceData = (
  allCandles: CandlestickData[],
  chart: IChartApi,
  setHighest: (candle: CandlestickData | null) => void,
  setLowest: (candle: CandlestickData | null) => void,
) => {
  const logicalRange = chart
    .timeScale()
    .getVisibleLogicalRange() as LogicalRange | null;
  if (!logicalRange) return;

  const from = Math.floor(logicalRange.from ?? 0);
  const to = Math.ceil(logicalRange.to ?? 0);

  const visible = allCandles.slice(from, to + 1);
  if (!visible.length) return;

  const lowestCandle = visible.reduce((a, b) => (a.low < b.low ? a : b));
  const highestCandle = visible.reduce((a, b) => (a.high > b.high ? a : b));

  setLowest(lowestCandle);
  setHighest(highestCandle);
};

export default setCandlePriceData;
