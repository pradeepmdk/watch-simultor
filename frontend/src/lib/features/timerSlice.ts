import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RTCTime } from '../timer/types';

export interface LogEvent {
  id: string;
  timestamp: string;
  type: 'NEW_SECOND' | 'NEW_MINUTE' | 'NEW_STEP' | 'NEW_STATE';
  message: string;
  data?: any;
}

export interface MinuteStepData {
  timestamp: string; // YYYY-MM-DD HH:MM:00
  steps: number;
}

export interface TimerState {
  isRunning: boolean;
  speed: number;
  startDate: string;
  duration: number; // in days
  archetype: string;
  progress: number; // 0-100
  currentTime: RTCTime | null;
  events: LogEvent[];
  // Step tracking for charts
  hourlySteps: number[]; // 168 hours (7 days)
  dailySteps: number[]; // 365 days (1 year)
  currentHourIndex: number;
  currentDayIndex: number;
  // Minute-by-minute step tracking for JSON export
  minuteSteps: MinuteStepData[];
  // JSON export filename
  exportFilename: string;
}

// Create initial date at 9:00 AM local time (active hour for testing)
// We use date string format so it works consistently across timezones
const getInitialStartDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  // Return ISO format with 9:00 AM local time
  return `${year}-${month}-${day}T09:00:00`;
};

const initialState: TimerState = {
  isRunning: false,
  speed: 1,
  startDate: getInitialStartDate(),
  duration: 7,
  archetype: 'office',
  progress: 0,
  currentTime: null,
  events: [],
  hourlySteps: Array(168).fill(0),
  dailySteps: Array(365).fill(0),
  currentHourIndex: 0,
  currentDayIndex: 0,
  minuteSteps: [],
  exportFilename: 'simulation.json',
};

export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isRunning = true;
      state.progress = 0;
    },
    pauseTimer: (state) => {
      state.isRunning = false;
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.progress = 0;
      state.currentTime = null;
      state.events = [];
      state.hourlySteps = Array(168).fill(0);
      state.dailySteps = Array(365).fill(0);
      state.currentHourIndex = 0;
      state.currentDayIndex = 0;
      state.minuteSteps = [];
    },
    setSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      // If date-only format (YYYY-MM-DD), append 9:00 AM time
      if (action.payload && action.payload.length === 10 && action.payload.includes('-')) {
        const date = new Date(action.payload + 'T09:00:00');
        state.startDate = date.toISOString();
      } else {
        state.startDate = action.payload;
      }
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setArchetype: (state, action: PayloadAction<string>) => {
      state.archetype = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = Math.min(100, Math.max(0, action.payload));
    },
    updateCurrentTime: (state, action: PayloadAction<RTCTime>) => {
      state.currentTime = action.payload;
    },
    addEvent: (state, action: PayloadAction<Omit<LogEvent, 'id'>>) => {
      const event: LogEvent = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      state.events.unshift(event); // Add to beginning for newest first
      // Keep only last 100 events to prevent memory issues
      if (state.events.length > 100) {
        state.events = state.events.slice(0, 100);
      }
    },
    clearEvents: (state) => {
      state.events = [];
    },
    addStepsToHour: (state, action: PayloadAction<{ hourIndex: number; steps: number }>) => {
      const { hourIndex, steps } = action.payload;
      if (hourIndex >= 0 && hourIndex < 168) {
        state.hourlySteps[hourIndex] += steps;
      }
    },
    addStepsToDay: (state, action: PayloadAction<{ dayIndex: number; steps: number }>) => {
      const { dayIndex, steps } = action.payload;
      if (dayIndex >= 0 && dayIndex < 365) {
        state.dailySteps[dayIndex] += steps;
      }
    },
    addMinuteSteps: (state, action: PayloadAction<MinuteStepData>) => {
      if (!state.minuteSteps) {
        state.minuteSteps = [];
      }
      state.minuteSteps.push(action.payload);
    },
    setExportFilename: (state, action: PayloadAction<string>) => {
      state.exportFilename = action.payload;
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resetTimer,
  setSpeed,
  setStartDate,
  setDuration,
  setArchetype,
  setProgress,
  updateCurrentTime,
  addEvent,
  clearEvents,
  addStepsToHour,
  addStepsToDay,
  addMinuteSteps,
  setExportFilename,
} = timerSlice.actions;

export default timerSlice.reducer;
