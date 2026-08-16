import type { CreateNoticePayload, NoticeDetail, NoticeDivision, NoticeSummary } from "../apis/types";
import type { NoticeFormValue, NoticeType } from "../components/noticeFormModel";

/**
 * FE 카테고리(NOTICE/GUIDE) ↔ 백엔드 division 매핑.
 * division 값은 등록 명세 예시에서 따온 것이라, 백엔드 표기가 확정되면 이 두 상수만 교체하면 된다.
 */
const DIVISION_BY_TYPE: Record<NoticeType, NoticeDivision> = {
  NOTICE: "Admissions Notice",
  GUIDE: "Prospective Students Notice",
};

const TYPE_BY_DIVISION: Record<string, NoticeType> = {
  "Admissions Notice": "NOTICE",
  "Prospective Students Notice": "GUIDE",
};

/** division 이 없거나 알 수 없는 값이면 기본 탭(NOTICE)으로 안전하게 분류한다. */
const toNoticeType = (division?: NoticeDivision): NoticeType => (division && TYPE_BY_DIVISION[division]) || "NOTICE";

/** 목록 화면(NoticeList)이 사용하는 뷰 모델 */
export interface NoticeListItem {
  noticeId: number;
  title: string;
  author: string;
  type: NoticeType;
  isPinned: boolean;
  /** ISO datetime */
  createdAt: string;
}

export const toNoticeListItem = (dto: NoticeSummary): NoticeListItem => ({
  noticeId: dto.noticeId,
  title: dto.title,
  author: dto.author,
  type: toNoticeType(dto.division),
  isPinned: dto.isPinned ?? false,
  createdAt: dto.createdAt,
});

/** 상세 응답 → 수정 폼 초기값. division/isPinned 미제공 시 폼 기본값으로 둔다. */
export const toNoticeFormValue = (dto: NoticeDetail): NoticeFormValue => ({
  title: dto.title,
  category: toNoticeType(dto.division),
  content: dto.content,
  isPinned: dto.isPinned ?? false,
});

/** 작성 폼 → 등록 요청 페이로드. attachmentIds 는 파일 업로드 API 연동 전이라 보내지 않는다. */
export const toCreateNoticePayload = (form: NoticeFormValue): CreateNoticePayload => ({
  title: form.title.trim(),
  division: DIVISION_BY_TYPE[form.category],
  content: form.content,
  isPinned: form.isPinned,
});
