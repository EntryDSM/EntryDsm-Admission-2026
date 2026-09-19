import styled from "@emotion/styled";

import { colors, media } from "@entry/design";
import { USER_APP_URL } from "../../utils/env";
import { NoPathHeader } from "./baseHeader";

/** 이 디자인으로 제공하는 상태 코드. 다른 코드가 필요해지면 ERROR_PAGE_CONTENTS 에 항목을 추가한다. */
export type ErrorPageStatus = 403 | 404;

interface ErrorPageContent {
  /** 상태 코드 아래에 표시하는 영문 제목 */
  title: string;
  /** 안내 카드 첫 줄. 둘째 줄(연락처 안내)은 모든 상태에 공통이다. */
  message: string;
}

export const ERROR_PAGE_CONTENTS: Record<ErrorPageStatus, ErrorPageContent> = {
  403: { title: "Forbidden", message: "접근 권한이 없습니다. 권한을 확인 후 다시 시도해주세요." },
  404: { title: "Not Found", message: "요청한 페이지를 찾을 수 없습니다. 경로를 확인 후 다시 시도해주세요." },
};

export const isErrorPageStatus = (status: number): status is ErrorPageStatus => status in ERROR_PAGE_CONTENTS;

interface ErrorPageProps {
  status: ErrorPageStatus;
  /** "홈으로 돌아가기" 이동 주소. 기본은 유저 앱(EntryDSM) 홈이며, 개발 환경에서 env 가 없으면 현재 앱의 "/" 로 간다. */
  homeHref?: string;
}

/**
 * 모든 앱이 공유하는 전체 화면 에러 페이지.
 * 로고 헤더 아래에 상태 코드·영문 제목·안내 카드·홈 버튼을 세로로 가운데 정렬한다.
 */
export const ErrorPage = ({ status, homeHref }: ErrorPageProps) => {
  const { title, message } = ERROR_PAGE_CONTENTS[status];

  return (
    <>
      <NoPathHeader />
      <Container>
        <StatusCode>{status}</StatusCode>
        <StatusTitle>{title}</StatusTitle>
        <MessageCard>
          <Message>
            {message}
            <br />
            문제가 계속될 경우, 아래 연락처로 문의해주세요.
          </Message>
          <Contact>
            이용문의: 042) 866-8820, 042) 866-8822
            <br />
            (대덕소프트웨어마이스터고등학교 SW 교육부)
          </Contact>
        </MessageCard>
        <HomeLink href={homeHref ?? (USER_APP_URL || "/")}>홈으로 돌아가기</HomeLink>
      </Container>
    </>
  );
};

const CARD_MAX_WIDTH = "556px";

const Container = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  /* 고정 헤더(70px) 아래 영역의 세로 가운데에 놓고, 화면이 낮을 때도 위아래 여백을 남긴다. */
  padding: 118px 16px 48px;
  background-color: ${colors.extra.realWhite};
`;

const StatusCode = styled.h1`
  font-size: 72px;
  font-weight: 700;
  line-height: 1.2;
  color: ${colors.orange[800]};

  ${media.medium} {
    font-size: 56px;
  }
`;

const StatusTitle = styled.p`
  margin-top: 12px;
  font-size: 24px;
  font-weight: 400;
  color: ${colors.gray[400]};
  text-align: center;

  ${media.medium} {
    font-size: 20px;
  }
`;

const MessageCard = styled.section`
  width: 100%;
  max-width: ${CARD_MAX_WIDTH};
  margin-top: 48px;
  padding: 32px 24px;
  border: 1px solid ${colors.gray[200]};
  border-radius: 12px;
  background-color: ${colors.gray[50]};
  text-align: center;
  /* 전역 스타일이 user-select 를 막지만, 문의 전화번호는 복사할 수 있어야 한다. */
  user-select: text;

  ${media.medium} {
    margin-top: 32px;
    padding: 24px 16px;
  }
`;

const Message = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.gray[500]};
  word-break: keep-all;
`;

const Contact = styled.p`
  margin-top: 20px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.gray[500]};
  word-break: keep-all;
`;

const HomeLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: ${CARD_MAX_WIDTH};
  height: 48px;
  margin-top: 48px;
  border-radius: 12px;
  background-color: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
  font-size: 18px;
  font-weight: 500;
  transition: background-color 0.35s ease-in-out;

  &:hover {
    background-color: ${colors.orange[850]};
  }

  &:focus-visible {
    outline: 2px solid ${colors.orange[800]};
    outline-offset: 3px;
  }

  ${media.medium} {
    margin-top: 32px;
  }
`;
