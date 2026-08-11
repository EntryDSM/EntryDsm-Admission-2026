const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export const isWithinLastHour = (timestamp: string, now = Date.now()) => {
  const occurredAt = Date.parse(timestamp);

  return Number.isFinite(occurredAt) && occurredAt >= now - ONE_HOUR_IN_MILLISECONDS && occurredAt <= now;
};
