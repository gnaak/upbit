import { ChartSeriesProps } from "@/types/types";
import { IChartApi } from "lightweight-charts";

const createSeries = (chart: IChartApi): ChartSeriesProps => {
  const candleSeries = chart.addCandlestickSeries({
    upColor: "#f04452",
    borderUpColor: "#f04452",
    wickUpColor: "#f04452",
    downColor: "#3182f6",
    borderDownColor: "#3182f6",
    wickDownColor: "#3182f6",
  });

  const sma5Series = chart.addLineSeries({ color: "orange", lineWidth: 1 });
  const sma20Series = chart.addLineSeries({ color: "blue", lineWidth: 1 });

  const bbUpperSeries = chart.addLineSeries({ color: "green", lineWidth: 1 });
  const bbMiddleSeries = chart.addLineSeries({ color: "green", lineWidth: 1 });
  const bbLowerSeries = chart.addLineSeries({ color: "green", lineWidth: 1 });

  const macdSeries = chart.addLineSeries({
    color: "red",
    lineWidth: 2,
    priceScaleId: "macd",
  });
  const signalSeries = chart.addLineSeries({
    color: "blue",
    lineWidth: 2,
    priceScaleId: "macd",
  });
  const macdHistSeries = chart.addHistogramSeries({
    priceScaleId: "macd",
    priceFormat: { type: "volume" },
  });

  const rsiSeries = chart.addLineSeries({
    color: "purple",
    lineWidth: 2,
    priceScaleId: "rsi",
  });
  const rsi7Series = chart.addLineSeries({
    color: "pink",
    lineWidth: 2,
    priceScaleId: "rsi",
  });

  // 차트에 추가
  chart.priceScale("macd").applyOptions({
    scaleMargins: { top: 0.75, bottom: 0.15 },
  });
  chart.priceScale("rsi").applyOptions({
    scaleMargins: { top: 0.9, bottom: 0 },
  });
  chart.priceScale("right").applyOptions({
    scaleMargins: { top: 0.1, bottom: 0.3 },
  });

  return {
    candleSeries,
    sma5Series,
    sma20Series,
    bbUpperSeries,
    bbMiddleSeries,
    bbLowerSeries,
    macdSeries,
    signalSeries,
    macdHistSeries,
    rsiSeries,
    rsi7Series,
  };
};

export default createSeries;
