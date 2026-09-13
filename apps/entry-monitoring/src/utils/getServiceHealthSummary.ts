import type { ServiceHealthData, ServiceHealthStatus } from "../apis/getServiceHealth";

export const getServiceHealthSummary = (health?: ServiceHealthData) => {
  const statusOf = (name: string) => health?.services.find(({ service }) => service === name)?.status;
  const user = statusOf("IDENTITY");
  const auth = statusOf("AUTH");
  const application = statusOf("APPLICATION");
  const statuses = [user, auth, application];
  // A missing service must not make the combined status appear healthy.
  const total: ServiceHealthStatus | undefined = statuses.includes("DOWN")
    ? "DOWN"
    : statuses.includes(undefined)
      ? undefined
      : statuses.includes("DEGRADED")
        ? "DEGRADED"
        : "UP";

  return { total, user, auth, application };
};
