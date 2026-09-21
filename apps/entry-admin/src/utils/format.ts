/** ISO date(`2010-03-15`) → `2010.03.15`. 값이 없으면 `undefined`. */
export const formatDotDate = (isoDate?: string) => {
  if (!isoDate) {
    return undefined;
  }

  return isoDate.slice(0, 10).replaceAll("-", ".");
};

/**
 * 접수번호 표기. 별도 접수 번호는 없고 접수 순서대로 매겨진 `applicantId` 를 네 자리로 채운다(`0001`).
 * 백엔드 `ReceiptNumber` 가 서식 1 의 접수번호 칸·원서·수험표 파일명·엑셀에 쓰는 표기와 같다.
 */
export const formatReceiptNumber = (applicantId: number) => String(applicantId).padStart(4, "0");
