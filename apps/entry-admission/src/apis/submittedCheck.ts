import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

// 로그인한 지원자의 최종 원서 제출 상태를 조회하는 훅입니다.
export const useGetApplicationStatus = () => {
  return useQuery({
    queryKey: ["application-status"],
    queryFn: () => Http.get<unknown>("/application/status"),
    retry: 1,
  });
};
