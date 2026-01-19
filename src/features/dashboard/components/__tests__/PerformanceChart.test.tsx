import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PerformanceChart } from '../PerformanceChart';
import { renderWithProviders } from '@/test/test-utils';
import type { PerformancePoint } from '@/types/dashboard';

const data: PerformancePoint[] = [
  { date: '2024-01-01', value: 100 },
  { date: '2024-01-02', value: 120 },
];

const mockUsePortfolioHistoricalData = vi.fn();

vi.mock('@/features/portfolio/hooks/usePortfolioHistoricalData', () => ({
  usePortfolioHistoricalData: () => mockUsePortfolioHistoricalData(),
}));

describe('PerformanceChart', () => {
  it('changes range when clicking chips', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();

    mockUsePortfolioHistoricalData.mockReturnValue({
      data,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<PerformanceChart range="7d" onRangeChange={onRangeChange} />);

    await user.click(screen.getByRole('button', { name: '90D' }));
    expect(onRangeChange).toHaveBeenCalledWith('90d');
  });
});
