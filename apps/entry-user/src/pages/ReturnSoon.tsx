import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { ErrorPage, USER_APP_URL } from "@entry/ui";

export const ReturnSoon = () => {
  const [params] = useSearchParams();
  const code = params.get("code") || "";

  useEffect(() => {
    // env 미설정 시(개발) href="" 는 현재 페이지 리로드가 되어 무한 루프가 되므로 건너뛴다
    if (!USER_APP_URL) return;

    const timer = setTimeout(() => {
      window.location.href = USER_APP_URL;
    }, 10000);
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
