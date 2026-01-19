import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WatchlistCard } from '../WatchlistCard';
import type { WatchlistCardModel } from '@/types/dashboard';

const item: WatchlistCardModel = {
  id: '1',
  name: 'Bitcoin',
  ticker: 'BTC',
  priceUsd: 50000,
  changePct: -2.1,
};

describe('WatchlistCard', () => {
  it('renders price details and handles removal', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<WatchlistCard item={item} onRemove={onRemove} flash />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('-2.1%')).toBeInTheDocument();
    expect(screen.getByText('Live price')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Remove BTC from watchlist'));
    expect(onRemove).toHaveBeenCalledWith('1');
  });
});
