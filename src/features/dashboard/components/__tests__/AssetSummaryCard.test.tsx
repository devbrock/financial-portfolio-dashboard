import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { AssetSummaryCard } from '../AssetSummaryCard';
import type { AssetCardModel } from '@/types/dashboard';
import { renderWithProviders } from '@/test/test-utils';

const baseAsset: AssetCardModel = {
  id: '1',
  name: 'Apple',
  ticker: 'AAPL',
  valueUsd: 1200,
  weeklyDeltaPct: 2.4,
};

describe('AssetSummaryCard', () => {
  it('renders asset details and delta', () => {
    renderWithProviders(<AssetSummaryCard asset={baseAsset} />);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
    expect(screen.getByText('+2.4%')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('renders loading skeletons', () => {
    renderWithProviders(<AssetSummaryCard asset={baseAsset} loading />);

    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Weekly')).not.toBeInTheDocument();
  });

  it('renders neutral delta when weekly change is flat', () => {
    renderWithProviders(<AssetSummaryCard asset={{ ...baseAsset, weeklyDeltaPct: 0 }} />);

    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});
