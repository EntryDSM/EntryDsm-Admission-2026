import styled from "@emotion/styled";

import { colors } from "@entry/design";
import { ArrowNav } from "../../assets";

interface IPageNav {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const PageNav = ({ totalPages, currentPage, setCurrentPage }: IPageNav) => {
  const pagesPerGroup = 7;
  const currentGroupStart = Math.floor((currentPage - 1) / pagesPerGroup) * pagesPerGroup + 1;
  const currentGroupEnd = Math.min(currentGroupStart + pagesPerGroup - 1, totalPages);

  const handlePrevGroup = () => {
    const prevGroupStart = Math.max(1, currentGroupStart - pagesPerGroup);
    setCurrentPage(prevGroupStart);
  };

  const handleNextGroup = () => {
    const nextGroupStart = Math.min(totalPages, currentGroupStart + pagesPerGroup);
    setCurrentPage(nextGroupStart);
  };

  return (
    <Container aria-label="페이지 이동">
      {currentGroupStart > 1 ? (
        <NavChange type="button" aria-label="이전 페이지 묶음" onClick={handlePrevGroup}>
          <ArrowNav />
        </NavChange>
      ) : (
        <NavChange type="button" aria-label="이전 페이지 묶음" disabled>
          <ArrowNav isBlocked={true} />
        </NavChange>
      )}
      {Array.from({ length: currentGroupEnd - currentGroupStart + 1 }, (_, i) => {
        const page = currentGroupStart + i;
        return (
          <Nav
            key={page}
            type="button"
            isActive={currentPage === page}
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Nav>
        );
      })}
      {currentGroupEnd < totalPages ? (
        <NavChange type="button" aria-label="다음 페이지 묶음" onClick={handleNextGroup}>
          <ArrowNav isRight={true} />
        </NavChange>
      ) : (
        <NavChange type="button" aria-label="다음 페이지 묶음" disabled>
          <ArrowNav isRight={true} isBlocked={true} />
        </NavChange>
      )}
    </Container>
  );
};

const Container = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const NavChange = styled.button`
  background-color: transparent;
  width: fit-content;
  outline: none;
  border: none;
`;

// 키보드로도 누를 수 있도록 버튼으로 둔다. 버튼 기본 글꼴 크기(13.33px)·여백이 끼지 않게 초기화한다.
const Nav = styled.button<{ isActive: boolean }>`
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;
  width: 30px;
  height: 30px;
  color: ${({ isActive }) => (isActive ? colors.orange[800] : colors.gray[500])};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease-in;
  &:hover {
    transform: translateY(-2px);
    transition: 0.3s ease-in;
  }
`;
