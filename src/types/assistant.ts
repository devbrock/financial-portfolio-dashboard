export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AssistantState = {
  messages: AssistantMessage[];
};
