import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { BarChart } from "./BarChart";

type Datum = { quarter: string; pnl: number };

const data: readonly Datum[] = [
  { quarter: "Q1", pnl: 12.4 },
  { quarter: "Q2", pnl: 8.1 },
  { quarter: "Q3", pnl: 15.2 },
  { quarter: "Q4", pnl: 11.6 },
];

const meta: Meta<typeof BarChart<Datum>> = {
  title: "Charts/BarChart",
  component: BarChart,
};
export default meta;

type Story = StoryObj<typeof BarChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Quarterly P&L" subtitle="Percent">
      <BarChart
        data={data}
        xKey="quarter"
        series={[{ key: "pnl", name: "P&L", color: "var(--ui-primary)" }]}
        yTickFormatter={(v) => (typeof v === "number" ? `${v}%` : String(v))}
      />
    </ChartContainer>
  ),
};


