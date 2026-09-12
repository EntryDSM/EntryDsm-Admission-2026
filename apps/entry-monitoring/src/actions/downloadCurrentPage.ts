import { getMonitoringReport } from "../apis/getMonitoringReport";

export const downloadCurrentPage = async (signal?: AbortSignal) => {
  const controller = new AbortController();
  const timeoutError = new Error("리포트 생성이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
  const cancel = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();
  const deadline = Date.now() + 5 * 60 * 1000;
  const timeout = setTimeout(() => controller.abort(timeoutError), 5 * 60 * 1000);
  const requestSignal = controller.signal;
  try {
    while (true) {
      requestSignal.throwIfAborted();
      const report = await getMonitoringReport(requestSignal);
      requestSignal.throwIfAborted();
      if (Date.now() >= deadline) throw timeoutError;
      if (report.status === "READY") {
        const url = new URL(report.downloadUrl);
        const expiresAt = Date.parse(report.expiresAt);
        if (!Number.isFinite(expiresAt) || url.protocol !== "https:" || !report.fileName || expiresAt <= Date.now()) {
          throw new Error("리포트 다운로드 링크가 유효하지 않습니다. 다시 시도해 주세요.");
        }
        const link = document.createElement("a");
        link.href = url.href;
        link.download = report.fileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }
      if (report.status !== "GENERATING") throw new Error("리포트 상태를 확인할 수 없습니다.");
      const delay = Math.max(1, Number.isFinite(report.pollAfterSeconds) ? report.pollAfterSeconds : 3) * 1000;
      if (Date.now() + delay >= deadline)
        throw new Error("리포트 생성이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
      await new Promise<void>((resolve, reject) => {
        const onAbort = () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        };
        const timer = setTimeout(() => {
          requestSignal.removeEventListener("abort", onAbort);
          resolve();
        }, delay);
        requestSignal.addEventListener("abort", onAbort, { once: true });
        if (requestSignal.aborted) onAbort();
      });
    }
  } catch (error) {
    if (requestSignal.aborted) throw requestSignal.reason;
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
};
