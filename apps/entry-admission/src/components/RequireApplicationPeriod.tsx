import { useEffect } from "react";
import { Outlet } from "react-router";
import { USER_APP_URL } from "@entry/ui";
import { useApplicationPeriodQuery } from "../hooks/useApplicationPeriod";
import { GuardButton, GuardScreen } from "./GuardScreen";

/**
 * 원서 접수 기간 가드 라우트. 서버 현재 시각(/time)과 원서 접수 일정(/schedules)을 받아 기간 안일 때만 자식 라우트를 렌더링한다.
 * - 기간 밖(시작 전·마감 후·일정 미등록): 유저 앱으로 보낸다.
 * - 조회 실패: 페이지를 막고(fail-closed) 재시도 화면을 띄운다.
 * 접수 시작·단계 저장·제출 직전의 재검증(useVerifyApplicationPeriod)이 같은 캐시를 갱신하면 여기서도 다시 평가돼 이동한다.
 * 바깥의 RequireAuth 가 라우트 이동마다 자식을 다시 마운트하므로 이동 때도 새로 조회되지만, 캐시된 판정으로 화면은 유지된다.
 */
export const RequireApplicationPeriod = () => {
  const { periodStatus, periodError, isCheckingPeriod, refetchPeriod } = useApplicationPeriodQuery();
  const isClosed = periodStatus === "closed";

  useEffect(() => {
    if (isClosed) {
      window.location.replace(USER_APP_URL);
    }
  }, [isClosed]);

  if (isClosed) {
    return <GuardScreen>원서 접수 기간이 아닙니다. 유저 페이지로 이동합니다.</GuardScreen>;
  }

  // 판정값이 아직 없을 때만 막는다. 재검증 중에는 이전 판정(open)을 유지해 작성 중인 화면이 사라지지 않게 한다.
  if (periodStatus === undefined) {
    if (periodError && !isCheckingPeriod) {
      return (
        <GuardScreen>
          원서 접수 기간 확인 중 오류가 발생했습니다.
          <GuardButton type="button" onClick={() => void refetchPeriod()}>
            다시 시도
          </GuardButton>
        </GuardScreen>
      );
    }

    return <GuardScreen>원서 접수 기간 확인 중...</GuardScreen>;
  }

  return <Outlet />;
};
