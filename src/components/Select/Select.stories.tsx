import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Controls/Select',
  component: Select,
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select aria-label="Choose time range" defaultValue="1m">
      <option value="1d">1 day</option>
      <option value="1w">1 week</option>
      <option value="1m">1 month</option>
      <option value="1y">1 year</option>
    </Select>
  ),
};
