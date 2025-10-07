/**
 * Timer and RTC Types
 * Milestone 2: Timer Module with adjustable playback speed
 */

export type EventType = 'NEW_SECOND' | 'NEW_MINUTE' | 'NEW_STEP' | 'NEW_STATE';

export interface TimerEvent {
  type: EventType;
  timestamp: number; // Unix timestamp in ms
  simulatedTime: Date;
  data?: any;
}

export interface RTCTime {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  dayOfWeek: number; // 0 (Sunday) - 6 (Saturday)
}

export interface TimerState {
  isRunning: boolean;
  speed: number; // 1-1000
  startDate: string; // ISO date string
  currentTime: Date;
  realStartTime: number | null; // Real-world timestamp when timer started
  simulatedStartTime: number | null; // Simulated timestamp when timer started
  elapsedSimulatedMs: number; // Total simulated milliseconds elapsed
}

export type EventListener = (event: TimerEvent) => void;
