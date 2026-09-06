import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import { colors, Flex } from "@entry/design";
import {
  AUTH_APP_URL,
  Btn,
  CancelModal,
  ShowResultModal,
  PasswordModal,
  ChangePasswordModal,
  USER_APP_URL,
  useModal,
} from "@entry/ui";
import { toast } from "react-toastify";
import { ADMISSION_TYPE_LABEL } from "../constants/admissionType";
import { ADMISSION_APP_URL } from "../utils/env";

// API 연동 비활성화
// import {
//   getUserInfo,
//   IUserInfoResponseType,
//   deleteUser,
//   changePassword,
//   removeAccessToken,
//   removeRefreshToken,
// } from '@entry/util-config';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { usePassVerification } from '../hooks/usePassVerification';
// import { useRemainingTime } from '../hooks/useRemainingTime';
// import {
//   getFinalApplicationPdf,
//   deleteApplication,
//   getApplicationStatus,
//   getFirstRoundPass,
//   getSecondRoundPass,
// } from '../apis';
// import { useGetAllSchedule } from '../apis/schedule/schedule';

type LocalApplicationStatus = {
  applicationType: keyof typeof ADMISSION_TYPE_LABEL;
  isSubmitted: boolean;
  isPrintedArrived: boolean;
};

const LOCAL_USER_INFO = {
  name: "user",
  phoneNumber: "전화번호 없음",
};

const LOCAL_REMAINING_TIME = "일정 확인 필요";
const LOCAL_APPLICATION_AVAILABLE = true;

const getLocalApplicationStatus = (): LocalApplicationStatus | null => null;

