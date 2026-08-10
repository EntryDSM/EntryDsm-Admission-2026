type QueryParamValue = string | number | boolean | (string | number)[] | undefined | null;

/**
 * 객체를 쿼리 스트링으로 직렬화한다.
 * - `undefined` / `null` / 빈 문자열 / 빈 배열은 생략한다.
 * - 배열은 API 공통 규약에 따라 콤마로 이어 붙인다. (예: `regions=DAEJEON,NATIONWIDE`)
 * - 결과에는 선행 `?` 가 포함되며, 직렬화할 값이 없으면 빈 문자열을 반환한다.
 */
export const buildQueryString = (params: Record<string, QueryParamValue>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }

      searchParams.append(key, value.join(","));
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
