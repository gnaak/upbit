import { useEffect, useMemo, useRef, useState } from "react";
import usePreviousData from "@/hooks/usePrevData";
import { ChartSeriesProps, PrevCandleProps } from "@/types/types";
import createSeries from "@/utils/createSeries";
import initChart from "@/utils/initChart";
import { setInitialData } from "@/utils/setInitialData";
import ChartHeader from "@/components/chartHeader";
import { useRealtimeCandle } from "@/hooks/useWebsocket";
import { CandlestickData, UTCTimestamp } from "lightweight-charts";
import Header from "@/components/header";
import Chart from "@/components/chart";
const Main = () => {
  const [code, setCode] = useState<string>("KRW-BTC");
  const [type, setType] = useState("minutes1");
  const prevData: PrevCandleProps[] = usePreviousData(type, code);

  // 백엔드 가격 & 보조지표
  const [candle, setCandles] = useState<ChartSeriesProps | null>(null);
  const [series, setSeries] = useState<ChartSeriesProps | null>(null);

  // 사용자 선택 보조지표
  const [indicators, setIndicators] = useState<string[] | null>(null);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorContainerRef = useRef<HTMLDivElement | null>(null);

  // 캔들 위에 마우스 올렸을 때 고가, 저가 표시
  const [hoverCandle, setHoverCandle] = useState<CandlestickData | null>(null);

  const lastCandle: CandlestickData | undefined = useMemo(() => {
    if (!prevData?.length) return undefined;
    const last = prevData[prevData.length - 1];
    return {
      time: last.time as UTCTimestamp,
      open: last.opening_price,
      high: last.high_price,
      low: last.low_price,
      close: last.trade_price,
    };
  }, [prevData]);

  // 현재가
  const [current, setCurrent] = useState<number | null>(null);
  const [lastDayPrice, setLastDayPrice] = useState<number | null>(null);
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 차트 생성 && 시리즈 생성
    const chart = initChart(chartContainerRef.current, type);
    const createdSeries = createSeries(chart!, indicators);
    setSeries(createdSeries);

    const indicatorChart = initChart(indicatorContainerRef.current, type);

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
  useRealtimeCandle(
    code,
    type,
    series,
    setCurrent,
    setLastDayPrice,
    lastCandle
  );
  return (
    <div className="h-screen w-screen p-5 flex flex-col gap-2">
      {/* 메인 헤더 */}
      <Header
        code={code}
        setCode={setCode}
        current={current}
        lastDayPrice={lastDayPrice}
      />
      {/* 차트 헤더 */}
      <ChartHeader type={type} setType={setType} />
      {/* 차트 */}
      <Chart chartContainerRef={chartContainerRef} hoverCandle={hoverCandle} />
      <div ref={indicatorContainerRef}></div>
    </div>
  );
};
export default Main;
