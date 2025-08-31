import { PrevCandleProps } from "@/types/types";
import { useGet } from "./useAPI";

const usePreviousData = (type: string, code: string) => {
  const { data } = useGet<PrevCandleProps[]>(
    `api/candle/${type}/${code}`,
    [type, code],
    true,
    Infinity
  );
  return data;
};
export default usePreviousData;
