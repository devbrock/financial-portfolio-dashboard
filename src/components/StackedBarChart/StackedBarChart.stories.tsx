import type { Meta, StoryObj } from '@storybook/react';
import { ChartContainer } from '../ChartContainer/ChartContainer';
import { StackedBarChart } from './StackedBarChart';

type Datum = { month: string; equities: number; fixedIncome: number; cash: number };

const data: readonly Datum[] = [
  { month: 'Jan', equities: 52, fixedIncome: 36, cash: 12 },
  { month: 'Feb', equities: 55, fixedIncome: 33, cash: 12 },
  { month: 'Mar', equities: 58, fixedIncome: 30, cash: 12 },
  { month: 'Apr', equities: 54, fixedIncome: 34, cash: 12 },
  { month: 'May', equities: 56, fixedIncome: 32, cash: 12 },
];

const meta: Meta<typeof StackedBarChart<Datum>> = {
  title: 'Charts/StackedBarChart',
  component: StackedBarChart,
};
export default meta;

type Story = StoryObj<typeof StackedBarChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Allocation Over Time" subtitle="Stacked bars">
      <StackedBarChart
        data={data}
        xKey="month"
        series={[
          { key: 'equities', name: 'Equities', color: 'var(--ui-primary)' },
          { key: 'fixedIncome', name: 'Fixed Income', color: 'var(--ui-accent)' },
          { key: 'cash', name: 'Cash', color: 'var(--ui-surface-2)' },
        ]}
        legend
        yTickFormatter={v => (typeof v === 'number' ? `${v}%` : String(v))}
      />
    </ChartContainer>
  ),
};
