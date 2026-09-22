import styled from "@emotion/styled";
import { colors } from "@entry/design";

/** 접근 가드(RequireAuth·RequireApplicationPeriod)가 페이지 대신 띄우는 전체 화면 안내. */
export const GuardScreen = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: ${colors.gray[400]};
  font-size: 18px;
  font-weight: 500;
`;

const guardActionStyle = `
  padding: 10px 20px;
  border-radius: 8px;
  background-color: ${colors.orange[400]};
  color: ${colors.gray[50]};
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: ${colors.orange[500]};
  }
`;

export const GuardLink = styled.a`
  ${guardActionStyle}
`;

export const GuardButton = styled.button`
  ${guardActionStyle}
  border: none;
`;
