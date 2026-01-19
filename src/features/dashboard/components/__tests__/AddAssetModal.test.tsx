import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddAssetModal } from '../AddAssetModal';
import { renderWithProviders } from '@/test/test-utils';

describe('AddAssetModal', () => {
  it('submits a new asset', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { store } = renderWithProviders(<AddAssetModal open onOpenChange={onOpenChange} />);

    const searchInput = screen.getByPlaceholderText('Search RBLX, Adobe, BTC, Ethereum...');

    await user.type(searchInput, 'AAPL');

    const option = await screen.findByText(/Stock · AAPL — Apple Inc/i);
    await user.click(option);

    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '5');

    await user.clear(screen.getByLabelText('Purchase price (USD)'));
    await user.type(screen.getByLabelText('Purchase price (USD)'), '150');

    await user.clear(screen.getByLabelText('Purchase date'));
    await user.type(screen.getByLabelText('Purchase date'), '2024-02-01');

    await user.click(screen.getByRole('button', { name: 'Add Asset' }));

    await waitFor(() => {
      const holdings = store.getState().portfolio.holdings;
      expect(holdings.some(h => h.symbol === 'AAPL')).toBe(true);
    });
  });

  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddAssetModal open onOpenChange={() => undefined} />);

    const submitButtons = screen.getAllByRole('button', { name: 'Add Asset' });
    await user.click(submitButtons[0]);

    expect(await screen.findByText('Select an asset from search')).toBeInTheDocument();
  });

  it('uppercases symbol input while typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddAssetModal open onOpenChange={() => undefined} />);

    const searchInput = screen.getByPlaceholderText('Search RBLX, Adobe, BTC, Ethereum...');
    await user.type(searchInput, 'aapl');

    expect(searchInput).toHaveValue('AAPL');
  });
});
