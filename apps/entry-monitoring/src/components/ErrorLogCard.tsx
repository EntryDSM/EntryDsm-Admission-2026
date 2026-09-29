import styled from "@emotion/styled";
import { colors } from "@entry/design";

interface IErrorLogCardProps {
  label: string;
  value: string;
  items: string[];
}

export const ErrorLogCard = ({ label, value, items }: IErrorLogCardProps) => {
  return (
    <ErrorLogCardContainer>
      <Label>{label}</Label>
      <Value>{value}</Value>
      <ItemList>
        {items.map((item, index) => (
          <ItemBox key={index}>{item}</ItemBox>
        ))}
      </ItemList>
    </ErrorLogCardContainer>
  );
};

const ErrorLogCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border: 1px solid #cccccc;
  border-radius: 16px;
  background-color: ${colors.extra.realWhite};
  box-sizing: border-box;
`;

const Label = styled.span`
  font-size: 14px;
  color: ${colors.extra.realBlack};
  opacity: 0.6;
`;

const Value = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.extra.realBlack};
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
`;

const ItemBox = styled.div`
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 10px;
  background-color: #e9e9e9;
  color: #666666;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;
