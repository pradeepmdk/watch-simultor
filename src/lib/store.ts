import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice';
import { loadState, saveState } from './localStorage';

export const makeStore = () => {
  // Load persisted state from localStorage
  const persistedState = loadState();
  
  const store = configureStore({
    reducer: {
      counter: counterReducer,
      // Add more reducers here
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
        // Add more slices to persist here
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
