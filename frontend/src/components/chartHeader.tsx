import { useEffect, useRef, useState } from "react";
import arrow_down from "@/assets/arrow_down.png";
const ChartHeader = ({ type, setType, indicators, setIndicators }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isIndicator, setIsIndicator] = useState<boolean>(false);
  const [detailType, setDetailType] = useState<string>("minutes");
  const [detailUnit, setDetailUnit] = useState<number>(1);
  if (type.includes("minutes")) {
    type = "minutes";
  }

  useEffect(() => {
    setType(detailType + String(detailUnit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailType, detailUnit]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const typeOptions = {
    days: "일",
    weeks: "주",
    months: "월",
    years: "년",
  };

  const IndicatorOptions = {
    sm5: "이동평균선(5)",
    sm20: "이동평균선(20)",
    bb: "볼린저 밴드",
    rsi: "RSI",
    macd: "MACD",
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // dropdown 바깥 클릭 시 닫기
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }

      // indicator 바깥 클릭 시 닫기
      if (indicatorRef.current && !indicatorRef.current.contains(target)) {
        setIsIndicator(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const minuteOptions = [1, 3, 5, 10, 15, 30, 60, 240];
  return (
    <>
      <div className="flex flex-row h-8 items-center text-[15px] gap-3">
        <div className="flex flex-row h-8 items-center">
          <div
            ref={dropdownRef}
            className={`py-1 px-2 relative flex flex-row hover:bg-[#0220470D] gap-1 items-center rounded-lg cursor-pointer ${
              type == "minutes" && "bg-[#0220470D]"
            }`}
            onClick={() => setType(detailType + detailUnit)}
          >
            <span>
              {" "}
              {detailUnit != 60 && detailUnit != 240
                ? detailUnit + "분"
                : detailUnit / 60 + "시간"}
            </span>
            <img
              src={arrow_down}
              alt=""
              className="h-4 w-4"
              onClick={() => setIsDropdownOpen(true)}
            />
            {isDropdownOpen && (
              <div className="flex flex-col p-2 gap-2 absolute rounded-lg w-[100px] z-50 top-12 left-2 bg-white border border-gray-300 ">
                {minuteOptions.map((option) => (
                  <div
                    className="hover:bg-[#0220470D] py-1 px-2 rounded-lg"
                    key={option}
                    onClick={() => {
                      setDetailUnit(option);
                      setIsDropdownOpen(false);
                      setDetailType("minutes");
                    }}
                  >
                    {option != 60 && option != 240
                      ? option + "분"
                      : option / 60 + "시간"}
                  </div>
                ))}
              </div>
            )}
          </div>
          {Object.entries(typeOptions).map(([key, label]) => (
            <div
              key={key}
              onClick={() => {
                setType(key);
                setDetailUnit(1);
              }}
              className={`py-1 px-2 rounded-lg cursor-pointer hover:bg-[#0220470D] ${
                type === key ? "bg-[#0220470D]" : ""
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="w-[2px] h-4 border-l-2 border-l-[#0220472c]"></div>
        <div className="relative">
          <div
            ref={indicatorRef}
            className="flex flex-row items-center py-1 px-2 rounded-lg gap-2 hover:bg-[#0220470D] cursor-pointer"
            onClick={() => {
              setIsIndicator(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="line-icon h-4 w-4"
            >
              <path
                fill="#B0B8C1"
                d="M20.318 10.8h-7v-7a1.2 1.2 0 10-2.4 0v7h-7a1.2 1.2 0 100 2.4h7v7a1.2 1.2 0 102.4 0v-7h7a1.2 1.2 0 100-2.4"
                fillRule="evenodd"
              ></path>
            </svg>
            <span>보조지표</span>
            {isIndicator && (
              <div className="flex flex-col p-2 gap-2 absolute rounded-lg w-[180px] z-50 top-12 left-2 bg-white border border-gray-300 ">
                {Object.entries(IndicatorOptions).map(([key, label]) => (
                  <div
                    key={key}
                    onClick={() => {
                      if (indicators.includes(key)) {
                        setIndicators(indicators.filter((i) => i !== key));
                      } else {
                        setIndicators([...indicators, key]);
                      }
                    }}
                    className={`flex flex-row justify-between items-center gap-2 py-1 px-2 rounded-lg cursor-pointer hover:bg-[#0220470D] ${
                      indicators.includes(key) ? "bg-[#0220470D]" : ""
                    }`}
                  >
                    <span>{label}</span>
                    {indicators.includes(key) ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <g fill="none" fillRule="evenodd">
                          <path
                            fill="#3180F2"
                            d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11"
                          ></path>
                          <path
                            stroke="#FFF"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7.5 11.676l3.416 3.416L16.5 9.508"
                          ></path>
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <path
                          d="M17.2 10.2l-5.6 5.6c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3l-3.4-3.4c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l2.7 2.7 4.9-4.9c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          fill="#b0b8c1"
                        ></path>
                        <path
                          d="M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9m0-2C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1z"
                          fill="#b0b8c1"
                        ></path>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartHeader;
