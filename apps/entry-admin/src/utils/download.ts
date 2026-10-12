import { toast } from "react-toastify";

/** 팝업이 막히면 null 을 돌려준다. */
export const openDownloadWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

/** 응답을 기다린 뒤 여는 창은 팝업으로 막힐 수 있어, 토스트를 눌러도 같은 링크가 열리게 한다. */
export const notifyDownloadReady = (label: string, url: string) => {
  const opened = openDownloadWindow(url);

  toast.success(
    opened
      ? `${label} 다운로드를 시작했습니다.`
      : `${label} 생성이 완료되었습니다. 여기를 클릭하면 다운로드 링크를 엽니다.`,
    { autoClose: 15_000, onClick: () => openDownloadWindow(url) }
  );
};
