import styled from "@emotion/styled";
import { TabSection } from "@entry/ui";
import { media } from "../styles/breakpoints";

interface ResponsiveTabSectionProps {
  options: { key: string; label: string }[];
  activeType: string;
  onTypeChange: (type: string) => void;
}

export const ResponsiveTabSection = ({ options, activeType, onTypeChange }: ResponsiveTabSectionProps) => (
  <TabWrapper>
    <TabSection options={options} activeType={activeType} onTypeChange={onTypeChange} />
  </TabWrapper>
);

const TabWrapper = styled.div`
  > div {
    flex-wrap: wrap;
    gap: 8px;
  }

  ${media.tablet} {
    > div > div {
      font-size: 16px;
      padding: 8px 12px;
    }
  }
`;
