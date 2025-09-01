import { useEffect, useState } from "react";

const Header = ({ code, setCode, current, lastDayPrice }) => {
  const codeName = {
    "KRW-BTC": { name: "비트코인", img: "bit" },
    "KRW-ETH": { name: "이더리움", img: "eth" },
  };

  const [diffP, setDiffP] = useState<string | null>(null);
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    if (current && lastDayPrice) {
      setDiffP((((current - lastDayPrice) / lastDayPrice) * 100).toFixed(2));
      setDiff(current - lastDayPrice);
    }
  }, [current, lastDayPrice]);

  useEffect(() => {
    if (!current || !diffP) return;
    const arrow = Number(diffP) > 0 ? "▲" : "▼";
    document.title = `${arrow} ${current.toLocaleString(
      "ko-KR",
    )} ${diff} (${diffP}%)`;
  }, [current, diff, diffP]);

  return (
    <>
      <div className="h-24 flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <img
            src={`/${codeName[code].img}.png`}
            alt="code image"
            className="h-8 w-8"
          />
          <span className="font-bold text-[18px]">{codeName[code].name}</span>
          <span className="text-[14px]">{code}</span>
        </div>
        {current && lastDayPrice && (
          <div className="flex flex-col leading-tight">
            <span
              className={` font-bold text-[18px] ${
                current > lastDayPrice ? "text-[#f04452]" : "text-[#3182f6]"
              }`}
            >
              {current.toLocaleString("ko-KR")}KRW
            </span>
            {diffP && diff && (
              <div className="flex flex-row gap-2 items-center">
                <span
                  className={`${
                    Number(diffP) > 0 ? "text-[#f04452]" : "text-[#3182f6]"
                  }`}
                >
                  {diffP}%
                </span>
                <div className="flex flex-row items-center">
                  <img
                    src={Number(diffP) > 0 ? "up.png" : "down.png"}
                    alt="upDown"
                    className="h-8 w-6"
                  />
                  <span
                    className={`${
                      Number(diffP) > 0 ? "text-[#f04452]" : "text-[#3182f6]"
                    }`}
                  >
                    {diff.toLocaleString("ko-KR")}KRW
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
