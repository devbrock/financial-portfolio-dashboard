import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = {
  title: 'Data Display/Stat',
  component: Stat,
};
export default meta;

type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Stat label="AUM" value="$4.2B" subvalue="As of today" />
      <Stat label="YTD" value="+12.4%" subvalue="Net performance" />
    </div>
  ),
};
