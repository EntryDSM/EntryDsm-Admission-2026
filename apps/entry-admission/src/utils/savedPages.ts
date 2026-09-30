/**
 * 원서 단계별 "서버에 마지막으로 저장한 입력값" 기록.
 *
 * 단계 저장은 "다음" 을 눌러야만 일어난다. 앞 단계로 돌아가 값을 고친 뒤 "다음" 대신 주소창·뒤로/앞으로 가기로
 * 미리보기·제출 단계로 건너뛰면, 화면(IndexedDB)은 고친 값인데 서버에는 고치기 전 값이 남은 채 제출된다.
 * 그래서 단계마다 저장에 쓴 입력값의 지문을 applicantId 별로 localStorage 에 남기고, 지금 입력값과 다르면 저장 안 된 단계로 본다.
 */
const getStorageKey = (applicantId: number) => `entry-application-saved-pages:${applicantId}`;

type SavedPages = Record<string, string>;

const readSavedPages = (applicantId: number): SavedPages => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(getStorageKey(applicantId)) ?? "{}");
    return saved && typeof saved === "object" ? (saved as SavedPages) : {};
  } catch {
    return {};
  }
};

const writeSavedPages = (applicantId: number, savedPages: SavedPages) => {
  try {
    window.localStorage.setItem(getStorageKey(applicantId), JSON.stringify(savedPages));
  } catch {
    // 저장소를 못 쓰면 기록이 남지 않아 앞 단계가 모두 "저장 안 됨" 으로 보인다. 다시 저장하게 될 뿐 잘못 제출되지는 않는다.
  }
};

// 객체 키 순서와 파일(증명사진)까지 반영한 안정적인 직렬화. File 은 JSON 으로 바꾸면 `{}` 라 바뀐 사진을 알아채지 못한다.
const stableReplacer = (_key: string, value: unknown) => {
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return value instanceof File ? `file:${value.name}:${value.size}:${value.lastModified}` : `blob:${value.size}`;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
  }

  return value;
};

/** 입력값의 지문(FNV-1a 32비트). 자기소개서처럼 긴 값도 localStorage 에 짧게 남긴다. */
export const fingerprintPageInput = (input: unknown) => {
  const text = JSON.stringify(input, stableReplacer) ?? "";
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16);
};

/** 단계 경로 → 서버에 마지막으로 저장한 입력값의 지문 */
export const getSavedPageFingerprints = (applicantId: number): Readonly<SavedPages> => readSavedPages(applicantId);

export const markPageSaved = (applicantId: number, route: string, fingerprint: string) => {
  writeSavedPages(applicantId, { ...readSavedPages(applicantId), [route]: fingerprint });
};

/** 다시 저장해야 하는 단계로 되돌린다(예: 성적을 고치면 총점 계산 단계). */
export const unmarkPagesSaved = (applicantId: number, routes: readonly string[]) => {
  const savedPages = readSavedPages(applicantId);
  routes.forEach(route => delete savedPages[route]);
  writeSavedPages(applicantId, savedPages);
};

export const clearSavedPages = (applicantId: number) => {
  try {
    window.localStorage.removeItem(getStorageKey(applicantId));
  } catch {
    // 지우지 못해도 다음 원서는 applicantId 가 달라 섞이지 않는다.
  }
};
