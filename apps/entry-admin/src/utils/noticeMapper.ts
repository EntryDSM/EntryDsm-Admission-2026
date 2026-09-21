import type {
  CreateNoticePayload,
  UpdateNoticePayload,
  NoticeDetail,
  NoticeDivision,
  NoticeSummary,
} from "../apis/types";

/* ────────────── 공지 폼 모델 (단일 출처. `components/noticeFormModel` 은 재노출 시임) ────────────── */

export type NoticeType = "NOTICE" | "GUIDE";

export type NoticeFormValue = {
  title: string;
  category: NoticeType;
  content: string;
  isPinned: boolean;
};

export type NoticeAttachment = {
  id: string;
  name: string;
  file?: File;
  url?: string;
};

export const INITIAL_NOTICE_FORM_VALUE: NoticeFormValue = {
  title: "",
  category: "NOTICE",
  content: "",
  isPinned: false,
};

/* ─────────────────────────── DTO ↔ 뷰 모델 매핑 ─────────────────────────── */

/**
 * FE 카테고리(NOTICE/GUIDE) ↔ 백엔드 공지 분류(`NoticeCategory` 저장값) 매핑.
 * admin 등록/수정의 `division` 과 notification 목록 조회의 `category` 가 같은 값을 쓴다(2026-09-21 확인).
 */
const DIVISION_BY_TYPE: Record<NoticeType, NoticeDivision> = {
  NOTICE: "ADMISSION_NOTICE",
  GUIDE: "PROSPECTIVE_STUDENT",
};

/** 저장값 외에 서버가 함께 받아 주는 한글·영문 이름도 역매핑해, 어떤 표기로 내려와도 분류된다. */
const TYPE_BY_DIVISION: Record<string, NoticeType> = {
  ADMISSION_NOTICE: "NOTICE",
  "입학 공지사항": "NOTICE",
  "Admissions Notice": "NOTICE",
  PROSPECTIVE_STUDENT: "GUIDE",
  "예비 신입생 안내": "GUIDE",
  "Prospective Students Notice": "GUIDE",
};

/** division 이 없거나 알 수 없는 값이면 기본 카테고리(NOTICE)로 안전하게 분류한다. */
const toNoticeType = (division?: NoticeDetail["division"]): NoticeType =>
  (division && TYPE_BY_DIVISION[division.trim()]) || "NOTICE";

/** FE 카테고리 → 백엔드 공지 분류. 목록 `category` 파라미터·등록/수정 `division` 에 쓴다. */
export const getNoticeDivision = (category: NoticeType): NoticeDivision => DIVISION_BY_TYPE[category];

/** 목록 화면(NoticeList)이 사용하는 뷰 모델 */
export interface NoticeListItem {
  noticeId: number;
  title: string;
  author: string;
  /** 목록 응답 명세에 없는 필드 — 미제공(undefined)을 false 로 단정하지 않도록 optional 로 전달한다. */
  isPinned?: boolean;
  /** ISO datetime */
  createdAt: string;
}

export const toNoticeListItem = (dto: NoticeSummary): NoticeListItem => ({
  noticeId: dto.noticeId,
  title: dto.title,
  author: dto.author,
  isPinned: dto.isPinned,
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

/** 수정 폼 → 수정 요청 페이로드. 기존 첨부파일은 서버에서 유지하도록 attachmentIds 를 생략한다(보내면 전체 교체). */
export const toUpdateNoticePayload = (form: NoticeFormValue): UpdateNoticePayload => ({
  title: form.title.trim(),
  division: DIVISION_BY_TYPE[form.category],
  content: form.content,
  isPinned: form.isPinned,
});
