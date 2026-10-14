import type {
  CreateNoticePayload,
  UpdateNoticePayload,
  NoticeDetail,
  NoticeDivision,
  NoticeSummary,
} from "../apis/types";

/* ─────────────────────────── 공지 폼 모델 ─────────────────────────── */

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

/** 서버가 받는 첨부 확장자 */
export const NOTICE_ATTACHMENT_EXTENSIONS = ["pdf", "hwp", "xlsx", "docx", "jpg", "jpeg", "png", "webp"] as const;

export const NOTICE_ATTACHMENT_ACCEPT = NOTICE_ATTACHMENT_EXTENSIONS.map(extension => `.${extension}`).join(",");

export const NOTICE_ATTACHMENT_MAX_SIZE_BYTES = 20 * 1024 * 1024;

/** 서버가 거절할 파일을 올리기 전에 걸러 안내 문구를 돌려준다. 통과하면 null. */
export const getNoticeAttachmentError = (file: File): string | null => {
  const extension = file.name.includes(".") ? (file.name.split(".").pop() ?? "").toLowerCase() : "";

  if (!(NOTICE_ATTACHMENT_EXTENSIONS as readonly string[]).includes(extension)) {
    return `${file.name}: 허용되지 않는 형식입니다. (${NOTICE_ATTACHMENT_EXTENSIONS.join(", ")})`;
  }

  if (file.size > NOTICE_ATTACHMENT_MAX_SIZE_BYTES) {
    return `${file.name}: 파일당 최대 20MB 까지 올릴 수 있습니다.`;
  }

  return null;
};

/** 새로 올릴 파일만 뽑는다(기존 첨부는 `file` 이 없다). */
export const getNewAttachmentFiles = (attachments: NoticeAttachment[]): File[] =>
  attachments.flatMap(attachment => (attachment.file ? [attachment.file] : []));

export const INITIAL_NOTICE_FORM_VALUE: NoticeFormValue = {
  title: "",
  category: "NOTICE",
  content: "",
  isPinned: false,
};

/* ─────────────────────────── DTO ↔ 뷰 모델 매핑 ─────────────────────────── */

const DIVISION_BY_TYPE: Record<NoticeType, NoticeDivision> = {
  NOTICE: "ADMISSION_NOTICE",
  GUIDE: "PROSPECTIVE_STUDENT",
};

/** 서버가 함께 받는 한글·영문 분류 이름도 분류한다. */
const TYPE_BY_DIVISION: Record<string, NoticeType> = {
  ADMISSION_NOTICE: "NOTICE",
  "입학 공지사항": "NOTICE",
  "Admissions Notice": "NOTICE",
  PROSPECTIVE_STUDENT: "GUIDE",
  "예비 신입생 안내": "GUIDE",
  "Prospective Students Notice": "GUIDE",
};

const toNoticeType = (division?: NoticeDetail["division"]): NoticeType =>
  (division && TYPE_BY_DIVISION[division.trim()]) || "NOTICE";

export const getNoticeDivision = (category: NoticeType): NoticeDivision => DIVISION_BY_TYPE[category];

export interface NoticeListItem {
  noticeId: number;
  title: string;
  author: string;
  isPinned?: boolean;
  createdAt: string;
}

export const toNoticeListItem = (dto: NoticeSummary): NoticeListItem => ({
  noticeId: dto.noticeId,
  title: dto.title,
  author: dto.author,
  isPinned: dto.isPinned,
  createdAt: dto.createdAt,
});

/** 상세 응답에 분류가 없어 목록 탭에서 넘겨받은 `category` 를 먼저 쓴다. */
export const toNoticeFormValue = (dto: NoticeDetail, category?: NoticeType): NoticeFormValue => ({
  title: dto.title,
  category: category ?? toNoticeType(dto.division),
  content: dto.content,
  isPinned: dto.isPinned ?? false,
});

/** `attachmentIds` 는 첨부 업로드를 마친 뒤 등록 훅이 붙인다. */
export const toCreateNoticePayload = (form: NoticeFormValue): CreateNoticePayload => ({
  title: form.title.trim(),
  division: DIVISION_BY_TYPE[form.category],
  content: form.content,
  isPinned: form.isPinned,
});

/**
 * 분류·상단 고정은 상세 응답에 없어 폼 초기값이 실제와 다를 수 있으므로, 바꾼 경우에만 보내 서버 값을 지킨다.
 * `attachmentIds` 는 보내면 첨부 목록 전체가 바뀌어, 새 파일이 있을 때만 수정 훅이 붙인다.
 */
export const toUpdateNoticePayload = (form: NoticeFormValue, initial: NoticeFormValue): UpdateNoticePayload => ({
  title: form.title.trim(),
  division: form.category === initial.category ? undefined : DIVISION_BY_TYPE[form.category],
  content: form.content,
  isPinned: form.isPinned === initial.isPinned ? undefined : form.isPinned,
});
