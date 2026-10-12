import { type KeyboardEvent, type RefObject, useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * 화면을 덮는 대화상자(옆에서 열리는 패널)의 공통 동작. 마운트돼 있는 동안을 열린 상태로 본다.
 * - 뒤 페이지 스크롤을 막고, 닫히면 원래 스크롤 위치로 돌려놓는다(지원자 상세 모달과 같은 방식).
 * - Esc 로 닫기를 요청한다. 닫을지는 `onRequestClose` 가 정한다(작성 중이면 확인 등).
 * - Tab 포커스가 대화상자 밖으로 나가지 않게 한다 — 반환한 핸들러를 대화상자 루트의 onKeyDown 에 붙인다.
 */
export const useModalDialog = (contentRef: RefObject<HTMLElement | null>, onRequestClose: () => void) => {
  useEffect(() => {
    const { position, top, width } = document.body.style;
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    contentRef.current?.focus();

    return () => {
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [contentRef]);

  useEffect(() => {
    const handleEscapeKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onRequestClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onRequestClose]);

  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const content = contentRef.current;
    const focusableElements = Array.from(content?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    if (focusableElements.length === 0) {
      event.preventDefault();
      content?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === content)) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
};
