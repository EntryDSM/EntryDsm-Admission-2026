import styled from "@emotion/styled";
import { colors } from "@entry/design";

type StatCardVariant = "primary" | "gray" | "white";

interface IStatCardDetailValue {
  label: string;
  value: string;
}

interface IStatCardProps {
  label?: string;
  value?: string;
  variant?: StatCardVariant;
  labelFontSize?: string;
  valueFontSize?: string;
  detailValues?: IStatCardDetailValue[];
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

export const StatCard = ({
  label,
  value,
  variant = "white",
  labelFontSize = "14px",
  valueFontSize = "32px",
  detailValues,
}: IStatCardProps) => {
  return (
    <StatCardContainer variant={variant}>
      {label ? (
        <Label variant={variant} fontSize={labelFontSize}>
          {label}
        </Label>
      ) : (
        <div></div>
      )}

      {detailValues ? (
        <DetailValueGroup>
          {detailValues.map(item => (
            <DetailValue key={item.label}>
              <DetailLabel>{item.label}</DetailLabel>
              <DetailAmount fontSize={valueFontSize}>{item.value}</DetailAmount>
            </DetailValue>
          ))}
        </DetailValueGroup>
      ) : (
        <Value fontSize={valueFontSize}>{value}</Value>
      )}
    </StatCardContainer>
  );
};

export const PeopleCard = ({
  label,
  value,
  variant = "white",
  labelFontSize = "14px",
  valueFontSize = "32px",
  detailValues,
}: IStatCardProps) => {
  return (
    <StatCardContainer variant={variant}>
      <Label variant={variant} fontSize={labelFontSize}>
        {label}
      </Label>
      {detailValues ? (
        <DetailValueGroup>
          {detailValues.map(item => (
            <DetailValue key={item.label}>
              <DetailLabel>{item.label}</DetailLabel>
              <DetailAmount fontSize={valueFontSize}>{item.value}</DetailAmount>
            </DetailValue>
          ))}
        </DetailValueGroup>
      ) : (
        <Value fontSize={valueFontSize}>{value}</Value>
      )}
    </StatCardContainer>
  );
};

const StatCardContainer = styled.div<{ variant: StatCardVariant }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  width: 100%;
  height: 110px;
  border-radius: 16px;
  background-color: ${({ variant }) => variantStyle[variant].background};
  color: ${({ variant }) => variantStyle[variant].color};
`;

const Label = styled.span<{ variant: StatCardVariant; fontSize: string }>`
  font-size: ${({ fontSize }) => fontSize};
  color: ${({ variant }) => variantStyle[variant].color};
  opacity: ${({ variant }) => (variant === "white" ? 0.6 : 0.85)};
`;

const Value = styled.span<{ fontSize: string }>`
  font-size: ${({ fontSize }) => fontSize};
  font-weight: 700;
  white-space: nowrap;
`;

const DetailValueGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
`;

const DetailValue = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
`;

const DetailAmount = styled.span<{ fontSize: string }>`
  font-size: ${({ fontSize }) => fontSize};
  font-weight: 700;
`;
