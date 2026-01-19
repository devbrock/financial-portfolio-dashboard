import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card/Card';
import { ChartContainer } from '../ChartContainer/ChartContainer';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';

describe('layout components', () => {
  it('renders Inline as a child slot', () => {
    render(
      <Inline asChild>
        <span data-testid="inline">Inline content</span>
      </Inline>
    );

    const inline = screen.getByTestId('inline');
    expect(inline.tagName).toBe('SPAN');
  });

  it('renders Stack as a child slot', () => {
    render(
      <Stack asChild>
        <div data-testid="stack">Stack content</div>
      </Stack>
    );

    const stack = screen.getByTestId('stack');
    expect(stack.tagName).toBe('DIV');
  });

  it('renders ChartContainer without header when no metadata provided', () => {
    const { container } = render(
      <ChartContainer>
        <div>Chart content</div>
      </ChartContainer>
    );

    expect(container.querySelector('header')).toBeNull();
    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });

  it('renders Card as a child slot', () => {
    render(
      <Card asChild>
        <section data-testid="card">Card content</section>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('SECTION');
  });
});
