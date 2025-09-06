const Chart = ({ chartContainerRef, hoverCandle }) => {
  return (
    <div className="relative w-full flex-1">
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
  );
};

export default Chart;
