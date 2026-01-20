import type { ReactElement, PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterContextProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { configureStore, type AnyAction, type Reducer } from '@reduxjs/toolkit';
import portfolioReducer from '@/features/portfolio/portfolioSlice';
import authReducer from '@/features/auth/authSlice';
import assistantReducer from '@/features/assistant/assistantSlice';
import { routeTree } from '@/routeTree.gen';
import type { PortfolioState } from '@/types/portfolio';
import type { AuthState } from '@/types/auth';
import type { AssistantState } from '@/types/assistant';

export function createTestStore(preloadedState?: {
  portfolio?: ReturnType<typeof portfolioReducer>;
  assistant?: AssistantState;
  auth?: AuthState;
}) {
  return configureStore({
    reducer: {
      portfolio: portfolioReducer as Reducer<PortfolioState, AnyAction, PortfolioState | undefined>,
      assistant: assistantReducer as Reducer<AssistantState, AnyAction, AssistantState | undefined>,
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
  router?: ReturnType<typeof createRouter>;
};

export function createTestRouter(initialEntries: string[] = ['/']) {
  const history = createMemoryHistory({ initialEntries });
  return createRouter({ routeTree, history });
}

export function createTestWrapper(
  store = createTestStore(),
  queryClient = createTestQueryClient(),
  router = createTestRouter()
) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>{children}</RouterContextProvider>
        </QueryClientProvider>
      </Provider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  {
    store = createTestStore(),
    queryClient = createTestQueryClient(),
    router = createTestRouter(),
  }: RenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>{children}</RouterContextProvider>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper }),
    store,
    queryClient,
  };
}
