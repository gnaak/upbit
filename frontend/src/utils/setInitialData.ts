// utils/setInitialData.ts
import { UTCTimestamp } from "lightweight-charts";
import { ChartSeriesProps, PrevCandleProps } from "@/types/types";

export const setInitialData = (
  series: ChartSeriesProps,
  prevData: PrevCandleProps[]
) => {
  // 캔들 데이터
  series.candleSeries.setData(
    prevData.map((d) => ({
      time: Number(d.time) as UTCTimestamp,
      open: d.opening_price,
      high: d.high_price,
      low: d.low_price,
      close: d.trade_price,
    }))
  );

  // 이동평균선 (SMA)
  series.sma5Series.setData(
    prevData
      .filter((d) => d.sma5 !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.sma5!,
      }))
  );

  series.sma20Series.setData(
    prevData
      .filter((d) => d.sma20 !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.sma20!,
      }))
  );

  // 볼린저 밴드
  series.bbUpperSeries.setData(
    prevData
      .filter((d) => d.bb_upper !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.bb_upper!,
      }))
  );

  series.bbMiddleSeries.setData(
    prevData
      .filter((d) => d.bb_middle !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.bb_middle!,
      }))
  );

  series.bbLowerSeries.setData(
    prevData
      .filter((d) => d.bb_lower !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.bb_lower!,
      }))
  );

  // MACD & Signal
  series.macdSeries.setData(
    prevData
      .filter((d) => d.macd !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.macd!,
      }))
  );

  series.signalSeries.setData(
    prevData
      .filter((d) => d.signal !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.signal!,
      }))
  );

  // MACD Histogram
  series.macdHistSeries.setData(
    prevData
      .filter((d) => d.macd !== null && d.signal !== null)
      .map((d) => {
        const hist = d.macd! - d.signal!;
        return {
          time: Number(d.time) as UTCTimestamp,
          value: hist,
          color: hist >= 0 ? "green" : "red",
        };
      })
  );

  // RSI 14
  series.rsiSeries.setData(
    prevData
      .filter((d) => d.rsi14 !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.rsi14!,
      }))
  );

  // RSI 7
  series.rsi7Series.setData(
    prevData
      .filter((d) => d.rsi7 !== null)
      .map((d) => ({
        time: Number(d.time) as UTCTimestamp,
        value: d.rsi7!,
      }))
  );
};
