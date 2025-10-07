import { configureStore } from '@reduxjs/toolkit';
import timerReducer from './features/timerSlice';
import { loadState, saveState } from './localStorage';

export const makeStore = () => {
  // Load persisted state from localStorage
  const persistedState = loadState();

  // Type assertion needed due to Redux Toolkit's strict typing with partial preloadedState
  // See: https://github.com/reduxjs/redux-toolkit/issues/1806
  const store = configureStore({
    reducer: {
      // @ts-expect-error - Redux Toolkit has issues with partial preloadedState typing
      timer: timerReducer,
    },
    ...(persistedState ? { preloadedState: persistedState } : {}),
  });

  // Subscribe to store changes and save to localStorage with debouncing
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  store.subscribe(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const state = store.getState();
      saveState({
        timer: {
          ...state.timer,
          // Don't persist runtime state
          isRunning: false,
          events: [], // Don't persist events to avoid bloat
        },
      });
    }, 500); // Debounce by 500ms
  });

  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
