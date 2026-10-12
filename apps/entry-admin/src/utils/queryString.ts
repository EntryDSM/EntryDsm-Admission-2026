type QueryParamValue = string | number | boolean | (string | number)[] | undefined | null;

/** 빈 값은 빼고 배열은 콤마로 잇는다. 값이 없으면 빈 문자열, 있으면 `?` 로 시작한다. */
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
