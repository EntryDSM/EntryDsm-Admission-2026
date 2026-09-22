/** react-query 캐시 키 레지스트리. 키 구성을 한 곳에서 관리한다. */
export const QueryKeys = {
  account: {
    me: ["admin", "account", "me"] as const,
  },
  schedule: {
    /** 공개 일정 목록. 랜딩·제출 완료 화면이 공유한다. */
    list: ["schedules"] as const,
    /** 서버 시각 기준 원서 접수 기간 판정(open/closed). 가드와 접수 시작·단계 저장·제출 전 재검증이 공유한다. */
    applicationPeriod: ["application-period"] as const,
  },
};
