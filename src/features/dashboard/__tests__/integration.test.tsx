import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../Dashboard';
import { renderWithProviders } from '@/test/test-utils';
import { addHolding } from '@/features/portfolio/portfolioSlice';
import { persistor, store } from '@/store/store';

vi.mock('@/utils/generateSeed', () => ({
  generateSeed: () => 'seed',
}));

vi.mock('@/utils/generateMockHoldings', () => ({
  generateMockHoldings: vi.fn(),
}));

import { generateMockHoldings } from '@/utils/generateMockHoldings';

const mockGenerateHoldings = vi.mocked(generateMockHoldings);

describe('dashboard flows', () => {
  it('adds an asset via the modal flow', async () => {
    mockGenerateHoldings.mockReturnValueOnce([]);
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await user.click(screen.getByRole('button', { name: 'Add Asset' }));
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

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Add Asset' }));

    await waitFor(() => {
      expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
    });
  });

  it('removes an asset via confirmation dialog', async () => {
    mockGenerateHoldings.mockReturnValueOnce([
      {
        id: 'hold-1',
        symbol: 'AAPL',
        assetType: 'stock',
        quantity: 10,
        purchasePrice: 120,
        purchaseDate: '2024-01-01',
      },
    ]);
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
    });

    const actionButtons = screen.getAllByLabelText('Row actions for AAPL');
    await user.click(actionButtons[0]);
    await user.click(screen.getAllByRole('menuitem', { name: 'Remove' })[0]);
    await screen.findByText('Remove holding?');
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(screen.getAllByText('No holdings found').length).toBeGreaterThan(0);
    });
  });

  it('persists holdings to localStorage', async () => {
    window.localStorage.clear();
    persistor.persist();
    store.dispatch(
      addHolding({
        id: 'persist-1',
        symbol: 'AAPL',
        assetType: 'stock',
        quantity: 1,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      })
    );
    await persistor.flush();
    await new Promise(resolve => setTimeout(resolve, 0));
    const persisted = window.localStorage.getItem('persist:root');
    expect(persisted).toContain('AAPL');
  });
});
