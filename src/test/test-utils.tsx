import type { ReactElement, PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from '@/features/portfolio/portfolioSlice';

export function createTestStore(preloadedState?: {
  portfolio?: ReturnType<typeof portfolioReducer>;
}) {
  return configureStore({
    reducer: {
      portfolio: portfolioReducer,
    },
    preloadedState,
  });
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

type RenderOptions = {
  store?: ReturnType<typeof createTestStore>;
  queryClient?: QueryClient;
};

export function createTestWrapper(
  store = createTestStore(),
  queryClient = createTestQueryClient()
) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  { store = createTestStore(), queryClient = createTestQueryClient() }: RenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper }),
    store,
    queryClient,
  };
}
