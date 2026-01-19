import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Primitives/Stack',
  component: Stack,
};
export default meta;

type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: { gap: 'md' },
  render: args => (
    <Stack {...args}>
      <div className="rounded-xl border border-(--ui-border) bg-(--ui-bg) p-4">Item A</div>
      <div className="rounded-xl border border-(--ui-border) bg-(--ui-bg) p-4">Item B</div>
      <div className="rounded-xl border border-(--ui-border) bg-(--ui-bg) p-4">Item C</div>
    </Stack>
  ),
};
