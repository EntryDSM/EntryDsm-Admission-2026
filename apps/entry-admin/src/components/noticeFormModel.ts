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
