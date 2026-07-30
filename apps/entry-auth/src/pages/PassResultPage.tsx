import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { getPassInfo } from "../apis";
import { PASS_RESULT_MESSAGE } from "../hooks/usePassVerification";

export const PassResultPage = () => {
  const requestedRef = useRef(false);
  const modelToken = new URLSearchParams(window.location.search).get("mdl_tkn");
  const [message, setMessage] = useState(
    modelToken ? "PASS 인증 결과를 확인하고 있습니다." : "인증 토큰이 없습니다. 인증을 다시 진행해 주세요."
  );
  const [isError, setIsError] = useState(!modelToken);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    if (!modelToken) return;

    void getPassInfo(modelToken)
      .then(data => {
        window.opener?.postMessage({ type: PASS_RESULT_MESSAGE, success: true, data }, window.location.origin);
        setMessage("인증이 완료되었습니다. 창이 자동으로 닫힙니다.");
        window.setTimeout(() => window.close(), 500);
      })
      .catch((cause: unknown) => {
        const error = cause instanceof Error ? cause.message : "PASS 인증 결과 조회에 실패했습니다.";
        window.opener?.postMessage({ type: PASS_RESULT_MESSAGE, success: false, error }, window.location.origin);
        setIsError(true);
        setMessage(error);
      });
  }, [modelToken]);

  return (
    <ResultContainer>
      <ResultTitle $isError={isError}>{isError ? "인증 실패" : "PASS 본인인증"}</ResultTitle>
      <ResultMessage>{message}</ResultMessage>
      {isError && (
        <CloseButton type="button" onClick={() => window.close()}>
          닫기
        </CloseButton>
      )}
    </ResultContainer>
  );
};

const ResultContainer = styled.main`
  min-height: 100vh;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
`;

const ResultTitle = styled.h1<{ $isError: boolean }>`
  color: ${({ $isError }) => ($isError ? colors.extra.error : colors.gray[500])};
  font-size: 24px;
  font-weight: 700;
`;

const ResultMessage = styled.p`
  margin-top: 16px;
  color: ${colors.gray[400]};
  font-size: 15px;
  line-height: 1.6;
`;

const CloseButton = styled.button`
  margin-top: 28px;
  padding: 12px 28px;
  border: 0;
  border-radius: 8px;
  background: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
  cursor: pointer;
`;
