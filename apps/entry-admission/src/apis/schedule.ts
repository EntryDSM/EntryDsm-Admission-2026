import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

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

const schedulesPath = "/api/schedule/v11/schedules";

export const getSchedules = async () => {
  const response = await Http.get<GetSchedulesResponse>(schedulesPath, { auth: false });
  return response.data;
};

export const useGetAllSchedule = () => {
  return useQuery({
    // 랜딩과 제출 완료 화면이 공유하는 공개 일정 캐시입니다.
    queryKey: ["schedules"],
    queryFn: getSchedules,
  });
};
