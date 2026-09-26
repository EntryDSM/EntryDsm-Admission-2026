import { media } from "@entry/design";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { AUTH_APP_URL } from "@entry/ui";
import { ApplicationTimeline, FaqSection, InfoSection } from "../components";
import { school } from "../assets";
import { getSchedules, getServerTime } from "../apis/schedule";
import { getMyAccount } from "../apis/mypage";
import { ADMISSION_APP_URL } from "../utils/env";
import { APPLICATION_SCHEDULE_TITLE, hasFirstAnnouncementStarted, toDate } from "../utils/schedule";

export const Main = () => {
  const navigate = useNavigate();
  const { data: schedules, isError: isSchedulesError } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
  });
  const { data: serverTime, isError: isServerTimeError } = useQuery({
    queryKey: ["server-time"],
    queryFn: getServerTime,
    refetchInterval: 30_000,
  });
  const { isSuccess: isLoggedIn, isPending: isCheckingLogin } = useQuery({
    queryKey: ["my-account"],
    queryFn: getMyAccount,
    retry: false,
    // 비로그인 방문자의 401 은 정상 흐름이라 Sentry 에 보내지 않는다 (docs/OBSERVABILITY.md 2절).
    meta: { sentryIgnoreStatuses: [401] },
  });
  const applicationSchedule = schedules?.find(schedule => schedule.title === APPLICATION_SCHEDULE_TITLE);
  const currentServerTime = serverTime ? toDate(serverTime) : null;
  const isApplicationPeriod = Boolean(
    applicationSchedule &&
    currentServerTime &&
    currentServerTime >= toDate(applicationSchedule.startAt) &&
    currentServerTime <= toDate(applicationSchedule.endAt)
  );
  const applicationPeriodSubtitle =
    isSchedulesError || isServerTimeError
      ? "원서 접수 일정을 불러오지 못했습니다."
      : !schedules || !serverTime
        ? "원서 접수 일정을 확인하고 있습니다."
        : !applicationSchedule
          ? "원서 접수 일정이 등록되지 않았습니다."
          : isApplicationPeriod
            ? "원서 접수 기간입니다."
            : "원서 접수 기간이 아닙니다.";
  // 1차 합격 발표 시각부터는 접수가 끝나 지원 버튼이 늘 비활성이므로, 그 자리를 마이페이지와 같은 "합격 결과 확인"(/mypage/result) 으로 쓴다.
  // 일정·서버 시각을 못 받으면 지원 버튼 그대로다.
  const isResultStage = hasFirstAnnouncementStarted(schedules, serverTime);
  // 두 버튼 모두 비로그인 클릭은 로그인 페이지로 보낸다. 로그인 여부를 아직 확인하는 동안은 잘못 보내지 않게 비활성으로 둔다.
  // 지원하기는 접수 기간이 아닐 때만 비활성이다(비로그인이라고 막지 않는다).
  const isApplyDisabled = !isApplicationPeriod || isCheckingLogin;

  const goToLogin = () => {
    window.location.href = AUTH_APP_URL;
  };

  const handleApplyClick = () => {
    if (isApplyDisabled) {
      return;
    }
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    window.location.href = ADMISSION_APP_URL;
  };

  const handleCheckResultClick = () => {
    if (isCheckingLogin) {
      return;
    }
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    navigate("/mypage/result");
  };

  return (
    <>
      <MainContainer>
        <BackgroundImage src={school} alt="대덕소프트웨어마이스터고등학교" />
        <Overlay />
        <ContentWrapper>
          <Title>
            <OrangeText>대덕소프트웨어마이스터고등학교</OrangeText>
            <br />
            IT 업계를 이끌 미래 인재를 모집하고 있어요
          </Title>
          <TimelineSection>
            <ApplicationTimeline schedules={schedules} />
            {isResultStage ? (
              <ActionButton onClick={handleCheckResultClick} disabled={isCheckingLogin}>
                합격 결과 확인
              </ActionButton>
            ) : (
              <ActionButton onClick={handleApplyClick} disabled={isApplyDisabled}>
                지원하기
              </ActionButton>
            )}
          </TimelineSection>
        </ContentWrapper>
      </MainContainer>
      <InfoSection subtitle={applicationPeriodSubtitle} />
      <FaqSection />
    </>
  );
};

const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2;
`;

const ContentWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 3;
  text-align: center;
  padding: 0 20px;

  ${media.medium} {
    padding: 0 15px;
  }
`;

const Title = styled.h1`
  font-size: 52px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
  margin-bottom: 120px;

  @media (max-width: 1200px) {
    font-size: 48px;
    margin-bottom: 100px;
  }

  ${media.tablet} {
    font-size: 36px;
    margin-bottom: 80px;

    br {
      display: none;
    }
  }

  ${media.medium} {
    font-size: 28px;
    margin-bottom: 60px;
    line-height: 1.3;
  }

  ${media.small} {
    font-size: 24px;
    margin-bottom: 50px;
  }
`;

const OrangeText = styled.span`
  color: ${colors.orange[800]};
`;

const TimelineSection = styled.div`
  position: relative;
  width: 100%;
  margin-top: 50px;

  ${media.desktop} {
    margin-top: 40px;
  }
`;

const ActionButton = styled.button`
  width: 210px;
  margin-top: 60px;
  background-color: ${colors.orange[800]};
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px 40px;
  font-size: 21px;
  font-weight: 450;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${colors.orange[850]};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${colors.gray[400]};
    cursor: not-allowed;
    opacity: 0.7;
  }

  @media (max-width: 1200px) {
    width: 190px;
    font-size: 19px;
    padding: 15px 35px;
  }

  ${media.desktop} {
    width: 170px;
    font-size: 17px;
    padding: 14px 30px;
    margin-top: 50px;
  }

  ${media.tablet} {
    width: 200px;
    margin-top: 60px;
    padding: 16px 40px;
    font-size: 18px;
  }

  ${media.medium} {
    width: 180px;
    margin-top: 50px;
    padding: 14px 32px;
    font-size: 16px;
    border-radius: 12px;
  }

  ${media.small} {
    width: 160px;
    padding: 12px 28px;
    font-size: 14px;
  }
`;
