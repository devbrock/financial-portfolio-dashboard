import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, CardBody, Container, Inline, Stack, Text } from '@components';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/features/shell/AppShell';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { PageHeader } from '@/features/shell/PageHeader';
import { useAssistantChat } from './hooks/useAssistantChat';
import type { AssistantMessage } from '@/types/assistant';
import { Send } from 'lucide-react';

export function Assistant() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const handleNavChange = useCallback(
    (next: keyof typeof DASHBOARD_NAV_ROUTES) => navigate({ to: DASHBOARD_NAV_ROUTES[next] }),
    [navigate]
  );

  const { messages, isLoading, error, sendMessage, resetChat } = useAssistantChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!inputValue.trim()) return;
      const value = inputValue;
      setInputValue('');
      await sendMessage(value);
    },
    [inputValue, sendMessage]
  );

  return (
    <AppShell activeNav={activeNav} onNavChange={handleNavChange}>
      <Container className="max-w-none px-0">
        <Stack gap="lg">
          <PageHeader
            title="OrionGPT"
            subtitle="Ask about market movers, holdings, or portfolio performance."
            rightSlot={
              <Button variant="secondary" size="sm" onClick={resetChat} disabled={isLoading}>
                Clear chat
              </Button>
            }
          />

          <Card className="border border-(--ui-border) bg-(--ui-bg)">
            <CardBody className="flex h-[60vh] flex-col gap-4">
              <div
                className="flex-1 space-y-4! overflow-y-auto pr-1"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {messages.map(message => (
                  <MessageBubble key={message.id} role={message.role} content={message.content} />
                ))}
                {isLoading ? (
                  <div role="status" className="text-sm text-(--ui-text-muted)">
                    Thinking…
                  </div>
                ) : null}
                {error ? (
                  <div role="alert" className="text-sm text-red-600">
                    {error}
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                  value={inputValue}
                  onChange={event => setInputValue(event.target.value)}
                  aria-label="Chat message"
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Ask about your portfolio or the market..."
                  className="h-[44px] flex-1 resize-none rounded-2xl border border-(--ui-border) bg-(--ui-bg) px-4 py-3 text-sm text-(--ui-text) focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:outline-none"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-[44px]"
                  rightIcon={<Send />}
                >
                  Send
                </Button>
              </form>
            </CardBody>
          </Card>

          <Inline align="center" className="flex-wrap gap-2">
            {[
              'Summarize my portfolio performance.',
              'Which holdings are my top gainers and top losers today?',
              'What are the biggest movers in my watchlist right now?',
            ].map(prompt => (
              <Button
                key={prompt}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInputValue('');
                  void sendMessage(prompt);
                }}
              >
                {prompt}
              </Button>
            ))}
          </Inline>

          <Text as="div" size="sm" tone="muted">
            OrionGPT can make mistakes. Verify responses independently. OrionGPT is not liable for
            any losses or decisions based on its responses.
          </Text>
        </Stack>
      </Container>
    </AppShell>
  );
}

function formatMessageContent(role: AssistantMessage['role'], content: string) {
  if (role !== 'assistant') return content;
  return content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\s*-\s+/gm, '• ');
}

function MessageBubble({ role, content }: { role: AssistantMessage['role']; content: string }) {
  const isUser = role === 'user';
  const formattedContent = formatMessageContent(role, content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-(--ui-primary) text-(--ui-inverse-text)'
            : 'bg-(--ui-surface) text-(--ui-text)'
        }`}
      >
        <Text as="p" className="whitespace-pre-wrap">
          {formattedContent}
        </Text>
      </div>
    </div>
  );
}
