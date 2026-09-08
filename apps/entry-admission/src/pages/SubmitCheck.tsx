import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import { Btn, InputContent, PreviousBtn, useApplicationData } from "@entry/ui";
import { ApplicationPreview } from "./applicationCheck/index";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { clearStartedApplicantId, getApplicationStorageKey, getStartedApplicantId, submitApplication } from "../apis";

export const SubmitCheck = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { clearAllData } = useApplicationData();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleClose = () => {
    navigate("/application-preview");
  };

  const handleSubmit = async () => {
    if (message !== "확인했습니다" || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication();
      const applicantId = getStartedApplicantId();
      await clearAllData(applicantId === null ? undefined : getApplicationStorageKey(applicantId));
      clearStartedApplicantId();
      navigate("/submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "원서 제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ApplicationPreview />
      <ModalBackdrop>
        <ModalCard>
          <Flex width="100%" height="fit-content" isColumn={true} gap={40}>
            <Flex width="fit-content" height="fit-content" isColumn={true} gap={16}>
              <Text fontSize={32} fontWeight={700}>
                제출하시겠습니까?
              </Text>
              <Text fontSize={18} color={colors.gray[400]}>
                제출을 위해서는 "확인했습니다"를 작성해주세요.
              </Text>
            </Flex>
            <InputContent
              width="100%"
              value={message}
              onChange={handleInputChange}
              placeholder='"확인했습니다"를 입력하세요'
            />
            <ButtonRow>
              <PreviousBtn
                width="83px"
                backgroundColor={colors.gray[50]}
                color={colors.gray[400]}
                borderColor={colors.gray[100]}
                hoverBackgroundColor={colors.gray[50]}
                onClick={handleClose}
              >
                취소
              </PreviousBtn>
              <Btn
                width="83px"
                onClick={() => void handleSubmit()}
                backgroundColor={colors.orange[100]}
                color={colors.orange[700]}
                borderColor={colors.orange[300]}
                hoverBackgroundColor={colors.orange[100]}
                isBlocked={message !== "확인했습니다" || isSubmitting}
              >
                {isSubmitting ? "제출 중" : "제출"}
              </Btn>
            </ButtonRow>
          </Flex>
        </ModalCard>
      </ModalBackdrop>
    </>
  );
};

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const ModalCard = styled.div`
  width: min(520px, 100%);
  border-radius: 10px;
  padding: 48px 40px;
  background-color: ${colors.extra.realWhite};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
`;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  gap: 16px;
`;
