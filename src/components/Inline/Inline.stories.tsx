import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from './Inline';

const meta: Meta<typeof Inline> = {
  title: 'Primitives/Inline',
  component: Inline,
};
export default meta;

type Story = StoryObj<typeof Inline>;

export const Default: Story = {
  render: () => (
    <Inline>
      <div className="rounded-full border border-(--ui-border) bg-(--ui-bg) px-3 py-1.5 text-sm">
        Alpha
      </div>
      <div className="rounded-full border border-(--ui-border) bg-(--ui-bg) px-3 py-1.5 text-sm">
        Beta
      </div>
      <div className="rounded-full border border-(--ui-border) bg-(--ui-bg) px-3 py-1.5 text-sm">
        Gamma
      </div>
    </Inline>
  ),
};
