import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

function ProblemChild(): ReactElement {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: '',
        reload: vi.fn(),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders fallback UI and calls onError', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Reload page')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it('handles reload and contact actions', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: 'Reload page' }));
    expect(window.location.reload).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Contact us' }));
    expect(window.location.href).toContain('mailto:support@orionfcu.com');
  });
});
