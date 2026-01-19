import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoldingsTable } from '../HoldingsTable';
import { renderWithProviders } from '@/test/test-utils';
import type { HoldingRow, SortDir, SortKey } from '@/types/dashboard';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const holdings: HoldingRow[] = [
  {
    id: '1',
    name: 'Apple',
    ticker: 'AAPL',
    date: 'January 1, 2024',
    volume: 10,
    changePct: 1.2,
    purchasePrice: 150,
    priceUsd: 190,
    pnlUsd: 100,
    status: 'active',
  },
];

describe('HoldingsTable', () => {
  it('calls onSort when clicking headers', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    renderWithProviders(
      <HoldingsTable
        holdings={holdings}
        onSort={onSort}
        sortKey={'name' as SortKey}
        sortDir={'asc' as SortDir}
        onRemove={() => undefined}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Profit/Loss' }));
    expect(onSort).toHaveBeenCalledWith('pnlUsd');
  });

  it('supports keyboard sorting', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    renderWithProviders(
      <HoldingsTable
        holdings={holdings}
        onSort={onSort}
        sortKey={'name' as SortKey}
        sortDir={'asc' as SortDir}
        onRemove={() => undefined}
      />
    );

    const nameButton = screen.getByRole('button', { name: 'Name' });
    nameButton.focus();
    expect(nameButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('exposes an accessible table label', () => {
    renderWithProviders(
      <HoldingsTable
        holdings={holdings}
        onSort={() => undefined}
        sortKey={'name' as SortKey}
        sortDir={'asc' as SortDir}
        onRemove={() => undefined}
      />
    );

    expect(screen.getByRole('table', { name: 'Holdings table' })).toBeInTheDocument();
  });

  it('has no basic accessibility violations', async () => {
    const { container } = renderWithProviders(
      <HoldingsTable
        holdings={holdings}
        onSort={() => undefined}
        sortKey={'name' as SortKey}
        sortDir={'asc' as SortDir}
        onRemove={() => undefined}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders logo fallbacks and value formatting variants', () => {
    const mixedHoldings: HoldingRow[] = [
      {
        id: '1',
        name: 'Alpha',
        ticker: 'ALP',
        date: 'January 1, 2024',
        volume: 10,
        changePct: 2.5,
        purchasePrice: 120,
        priceUsd: 100,
        pnlUsd: 120,
        status: 'active',
        logo: 'https://example.com/logo.png',
      },
      {
        id: '2',
        name: 'Beta',
        ticker: 'BET',
        date: 'January 2, 2024',
        volume: 5,
        changePct: -1.5,
        purchasePrice: 95,
        priceUsd: 80,
        pnlUsd: -50,
        status: 'active',
      },
      {
        id: '3',
        name: 'Gamma',
        ticker: 'GAM',
        date: 'January 3, 2024',
        volume: 7,
        changePct: 0,
        purchasePrice: 90,
        priceUsd: 90,
        pnlUsd: 0,
        status: 'active',
      },
    ];

    const { container } = renderWithProviders(
      <HoldingsTable
        holdings={mixedHoldings}
        onSort={() => undefined}
        sortKey={'name' as SortKey}
        sortDir={'asc' as SortDir}
        onRemove={() => undefined}
      />
    );

    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(screen.getByText('+2.5%')).toBeInTheDocument();
    expect(screen.getByText('-1.5%')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('+$120.00')).toBeInTheDocument();
    expect(screen.getByText('-$50.00')).toBeInTheDocument();
    expect(screen.getByText('+$0.00')).toBeInTheDocument();
  });
});
