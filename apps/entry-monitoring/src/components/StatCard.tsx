import styled from "@emotion/styled";
import { colors } from "@entry/design";

type StatCardVariant = "primary" | "gray" | "white";

interface IStatCardProps {
  label: string;
  value: string;
  variant?: StatCardVariant;
}

const variantStyle: Record<StatCardVariant, { background: string; color: string }> = {
  primary: {
    background: "#6668F1",
    color: colors.extra.realWhite,
  },
  gray: {
    background: "#969696",
    color: colors.extra.realWhite,
  },
  white: {
    background: "#F7F7F7",
    color: colors.extra.realBlack,
  },
};

export const StatCard = ({ label, value, variant = "white" }: IStatCardProps) => {
  return (
    <StatCardContainer variant={variant}>
      <Label variant={variant}>{label}</Label>
      <Value>{value}</Value>
    </StatCardContainer>
  );
};

const StatCardContainer = styled.div<{ variant: StatCardVariant }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 18px;
  width: 100%;
  height: 110px;
  border-radius: 16px;
  background-color: ${({ variant }) => variantStyle[variant].background};
  color: ${({ variant }) => variantStyle[variant].color};
`;

const Label = styled.span<{ variant: StatCardVariant }>`
  font-size: 14px;
  color: ${({ variant }) => variantStyle[variant].color};
  opacity: ${({ variant }) => (variant === "white" ? 0.6 : 0.85)};
`;

const Value = styled.span`
  font-size: 32px;
  font-weight: 700;
`;
