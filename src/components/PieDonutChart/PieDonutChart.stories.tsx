import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { PieDonutChart } from "./PieDonutChart";

type Datum = { name: string; value: number };

const data: readonly Datum[] = [
  { name: "Equities", value: 52 },
  { name: "Fixed Income", value: 28 },
  { name: "Alternatives", value: 14 },
  { name: "Cash", value: 6 },
];

const meta: Meta<typeof PieDonutChart<Datum>> = {
  title: "Charts/PieDonutChart",
  component: PieDonutChart,
};
export default meta;

type Story = StoryObj<typeof PieDonutChart<Datum>>;

export const Donut: Story = {
  render: () => (
    <ChartContainer title="Allocation" subtitle="By asset class">
      <PieDonutChart data={data} nameKey="name" valueKey="value" variant="donut" />
    </ChartContainer>
  ),
};

export const Pie: Story = {
  render: () => (
    <ChartContainer title="Allocation" subtitle="Pie variant">
      <PieDonutChart data={data} nameKey="name" valueKey="value" variant="pie" />
    </ChartContainer>
  ),
};


