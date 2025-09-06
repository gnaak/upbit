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
      vertLines: {
        color: "#F3F3F3",
      },
      horzLines: {
        color: "#F3F3F3",
      },
    },
  });

  const timeScale = chart.timeScale();
  timeScale.setVisibleLogicalRange({ from: 0, to: 200 });

  chart.applyOptions({
    width: container.clientWidth,
    height: container.clientHeight,
  });

  return chart;
};

export default initChart;
