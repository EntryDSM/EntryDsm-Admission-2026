import { useMemo } from "react";
import styled from "@emotion/styled";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { colors } from "@entry/design";

ChartJS.register(ArcElement, Tooltip);

interface IDeviceData {
  label: string;
  count: number;
  percentage: number;
}

interface IDeviceChartCardProps {
  title: string;
  data: IDeviceData[];
}

const CHART_COLORS = ["#A5A6F6", "#CFCFFF", "#DBDBFF", "#cfcff4"];

export const DeviceChartCard = ({ title, data }: IDeviceChartCardProps) => {
  const chartData = useMemo(
    () => ({
      labels: data.map(item => item.label),
      datasets: [
        {
          data: data.map(item => item.count),
          backgroundColor: CHART_COLORS,
          borderColor: colors.extra.realWhite,
          borderWidth: 2,
        },
      ],
    }),
    [data]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    }),
    []
  );

  return (
    <Card>
      <Title>{title}</Title>
      <UserContent>
        <ChartWrapper>
          <ChartInner>
            <Pie data={chartData} options={chartOptions} redraw />
          </ChartInner>
        </ChartWrapper>
        <Legend>
          {data.map(item => (
            <LegendItem key={item.label}>
              <strong>{item.label}</strong> {item.count}명 ({item.percentage}%)
            </LegendItem>
          ))}
        </Legend>
      </UserContent>
    </Card>
  );
};

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${colors.gray[200]};
  background-color: ${colors.extra.realWhite};
`;

const Title = styled.span`
  font-size: 14px;
`;

const UserContent = styled.div`
  display: flex;
  justify-content: space-around;
`;

const ChartWrapper = styled.div`
  display: flex;
  height: 150px;
  overflow: hidden;
`;

const ChartInner = styled.div`
  height: 250px;
  transform: scaleY(0.6);
  transform-origin: top center;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-right: 20px;
`;

const LegendItem = styled.div`
  font-size: 16px;

  strong {
    font-weight: 700;
    margin-right: 4px;
  }
`;
