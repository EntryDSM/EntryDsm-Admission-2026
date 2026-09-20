import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import { colors, media, Text } from "@entry/design";
import { Check } from "../../assets/icons/Check";
import { OActivate, ONoActivate, XActivate, XNoActivate } from "../../assets/icons/OXIcons";

interface ICertCheckFormType {
  title: string;
  value: "O" | "X" | null;
  onChange: (value: "O" | "X") => void;
  width?: string;
  helperText?: string;
  compactOnMobile?: boolean;
}

export const CertCheckForm: React.FC<ICertCheckFormType> = ({
  title,
  value,
  onChange,
  width = "100%",
  helperText,
  compactOnMobile = false,
}) => {
  const [_, setIsFilled] = useState<boolean>(false);

  useEffect(() => {
    setIsFilled(!!value);
  }, [value]);

  return (
    <Container width={width}>
      <ContentRow $compactOnMobile={compactOnMobile}>
        <LeftSection $compactOnMobile={compactOnMobile}>
          <CheckMark hasValue={!!value}>
            <Check />
          </CheckMark>
          <Title $compactOnMobile={compactOnMobile}>{title}</Title>
          {helperText && (
            <Text fontSize={12} color={colors.gray[400]}>
              {helperText}
            </Text>
          )}
        </LeftSection>
        <BtnWrapper $compactOnMobile={compactOnMobile}>
          <IconBtn $compactOnMobile={compactOnMobile} onClick={() => onChange("O")} aria-label={`${title} O 선택`}>
            {value === "O" ? <OActivate /> : <ONoActivate />}
          </IconBtn>
          <IconBtn $compactOnMobile={compactOnMobile} onClick={() => onChange("X")} aria-label={`${title} X 선택`}>
            {value === "X" ? <XActivate /> : <XNoActivate />}
          </IconBtn>
        </BtnWrapper>
      </ContentRow>
    </Container>
  );
};

const Container = styled.div<Pick<ICertCheckFormType, "width">>`
  width: ${({ width }) => width};
  max-width: 100%;
  margin-bottom: 16px;
`;

const ContentRow = styled.div<{ $compactOnMobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;

  ${media.tablet} {
    align-items: ${({ $compactOnMobile }) => ($compactOnMobile ? "center" : "flex-start")};
    flex-direction: ${({ $compactOnMobile }) => ($compactOnMobile ? "row" : "column")};
    gap: ${({ $compactOnMobile }) => ($compactOnMobile ? "8px" : "16px")};
  }
`;

const LeftSection = styled.div<{ $compactOnMobile: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  min-width: 0;
  flex: ${({ $compactOnMobile }) => ($compactOnMobile ? "1" : "none")};

  ${media.tablet} {
    gap: 12px;
  }

  ${media.medium} {
    gap: ${({ $compactOnMobile }) => ($compactOnMobile ? "6px" : "12px")};
  }
`;

const Title = styled.span<{ $compactOnMobile: boolean }>`
  min-width: 0;
  font-size: 32px;
  font-weight: 600;
  overflow-wrap: anywhere;

  ${media.tablet} {
    font-size: 20px;
  }

  ${media.medium} {
    font-size: ${({ $compactOnMobile }) => ($compactOnMobile ? "clamp(12px, 3.4vw, 16px)" : "17px")};
    white-space: ${({ $compactOnMobile }) => ($compactOnMobile ? "nowrap" : "normal")};
  }
`;

const BtnWrapper = styled.div<{ $compactOnMobile: boolean }>`
  display: flex;
  gap: 32px;
  align-items: center;
  flex-shrink: 0;

  ${media.tablet} {
    gap: ${({ $compactOnMobile }) => ($compactOnMobile ? "8px" : "32px")};
  }

  ${media.medium} {
    gap: ${({ $compactOnMobile }) => ($compactOnMobile ? "4px" : "16px")};
  }
`;

const IconBtn = styled.button<{ $compactOnMobile: boolean }>`
  width: 52px;
  height: 52px;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg {
    width: 100%;
    height: 100%;
  }

  ${media.tablet} {
    width: ${({ $compactOnMobile }) => ($compactOnMobile ? "44px" : "52px")};
    height: ${({ $compactOnMobile }) => ($compactOnMobile ? "44px" : "52px")};
  }

  ${media.medium} {
    width: ${({ $compactOnMobile }) => ($compactOnMobile ? "clamp(36px, 10vw, 44px)" : "52px")};
    height: ${({ $compactOnMobile }) => ($compactOnMobile ? "clamp(36px, 10vw, 44px)" : "52px")};
  }

  &:hover {
    transform: scale(1.05);
  }
  &:focus-visible {
    outline: 2px solid ${colors.orange[800]};
    outline-offset: 2px;
    border-color: ${colors.orange[800]};
  }
`;

const CheckMark = styled.span<{ hasValue: boolean }>`
  color: ${props => (props.hasValue ? colors.orange[800] : colors.gray[300])};
  transition: color 0.2s;
  flex-shrink: 0;

  svg {
    fill: currentColor !important;
    color: inherit !important;
  }

  * {
    fill: currentColor !important;
    stroke: currentColor !important;
  }
`;
