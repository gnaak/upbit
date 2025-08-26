import bit from "@/assets/bit.png";
import { useGet } from "@/hooks/useAPI";

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
  const { data: bitData, refetch: refetchBit } = useGet<BitCoinProps[]>(
    "api/bit",
    ["bit"],
    false
  );

  return (
    <>
      <div className="flex flex-row items-center gap-5 p-5">
        <button onClick={() => refetchBit()}>
          <img src={bit} alt="" className="w-8 h-8" />
        </button>
        {bitData ? (
          <p>현재가: {bitData[0].trade_price?.toLocaleString()} 원</p>
        ) : (
          <p>데이터 없음</p>
        )}
      </div>
    </>
  );
};
export default Main;
