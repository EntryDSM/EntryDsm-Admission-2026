import { getMonitoringReport } from "../apis/getMonitoringReport";
import { API_BASE_URL } from "../apis/http";

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
    requestSignal.throwIfAborted();
    const report = await getMonitoringReport(requestSignal);
    requestSignal.throwIfAborted();
    if (Date.now() >= deadline) throw timeoutError;

    const url = new URL(report.downloadUrl, API_BASE_URL || window.location.origin);
    const expiresAt = Date.parse(report.expiresAt);
    if (!Number.isFinite(expiresAt) || url.protocol !== "https:" || !report.fileName || expiresAt <= Date.now()) {
      throw new Error("리포트 다운로드 링크가 유효하지 않습니다. 다시 시도해 주세요.");
    }

    // 교차 출처 링크도 Blob URL로 바꿔 파일명과 다운로드 동작을 일관되게 보장합니다.
    const downloadResponse = await fetch(url.href, { signal: requestSignal });
    if (!downloadResponse.ok) {
      throw new Error("리포트 파일을 다운로드하지 못했습니다. 다시 시도해 주세요.");
    }

    const blob = await downloadResponse.blob();
    if (blob.size === 0) {
      throw new Error("리포트 파일이 비어 있습니다. 다시 시도해 주세요.");
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  } catch (error) {
    if (requestSignal.aborted) throw requestSignal.reason;
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
};
