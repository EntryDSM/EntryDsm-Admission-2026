export interface DeviceStat {
  label: string;
  count: number;
  percentage: number;
}

export interface MonitoringData {
  deviceStats: DeviceStat[];
  totalApiRequests: number;
  apiSuccessCount: number;
  apiFailCount: number;
  apiFailRate: number;
  apiRequestChart: number[];
  totalUsers: number;
  concurrentMax: number;
  concurrentAvg: number;
  avgStayTime: string;
  applicationSuccess: number;
  applicationFail: number;
  pdfSuccess: number;
  pdfFail: number;
  visitorChart: number[];
  clientErrorLogs: string[];
  serverErrorLogs: string[];
  summary: { total: number; user: number; auth: number; visitor: number };
  dbUsageMb: number;
  bucketUsageMb: number;
  clientErrorCount: number;
  clientWarnCount: number;
}

export const mockMonitoringData: MonitoringData = {
  deviceStats: [
    { label: "Android", count: 240, percentage: 40 },
    { label: "Windows", count: 180, percentage: 30 },
    { label: "iOS", count: 120, percentage: 20 },
    { label: "기타", count: 60, percentage: 10 },
  ],
  totalApiRequests: 24304,
  apiSuccessCount: 0,
  apiFailCount: 0,
  apiFailRate: 0,
  apiRequestChart: [12, 8, 5, 3, 6, 10, 20, 30, 22, 15, 9, 14],
  totalUsers: 1600,
  concurrentMax: 160,
  concurrentAvg: 24,
  avgStayTime: "0시간 2분 2초",
  applicationSuccess: 10,
  applicationFail: 10,
  pdfSuccess: 10,
  pdfFail: 0,
  visitorChart: [10, 6, 4, 2, 5, 8, 15, 25, 18, 12, 7, 11],
  clientErrorLogs: Array(6).fill("Dom Client..."),
  serverErrorLogs: Array(6).fill("/api/v1/applicant/123"),
  summary: { total: 160, user: 3, auth: 163, visitor: 23 },
  dbUsageMb: 0,
  bucketUsageMb: 0,
  clientErrorCount: 0,
  clientWarnCount: 0,
};
