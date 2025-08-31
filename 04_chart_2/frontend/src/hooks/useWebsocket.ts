// hooks/useRealtimeCandle.ts
import { useEffect, useRef } from "react";
import { ChartSeriesProps, CurrentCandleProps } from "@/types/types";
import { CandlestickData, UTCTimestamp } from "lightweight-charts";

export const useRealtimeCandle = (
  code: string,
  type: string,
  series: ChartSeriesProps
) => {
  const currentCandleRef = useRef<CandlestickData | null>(null);

  useEffect(() => {
    if (!series) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${code}/${type}`);

    ws.onmessage = (event) => {
      const data: CurrentCandleProps = JSON.parse(event.data);
      const candleTime = Number(data.time) as UTCTimestamp;
      const price = data.trade_price;
      let currentCandle = currentCandleRef.current;
      // 이전과 다른 타임스탬프가 들어왔을 때 (새로운 캔들)
      if (!currentCandle || Number(currentCandle.time) !== candleTime) {
        currentCandle = {
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
        };
      } else {
        // 현재 캔들 이어서 업데이트
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        series.candleSeries.update(currentCandle);
      }

      // 볼린저 밴드 업데이트
      if (data.bb_upper != null)
        series.bbUpperSeries.update({ time: candleTime, value: data.bb_upper });
      if (data.bb_middle != null)
        series.bbMiddleSeries.update({
          time: candleTime,
          value: data.bb_middle,
        });
      if (data.bb_lower != null)
        series.bbLowerSeries.update({ time: candleTime, value: data.bb_lower });

      if (data.sma5 != null)
        series.sma5Series.update({ time: candleTime, value: data.sma5 });
      if (data.sma20 != null)
        series.sma20Series.update({ time: candleTime, value: data.sma20 });

      // MACD 업데이트
      if (data.macd != null && data.signal != null) {
        series.macdSeries.update({ time: candleTime, value: data.macd });
        series.signalSeries.update({ time: candleTime, value: data.signal });
        const hist = data.macd - data.signal;
        series.macdHistSeries.update({
          time: candleTime,
          value: hist,
          color: hist >= 0 ? "green" : "red",
        });
      }

      // RSI 업데이트
      if (data.rsi14 != null)
        series.rsiSeries.update({ time: candleTime, value: data.rsi14 });
      if (data.rsi7 != null)
        series.rsi7Series.update({ time: candleTime, value: data.rsi7 });

      currentCandleRef.current = currentCandle;
    };

    return () => ws.close();
  }, [code, type, series]);
};
