/**
 * Local Storage utility functions for Redux state persistence
 */

// Import the timer state type
import { TimerState } from './features/timerSlice';

// Type for the persisted state
export type PersistedState = {
  timer: TimerState;
};

const STORAGE_KEY = 'redux_state';

/**
 * Load state from localStorage
 */
export const loadState = (): Partial<PersistedState> | undefined => {
  try {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return undefined;
    }

    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return undefined;
  }
};

/**
 * Save state to localStorage
 */
export const saveState = (state: Partial<PersistedState>): void => {
  try {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return;
    }

    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

/**
 * Clear state from localStorage
 */
export const clearState = (): void => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing state from localStorage:', err);
  }
};
