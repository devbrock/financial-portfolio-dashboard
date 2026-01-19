import type { Meta, StoryObj } from '@storybook/react';
import { ChartContainer } from '../ChartContainer/ChartContainer';
import { AreaChart } from './AreaChart';

type Datum = { month: string; aum: number };

const data: readonly Datum[] = [
  { month: 'Jan', aum: 2.4 },
  { month: 'Feb', aum: 2.55 },
  { month: 'Mar', aum: 2.7 },
  { month: 'Apr', aum: 2.62 },
  { month: 'May', aum: 2.85 },
  { month: 'Jun', aum: 3.05 },
];

const meta: Meta<typeof AreaChart<Datum>> = {
  title: 'Charts/AreaChart',
  component: AreaChart,
};
export default meta;

type Story = StoryObj<typeof AreaChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="AUM" subtitle="Billions USD">
      <AreaChart
        data={data}
        xKey="month"
        series={[{ key: 'aum', name: 'AUM', color: 'var(--ui-primary)' }]}
        yTickFormatter={v => (typeof v === 'number' ? `$${v.toFixed(1)}B` : String(v))}
      />
    </ChartContainer>
  ),
};
