import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { RadarChart } from "./RadarChart";

type Datum = {
  metric: string;
  portfolio: number;
  benchmark: number;
};

const data: readonly Datum[] = [
  { metric: "Risk", portfolio: 72, benchmark: 60 },
  { metric: "Return", portfolio: 68, benchmark: 62 },
  { metric: "Liquidity", portfolio: 80, benchmark: 74 },
  { metric: "Diversification", portfolio: 62, benchmark: 70 },
  { metric: "Cost", portfolio: 58, benchmark: 64 },
];

const meta: Meta<typeof RadarChart<Datum>> = {
  title: "Charts/RadarChart",
  component: RadarChart,
};
export default meta;

type Story = StoryObj<typeof RadarChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Portfolio vs Benchmark" subtitle="Risk profile">
      <RadarChart
        data={data}
        angleKey="metric"
        series={[
          { key: "portfolio", name: "Portfolio", color: "var(--ui-primary)" },
          { key: "benchmark", name: "Benchmark", color: "var(--ui-accent)" },
        ]}
        legend
        radiusTickFormatter={(v) => (typeof v === "number" ? `${v}` : String(v))}
      />
    </ChartContainer>
  ),
};


