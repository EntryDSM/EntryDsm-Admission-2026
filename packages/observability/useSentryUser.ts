import { useEffect } from "react";
import { setUser } from "@sentry/react";

/**
 * 로그인 사용자의 내부 userId 만 Sentry user.id 로 붙인다 (이름·연락처·IP 는 넣지 않는다 — docs/OBSERVABILITY.md 5절).
 * 값이 없어지면(로그아웃·401) 해제한다. 계정 조회 결과를 가진 가드/레이아웃에서 호출한다.
 */
export const useSentryUser = (userId: string | number | null | undefined): void => {
  useEffect(() => {
    setUser(userId === null || userId === undefined ? null : { id: String(userId) });
  }, [userId]);
};
