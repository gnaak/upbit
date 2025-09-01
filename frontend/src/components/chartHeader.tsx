import { useEffect, useState } from "react";
import arrow_down from "@/assets/arrow_down.png";
const ChartHeader = ({ type, setType }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [detailType, setDetailType] = useState<string>("minutes");
  const [detailUnit, setDetailUnit] = useState<number>(1);
  if (type.includes("minutes")) {
    type = "minutes";
  }

  useEffect(() => {
    setType(detailType + String(detailUnit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailType, detailUnit]);

  const typeOptions = {
    days: "일",
    weeks: "주",
    months: "월",
    years: "년",
  };

  const minuteOptions = [1, 3, 5, 10, 15, 30, 60, 240];
  return (
    <>
      <div className="flex flex-row h-8 gap-3 items-center">
        <div
          className={`py-1 px-2 relative flex flex-row gap-1 items-center rounded-lg cursor-pointer ${
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
            className={`py-1 px-2 rounded-lg cursor-pointer ${
              type === key ? "bg-[#0220470D]" : ""
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </>
  );
};

export default ChartHeader;
