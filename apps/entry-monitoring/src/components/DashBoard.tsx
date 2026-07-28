import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import type { TooltipItem, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarChartCardProps {
  title: string;
  labels: string[];
  values: number[];
  unit?: string;
  height?: number | string;
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  padding: 16,
  border: "1px solid #C8C8C8",
  width: "100%",
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#222",
  marginBottom: 8,
};

export function BarChartCard({ title, labels, values, unit = "", height = 60 }: BarChartCardProps) {
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "",
          data: values,
          backgroundColor: "rgba(0,0,0,0.12)",
          barThickness: 12,
          borderRadius: 6,
        },
      ],
    }),
    [labels, values]
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(34, 34, 34, 0.9)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "rgba(255,255,255,0.12)",
          borderWidth: 1,
          callbacks: {
            title: (items: TooltipItem<"bar">[]) => {
              const index = items[0]?.dataIndex ?? 0;
              return `${labels[index]} ${title}`;
            },
            label: context => {
              const value = context.parsed.y ?? 0;
              return ` ${value}${unit}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: "#9AA0A6", maxRotation: 0, autoSkip: true, maxTicksLimit: 3 },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: { display: false },
        },
      },
    }),
    [labels, title, unit]
  );

  return (
    <div style={cardStyle} aria-label={`${title}-card`}>
      <div style={titleStyle}>{title}</div>
      <div style={{ height }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
