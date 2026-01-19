import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Primitives/Text',
  component: Text,
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Sizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="body">Body text — the quick brown fox jumps over the lazy dog.</Text>
      <Text size="sm">Small text — the quick brown fox jumps over the lazy dog.</Text>
      <Text size="caption">Caption text — the quick brown fox jumps over the lazy dog.</Text>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="space-y-2">
      <Text tone="default">Default tone</Text>
      <Text tone="muted">Muted tone</Text>
      <Text tone="subtle">Subtle tone</Text>
      <div className="rounded-2xl bg-(--ui-inverse-bg) p-4">
        <Text tone="inverse">Inverse tone</Text>
      </div>
    </div>
  ),
};
