import type { ReactElement, PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore, type AnyAction, type Reducer } from '@reduxjs/toolkit';
import portfolioReducer from '@/features/portfolio/portfolioSlice';
import type { PortfolioState } from '@/types/portfolio';

export function createTestStore(preloadedState?: {
  portfolio?: ReturnType<typeof portfolioReducer>;
}) {
  return configureStore({
    reducer: {
      portfolio: portfolioReducer as Reducer<PortfolioState, AnyAction, PortfolioState | undefined>,
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
