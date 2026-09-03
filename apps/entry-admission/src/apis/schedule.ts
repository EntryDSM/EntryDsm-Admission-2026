import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

// 비인증 원서 일정 조회 API의 공통 경로입니다.
const path = "/schedule";

// 특정 일정 유형과 전체 일정을 React Query 캐시로 조회합니다.
export const useGetSchedule = (type: string) => {
  return useQuery({
    queryKey: ["schedule", type],
    queryFn: () => Http.get<unknown>(path, { auth: false, params: { type } }),
  });
};

export const useGetAllSchedule = () => {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: () => Http.get<unknown>(`${path}/all`, { auth: false }),
  });
};
