export interface Schedule {
  scheduleId: number;
  title: string;
  startAt: string;
  endAt: string;
}

export interface ScheduleResponse {
  status: number;
  message: string;
  data: Schedule[];
}

export interface ServerTime {
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  hour: number;
  minute: number;
  second: number;
}

export interface ServerTimeResponse {
  status: "SUCCESS";
  message: string;
  data: {
    currentTime: ServerTime;
  };
}
