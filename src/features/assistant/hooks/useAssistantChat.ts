import { useCallback, useMemo, useRef, useState } from 'react';
import { createChatCompletion } from '@/services/api/clients/openRouterClient';
import { usePortfolioData } from '@/features/portfolio/hooks/usePortfolioData';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addMessage, resetAssistant } from '@/features/assistant/assistantSlice';
import type { AssistantMessage } from '@/types/assistant';
import type { HoldingWithPrice } from '@/types/portfolio';
import { useMarketQuotes } from '@/features/market/hooks/useMarketQuotes';
import { INDEX_SYMBOLS } from '@/features/market/marketData';
import { buildAssistantToolContext } from '@/features/assistant/tools/assistantTools';

const MODEL = 'gpt-oss-20b';
type OpenRouterMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const formatHoldingsSummary = (holdings: HoldingWithPrice[]) => {
  if (holdings.length === 0) return 'No holdings.';
  return holdings
    .map(holding => {
      const label = holding.companyName?.trim() || holding.symbol.toUpperCase();
      return holding.companyName ? `${label} (${holding.symbol.toUpperCase()})` : label;
    })
    .slice(0, 12)
    .join(', ');
};

export function useAssistantChat() {
  const { holdingsWithPrice, watchlistWithPrice, metrics, dataUpdatedAt } = usePortfolioData();
  const { data: marketIndices, dataUpdatedAt: marketUpdatedAt } = useMarketQuotes(INDEX_SYMBOLS);
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.assistant.messages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const toolData = useMemo(
    () => ({
      holdings: holdingsWithPrice,
      watchlist: watchlistWithPrice,
      metrics,
      portfolioUpdatedAt: dataUpdatedAt,
      marketIndices,
      marketUpdatedAt,
    }),
    [holdingsWithPrice, watchlistWithPrice, metrics, dataUpdatedAt, marketIndices, marketUpdatedAt]
  );

  const systemPrompt = useMemo(() => {
    const holdingsSummary = formatHoldingsSummary(holdingsWithPrice);
    return [
      'You are Orion, a concise market assistant.',
      'Use the provided context data to answer portfolio and market questions.',
      'Respond in plain text only. Do not use markdown or bullet formatting.',
      `Portfolio total value: $${metrics.totalValue.toFixed(2)}.`,
      `Total P/L: $${metrics.totalPL.toFixed(2)} (${metrics.totalPLPct.toFixed(2)}%).`,
      `Holdings: ${holdingsSummary}`,
      'If asked about unavailable data, say it is not available yet.',
    ].join(' ');
  }, [holdingsWithPrice, metrics.totalPL, metrics.totalPLPct, metrics.totalValue]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMessage: AssistantMessage = {
        id: `${Date.now()}-user`,
        role: 'user',
        content: trimmed,
      };

      const pendingMessages: AssistantMessage[] = [...messages, userMessage];
      dispatch(addMessage(userMessage));
      setIsLoading(true);
      setError(null);
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        let toolContext: string | null = null;
        try {
          toolContext = await buildAssistantToolContext({
            question: trimmed,
            ...toolData,
          });
        } catch (toolError) {
          toolContext = null;
          console.warn('Assistant tool context failed.', toolError);
        }

        const toolMessages: OpenRouterMessage[] = toolContext
          ? [{ role: 'system' as const, content: toolContext }]
          : [];
        const userMessages: OpenRouterMessage[] = pendingMessages
          .filter(
            (msg): msg is AssistantMessage & { role: 'user' | 'assistant' } =>
              msg.role !== 'system'
          )
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          }));
        const requestMessages: OpenRouterMessage[] = [
          { role: 'system', content: systemPrompt },
          ...toolMessages,
          ...userMessages,
        ];

        const response = await createChatCompletion({
          model: MODEL,
          messages: requestMessages,
          temperature: 0.2,
        });

        const reply = response.choices[0]?.message?.content?.trim() ?? '';
        if (!reply) {
          throw new Error('Assistant returned an empty response.');
        }

        if (requestIdRef.current !== requestId) return;

        dispatch(
          addMessage({
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content: reply,
          })
        );
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        setError(err instanceof Error ? err.message : 'Assistant request failed.');
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [dispatch, messages, systemPrompt, toolData]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat: () => dispatch(resetAssistant()),
  };
}
