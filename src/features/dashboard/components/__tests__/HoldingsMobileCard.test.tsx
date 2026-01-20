import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { HoldingsMobileCard } from '../HoldingsMobileCard';
import { renderWithProviders } from '@/test/test-utils';
import type { HoldingRow } from '@/types/dashboard';

const holding: HoldingRow = {
  id: '1',
  name: 'Apple',
  ticker: 'AAPL',
  date: 'January 1, 2024',
  dateIso: '2024-01-01',
  volume: 10,
  changePct: 1.2,
  purchasePrice: 150,
  priceUsd: 190,
  pnlUsd: 100,
  status: 'active',
};

describe('HoldingsMobileCard', () => {
  it('renders holding summary', () => {
    renderWithProviders(<HoldingsMobileCard holding={holding} onRemove={() => undefined} />);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
  });
});
