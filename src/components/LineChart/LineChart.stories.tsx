import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { LineChart } from "./LineChart";

type Datum = { month: string; revenue: number; expenses: number };

const data: readonly Datum[] = [
  { month: "Jan", revenue: 120, expenses: 80 },
  { month: "Feb", revenue: 140, expenses: 90 },
  { month: "Mar", revenue: 160, expenses: 110 },
  { month: "Apr", revenue: 155, expenses: 105 },
  { month: "May", revenue: 175, expenses: 120 },
  { month: "Jun", revenue: 190, expenses: 125 },
];

const meta: Meta<typeof LineChart<Datum>> = {
  title: "Charts/LineChart",
  component: LineChart,
};
export default meta;

type Story = StoryObj<typeof LineChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Revenue vs Expenses" subtitle="Last 6 months">
      <LineChart
        data={data}
        xKey="month"
        series={[
          { key: "revenue", name: "Revenue", color: "var(--ui-primary)" },
          { key: "expenses", name: "Expenses", color: "var(--ui-accent)" },
        ]}
        legend
        yTickFormatter={(v) => (typeof v === "number" ? `$${v}k` : String(v))}
      />
    </ChartContainer>
  ),
};


