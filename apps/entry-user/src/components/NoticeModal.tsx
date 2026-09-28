import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import noticeImages from "virtual:notice-images";

import { colors } from "@entry/design";

// public/NoticeImg 의 이미지를 파일명 순으로 한 장씩 띄우는 공지 팝업. 닫으면 다음 장이 뜨고, 폴더가 비어 있으면 뜨지 않는다.
// 목록은 빌드할 때 vite.config.ts 의 noticeImages 플러그인이 만든다.
// 접속과 동시에 새 탭을 여는 방식은 브라우저 팝업 차단에 막혀서 사이트 안 모달로 띄운다.
// 닫은 장 수를 sessionStorage 에 남겨, 같은 탭 안에서 페이지를 옮기거나 새로고침해도 이미 닫은 장은 다시 띄우지 않는다.
const CLOSED_COUNT_KEY = "entry-notice-closed-count";

const readClosedCount = () => {
  try {
    const count = Number(window.sessionStorage.getItem(CLOSED_COUNT_KEY));
    return Number.isInteger(count) && count > 0 ? count : 0;
  } catch {
    // 저장소를 쓸 수 없는 브라우저(사이트 데이터 차단 등)에서는 새로고침할 때마다 첫 장부터 띄운다.
    return 0;
  }
};

const saveClosedCount = (count: number) => {
  try {
    window.sessionStorage.setItem(CLOSED_COUNT_KEY, String(count));
  } catch {
    // 저장에 실패해도 지금 화면에서는 다음 장으로 넘어간다.
  }
};

export const NoticeModal = () => {
  const [closedCount, setClosedCount] = useState(readClosedCount);
  // 크기를 모르는 이미지를 받기 전에 띄우면 팝업이 버튼만 한 크기로 떴다가 커지므로, 첫 장을 받은 뒤부터 보인다.
  const [hasLoaded, setHasLoaded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const imageSrc = noticeImages[closedCount];
  const isVisible = imageSrc !== undefined && hasLoaded;

  const handleClose = useCallback(() => {
    saveClosedCount(closedCount + 1);
    setClosedCount(closedCount + 1);
  }, [closedCount]);

  useEffect(() => {
    if (!isVisible) return;

    // 키보드 사용자가 바로 Enter·Esc 로 닫을 수 있도록 장마다 닫기 버튼에 포커스를 둔다.
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleClose]);

  useEffect(() => {
    if (!isVisible) return;

    // 지금 장을 보는 동안 남은 장을 미리 받아 두어, 닫자마자 다음 장이 바로 뜨게 한다.
    noticeImages.slice(closedCount + 1).forEach(src => {
      new Image().src = src;
    });
  }, [isVisible, closedCount]);

  if (imageSrc === undefined) return null;

  return (
    <Overlay isVisible={isVisible} onClick={handleClose}>
      <Dialog role="dialog" aria-modal="true" aria-label="공지" onClick={e => e.stopPropagation()}>
        <ImageArea>
          <NoticeImage
            key={imageSrc}
            src={imageSrc}
            alt="공지 이미지"
            onLoad={() => setHasLoaded(true)}
            // 깨진 파일은 건너뛰고 다음 장으로 넘어간다.
            onError={handleClose}
          />
        </ImageArea>
        <CloseButton ref={closeButtonRef} type="button" onClick={handleClose}>
          닫기
        </CloseButton>
      </Dialog>
    </Overlay>
  );
};

// 헤더(z-index 100)는 덮고, 토스트(9999)보다는 아래에 둔다. 첫 장을 받기 전에는 보이지도, 클릭을 가로채지도 않는다.
const Overlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.6);
  visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
`;

// 이미지 원래 크기에 맞춰지되 화면(여백 16px 제외)을 넘지 않는다.
const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
  border-radius: 16px;
  overflow: hidden;
  background-color: ${colors.extra.realWhite};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

// 공지 이미지는 글자가 많아 화면 높이에 맞춰 줄이면 읽기 어려우므로, 넘치는 만큼은 줄이지 않고 이 영역 안에서 스크롤한다.
// 닫기 버튼은 스크롤과 상관없이 늘 팝업 아래에 보인다.
const ImageArea = styled.div`
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

// 폭이 화면보다 넓을 때만 비율을 유지한 채 줄인다.
const NoticeImage = styled.img`
  display: block;
  max-width: 100%;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 100%;
  height: 52px;
  border-top: 1px solid ${colors.gray[200]};
  background-color: ${colors.extra.realWhite};
  color: ${colors.gray[500]};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: ${colors.gray[50]};
  }
`;
