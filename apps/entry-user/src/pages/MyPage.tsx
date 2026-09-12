import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import { colors, Flex } from "@entry/design";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AUTH_APP_URL, Btn, CancelModal, ShowResultModal, USER_APP_URL, useModal } from "@entry/ui";
import { toast } from "react-toastify";
import {
  type ApplicantStatus,
  type ApplicationDownload,
  cancelApplication,
  deleteMyAccount,
  getApplicationDownload,
  getApplicationResult,
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
  const [isPass, setIsPass] = useState(false);
  const [receiptCode, setReceiptCode] = useState("");
  const [cancellationEmail, setCancellationEmail] = useState("");
  const [cancellationPassword, setCancellationPassword] = useState("");
  const queryClient = useQueryClient();

  const openModalHandler = useCallback((modalName: keyof typeof openModal) => {
    setOpenModal(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModalHandler = useCallback((modalName: keyof typeof openModal) => {
    setOpenModal(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const resultModal = useModal();

  const { data: userInfo } = useQuery({
    queryKey: ["my-account"],
    queryFn: getMyAccount,
  });
  const { data: applicationStatus } = useQuery({
    queryKey: ["application-status"],
    queryFn: getApplicationStatus,
  });
  const resultQuery = useQuery({
    queryKey: ["application-result"],
    queryFn: getApplicationResult,
    enabled: false,
    retry: false,
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
  const cancelApplicationMutation = useMutation({
    mutationFn: cancelApplication,
    onSuccess: () => {
      toast.success("원서 접수가 취소되었습니다.");
      setCancellationPassword("");
      closeModalHandler("cancelCredentials");
      void queryClient.invalidateQueries({ queryKey: ["application-status"] });
    },
    onError: () => toast.error("원서 접수 취소에 실패했습니다."),
  });
  const downloadApplicationMutation = useMutation<ApplicationDownload, Error, string>({
    mutationFn: receiptCode => getApplicationDownload(receiptCode),
    onSuccess: download => {
      window.open(download.downloadUrl, "_blank", "noopener,noreferrer");
      closeModalHandler("download");
    },
    onError: () => toast.error("원서 다운로드 링크를 생성하지 못했습니다."),
  });

  const applicantStatus = applicationStatus?.applicantStatus ?? userInfo?.applicantStatus ?? "NONE";
  const hasApplication = applicantStatus !== "NONE";
  const isSubmitted = SUBMITTED_STATUSES.includes(applicantStatus);
  const canCancelApplication = applicantStatus === "SUBMITTED";

  const handleDownloadApplication = () => {
    openModalHandler("download");
  };

  const handleCancelApplication = () => {
    closeModalHandler("cancelApplication");
    openModalHandler("cancelCredentials");
  };

  const handleDownloadConfirm = () => {
    if (!receiptCode.trim()) {
      toast.error("수험번호를 입력해주세요.");
      return;
    }

    downloadApplicationMutation.mutate(receiptCode.trim());
  };

  const handleCancelApplicationConfirm = () => {
    if (!cancellationEmail.trim() || !cancellationPassword) {
      toast.error("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    cancelApplicationMutation.mutate({
      email: cancellationEmail.trim(),
      password: cancellationPassword,
    });
  };

  const handleChangePassword = () => {
    window.location.href = `${AUTH_APP_URL.replace(/\/$/, "")}/find-password`;
  };

  const handleCheckResult = async () => {
    if (resultQuery.isFetching) return;

    const { data, isError } = await resultQuery.refetch();

    if (isError || !data) {
      toast.error("합격 결과를 불러오지 못했습니다.");
      return;
    }

    if (data.passStatus === "PENDING") {
      toast.info("아직 합격 결과가 발표되지 않았습니다.");
      return;
    }

    setIsPass(data.passStatus === "PASSED");
    resultModal.open();
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
              isBlocked={!isSubmitted}
            >
              원서 다운로드
            </Btn>
            <Btn
              backgroundColor={colors.gray[50]}
              color={colors.orange[800]}
              borderColor={colors.orange[800]}
              hoverBackgroundColor="transparent"
              onClick={handleCheckResult}
              isBlocked={resultQuery.isFetching}
            >
              합격 결과 확인
            </Btn>
          </Flex>
          {canCancelApplication && (
            <Btn
              backgroundColor={colors.gray[50]}
              color={colors.extra.error}
              borderColor={colors.extra.error}
              hoverBackgroundColor="transparent"
              onClick={() => openModalHandler("cancelApplication")}
            >
              원서 최종 제출 취소
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
        onClick={() => deleteAccountMutation.mutate()}
      />

      <CancelModal
        setIsOpen={() => closeModalHandler("cancelApplication")}
        isOpen={openModal.cancelApplication}
        title="원서 접수를 취소하시겠습니까?"
        content="취소 시 제출한 원서가 삭제되며, 다시 복구할 수 없습니다."
        btnText="접수 취소"
        onClick={handleCancelApplication}
      />

      {openModal.download && (
        <InputModalOverlay>
          <InputModal>
            <ModalTitle>원서 다운로드</ModalTitle>
            <ModalDescription>원서에 기재된 수험번호를 입력해주세요.</ModalDescription>
            <InputGroup>
              <InputLabel htmlFor="receipt-code">수험번호</InputLabel>
              <ModalInput
                id="receipt-code"
                value={receiptCode}
                onChange={event => setReceiptCode(event.target.value)}
                placeholder="수험번호를 입력하세요"
                disabled={downloadApplicationMutation.isPending}
              />
            </InputGroup>
            <ModalButtonGroup>
              <Btn
                backgroundColor={colors.gray[50]}
                color={colors.gray[500]}
                borderColor={colors.gray[300]}
                hoverBackgroundColor="transparent"
                onClick={() => closeModalHandler("download")}
              >
                취소
              </Btn>
              <Btn onClick={handleDownloadConfirm} isBlocked={downloadApplicationMutation.isPending}>
                {downloadApplicationMutation.isPending ? "생성 중..." : "다운로드"}
              </Btn>
            </ModalButtonGroup>
          </InputModal>
        </InputModalOverlay>
      )}

      {openModal.cancelCredentials && (
        <InputModalOverlay>
          <InputModal>
            <ModalTitle>원서 접수 취소</ModalTitle>
            <ModalDescription>취소를 위해 가입 이메일과 비밀번호를 입력해주세요.</ModalDescription>
            <InputGroup>
              <InputLabel htmlFor="cancellation-email">이메일</InputLabel>
              <ModalInput
                id="cancellation-email"
                type="email"
                value={cancellationEmail}
                onChange={event => setCancellationEmail(event.target.value)}
                placeholder="이메일을 입력하세요"
                disabled={cancelApplicationMutation.isPending}
              />
            </InputGroup>
            <InputGroup>
              <InputLabel htmlFor="cancellation-password">비밀번호</InputLabel>
              <ModalInput
                id="cancellation-password"
                type="password"
                value={cancellationPassword}
                onChange={event => setCancellationPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={cancelApplicationMutation.isPending}
              />
            </InputGroup>
            <ModalButtonGroup>
              <Btn
                backgroundColor={colors.gray[50]}
                color={colors.gray[500]}
                borderColor={colors.gray[300]}
                hoverBackgroundColor="transparent"
                onClick={() => closeModalHandler("cancelCredentials")}
              >
                취소
              </Btn>
              <Btn
                backgroundColor={colors.extra.error}
                hoverBackgroundColor={colors.extra.error}
                onClick={handleCancelApplicationConfirm}
                isBlocked={cancelApplicationMutation.isPending}
              >
                {cancelApplicationMutation.isPending ? "취소 중..." : "접수 취소"}
              </Btn>
            </ModalButtonGroup>
          </InputModal>
        </InputModalOverlay>
      )}

      <ShowResultModal isOpen={resultModal.isOpen} onClose={resultModal.close} isPass={isPass} />
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

const InputModalOverlay = styled.div`
  z-index: 120;
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-color: rgb(0 0 0 / 20%);
`;

const InputModal = styled.div`
  width: min(100%, 440px);
  padding: 40px;
  border-radius: 24px;
  background-color: ${colors.extra.realWhite};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 28px;
  color: ${colors.gray[500]};
`;

const ModalDescription = styled.p`
  margin: -8px 0 4px;
  font-size: 16px;
  color: ${colors.gray[400]};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputLabel = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.gray[500]};
`;

const ModalInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: ${colors.orange[800]};
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;
