import type { Meta, StoryObj } from '@storybook/react';
import { DeltaPill } from './DeltaPill';

const meta: Meta<typeof DeltaPill> = {
  title: 'Data Display/DeltaPill',
  component: DeltaPill,
};
export default meta;

type Story = StoryObj<typeof DeltaPill>;

export const Examples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <DeltaPill direction="up" tone="success">
        +2.4%
      </DeltaPill>
      <DeltaPill direction="down" tone="danger">
        -1.1%
      </DeltaPill>
      <DeltaPill direction="flat" tone="neutral">
        0.0%
      </DeltaPill>
    </div>
  ),
};
