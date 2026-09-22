import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";
import { QueryKeys } from "./query";

export interface AdmissionSchedule {
  scheduleId: number;
  title: string;
  startAt: ScheduleDateTime;
  endAt: ScheduleDateTime;
}

export interface ScheduleDateTime {
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  hour: number;
  minute: number;
  second: number;
}

interface GetSchedulesResponse {
  status: number;
  message: string;
  data: AdmissionSchedule[];
}

interface GetServerTimeResponse {
  status: string;
  message: string;
  data: { currentTime: ScheduleDateTime };
}

const schedulesPath = "/api/schedule/v11/schedules";
const serverTimePath = "/api/schedule/v11/time";

export const getSchedules = async () => {
  const response = await Http.get<GetSchedulesResponse>(schedulesPath, { auth: false });
  return response.data;
};

/** 서버 현재 시각. 접수 기간 판정은 브라우저 시계가 아니라 이 값을 기준으로 한다. */
export const getServerTime = async () => {
  const response = await Http.get<GetServerTimeResponse>(serverTimePath, { auth: false });
  return response.data.currentTime;
};

export const useGetAllSchedule = () => {
  return useQuery({
    // 랜딩과 제출 완료 화면이 공유하는 공개 일정 캐시입니다.
    queryKey: QueryKeys.schedule.list,
    queryFn: getSchedules,
  });
};
