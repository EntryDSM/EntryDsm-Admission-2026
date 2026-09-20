import { useEffect } from "react";
import { Outlet, useMatches } from "react-router";

/** 라우트 정의의 `handle`에 페이지 제목을 담을 때 쓰는 형태: `handle: { title: "공지사항" }` */
export type PageTitleHandle = { title?: string };

type DocumentTitleOutletProps = {
  /** 페이지 제목이 없는 라우트(홈 등)에 쓰는 전체 제목 — index.html의 `<title>`과 같은 값을 넘긴다 */
  defaultTitle: string;
  /** 페이지 제목 뒤에 붙는 서비스 이름. 생략하면 defaultTitle을 그대로 붙인다 */
  suffix?: string;
};

/**
 * 라우터 최상단에서 모든 라우트를 감싸 `document.title`을 "페이지 제목 | 서비스명"으로 유지한다.
 * 페이지 제목은 현재 매치된 라우트들 중 가장 안쪽의 `handle.title`을 쓴다.
 * 데이터 로드 후 제목을 덮어써야 하는 페이지(공지 상세 등)는 usePageTitle을 함께 쓴다.
 */
export const DocumentTitleOutlet = ({ defaultTitle, suffix }: DocumentTitleOutletProps) => {
  const matches = useMatches();
  const pageTitle = [...matches]
    .reverse()
    .map(match => (match.handle as PageTitleHandle | undefined)?.title)
    .find(Boolean);
  const title = pageTitle ? `${pageTitle} | ${suffix ?? defaultTitle}` : defaultTitle;

  // 제목 문자열이 실제로 바뀔 때만 갱신해, 무관한 리렌더가 usePageTitle이 덮어쓴 제목을 되돌리지 않게 한다.
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <Outlet />;
};
