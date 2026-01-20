const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenRouterChatRequest = {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
};

type OpenRouterChatResponse = {
  choices: Array<{
    message: OpenRouterMessage;
  }>;
};

const getApiKey = () => import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

export async function createChatCompletion(payload: OpenRouterChatRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing.');
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Orion Wealth Dashboard',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'OpenRouter request failed.');
  }

  const data = (await response.json()) as OpenRouterChatResponse;
  return data;
}
