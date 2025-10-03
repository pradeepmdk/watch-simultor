// State Machine Types

export type DeviceState = 'SLEEP' | 'IDLE' | 'BACKGROUND' | 'ACTIVE';

export interface StateTransitionRule {
  from: DeviceState;
  to: DeviceState;
  condition: (context: StateContext) => boolean;
  priority: number; // Higher priority rules evaluated first
}

export interface StateContext {
  currentTime: Date;
  hour: number;
  isNight: boolean; // 22:00 - 06:00
  stepsInLastMinute: number;
  totalSteps: number;
  activityLevel: 'sleep' | 'sedentary' | 'light' | 'moderate' | 'vigorous';
  minutesSinceLastActivity: number;
}

export interface StateConfig {
  state: DeviceState;
  stepMultiplier: number; // Multiplies base step generation
  description: string;
  color: string; // For UI visualization
  icon: string; // Emoji for display
}

export interface StateTransitionEvent {
  from: DeviceState;
  to: DeviceState;
  timestamp: Date;
  reason: string;
}

// State configurations defining behavior
export const STATE_CONFIGS: Record<DeviceState, StateConfig> = {
  SLEEP: {
    state: 'SLEEP',
    stepMultiplier: 0, // No steps during sleep
    description: 'Device in sleep mode - no activity tracking',
    color: '#1e293b', // Dark slate
    icon: '😴',
  },
  IDLE: {
    state: 'IDLE',
    stepMultiplier: 0.3, // Reduced step tracking
    description: 'Device idle - minimal activity detection',
    color: '#475569', // Slate
    icon: '💤',
  },
  BACKGROUND: {
    state: 'BACKGROUND',
    stepMultiplier: 0.7, // Reduced but active tracking
    description: 'Background tracking - normal activity detection',
    color: '#3b82f6', // Blue
    icon: '📱',
  },
  ACTIVE: {
    state: 'ACTIVE',
    stepMultiplier: 1.0, // Full step tracking
    description: 'Active mode - full activity tracking',
    color: '#10b981', // Green
    icon: '🏃',
  },
};
