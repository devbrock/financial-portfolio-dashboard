import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePortfolioHistoricalData } from '../usePortfolioHistoricalData';
import { createTestWrapper } from '@/test/test-utils';

vi.mock('../usePortfolioHoldings', () => ({
  usePortfolioHoldings: () => [],
}));

vi.mock('@tanstack/react-query', async importOriginal => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueries: () => [],
  };
});

describe('usePortfolioHistoricalData', () => {
  it('returns empty data when there are no holdings', () => {
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => usePortfolioHistoricalData('30d'), { wrapper });

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});
