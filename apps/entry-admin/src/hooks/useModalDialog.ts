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
 * 화면을 덮는 패널의 공통 동작(마운트돼 있는 동안 열린 것으로 본다).
 * 뒤 페이지 스크롤을 막고, Esc 로 닫기를 요청하며, Tab 포커스를 패널 안에 가둔다.
 * 반환한 핸들러는 패널 루트의 onKeyDown 에 붙인다.
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
