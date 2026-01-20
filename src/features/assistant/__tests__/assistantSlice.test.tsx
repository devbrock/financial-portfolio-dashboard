import { describe, expect, it } from 'vitest';
import assistantReducer, { addMessage, resetAssistant } from '../assistantSlice';
import type { AssistantState } from '@/types/assistant';

describe('assistantSlice', () => {
  it('adds a message to the thread', () => {
    const initialState = assistantReducer(undefined, { type: 'init' });
    const nextState = assistantReducer(
      initialState,
      addMessage({ id: 'm1', role: 'user', content: 'Hello' })
    );

    expect(nextState.messages).toHaveLength(initialState.messages.length + 1);
    expect(nextState.messages.at(-1)?.content).toBe('Hello');
  });

  it('resets to the intro message', () => {
    const state: AssistantState = {
      messages: [
        { id: 'assistant-intro', role: 'assistant', content: 'Intro' },
        { id: 'm1', role: 'user', content: 'Hi' },
      ],
    };

    const nextState = assistantReducer(state, resetAssistant());
    expect(nextState.messages).toHaveLength(1);
    expect(nextState.messages[0]?.id).toBe('assistant-intro');
  });
});
