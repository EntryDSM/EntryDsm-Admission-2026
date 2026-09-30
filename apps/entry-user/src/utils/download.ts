/**
 * 서명된 다운로드 URL 을 새 창으로 연다. 브라우저가 팝업으로 막으면 false 를 돌려준다.
 * window.open 에 noopener 를 주면 창이 열려도 null 이 돌아와 막혔는지 알 수 없으므로, 연 뒤에 opener 를 끊는다.
 */
export const openDownloadWindow = (url: string) => {
  const opened = window.open(url, "_blank");

  if (!opened) {
    return false;
  }

  opened.opener = null;
  return true;
};
