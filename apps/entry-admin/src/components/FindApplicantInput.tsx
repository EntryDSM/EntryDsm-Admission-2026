import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { search } from "../assets";

interface IFindApplicantInputType {
  onSearch: (keyword: string) => void;
}

const SEARCH_DEBOUNCE_DELAY = 300;

export const FindApplicantInput = ({ onSearch }: IFindApplicantInputType) => {
  const [keyword, setKeyword] = useState<string>("");
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSearch(keyword);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [keyword, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
  };

  return (
    <InputContainer>
      <img src={search} alt="" />
      <input type="text" value={keyword} onChange={handleChange} placeholder="지원자 검색" />
    </InputContainer>
  );
};

const InputContainer = styled.div`
  width: 100%;
  max-width: 800px;
  height: 48px;
  display: flex;
  align-items: center;
  border: 1px solid ${colors.gray[300]};
  border-radius: 24px;
  padding: 12px 24px;
  background-color: ${colors.extra.realWhite};

  @media (max-width: 480px) {
    padding: 12px 18px;
  }

  img {
    width: 24px;
    height: 24px;
    opacity: 0.65;
  }

  input {
    width: 100%;
    padding-left: 10px;
    border: none;
    outline: none;
    background: transparent;
    color: ${colors.gray[500]};
    font-size: 16px;
    font-weight: 500;

    &::placeholder {
      color: ${colors.gray[300]};
      font-size: 16px;
    }
  }
`;
