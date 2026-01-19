import type { Meta, StoryObj } from '@storybook/react';
import { Combobox } from './Combobox';

const meta: Meta<typeof Combobox> = {
  title: 'Controls/Combobox',
  component: Combobox,
};
export default meta;

type Story = StoryObj<typeof Combobox>;

const items = [
  { value: 'AAPL', label: 'AAPL — Apple Inc.' },
  { value: 'MSFT', label: 'MSFT — Microsoft' },
  { value: 'NVDA', label: 'NVDA — NVIDIA' },
  { value: 'TSLA', label: 'TSLA — Tesla' },
  { value: 'AMZN', label: 'AMZN — Amazon' },
] as const;

export const Default: Story = {
  args: {
    items,
    placeholder: 'Search symbols…',
    'aria-label': 'Search symbols',
  },
};
