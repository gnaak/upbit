// hooks/useRealtimeCandle.ts
import { useEffect, useRef } from "react";
import { ChartSeriesProps, CurrentCandleProps } from "@/types/types";
import { CandlestickData, UTCTimestamp } from "lightweight-charts";

export const useRealtimeCandle = (
  code: string,
  type: string,
  series: ChartSeriesProps,
  setCurrent: (price: number) => void,
  setLastDayPrice: (price: number) => void,
  initialCandle?: CandlestickData
) => {
  const currentCandleRef = useRef<CandlestickData | null>(null);

  useEffect(() => {
    if (initialCandle) {
      currentCandleRef.current = initialCandle;
    }
  }, [initialCandle]);

  useEffect(() => {
    if (!series) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${code}/${type}`);

    ws.onmessage = (event) => {
      const data: CurrentCandleProps = JSON.parse(event.data);
      const candleTime = Number(data.time) as UTCTimestamp;
      const price = data.trade_price;
      setCurrent(price);
      setLastDayPrice(data.prev_closing_price);

      const currentCandle = currentCandleRef.current;
      // 이전과 다른 타임스탬프가 들어왔을 때 (새로운 캔들)
      if (!currentCandle) {
        // fallback: 정말 아무것도 없을 때만 생성
        const newCandle: CandlestickData = {
          time: candleTime,
          open: data.opening_price ?? price,
          high: data.high_price ?? price,
          low: data.low_price ?? price,
          close: price,
        };
        series.candleSeries.update(newCandle);
        currentCandleRef.current = newCandle;
        return;
      }

      // time이 같으면 → update
      if (Number(currentCandle.time) === candleTime) {
        const safeCandle: CandlestickData = {
          time: candleTime,
          open: Number(currentCandle.open ?? price),
          high: Math.max(Number(currentCandle.high ?? price), price),
          low: Math.min(Number(currentCandle.low ?? price), price),
          close: Number(price),
        };

        series.candleSeries.update(safeCandle);
        currentCandleRef.current = safeCandle;
      } else if (candleTime > Number(currentCandle.time)) {
        // 새로운 캔들 시작 → 이전 캔들을 초기 상태로 가져오기
        const newCandle: CandlestickData = {
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
        };

        // 직전 REST 캔들이 있으면 그대로 시작 (꼬리 보존)
        if (initialCandle && initialCandle.time === candleTime) {
          console.log("일봉에서 테스트");
          newCandle.open = initialCandle.open;
          newCandle.high = initialCandle.high;
          newCandle.low = initialCandle.low;
          newCandle.close = initialCandle.close;
        }

        series.candleSeries.update(newCandle);
        currentCandleRef.current = newCandle;
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
    };

    return () => {
      ws.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, type, series]);
};
