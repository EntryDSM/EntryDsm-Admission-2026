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
