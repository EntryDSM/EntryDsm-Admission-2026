import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

export interface AdmissionSchedule {
  // START_DATE, END_DATE, FIRST_ANNOUNCEMENT처럼 화면에서 일정을 구분하는 서버 코드입니다.
  type: string;
  // ISO-8601 날짜 문자열이며, 각 화면에서 표시 형식으로 변환합니다.
  date: string;
}

// 전체 일정 조회 API가 반환하는 데이터 래퍼입니다.
export interface GetAllScheduleResponse {
  schedules: AdmissionSchedule[];
}

// 비인증 원서 일정 조회 API의 공통 경로
const path = "/schedule";

export const useGetAllSchedule = () => {
  return useQuery({
    // 랜딩과 제출 완료 화면이 공유하는 공개 일정 캐시입니다.
    queryKey: ["schedule"],
    queryFn: () => Http.get<GetAllScheduleResponse>(`${path}/all`, { auth: false }),
  });
};
