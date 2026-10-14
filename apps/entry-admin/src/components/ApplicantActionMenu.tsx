import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

interface IApplicantActionMenuType {
  /** 접수 기간이라 접수 취소를 할 수 있는지. 아니면 취소 항목을 막는다. */
  isCancelAvailable: boolean;
  /** 1차 합격 발표 전이라 1차 합격자로 등록할 수 있는지. 아니면 등록 항목을 숨긴다. */
  isFirstPassSelectable: boolean;
  onCorrect: () => void;
  onSelectFirstPass: () => void;
  onCancel: () => void;
}

/** 메뉴가 화면 아래로 넘치면 위로 펼친다. 화면 끝과 띄울 간격 */
const VIEWPORT_MARGIN = 8;

const getMenuItems = (menu: HTMLElement) => Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));

/**
 * 지원자 목록 마지막 열의 "원서 정정" 버튼과 메뉴(원서 정정·1차 합격자 등록·원서 접수 취소).
 * 행을 누르면 상세 모달이 열리므로 이 안의 클릭은 행으로 올려 보내지 않는다.
 */
export const ApplicantActionMenu = ({
  isCancelAvailable,
  isFirstPassSelectable,
  onCorrect,
  onSelectFirstPass,
  onCancel,
}: IApplicantActionMenuType) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  // 그리기 전에 펼칠 방향을 정하고 첫 항목에 포커스한다.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!isOpen || !menu || !trigger) {
      return;
    }

    const menuRect = menu.getBoundingClientRect();
    const overflowsBelow = menuRect.bottom > window.innerHeight - VIEWPORT_MARGIN;
    const fitsAbove = trigger.getBoundingClientRect().top - menuRect.height - VIEWPORT_MARGIN > 0;
    menu.dataset.placement = overflowsBelow && fitsAbove ? "top" : "bottom";

    getMenuItems(menu)[0]?.focus();
  }, [isOpen]);

  const closeMenu = (restoreFocus: boolean) => {
    setIsOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = menuRef.current ? getMenuItems(menuRef.current) : [];
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const focusItem = (index: number) => items[(index + items.length) % items.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItem(currentIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItem(currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItem(0);
        break;
      case "End":
        event.preventDefault();
        focusItem(items.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu(true);
        break;
      case "Tab":
        // 버튼으로 포커스를 돌려 Tab 이 버튼 다음 칸으로 넘어가게 한다.
        closeMenu(true);
        break;
    }
  };

  const handleCorrectClick = () => {
    closeMenu(false);
    onCorrect();
  };

  const handleSelectFirstPassClick = () => {
    closeMenu(false);
    onSelectFirstPass();
  };

  // 접수 기간이 아니면 항목은 보이되 누르기만 막는다.
  const handleCancelClick = () => {
    if (!isCancelAvailable) {
      return;
    }

    closeMenu(false);
    onCancel();
  };

  return (
    <Container ref={containerRef} onClick={event => event.stopPropagation()}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleTriggerKeyDown}
      >
        원서 정정
        <Chevron $isOpen={isOpen} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </Chevron>
      </Trigger>

      {isOpen && (
        <Menu ref={menuRef} id={menuId} role="menu" aria-label="원서 정정 메뉴" onKeyDown={handleMenuKeyDown}>
          <MenuItem type="button" role="menuitem" onClick={handleCorrectClick}>
            <MenuItemTitle $tone="default">원서 정정</MenuItemTitle>
          </MenuItem>
          {isFirstPassSelectable && (
            <MenuItem type="button" role="menuitem" onClick={handleSelectFirstPassClick}>
              <MenuItemTitle $tone="default">1차 합격자 등록</MenuItemTitle>
            </MenuItem>
          )}
          <MenuDivider role="separator" />
          <MenuItem
            type="button"
            role="menuitem"
            $isDanger={true}
            aria-disabled={!isCancelAvailable}
            onClick={handleCancelClick}
          >
            <MenuItemTitle $tone={isCancelAvailable ? "danger" : "disabled"}>원서 접수 취소</MenuItemTitle>
          </MenuItem>
        </Menu>
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  display: inline-flex;
  max-width: 100%;
`;

// 2차 합격자 등록 버튼과 같은 모양에, 메뉴가 열린다는 화살표를 붙인다.
const Trigger = styled.button`
  height: 37px;
  max-width: 100%;
  padding: 8px 10px 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  background-color: ${colors.green[400]};
  color: ${colors.gray[50]};
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  &:hover,
  &[aria-expanded="true"] {
    background-color: ${colors.green[500]};
  }

  &:focus-visible {
    outline: 2px solid ${colors.green[600]};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    height: 34px;
    padding: 8px;
    gap: 4px;
    font-size: 14px;
  }
`;

const Chevron = styled.svg<{ $isOpen: boolean }>`
  flex-shrink: 0;
  transform: rotate(${({ $isOpen }) => ($isOpen ? "180deg" : "0deg")});
  transition: transform 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  width: 248px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  border: 1px solid ${colors.gray[200]};
  border-radius: 12px;
  background-color: ${colors.extra.realWhite};
  box-shadow:
    0 12px 32px rgba(31, 38, 44, 0.12),
    0 2px 6px rgba(31, 38, 44, 0.06);
  cursor: default;
  animation: applicantActionMenuIn 0.16s ease-out;

  &[data-placement="top"] {
    top: auto;
    bottom: calc(100% + 6px);
  }

  @keyframes applicantActionMenuIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const MENU_ITEM_TITLE_COLORS = {
  default: colors.gray[500],
  danger: colors.extra.error,
  disabled: colors.gray[300],
} as const;

const MenuItemTitle = styled.span<{ $tone: keyof typeof MENU_ITEM_TITLE_COLORS }>`
  color: ${({ $tone }) => MENU_ITEM_TITLE_COLORS[$tone]};
  font-size: 15px;
  font-weight: 600;
`;

const MenuItem = styled.button<{ $isDanger?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  border-radius: 8px;
  background-color: transparent;
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background-color: ${({ $isDanger }) => ($isDanger ? "rgba(232, 64, 69, 0.06)" : colors.gray[100])};
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;

    &:hover,
    &:focus-visible {
      background-color: ${colors.gray[50]};
    }
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  margin: 4px 8px;
  background-color: ${colors.gray[200]};
`;
