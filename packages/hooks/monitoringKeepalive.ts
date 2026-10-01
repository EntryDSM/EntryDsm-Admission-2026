// 로그와 LEAVE가 공유하는 전송 예산. 브라우저의 64 KiB 한도에서 여유를 둡니다.
const MAX_KEEPALIVE_BYTES = 60 * 1024;
let pendingBytes = 0;

export const availableMonitoringKeepaliveBytes = () => MAX_KEEPALIVE_BYTES - pendingBytes;

export const sendMonitoringKeepalive = async (endpoint: string, body: string, token: string) => {
  if (!token) throw new Error("Monitoring CSRF token unavailable");
  const blob = new Blob([body], { type: "application/json" });
  if (blob.size > availableMonitoringKeepaliveBytes()) {
    throw new Error("Monitoring keepalive budget exceeded");
  }

  pendingBytes += blob.size;
  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
      credentials: "include",
      body,
      keepalive: true,
    });
  } finally {
    pendingBytes -= blob.size;
  }
};