export const MyPage = () => {
  const [openModal, setOpenModal] = useState({
    delete: false,
    password: false,
    changePassword: false,
    cancelApplication: false,
  });
  const [isPass, setIsPass] = useState(false);
  const [announcementStep, setAnnouncementStep] = useState<1 | 2>(1);

  const openModalHandler = useCallback((modalName: keyof typeof openModal) => {
    setOpenModal(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModalHandler = useCallback((modalName: keyof typeof openModal) => {
    setOpenModal(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const resultModal = useModal();

  const userInfo = LOCAL_USER_INFO;
  const applicationStatus = getLocalApplicationStatus();
  const remainingTime = LOCAL_REMAINING_TIME;
  const isApplicationAvailable = LOCAL_APPLICATION_AVAILABLE;

  const handlePasswordConfirm = () => {
    toast.success("회원 탈퇴가 완료되었습니다.");
    closeModalHandler("password");
    closeModalHandler("delete");
    window.location.href = AUTH_APP_URL;
  };

  const handleChangePasswordConfirm = () => {
    toast.success("비밀번호가 성공적으로 변경되었습니다.");
    closeModalHandler("changePassword");
  };

  const handleApplicationSubmit = () => {
    if (!isApplicationAvailable) {
      toast.error("접수 기간이 아닙니다.");
      return;
    }

    window.open(ADMISSION_APP_URL, "_blank");
  };

  const handleDownloadApplication = () => {
    toast.info("API 연동 제거 상태라 원서 다운로드는 비활성화되어 있습니다.");
  };

  const handleCancelApplication = () => {
    toast.info("API 연동 제거 상태라 접수 취소는 비활성화되어 있습니다.");
    closeModalHandler("cancelApplication");
  };

  const handleChangePassword = () => {
    openModalHandler("changePassword");
  };

  const handleCheckFirstRoundResult = () => {
    setIsPass(false);
    setAnnouncementStep(1);
    resultModal.open();
  };

  const handleCheckSecondRoundResult = () => {
    setIsPass(false);
    setAnnouncementStep(2);
    resultModal.open();
  };

  const handleLogout = () => {
    window.location.href = USER_APP_URL;
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <UserName>{userInfo.name}님</UserName>
        <PhoneNumber>{userInfo.phoneNumber}</PhoneNumber>

        <ApplicationStatusSection>
          <StatusTitle>지원 상태</StatusTitle>
          <StatusBox>
            <ApplicationType>
              {applicationStatus ? ADMISSION_TYPE_LABEL[applicationStatus.applicationType] : "미지원"}
            </ApplicationType>
            <Divider />
            <StatusInfo>
              <StatusLabel>지원서 상태 :</StatusLabel>
              <StatusValue isSubmitted={applicationStatus?.isSubmitted || false}>
                {applicationStatus
                  ? applicationStatus.isPrintedArrived
                    ? "제출 완료 및 원서 도착"
                    : applicationStatus.isSubmitted
                      ? "제출 완료"
                      : "미제출"
                  : "미지원"}
              </StatusValue>
              {!applicationStatus && remainingTime && (
                <RemainingTimeText>(접수 마감까지 {remainingTime})</RemainingTimeText>
              )}
            </StatusInfo>
          </StatusBox>
        </ApplicationStatusSection>

        <ButtonGroup>
          <Flex width="fit-content" height="fit-content" gap={12}>
            <Btn
              backgroundColor={colors.orange[800]}
              color="#FFFFFF"
              borderColor={colors.orange[800]}
              hoverBackgroundColor={colors.orange[800]}
              onClick={handleDownloadApplication}
              isBlocked={!applicationStatus?.isSubmitted}
            >
              원서 다운로드
            </Btn>
            <Btn
              backgroundColor={colors.gray[50]}
              color={colors.orange[800]}
              borderColor={colors.orange[800]}
              hoverBackgroundColor="transparent"
              onClick={handleCheckFirstRoundResult}
            >
              1차 결과 확인
            </Btn>
            <Btn
              backgroundColor={colors.gray[50]}
              color={colors.orange[800]}
              borderColor={colors.orange[800]}
              hoverBackgroundColor="transparent"
              onClick={handleCheckSecondRoundResult}
            >
              2차 결과 확인
            </Btn>
          </Flex>
          {applicationStatus ? (
            <Btn
              backgroundColor={colors.gray[50]}
              color={colors.extra.error}
              borderColor={colors.extra.error}
              hoverBackgroundColor="transparent"
              onClick={() => openModalHandler("cancelApplication")}
            >
              원서 최종 제출 취소
            </Btn>
          ) : (
            <Btn
              backgroundColor={isApplicationAvailable ? colors.gray[50] : colors.gray[200]}
              color={isApplicationAvailable ? colors.orange[800] : colors.gray[400]}
              borderColor={isApplicationAvailable ? colors.orange[800] : colors.gray[400]}
              hoverBackgroundColor="transparent"
              onClick={isApplicationAvailable ? handleApplicationSubmit : undefined}
            >
              원서 접수하기
            </Btn>
          )}
        </ButtonGroup>

        <SettingsTitle>설정</SettingsTitle>

        <SettingsSection>
          <SettingsRow>
            <SettingsLabel>비밀번호</SettingsLabel>
            <Btn
              backgroundColor={colors.gray[50]}
              color={colors.gray[500]}
              borderColor={colors.gray[500]}
              hoverBackgroundColor="transparent"
              onClick={handleChangePassword}
            >
              비밀번호 변경
            </Btn>
          </SettingsRow>

          <SettingsRow>
            <SettingsLabel>계정</SettingsLabel>
            <SettingsButtonGroup>
              <Btn
                backgroundColor={colors.gray[50]}
                color={colors.gray[500]}
                borderColor={colors.gray[500]}
                hoverBackgroundColor="transparent"
                onClick={handleLogout}
              >
                로그아웃
              </Btn>
              <Btn
                backgroundColor={colors.gray[50]}
                color={colors.extra.error}
                borderColor={colors.extra.error}
                hoverBackgroundColor="transparent"
                onClick={() => openModalHandler("delete")}
              >
                회원 탈퇴
              </Btn>
            </SettingsButtonGroup>
          </SettingsRow>
        </SettingsSection>
      </ContentWrapper>
      <CancelModal
        setIsOpen={() => closeModalHandler("delete")}
        isOpen={openModal.delete}
        title="탈퇴하시겠습니까?"
        content="탈퇴 시 모든 정보가 삭제되며, 다시 복구할 수 없습니다."
        btnText="탈퇴하기"
        onClick={() => {
          closeModalHandler("delete");
          openModalHandler("password");
        }}
      />

      <PasswordModal
        setIsOpen={() => closeModalHandler("password")}
        isOpen={openModal.password}
        title="비밀번호 확인"
        content="회원 탈퇴를 위해 비밀번호를 입력해주세요."
        btnText="탈퇴하기"
        onConfirm={handlePasswordConfirm}
        isLoading={false}
      />

      <ChangePasswordModal
        setIsOpen={() => closeModalHandler("changePassword")}
        isOpen={openModal.changePassword}
        onConfirm={handleChangePasswordConfirm}
        isLoading={false}
        userPhoneNumber={userInfo.phoneNumber}
        passVerifiedPhoneNumber={userInfo.phoneNumber}
      />

      <CancelModal
        setIsOpen={() => closeModalHandler("cancelApplication")}
        isOpen={openModal.cancelApplication}
        title="원서 접수를 취소하시겠습니까?"
        content="취소 시 제출한 원서가 삭제되며, 다시 복구할 수 없습니다."
        btnText="접수 취소"
        onClick={handleCancelApplication}
      />

      <ShowResultModal
        isOpen={resultModal.isOpen}
        onClose={resultModal.close}
        isPass={isPass}
        step={announcementStep}
      />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 40px 0 200px 0;
`;

const ContentWrapper = styled.div`
  width: 1540px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
`;

const UserName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: inherit;
`;

const PhoneNumber = styled.div`
  font-size: 16px;
  color: ${colors.gray[400]};
  margin-top: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const SettingsTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: inherit;
  margin: 80px 0 0 0;
`;

const SettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
`;

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SettingsLabel = styled.span`
  font-size: 20px;
  color: inherit;
`;

const SettingsButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ApplicationStatusSection = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.gray[500]};
  margin: 0;
`;

const StatusBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 40px;
  background-color: ${colors.gray[100]};
  border-radius: 12px;
`;

const ApplicationType = styled.span`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.gray[500]};
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.gray[300]};
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const StatusLabel = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.gray[500]};
`;

const StatusValue = styled.span<{ isSubmitted: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${({ isSubmitted }) => (isSubmitted ? colors.orange[800] : colors.gray[400])};
`;

const RemainingTimeText = styled.span`
  font-size: 18px;
  font-weight: 500;
  color: ${colors.orange[800]};
  margin-left: 8px;
`;
