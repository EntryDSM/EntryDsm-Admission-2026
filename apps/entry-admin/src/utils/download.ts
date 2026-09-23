import { toast } from "react-toastify";

/** 서명된 다운로드 URL 을 새 창으로 연다. 브라우저가 팝업으로 막으면 null 을 돌려준다. */
export const openDownloadWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

/**
 * 파일 생성이 끝난 뒤 다운로드를 열고 토스트로 알린다.
 * 서버 응답을 기다린 뒤의 window.open 은 사용자 클릭과 떨어져 있어 브라우저가 팝업으로 막을 수 있으므로,
 * 토스트를 클릭해도 같은 링크가 열리게 한다.
 */
export const notifyDownloadReady = (label: string, url: string) => {
  const opened = openDownloadWindow(url);

  toast.success(
    opened
      ? `${label} 다운로드를 시작했습니다.`
      : `${label} 생성이 완료되었습니다. 여기를 클릭하면 다운로드 링크를 엽니다.`,
    { autoClose: 15_000, onClick: () => openDownloadWindow(url) }
  );
};

/** object URL 을 해제하기 전에 브라우저가 다운로드를 시작할 시간을 준다(즉시 해제하면 일부 브라우저가 파일을 못 받는다). */
const REVOKE_OBJECT_URL_DELAY_MS = 1_000;

/**
 * 받은 Blob 을 파일로 저장한다. 서명 URL 이 아니라 본문을 직접 내려주는 API(자기소개서·학업계획서 ZIP)용으로,
 * 임시 object URL 을 `<a download>` 로 눌러 저장을 시작하고 URL 은 잠시 뒤 해제한다.
 * `<a download>` 클릭은 window.open 과 달리 사용자 클릭과 떨어져 있어도 팝업 차단에 걸리지 않는다.
 */
export const saveBlobAsFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  // Firefox 는 문서에 붙어 있지 않은 앵커의 click() 을 무시한다.
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_OBJECT_URL_DELAY_MS);
};
