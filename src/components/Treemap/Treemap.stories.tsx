import type { Meta, StoryObj } from '@storybook/react';
import { ChartContainer } from '../ChartContainer/ChartContainer';
import { Treemap } from './Treemap';
import type { TreemapNode } from './Treemap.types';

const data: readonly TreemapNode[] = [
  {
    name: 'Equities',
    value: 52,
    children: [
      { name: 'US', value: 28 },
      { name: 'International', value: 16 },
      { name: 'EM', value: 8 },
    ],
  },
  {
    name: 'Fixed Income',
    value: 28,
    children: [
      { name: 'Treasuries', value: 14 },
      { name: 'Corp', value: 10 },
      { name: 'High Yield', value: 4 },
    ],
  },
  { name: 'Alternatives', value: 14 },
  { name: 'Cash', value: 6 },
];

const meta: Meta<typeof Treemap> = {
  title: 'Charts/Treemap',
  component: Treemap,
};
export default meta;

type Story = StoryObj<typeof Treemap>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Allocation Breakdown" subtitle="Treemap">
      <Treemap data={data} tooltipValueFormatter={v => `${v}%`} />
    </ChartContainer>
  ),
};
