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
  apiRequestChartLabels: string[];
  apiRequestChart: number[];
  totalUsers: number;
  concurrentMax: number;
  concurrentAvg: number;
  avgStayTime: string;
  applicationSuccess: number;
  applicationFail: number;
  pdfSuccess: number;
  pdfFail: number;
  visitorChartLabels: string[];
  visitorChart: number[];
  clientErrorLogs: string[];
  clientLogTotalCount: number;
  serverErrorLogs: string[];
  serverLogTotalCount: number;
  summary: { total: number; user: number; auth: number; application: number };
  dbUsageMb: number;
  bucketUsageMb: number;
  clientErrorCount: number;
  clientWarnCount: number;
}
