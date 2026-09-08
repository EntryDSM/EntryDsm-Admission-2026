import { colors, Flex, Text } from "@entry/design";
import { Btn, EntryLogo } from "@entry/ui";
import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getStartedApplicantId, useGetAllSchedule, useStartApplication } from "../apis";
import { getAccessToken } from "../utils/token";

const formatScheduleDate = (date: string | undefined) => {
  if (!date) return "일정 미정";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "일정 미정";

  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(parsedDate);
};

export const Landing = () => {
  const navigate = useNavigate();
  const { mutateAsync: startApplication, isPending } = useStartApplication();
  const { data: scheduleData } = useGetAllSchedule();
  const schedules = scheduleData?.schedules ?? [];
  const startDate = formatScheduleDate(schedules.find(schedule => schedule.type === "START_DATE")?.date);
  const endDate = formatScheduleDate(schedules.find(schedule => schedule.type === "END_DATE")?.date);
  const resultDate = formatScheduleDate(schedules.find(schedule => schedule.type === "FIRST_ANNOUNCEMENT")?.date);

  const handleStartApplication = async () => {
    if (!getAccessToken()) {
      toast.error("원서 접수는 로그인 후 이용할 수 있습니다.");
      return;
    }

    const startedApplicantId = getStartedApplicantId();

    if (startedApplicantId !== null) {
      navigate("/application-classification");
      return;
    }

    try {
      await startApplication();
      navigate("/application-classification");
    } catch {
      // useStartApplication의 onError에서 사용자에게 실패 안내를 표시합니다.
    }
  };

  return (
    <Flex width="100%" height="calc(100vh - 70px)" isColumn={true} alignItems="center" gap={60} justifyContent="center">
      <Flex width="40%" height="fit-content" isColumn={true} alignItems="center" gap={48}>
        <Flex isColumn={true} alignItems="center" width="fit-content" height="fit-content" gap={32}>
          <EntryLogo width={65} height={75} />
          <Text textAlign="center" width="445px" fontSize={28} fontWeight={700}>
            대덕소프트웨어마이스터고등학교 입학 원서 접수
          </Text>
          <Text textAlign="center" width="445px" fontSize={24} fontWeight={400} color={colors.gray[400]}>
            지원 전 안내사항을 읽어주세요
          </Text>
        </Flex>
        <Flex isColumn={true} alignItems="center" width="fit-content" height="fit-content" gap={24}>
          <ContentContainer>
            <Text fontSize={16} fontWeight={600}>
              현재 로그인한 계정으로 원서 접수를 진행할 수 있습니다.
            </Text>
          </ContentContainer>
          <ContentContainer>
            <Text fontSize={16} fontWeight={600}>
              원서 접수는 {startDate}부터 {endDate}까지 진행되고, 결과 발표는 {resultDate}입니다.
            </Text>
          </ContentContainer>
          <ContentContainer>
            <Text fontSize={18} fontWeight={600}>
              유형 정보-인적사항-자기소개서 및 학업계획서-성적 입력 순서로 진행됩니다.
            </Text>
          </ContentContainer>
        </Flex>
        <Btn width="100%" onClick={() => void handleStartApplication()} isBlocked={isPending}>
          접수하기
        </Btn>
      </Flex>
    </Flex>
  );
};

const ContentContainer = styled.div`
  width: 100%;
  padding: 15px 30px;
  border-radius: 16px;
  background-color: ${colors.gray[50]};
  border: 1px solid ${colors.gray[200]};
  display: flex;
  justify-content: center;
`;
