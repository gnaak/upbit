import { useEffect, useRef, useState } from "react";
import usePreviousData from "@/hooks/usePrevData";
import { ChartSeriesProps, PrevCandleProps } from "@/types/types";
import createSeries from "@/utils/createSeries";
import initChart from "@/utils/initChart";
import { setInitialData } from "@/utils/setInitialData";
import ChartHeader from "@/components/chartHeader";
import { useRealtimeCandle } from "@/hooks/useWebsocket";
import { CandlestickData } from "lightweight-charts";
import Header from "@/components/header";
const Main = () => {
  const [code, setCode] = useState<string>("KRW-BTC");
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [type, setType] = useState("minutes1");
  const prevData: PrevCandleProps[] = usePreviousData(type, code);
  const [series, setSeries] = useState<ChartSeriesProps | null>(null);

  // 캔들 위에 마우스 올렸을 때 고가, 저가 표시
  const [hoverCandle, setHoverCandle] = useState<CandlestickData | null>(null);

  // 현재가
  const [current, setCurrent] = useState<number | null>(null);
  const [lastDayPrice, setLastDayPrice] = useState<number | null>(null);
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 차트 생성 && 시리즈 생성
    const chart = initChart(chartContainerRef.current, type);
    const createdSeries = createSeries(chart!);
    setSeries(createdSeries);

    // 마우스 호버 이벤트
    chart.subscribeCrosshairMove((param) => {
      if (!param?.time) {
        setHoverCandle(null);
        return;
      }
      const price = param.seriesData.get(createdSeries.candleSeries);
      if (price) {
        const candle = price as CandlestickData;
        setHoverCandle(candle);
      }
    });

    // 이전 데이터 설정
    if (prevData) {
      setInitialData(createdSeries, prevData);
      setCurrent(prevData[prevData.length - 1].trade_price);
    }
    return () => {
      chart?.remove();
    };
  }, [prevData, type]);

  // 웹소켓 연결 및 실시간 데이터 처리
  useRealtimeCandle(code, type, series, setCurrent, setLastDayPrice);

  return (
    <div className="h-screen w-screen p-2 flex flex-col gap-2">
      {/* 메인 헤더 */}
      <Header
        code={code}
        setCode={setCode}
        current={current}
        lastDayPrice={lastDayPrice}
      />
      {/* 차트 헤더 */}
      <ChartHeader type={type} setType={setType} />
      <div className="relative">
        <div ref={chartContainerRef} className="w-full h-full" />
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
    </div>
  );
};
export default Main;
