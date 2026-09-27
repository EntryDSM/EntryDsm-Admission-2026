import { media } from "@entry/design";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AUTH_APP_URL, Btn, CancelModal, USER_APP_URL } from "@entry/ui";
import { toast } from "react-toastify";
import {
  type ApplicantStatus,
  deleteMyAccount,
  getApplicationDocument,
  getApplicationStatus,
  getMyAccount,
  logout,
} from "../apis/mypage";

const APPLICATION_STATUS_LABEL: Record<ApplicantStatus, string> = {
  NONE: "미지원",
  DRAFT: "작성 중",
  SUBMITTED: "제출 완료",
  REVIEWING: "검토 중",
  COMPLETED: "전형 완료",
  CANCELED: "제출 취소",
};

const SUBMITTED_STATUSES: ApplicantStatus[] = ["SUBMITTED", "REVIEWING", "COMPLETED"];

export const MyPage = () => {
  const [openModal, setOpenModal] = useState({
    delete: false,
    cancelApplication: false,
    cancelCredentials: false,
    download: false,
  });

  const openModalHandler = useCallback((modalName: keyof typeof openModal) => {
    setOpenModal(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModalHandler = useCallback((modalName: keyof typeof openModal) => {
    setOpenModal(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const navigate = useNavigate();

  const { data: userInfo } = useQuery({
    queryKey: ["my-account"],
    queryFn: getMyAccount,
    // 비로그인 방문자의 401 은 정상 흐름이라 Sentry 에 보내지 않는다 (docs/OBSERVABILITY.md 2절).
    meta: { sentryIgnoreStatuses: [401] },
  });
  const { data: applicationStatus } = useQuery({
    queryKey: ["application-status"],
    queryFn: getApplicationStatus,
  });
  const deleteAccountMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      closeModalHandler("delete");
      toast.success("회원 탈퇴가 완료되었습니다.");
      window.location.href = AUTH_APP_URL;
    },
    onError: () => toast.error("회원 탈퇴에 실패했습니다."),
  });
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.href = USER_APP_URL;
    },
    onError: () => toast.error("로그아웃에 실패했습니다."),
  });

  const applicantStatus = applicationStatus?.applicantStatus ?? userInfo?.applicantStatus ?? "NONE";
  const hasApplication = applicantStatus !== "NONE";
  const isSubmitted = SUBMITTED_STATUSES.includes(applicantStatus);

  const handleShowAccountInfo = () => {
    if (!userInfo) {
      toast.error("계정 정보를 불러오지 못했습니다.");
      return;
    }

    toast.info(`유저 ID: ${userInfo.userId}`);
  };

  const handleChangePassword = () => {
    window.location.href = `${AUTH_APP_URL.replace(/\/$/, "")}/find-password`;
  };

  const handleDownloadApplication = async () => {
    const document = await getApplicationDocument();
    window.open(document.downloadUrl, "_blank");
  };

  // 합격 결과는 팝업 대신 전용 페이지(/mypage/result)에서 보여준다. 발표 전·오류 안내도 그 페이지가 맡는다.
  const handleCheckResult = () => {
    navigate("/mypage/result");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <UserName>{userInfo?.name ?? "사용자"}님</UserName>
        <PhoneNumber>{userInfo?.phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3") ?? "전화번호 없음"}</PhoneNumber>

        <ApplicationStatusSection>
          <StatusTitle>지원 상태</StatusTitle>
          <StatusBox>
            <ApplicationType>{hasApplication ? "지원서" : "미지원"}</ApplicationType>
            <Divider />
            <StatusInfo>
              <StatusLabel>지원서 상태 :</StatusLabel>
              <StatusValue isSubmitted={isSubmitted}>{APPLICATION_STATUS_LABEL[applicantStatus]}</StatusValue>
              {applicantStatus === "COMPLETED" && (
                <Text color={colors.gray[400]} fontSize={12}>
                  *반드시 서류를 출력 후 서명한 뒤 제출하여야 접수가 완료됩니다.
                </Text>
              )}
            </StatusInfo>
          </StatusBox>
        </ApplicationStatusSection>
        <Flex width="fit-content" height="fit-content" gap={12} style={{ marginTop: 24 }}>
          <Btn
            backgroundColor={colors.orange[800]}
            color="#FFFFFF"
            borderColor={colors.orange[800]}
            hoverBackgroundColor={colors.orange[800]}
            onClick={() => handleDownloadApplication()}
            isBlocked={!isSubmitted}
          >
            원서 다운로드
          </Btn>
          <Btn
            backgroundColor="#FFFFFF"
            color={colors.orange[800]}
            borderColor={colors.orange[800]}
            hoverBackgroundColor="transparent"
            onClick={handleCheckResult}
          >
            합격 결과 확인
          </Btn>
        </Flex>
        <SettingsTitle>설정</SettingsTitle>
        <SettingsSection>
          <SettingsRow>
            <SettingsLabel>계정 확인</SettingsLabel>
            <Btn
              backgroundColor="#FFFFFF"
              color={colors.gray[500]}
              borderColor={colors.gray[500]}
              hoverBackgroundColor="transparent"
              onClick={handleShowAccountInfo}
              width="150px"
            >
              계정 정보 조회
            </Btn>
          </SettingsRow>

          <SettingsRow>
            <SettingsLabel>비밀번호</SettingsLabel>
            <Btn
              backgroundColor="#FFFFFF"
              color={colors.gray[500]}
              borderColor={colors.gray[500]}
              hoverBackgroundColor="transparent"
              width="150px"
              onClick={handleChangePassword}
            >
              비밀번호 변경
            </Btn>
          </SettingsRow>

          <SettingsRow>
            <SettingsLabel>계정</SettingsLabel>
            <SettingsButtonGroup>
              <Btn
                backgroundColor="#FFFFFF"
                color={colors.gray[500]}
                borderColor={colors.gray[500]}
                hoverBackgroundColor="transparent"
                onClick={handleLogout}
              >
                로그아웃
              </Btn>
              <Btn
                backgroundColor="#FFFFFF"
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
        confirmText="확인했습니다"
        confirmDescription='탈퇴를 위해서는 "확인했습니다"를 작성해주세요.'
        btnText="탈퇴하기"
        isLoading={deleteAccountMutation.isPending}
        onClick={() => deleteAccountMutation.mutate()}
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

  ${media.tablet} {
    padding: 28px 0 80px;
  }
`;

const ContentWrapper = styled.div`
  width: min(1200px, calc(100% - 48px));
  display: flex;
  flex-direction: column;

  ${media.medium} {
    width: calc(100% - 32px);
  }
`;

const UserName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: inherit;

  ${media.tablet} {
    font-size: 26px;
  }

  ${media.medium} {
    font-size: 24px;
  }
`;

const PhoneNumber = styled.div`
  font-size: 16px;
  color: ${colors.gray[400]};
  margin-top: 12px;
`;

const SettingsTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: inherit;
  margin: 80px 0 0 0;

  ${media.tablet} {
    margin-top: 48px;
    font-size: 18px;
  }
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

  gap: 16px;

  ${media.tablet} {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const SettingsLabel = styled.span`
  font-size: 20px;
  color: inherit;

  ${media.tablet} {
    font-size: 16px;
  }
`;

const SettingsButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

  ${media.tablet} {
    font-size: 20px;
  }
`;

const StatusBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 40px;
  background-color: ${colors.gray[100]};
  border-radius: 12px;

  ${media.tablet} {
    padding: 20px;
  }
`;

const ApplicationType = styled.span`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.gray[500]};

  ${media.tablet} {
    font-size: 16px;
  }
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

  ${media.tablet} {
    font-size: 18px;
  }
`;

const StatusValue = styled.span<{ isSubmitted: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${({ isSubmitted }) => (isSubmitted ? colors.orange[800] : colors.gray[400])};

  ${media.tablet} {
    font-size: 18px;
  }
`;
