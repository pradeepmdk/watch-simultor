import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice';
import timerReducer from './features/timerSlice';
import { loadState, saveState } from './localStorage';

export const makeStore = () => {
  // Load persisted state from localStorage
  const persistedState = loadState();

  const store = configureStore({
    reducer: {
      counter: counterReducer,
      timer: timerReducer,
    },
    ...(persistedState && { preloadedState: persistedState }),
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
        counter: state.counter,
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
