import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AssistantMessage, AssistantState } from '@/types/assistant';

const introMessage: AssistantMessage = {
  id: 'assistant-intro',
  role: 'assistant',
  content: "Hi! I'm your Orion market assistant. Ask me about market movers or your portfolio.",
};

const initialState: AssistantState = {
  messages: [introMessage],
};

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<AssistantMessage>) => {
      state.messages.push(action.payload);
    },
    resetAssistant: state => {
      state.messages = [introMessage];
    },
  },
});

export const { addMessage, resetAssistant } = assistantSlice.actions;

export default assistantSlice.reducer;
