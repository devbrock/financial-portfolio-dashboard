import type { ReactElement, PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore, type AnyAction, type Reducer } from '@reduxjs/toolkit';
import portfolioReducer from '@/features/portfolio/portfolioSlice';
import authReducer from '@/features/auth/authSlice';
import type { PortfolioState } from '@/types/portfolio';
import type { AuthState } from '@/types/auth';

export function createTestStore(preloadedState?: {
  portfolio?: ReturnType<typeof portfolioReducer>;
  auth?: AuthState;
}) {
  return configureStore({
    reducer: {
      portfolio: portfolioReducer as Reducer<PortfolioState, AnyAction, PortfolioState | undefined>,
      auth: authReducer as Reducer<AuthState, AnyAction, AuthState | undefined>,
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
