/** `2010-03-15` → `2010.03.15` */
export const formatDotDate = (isoDate?: string) => {
  if (!isoDate) {
    return undefined;
  }

  return isoDate.slice(0, 10).replaceAll("-", ".");
};

/** 접수번호 표기. 접수 순서인 `applicantId` 를 네 자리로 채운다(서버 문서와 같은 표기). */
export const formatReceiptNumber = (applicantId: number) => String(applicantId).padStart(4, "0");
