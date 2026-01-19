import { useEffect, useRef } from 'react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster, toast } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { store, persistor } from './store/store';
import { routeTree } from './routeTree.gen';
import { isLocalStorageAvailable } from './store/safeStorage';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 60 seconds
      gcTime: 300000, // 5 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    if (hasWarnedRef.current) {
      return;
    }
    if (!isLocalStorageAvailable()) {
      toast.warning(
        'Local storage is disabled. Your portfolio will not be saved between sessions.',
        { duration: 10000 }
      );
      hasWarnedRef.current = true;
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <div id="toast-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
            <Toaster richColors closeButton />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}

export default App;
