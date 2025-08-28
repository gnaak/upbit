import bit from "@/assets/bit.png";
import { useGet, usePost } from "@/hooks/useAPI";
import { useEffect, useState } from "react";

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
  const code = "KRW-BTC"; // 비트코인 마켓 코드
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    // 백엔드 WebSocket 엔드포인트 연결
    const ws = new WebSocket(`ws://localhost:8000/ws/${code}`);

    ws.onopen = () => {
      console.log("WebSocket 연결 성공:", code);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // 업비트 데이터에서 trade_price 추출
        setPrice(data.trade_price);
        console.log("받은 데이터:", data);
      } catch (err) {
        console.error("메시지 파싱 실패:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket 닫힘");
    };

    return () => {
      ws.close();
    };
  }, [code]);

  return (
    <div>
      <h2>{code} 현재가</h2>
      <p>{price ? price.toLocaleString() : "연결 중..."}</p>
    </div>
  );
}
export default Main;
