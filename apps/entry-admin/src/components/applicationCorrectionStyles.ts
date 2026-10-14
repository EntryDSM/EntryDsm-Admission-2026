import styled from "@emotion/styled";
import { colors } from "@entry/design";

/** 원서 정정 화면이 함께 쓰는 스타일. 컴포넌트 파일에서 내보내면 Fast Refresh 규칙에 걸려 따로 둔다. */

export const focusRing = `
  border-color: ${colors.green[400]};
  box-shadow: 0 0 0 3px rgba(74, 199, 118, 0.18);
`;

export const Card = styled.section`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid ${colors.gray[200]};
  border-radius: 16px;
  background-color: ${colors.extra.realWhite};

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export const CardHeader = styled.div`
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const CardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardTitle = styled.h3`
  color: ${colors.gray[500]};
  font-size: 18px;
  font-weight: 600;
`;

export const CardDescription = styled.p`
  color: ${colors.gray[400]};
  font-size: 14px;
  line-height: 1.6;
  word-break: keep-all;
`;

export const RequiredMark = styled.span`
  margin-left: 2px;
  color: ${colors.extra.error};
`;

export const FieldHelper = styled.p`
  color: ${colors.gray[400]};
  font-size: 13px;
  line-height: 1.5;
  word-break: keep-all;
`;

export const FieldError = styled.p`
  color: ${colors.extra.error};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  word-break: keep-all;
`;

export const TextInput = styled.input<{ $width?: string; $hasSuffix?: boolean }>`
  width: ${({ $width }) => $width ?? "100%"};
  max-width: 100%;
  height: 44px;
  padding: ${({ $hasSuffix }) => ($hasSuffix ? "0 40px 0 14px" : "0 14px")};
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background-color: ${colors.extra.realWhite};
  color: ${colors.gray[500]};
  font-size: 15px;
  user-select: text;

  &::placeholder {
    color: ${colors.gray[300]};
  }

  &:focus {
    ${focusRing}
  }

  &:read-only {
    background-color: ${colors.gray[50]};
    color: ${colors.gray[400]};
    box-shadow: none;
    border-color: ${colors.gray[200]};
  }

  &[aria-invalid="true"] {
    border-color: ${colors.extra.error};
  }
`;

export const Select = styled.select<{ $width?: string; $size?: "small"; $isGrade?: boolean }>`
  width: ${({ $width, $isGrade }) => $width ?? ($isGrade ? "100%" : "auto")};
  height: ${({ $size }) => ($size === "small" ? "30px" : "40px")};
  padding: 0 ${({ $size }) => ($size === "small" ? "6px" : "10px")};
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background-color: ${colors.extra.realWhite};
  color: ${colors.gray[500]};
  font-size: ${({ $size }) => ($size === "small" ? "13px" : "15px")};
  font-weight: ${({ $isGrade }) => ($isGrade ? 600 : 500)};
  text-align: ${({ $isGrade }) => ($isGrade ? "center" : "left")};
  cursor: pointer;

  &:focus {
    ${focusRing}
  }

  &[aria-invalid="true"] {
    border-color: ${colors.extra.error};
    background-color: rgba(232, 64, 69, 0.04);
  }
`;

export const InlineGroup = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SecondaryButton = styled.button`
  height: 44px;
  padding: 0 16px;
  flex-shrink: 0;
  border: 1px solid ${colors.green[400]};
  border-radius: 8px;
  background-color: ${colors.extra.realWhite};
  color: ${colors.green[600]};
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: ${colors.green[50]};
  }

  &:focus-visible {
    ${focusRing}
  }
`;

export const TextButton = styled.button`
  padding: 0;
  background: none;
  color: ${colors.gray[400]};
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover {
    color: ${colors.gray[500]};
  }
`;

export const TextAreaField = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TextArea = styled.textarea<{ $minHeight?: string }>`
  width: 100%;
  min-height: ${({ $minHeight }) => $minHeight ?? "200px"};
  padding: 14px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  color: ${colors.gray[500]};
  font-family: inherit;
  font-size: 15px;
  line-height: 1.7;
  resize: vertical;
  user-select: text;

  &::placeholder {
    color: ${colors.gray[300]};
  }

  &:focus {
    ${focusRing}
  }

  &[aria-invalid="true"] {
    border-color: ${colors.extra.error};
  }
`;

export const TextAreaFooter = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const Counter = styled.span`
  flex-shrink: 0;
  color: ${colors.gray[400]};
  font-size: 13px;
  font-variant-numeric: tabular-nums;
`;
