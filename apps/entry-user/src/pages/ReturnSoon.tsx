import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ErrorPage } from "@entry/ui";

export const ReturnSoon = () => {
  const [params] = useSearchParams();
  const code = params.get("code") || "";

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://entrydsm.kr";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container>
      <ErrorPage errorMsg={code || "UNKNOWN"} />
    </Container>
  );
};

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.extra.realWhite};
`;

// 로컬 버튼/카드는 공용 에러 페이지로 대체됨
