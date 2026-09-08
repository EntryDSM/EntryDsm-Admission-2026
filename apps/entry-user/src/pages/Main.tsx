import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { useQuery } from "@tanstack/react-query";
import { ApplicationTimeline, FaqSection, InfoSection } from "../components";
import { school } from "../assets";
import { getSchedules, getServerTime } from "../apis/schedule";
import { getMyAccount } from "../apis/mypage";
import { ADMISSION_APP_URL } from "../utils/env";

const toServerDate = (currentTime: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}) =>
  new Date(
    currentTime.year,
    currentTime.month - 1,
    currentTime.day,
    currentTime.hour,
    currentTime.minute,
    currentTime.second
  );

export const Main = () => {
  const { data: schedules, isError: isSchedulesError } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
  });
  const { data: serverTime, isError: isServerTimeError } = useQuery({
    queryKey: ["server-time"],
    queryFn: getServerTime,
    refetchInterval: 30_000,
  });
  const { isSuccess: isLoggedIn } = useQuery({
    queryKey: ["my-account"],
    queryFn: getMyAccount,
    retry: false,
  });
  const applicationSchedule = schedules?.find(schedule => schedule.title === "원서 접수");
  const currentServerTime = serverTime ? toServerDate(serverTime) : null;
  const isApplicationPeriod = Boolean(
    applicationSchedule &&
    currentServerTime &&
    currentServerTime >= new Date(applicationSchedule.startAt) &&
    currentServerTime <= new Date(applicationSchedule.endAt)
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
  const canApply = isLoggedIn && isApplicationPeriod;

  const handleApplyClick = () => {
    if (!canApply) {
      return;
    }

    window.location.href = ADMISSION_APP_URL;
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
            <ApplyButton onClick={handleApplyClick} disabled={!canApply}>
              지원하기
            </ApplyButton>
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

  @media (max-width: 480px) {
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

  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 80px;

    br {
      display: none;
    }
  }

  @media (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 60px;
    line-height: 1.3;
  }

  @media (max-width: 360px) {
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

  @media (max-width: 1024px) {
    margin-top: 40px;
  }
`;

const ApplyButton = styled.button`
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

  @media (max-width: 1024px) {
    width: 170px;
    font-size: 17px;
    padding: 14px 30px;
    margin-top: 50px;
  }

  @media (max-width: 768px) {
    width: 200px;
    margin-top: 60px;
    padding: 16px 40px;
    font-size: 18px;
  }

  @media (max-width: 480px) {
    width: 180px;
    margin-top: 50px;
    padding: 14px 32px;
    font-size: 16px;
    border-radius: 12px;
  }

  @media (max-width: 360px) {
    width: 160px;
    padding: 12px 28px;
    font-size: 14px;
  }
`;
