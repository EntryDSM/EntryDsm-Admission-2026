import { useEffect } from "react";

/**
 * 데이터 로드 후 문서 제목을 덮어쓸 때 쓴다 (예: 공지 상세에서 실제 공지 제목 표시).
 * title이 없으면 아무것도 하지 않으므로, 로드 전에는 DocumentTitleOutlet이 넣은 라우트 제목이 유지된다.
 */
export const usePageTitle = (title: string | undefined) => {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
};
