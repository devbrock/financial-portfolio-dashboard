import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketQuoteRow, MarketQuoteTile } from '../MarketQuotes';

vi.mock('@/features/portfolio/hooks/useCurrencyFormatter', () => ({
  useCurrencyFormatter: () => ({
    formatMoney: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

describe('MarketQuotes', () => {
  it('renders tile loading and empty states', () => {
    const { rerender } = render(
      <MarketQuoteTile name="S&P 500" symbol="SPY" loading quote={{ c: 450, dp: 1.2 }} />
    );

    expect(screen.getByText('S&P 500')).toBeInTheDocument();
    expect(screen.queryByText('Data unavailable')).not.toBeInTheDocument();

    rerender(<MarketQuoteTile name="S&P 500" symbol="SPY" loading={false} />);
    expect(screen.getByText('Data unavailable')).toBeInTheDocument();
  });

  it('renders tile quotes for positive, negative, and flat deltas', () => {
    const { rerender } = render(
      <MarketQuoteTile name="Nasdaq" symbol="QQQ" loading={false} quote={{ c: 100, dp: 1.2 }} />
    );
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('+1.2%')).toBeInTheDocument();

    rerender(
      <MarketQuoteTile name="Nasdaq" symbol="QQQ" loading={false} quote={{ c: 100, dp: -0.5 }} />
    );
    expect(screen.getByText('-0.5%')).toBeInTheDocument();

    rerender(
      <MarketQuoteTile name="Nasdaq" symbol="QQQ" loading={false} quote={{ c: 100, dp: 0 }} />
    );
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('renders row loading and fallback states', () => {
    const { rerender } = render(
      <MarketQuoteRow name="Energy" symbol="XLE" loading quote={{ c: 90, dp: 0.4 }} />
    );
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.queryByText('--')).not.toBeInTheDocument();

    rerender(<MarketQuoteRow name="Energy" symbol="XLE" loading={false} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders row quotes with negative and flat deltas', () => {
    const { rerender } = render(
      <MarketQuoteRow name="Tech" symbol="XLK" loading={false} quote={{ c: 75, dp: -1.1 }} />
    );
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    expect(screen.getByText('-1.1%')).toBeInTheDocument();

    rerender(
      <MarketQuoteRow name="Tech" symbol="XLK" loading={false} quote={{ c: 75, dp: 0.8 }} />
    );
    expect(screen.getByText('+0.8%')).toBeInTheDocument();

    rerender(<MarketQuoteRow name="Tech" symbol="XLK" loading={false} quote={{ c: 75, dp: 0 }} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});
