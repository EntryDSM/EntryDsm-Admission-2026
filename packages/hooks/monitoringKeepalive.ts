// 로그와 LEAVE가 공유하는 전송 예산. 브라우저의 64 KiB 한도에서 여유를 둡니다.
const MAX_KEEPALIVE_BYTES = 60 * 1024;
let pendingBytes = 0;

export const availableMonitoringKeepaliveBytes = () => MAX_KEEPALIVE_BYTES - pendingBytes;

export const sendMonitoringKeepalive = async (endpoint: string, body: string, token: string | null) => {
  const blob = new Blob([body], { type: "application/json" });
  if (blob.size > availableMonitoringKeepaliveBytes()) {
    throw new Error("Monitoring keepalive budget exceeded");
  }

  pendingBytes += blob.size;
  let beaconAccepted = false;
  try {
    if (!token && navigator.sendBeacon?.(endpoint, blob)) {
      // Beacon은 완료를 알 수 없으므로 문서가 살아 있는 동안 예산을 보수적으로 유지합니다.
      beaconAccepted = true;
      return null;
    }
    return await fetch(endpoint, {
      method: "POST",
      headers: token
        ? { "Content-Type": "application/json", "X-XSRF-TOKEN": token }
        : { "Content-Type": "application/json" },
      credentials: "include",
      body,
      keepalive: true,
    });
  } finally {
    if (!beaconAccepted) pendingBytes -= blob.size;
  }
};
