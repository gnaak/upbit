import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickData,
  UTCTimestamp,
} from "lightweight-charts";

interface BitCoinProps {
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
}

const Main = () => {
  const code = "KRW-BTC";
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // 캔들 위에 마우스 올렸을 때 고가, 저가 표시
  const [hoverCandle, setHoverCandle] = useState<CandlestickData | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart: IChartApi = createChart(chartContainerRef.current, {
      width: 1600,
      height: 800,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
        attributionLogo: false,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        // 한국시간으로 라벨 표시
        tickMarkFormatter: (time: number) => {
          // time 은 UTC timestamp (초 단위)
          const date = new Date(time * 1000);
          // 한국시간 변환
          return date.toLocaleString("ko-KR", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
        },
        rightOffset: 20,
      },
    });

    // 캔들 커스터마이징
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#f04452", // 상승: 빨강
      borderUpColor: "#f04452",
      wickUpColor: "#f04452",

      downColor: "#3182f6", // 하락: 파랑/청록
      borderDownColor: "#3182f6",
      wickDownColor: "#3182f6",
    });
    let currentCandle: CandlestickData | null = null;

    // 마우스 이동 이벤트
    chart.subscribeCrosshairMove((param) => {
      if (!param?.time) {
        setHoverCandle(null);
        return;
      }
      const price = param.seriesData.get(candleSeries);
      if (price) {
        const candle = price as CandlestickData;
        setHoverCandle(candle);
      }
    });

    const ws = new WebSocket(`ws://localhost:8000/ws/${code}`);

    ws.onmessage = (event) => {
      const data: BitCoinProps = JSON.parse(event.data);
      const price = data.trade_price;
      const timestamp = Math.floor(data.trade_timestamp / 1000);
      // 한국시간 기준으로 분 단위 캔들 만들기
      const timestampKST = timestamp + 9 * 60 * 60;
      const minuteKST = Math.floor(timestampKST / 60) * 60;

      // 다시 UTC로 변환해서 lightweight-charts에 넣기
      const minuteUTC = minuteKST - 9 * 60 * 60;
      const candleTime = minuteUTC as UTCTimestamp;

      if (!currentCandle || currentCandle.time !== candleTime) {
        if (currentCandle) {
          candleSeries.update(currentCandle);
        }
        currentCandle = {
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        candleSeries.update(currentCandle);
      }
    };

    return () => {
      ws.close();
      chart.remove();
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={chartContainerRef}
        style={{ width: "1600px", height: "800px" }}
      />

      {hoverCandle && (
        <div className="absolute top-2 left-2 px-3 py-1 rounded text-sm flex flex-row gap-2 z-10">
          <div>시가: {hoverCandle.open.toLocaleString()}</div>
          <div>종가: {hoverCandle.close.toLocaleString()}</div>
          <div>고가: {hoverCandle.high.toLocaleString()}</div>
          <div>저가: {hoverCandle.low.toLocaleString()}</div>
          <div
            className={
              hoverCandle.close >= hoverCandle.open
                ? "text-[#f04452]"
                : "text-[#3182f6]"
            }
          >
            {(
              ((hoverCandle.close - hoverCandle.open) / hoverCandle.open) *
              100
            ).toFixed(2)}
            %
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
