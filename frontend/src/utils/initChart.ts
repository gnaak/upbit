// utils/initChart.ts
import { createChart, IChartApi } from "lightweight-charts";

const initChart = (container: HTMLDivElement | null, type: string) => {
  if (!container) return null;

  const chart: IChartApi = createChart(container, {
    layout: {
      background: { color: "#ffffff" },
      textColor: "#000",
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: (time: number) => {
        const date = new Date(time * 1000);
        if (type.startsWith("minutes")) {
          return date.toLocaleString("ko-KR", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
        } else if (type === "days" || type === "weeks") {
          return date.toLocaleDateString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
          });
        } else if (type === "months") {
          return date.toLocaleDateString("ko-KR", {
            year: "2-digit",
            month: "2-digit",
          });
        } else if (type === "years") {
          return date.getFullYear().toString();
        }
      },
      rightOffset: 0,
    },
    grid: {
      vertLines: { color: "#F3F3F3" },
      horzLines: { color: "#F3F3F3" },
    },
  });

  const timeScale = chart.timeScale();

  // 저장 (index 기반으로 저장)
  timeScale.subscribeVisibleLogicalRangeChange((newRange) => {
    if (newRange && newRange.from !== null && newRange.to !== null) {
      localStorage.setItem("chartLogicalRange", JSON.stringify(newRange));
    }
  });

  // 데이터 세팅 이후 복원
  const savedRange = localStorage.getItem("chartLogicalRange");
  if (savedRange) {
    const range = JSON.parse(savedRange);
    if (range && range.from !== null && range.to !== null) {
      // 데이터 세팅 후에 실행해야 함
      requestAnimationFrame(() => {
        timeScale.setVisibleLogicalRange({
          from: range.from,
          to: range.to,
        });
      });
    }
  }

  chart.applyOptions({
    width: container.clientWidth,
    height: container.clientHeight,
  });

  return chart;
};

export default initChart;
