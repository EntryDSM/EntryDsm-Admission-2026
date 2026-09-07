import styled from "@emotion/styled";
import { colors } from "@entry/design";

export const AuthLink = styled.button`
  width: 130px;
  display: flex;
  justify-content: center;
  border-inline-start: 2px solid ${colors.gray[100]};
  cursor: pointer;
  background: none;
  border-block: none;
  border-inline-end: none;
  padding: 0;
  font: inherit;
  color: ${colors.gray[300]};
  &:hover {
    color: ${colors.gray[400]};
    transition: all 0.3s ease-out;
  }
`;

export const AuthLinkText = styled.button`
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: ${colors.gray[300]};
  &:hover {
    color: ${colors.gray[400]};
    transition: all 0.3s ease-out;
  }
`;
