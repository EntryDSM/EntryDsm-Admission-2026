import { useQuery } from "@tanstack/react-query";
import { Http } from "../http";
import type { ScheduleResponse, ServerTimeResponse } from "./type";

export const getSchedules = async () => {
  const response = await Http.get<ScheduleResponse>("/api/schedule/v11/schedules", { auth: false });
  return response.data;
};

export const getServerTime = async () => {
  const response = await Http.get<ServerTimeResponse>("/api/schedule/v11/time", { auth: false });
  return response.data.currentTime;
};

export const useGetSchedules = () =>
  useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
  });
