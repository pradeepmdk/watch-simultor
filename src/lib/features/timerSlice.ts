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

const initialState: TimerState = {
  isRunning: false,
  speed: 1,
  startDate: new Date().toISOString().split('T')[0],
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
      state.startDate = action.payload;
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
