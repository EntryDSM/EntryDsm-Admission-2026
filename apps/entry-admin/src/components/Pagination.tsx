import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { left, right } from "../assets";

interface IPagiNationType {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

const ELLIPSIS = "ellipsis";
const PAGE_RANGE = 2;

type PageNumberItem = number | typeof ELLIPSIS;

const getPageNumbers = (currentPage: number, totalPage: number): PageNumberItem[] => {
  if (totalPage <= 0) {
    return [];
  }

  const normalizedCurrentPage = Math.min(Math.max(currentPage, 1), totalPage);
  const pages = new Set([1, totalPage]);
  const startPage = Math.max(2, normalizedCurrentPage - PAGE_RANGE);
  const endPage = Math.min(totalPage - 1, normalizedCurrentPage + PAGE_RANGE);

  for (let page = startPage; page <= endPage; page += 1) {
    pages.add(page);
  }

  return [...pages]
    .sort((a, b) => a - b)
    .flatMap((page, index, sortedPages) => {
      const previousPage = sortedPages[index - 1];

      if (previousPage && page - previousPage > 1) {
        return [ELLIPSIS, page];
      }

      return [page];
    });
};

export const PagiNation = ({ currentPage, totalPage, onPageChange }: IPagiNationType) => {
  const pageNumbers = getPageNumbers(currentPage, totalPage);

  const goToPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPage) {
      onPageChange(currentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    onPageChange(page);
  };

  return (
    <Container>
      <PageButton id="left" onClick={goToPrevious} disabled={currentPage === 1}>
        <img src={left} alt="<" />
      </PageButton>

      {pageNumbers.map((pageNumber, index) =>
        pageNumber === ELLIPSIS ? (
          <Ellipsis key={`${pageNumber}-${index}`}>...</Ellipsis>
        ) : (
          <PageButton key={pageNumber} onClick={() => goToPage(pageNumber)} isActive={pageNumber === currentPage}>
            {pageNumber}
          </PageButton>
        )
      )}

      <PageButton id="right" onClick={goToNext} disabled={currentPage === totalPage}>
        <img src={right} alt=">" />
      </PageButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 80px;

  @media (max-width: 768px) {
    margin-top: 70px;
  }

  #left {
    margin-right: 5px;
  }

  #right {
    margin-left: 5px;
  }
`;

const PageButton = styled.button<{ isActive?: boolean }>`
  min-width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: none;
  color: ${({ isActive }) => (isActive ? colors.green[500] : colors.gray[400])};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  img {
    width: 7px;
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  }

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    font-size: 13px;

    img {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 480px) {
    min-width: 32px;
    height: 32px;
    font-size: 12px;

    img {
      width: 12px;
      height: 12px;
    }
  }
`;

const Ellipsis = styled.span`
  min-width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gray[400]};
  font-size: 14px;

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
  }
`;
