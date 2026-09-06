import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

const APPLICATION_STATUS_ENDPOINT = "/application/status";

// 로그인한 지원자의 최종 원서 제출 상태를 조회하는 훅입니다.
export const useGetApplicationStatus = () => {
  return useQuery({
    // 로그인 사용자별 상태이므로 인증 토큰이 포함된 공통 Http 클라이언트를 사용합니다.
    queryKey: ["application-status"],
    queryFn: () => Http.get<unknown>(APPLICATION_STATUS_ENDPOINT),
    // 일시적 네트워크 오류만 한 번 재시도해 상태 화면의 대기 시간을 제한합니다.
    retry: 1,
  });
};
