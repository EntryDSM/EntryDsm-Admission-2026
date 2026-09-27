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
