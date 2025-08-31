import { useEffect, useRef, useState } from "react";
import usePreviousData from "@/hooks/usePrevData";
import { ChartSeriesProps, PrevCandleProps } from "@/types/types";
import createSeries from "@/utils/createSeries";
import initChart from "@/utils/initChart";
import { setInitialData } from "@/utils/setInitialData";
import ChartHeader from "@/components/chartHeader";
import { useRealtimeCandle } from "@/hooks/useWebsocket";
const Main = () => {
  const code = "KRW-BTC";
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [type, setType] = useState("minutes1");
  const prevData: PrevCandleProps[] = usePreviousData(type, code);
  const [series, setSeries] = useState<ChartSeriesProps | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 차트 생성 && 시리즈 생성
    const chart = initChart(chartContainerRef.current, type);
    const createdSeries = createSeries(chart!);
    setSeries(createdSeries);

    // 이전 데이터 설정
    if (prevData) {
      setInitialData(createdSeries, prevData);
    }

    return () => {
      chart?.remove();
    };
  }, [prevData, type]);

  // 웹소켓 연결 및 실시간 데이터 처리
  useRealtimeCandle(code, type, series);

  return (
    <div className="h-screen w-screen p-2 flex flex-col gap-2">
      {/* 헤더 */}
      <ChartHeader type={type} setType={setType} />
      <div className="relative">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
export default Main;
