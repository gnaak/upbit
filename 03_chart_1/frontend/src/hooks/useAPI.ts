import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config";

/**
 *
 * @param url
 * @param key
 * @returns
 */
export const useGet = <T>(
  url: string,
  key: (string | number)[],
  enabled: boolean = true
) => {
  return useQuery<T>({
    queryKey: key,
    enabled,
    queryFn: async () => {
      const makeRequest = async () => {
        return await fetch(`${API_BASE_URL}/${url}`, {
          credentials: "include",
        });
      };

      const response = await makeRequest();

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API 오류 ${response.status}: ${text}`);
      }
      const data = await response.json();
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

/**
 *
 * @param url
 * @returns
 */
export const usePost = <
  TResponse,
  TRequest extends object | FormData,
  TError = { status?: number; message?: string }
>(
  url: string
) => {
  return useMutation<TResponse, TError, TRequest>({
    mutationFn: async (body: TRequest) => {
      // 헤더 조건부
      const headers: HeadersInit = {};
      let fetchBody: BodyInit;

      if (body instanceof FormData) {
        fetchBody = body;
        // FormData면 Content-Type 자동 설정 (headers에 아무것도 안 넣음)
      } else {
        fetchBody = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      }

      const makeRequest = async () => {
        return await fetch(`${API_BASE_URL}/${url}`, {
          method: "POST",
          headers,
          credentials: "include",
          body: fetchBody,
        });
      };

      const response = await makeRequest();

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw {
          status: response.status,
          message: errorData?.message || "Something went wrong",
          field: errorData?.field,
        } as TError;
      }

      return (await response.json()) as TResponse;
    },
  });
};


