import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import portfolioReducer from "@/features/portfolio/portfolioSlice";

/**
 * Redux Persist configuration
 */
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["portfolio"], // Only persist portfolio state
};

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
  portfolio: portfolioReducer,
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
  middleware: (getDefaultMiddleware) =>
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
