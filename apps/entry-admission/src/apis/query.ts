/** react-query 캐시 키 레지스트리. 키 구성을 한 곳에서 관리한다. */
export const QueryKeys = {
  account: {
    me: ["admin", "account", "me"] as const,
  },
};
