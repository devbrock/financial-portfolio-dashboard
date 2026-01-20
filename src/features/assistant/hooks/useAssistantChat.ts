import { useCallback, useMemo, useRef, useState } from 'react';
import { createChatCompletion } from '@/services/api/clients/openRouterClient';
import { usePortfolioData } from '@/features/portfolio/hooks/usePortfolioData';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addMessage } from '@/features/assistant/assistantSlice';
import type { AssistantMessage } from '@/types/assistant';
import type { HoldingWithPrice } from '@/types/portfolio';

const MODEL = 'gpt-oss-20b';

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
  const { holdingsWithPrice, metrics } = usePortfolioData();
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.assistant.messages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const systemPrompt = useMemo(() => {
    const holdingsSummary = formatHoldingsSummary(holdingsWithPrice);
    return [
      'You are Orion, a concise market assistant.',
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

      const pendingMessages = [...messages, userMessage];
      dispatch(addMessage(userMessage));
      setIsLoading(true);
      setError(null);
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        const response = await createChatCompletion({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...pendingMessages
              .filter(msg => msg.role !== 'system')
              .map(msg => ({ role: msg.role, content: msg.content })),
          ],
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
    [dispatch, messages, systemPrompt]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
