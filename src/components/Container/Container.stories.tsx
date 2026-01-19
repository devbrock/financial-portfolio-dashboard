import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Primitives/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  render: () => (
    <div className="bg-(--ui-surface) py-10">
      <Container>
        <div className="rounded-2xl border border-(--ui-border) bg-(--ui-bg) p-6">
          Container content
        </div>
      </Container>
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="dark bg-(--ui-bg) py-10">
      <Container>
        <div className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-(--ui-text)">
          Dark mode container content
        </div>
      </Container>
    </div>
  ),
};
