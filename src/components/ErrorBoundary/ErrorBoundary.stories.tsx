import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Feedback/ErrorBoundary',
  component: ErrorBoundary,
};

export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

const ExplodingChild = () => {
  throw new Error('Storybook test error');
};

export const HealthyTree: Story = {
  render: () => (
    <ErrorBoundary>
      <div className="rounded-2xl border border-(--ui-border) bg-(--ui-bg) p-6">
        <div className="text-sm font-semibold">All systems operational</div>
        <div className="mt-2 text-sm text-(--ui-text-muted)">
          This is the normal render state with no errors.
        </div>
      </div>
    </ErrorBoundary>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <ErrorBoundary>
      <ExplodingChild />
    </ErrorBoundary>
  ),
};
