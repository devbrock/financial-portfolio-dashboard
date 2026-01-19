import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssetSummaryCard } from '../AssetSummaryCard';
import type { AssetCardModel } from '@/types/dashboard';

const baseAsset: AssetCardModel = {
  id: '1',
  name: 'Apple',
  ticker: 'AAPL',
  valueUsd: 1200,
  weeklyDeltaPct: 2.4,
};

describe('AssetSummaryCard', () => {
  it('renders asset details and delta', () => {
    render(<AssetSummaryCard asset={baseAsset} />);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText('+2.4%')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('renders loading skeletons', () => {
    render(<AssetSummaryCard asset={baseAsset} loading />);

    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Weekly')).not.toBeInTheDocument();
  });

  it('renders neutral delta when weekly change is flat', () => {
    render(<AssetSummaryCard asset={{ ...baseAsset, weeklyDeltaPct: 0 }} />);

    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});
