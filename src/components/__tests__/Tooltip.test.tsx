import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../Tooltip/Tooltip';
import { ChartTooltip } from '../ChartTooltip/ChartTooltip';

describe('Tooltip', () => {
  it('shows and hides tooltip on hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="More info">
        <button type="button">Info</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Info' });
    await user.hover(trigger);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('More info');

    await user.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('respects delay before showing tooltip', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Delayed" delayMs={100}>
        <button type="button">Delayed trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Delayed trigger' });
    await user.hover(trigger);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Delayed');
    });
  });

  it('positions tooltip on the bottom side', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Bottom content" side="bottom">
        <button type="button">Bottom trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Bottom trigger' });
    await user.hover(trigger);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveStyle({ transform: 'translate(-50%, 0)' });
  });
});

describe('ChartTooltip', () => {
  it('renders label and items when active', () => {
    render(
      <ChartTooltip
        active
        label="Today"
        items={[
          { name: 'Revenue', value: 120, color: '#111111' },
          { name: 'Cost', value: 40 },
        ]}
      />
    );

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('120.00')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('40.00')).toBeInTheDocument();
  });

  it('returns null when inactive', () => {
    const { container } = render(<ChartTooltip active={false} items={[]} label="Hidden" />);

    expect(container.firstChild).toBeNull();
  });

  it('formats label and values when formatters are provided', () => {
    render(
      <ChartTooltip
        active
        label="Q2"
        items={[{ name: 'Revenue', value: 120 }]}
        labelFormatter={label => `Period ${label}`}
        valueFormatter={value => `$${value}`}
      />
    );

    expect(screen.getByText('Period Q2')).toBeInTheDocument();
    expect(screen.getByText('$120')).toBeInTheDocument();
  });
});
