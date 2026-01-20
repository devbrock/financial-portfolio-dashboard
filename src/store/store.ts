import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import portfolioReducer from '@/features/portfolio/portfolioSlice';
import assistantReducer from '@/features/assistant/assistantSlice';
import authReducer from '@/features/auth/authSlice';
import { safeStorage } from '@/store/safeStorage';

/**
 * Redux Persist configuration
 */
const persistConfig = {
  key: 'root',
  version: 1,
  storage: safeStorage,
  whitelist: ['portfolio', 'assistant', 'auth'],
};

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
  portfolio: portfolioReducer,
  assistant: assistantReducer,
  auth: authReducer,
});

/**
 * Persisted reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux store with Redux Persist
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Redux Persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/**
 * Persistor for Redux Persist
 */
export const persistor = persistStore(store);

/**
 * TypeScript types for Redux
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
