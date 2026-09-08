import type { consentDocuments } from "./consentDocuments";
export type ConsentType = keyof typeof consentDocuments;
export const consentTitles = {
  terms: "서비스 이용약관",
  privacy: "개인정보 수집·이용 동의",
  sensitive: "민감정보 처리 동의",
};
