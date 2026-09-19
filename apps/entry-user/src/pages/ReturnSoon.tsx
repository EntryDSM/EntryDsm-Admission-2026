import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { EntryLogo, ErrorPage, isErrorPageStatus, USER_APP_URL } from "@entry/ui";

/**
 * 외부(게이트웨이 등)에서 `/return_soon?code=<HTTP 상태 코드>` 로 보내는 오류 안내 경로.
 * 403·404 는 공용 에러 페이지(새 디자인)로 보여주고, 그 외 코드는 우선 기존 화면을 유지한다.
 */
export const ReturnSoon = () => {
  const [params] = useSearchParams();
  const code = params.get("code") || "";
  const status = Number(code);

  if (isErrorPageStatus(status)) {
    return <ErrorPage status={status} homeHref="/" />;
  }

  return <LegacyErrorPage errorMsg={code || "UNKNOWN"} />;
};

// 403·404 외 코드의 기존 화면. 다른 코드도 새 디자인으로 옮기면 삭제한다.
const LegacyErrorPage = ({ errorMsg }: { errorMsg: string }) => {
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
      <Flex
        backgroundColor="#FF7326"
        isColumn
        justifyContent="space-between"
        width="100%"
        height="100vh"
        paddingTop="80px"
        paddingBottom="80px"
        paddingLeft="80px"
        paddingRight="80px"
      >
        <Flex isColumn gap={27} width="fit-content" height="fit-content">
          <EntryLogo width={50} height={50} />
          <Flex isColumn gap={11} width="fit-content" height="fit-content">
            <Text fontSize={28} fontWeight={700} color="#FEE9E7">
              처리 중 문제가 발생했습니다
            </Text>
            <Text fontSize={28} fontWeight={700} color="#FEE9E7">
              1분 후 다시 시도해주세요
            </Text>
            <Text fontSize={20} fontWeight={300} color="#FEE9E7">
              에러코드 : {errorMsg}
            </Text>
          </Flex>
        </Flex>
        <Text fontSize={32} fontWeight={700} color="#FEE9E7">
          잠시 후 이전 화면으로 이동합니다
        </Text>
      </Flex>
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
