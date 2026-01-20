import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssistantChat } from '../useAssistantChat';
import { createTestWrapper } from '@/test/test-utils';

const mockCreateChatCompletion = vi.fn();
const mockBuildToolContext = vi.fn();

vi.mock('@/services/api/clients/openRouterClient', () => ({
  createChatCompletion: (...args: unknown[]) => mockCreateChatCompletion(...args),
}));

vi.mock('@/features/assistant/tools/assistantTools', () => ({
  buildAssistantToolContext: (...args: unknown[]) => mockBuildToolContext(...args),
}));

vi.mock('@/features/portfolio/hooks/usePortfolioData', () => ({
  usePortfolioData: () => ({
    holdingsWithPrice: [],
    watchlistWithPrice: [],
    metrics: {
      totalValue: 1000,
      totalCostBasis: 900,
      totalPL: 100,
      totalPLPct: 10,
      stockValue: 1000,
      cryptoValue: 0,
      stockPct: 100,
      cryptoPct: 0,
    },
    isLoading: false,
    isError: false,
    errorMessage: '',
    dataUpdatedAt: 0,
  }),
}));

vi.mock('@/features/market/hooks/useMarketQuotes', () => ({
  useMarketQuotes: () => ({ data: [], dataUpdatedAt: 0 }),
}));

describe('useAssistantChat', () => {
  it('appends assistant responses after sending a message', async () => {
    mockBuildToolContext.mockResolvedValue('context');
    mockCreateChatCompletion.mockResolvedValue({
      choices: [{ message: { role: 'assistant', content: 'Hello there' } }],
    });

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useAssistantChat(), { wrapper });

    await result.current.sendMessage('Hi');

    await waitFor(() => {
      expect(result.current.messages.some(msg => msg.content === 'Hi')).toBe(true);
      expect(result.current.messages.some(msg => msg.content === 'Hello there')).toBe(true);
    });
  });
});
