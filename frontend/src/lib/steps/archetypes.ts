/**
 * Archetype Definitions - Milestone 3
 * Defines step patterns for different person types
 */

export type ActivityLevel = 'sleep' | 'sedentary' | 'light' | 'moderate' | 'vigorous';
export type ActivityType = 'walking' | 'jogging';

export interface HourlyActivity {
  hour: number; // 0-23
  level: ActivityLevel;
  type: ActivityType;
  probability: number; // 0-1, probability of activity this hour
}

export interface ArchetypeDefinition {
  id: string;
  name: string;
  description: string;
  dailyStepGoal: number;
  schedule: HourlyActivity[];
}

// Step rates per minute
export const STEP_RATES = {
  walking: 120,  // 120 steps/min
  jogging: 180,  // 180 steps/min
} as const;

// Activity level multipliers (how active during the hour)
export const ACTIVITY_MULTIPLIERS = {
  sleep: 0,
  sedentary: 0.05,      // Minimal movement
  light: 0.3,           // Light activity
  moderate: 0.6,        // Moderate activity
  vigorous: 0.9,        // High activity
} as const;

/**
 * Office Worker Archetype
 * - Works 9-5 on weekdays
 * - Morning walk, lunch walk, evening activity
 * - Lower activity on weekends
 */
const OFFICE_WORKER: ArchetypeDefinition = {
  id: 'office',
  name: 'Office Worker',
  description: 'Sedentary job with regular breaks',
  dailyStepGoal: 8000,
  schedule: [
    // Night: 0-6 (Sleep)
    { hour: 0, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 1, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 2, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 3, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 4, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 5, level: 'sleep', type: 'walking', probability: 0 },

    // Morning routine: 6-9 (Light activity)
    { hour: 6, level: 'light', type: 'walking', probability: 0.7 },
    { hour: 7, level: 'moderate', type: 'walking', probability: 0.8 }, // Morning commute
    { hour: 8, level: 'light', type: 'walking', probability: 0.6 },

    // Work hours: 9-12 (Sedentary with breaks)
    { hour: 9, level: 'sedentary', type: 'walking', probability: 0.3 },
    { hour: 10, level: 'light', type: 'walking', probability: 0.4 }, // Coffee break
    { hour: 11, level: 'sedentary', type: 'walking', probability: 0.3 },

    // Lunch: 12-13 (Moderate activity)
    { hour: 12, level: 'moderate', type: 'walking', probability: 0.7 }, // Lunch walk

    // Afternoon: 13-17 (Sedentary with breaks)
    { hour: 13, level: 'sedentary', type: 'walking', probability: 0.3 },
    { hour: 14, level: 'sedentary', type: 'walking', probability: 0.3 },
    { hour: 15, level: 'light', type: 'walking', probability: 0.4 }, // Afternoon break
    { hour: 16, level: 'sedentary', type: 'walking', probability: 0.3 },

    // Evening commute: 17-18
    { hour: 17, level: 'moderate', type: 'walking', probability: 0.8 },

    // Evening: 18-22 (Light to moderate)
    { hour: 18, level: 'moderate', type: 'walking', probability: 0.6 }, // Evening walk
    { hour: 19, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 20, level: 'light', type: 'walking', probability: 0.4 },
    { hour: 21, level: 'sedentary', type: 'walking', probability: 0.3 },

    // Wind down: 22-23
    { hour: 22, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 23, level: 'sedentary', type: 'walking', probability: 0.1 },
  ],
};

/**
 * Athlete Archetype
 * - Multiple training sessions per day
 * - High step count with jogging
 * - Consistent schedule
 */
const ATHLETE: ArchetypeDefinition = {
  id: 'athlete',
  name: 'Athlete',
  description: 'Active lifestyle with regular training',
  dailyStepGoal: 15000,
  schedule: [
    // Night: 0-5 (Sleep)
    { hour: 0, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 1, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 2, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 3, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 4, level: 'sleep', type: 'walking', probability: 0 },

    // Morning training: 5-7
    { hour: 5, level: 'light', type: 'walking', probability: 0.6 },
    { hour: 6, level: 'vigorous', type: 'jogging', probability: 0.9 }, // Morning run
    { hour: 7, level: 'moderate', type: 'walking', probability: 0.7 }, // Cool down

    // Morning routine: 8-9
    { hour: 8, level: 'light', type: 'walking', probability: 0.6 },
    { hour: 9, level: 'moderate', type: 'walking', probability: 0.5 },

    // Midday: 10-13 (Active recovery)
    { hour: 10, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 11, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 12, level: 'moderate', type: 'walking', probability: 0.7 },
    { hour: 13, level: 'light', type: 'walking', probability: 0.5 },

    // Afternoon training: 14-17
    { hour: 14, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 15, level: 'moderate', type: 'walking', probability: 0.7 },
    { hour: 16, level: 'vigorous', type: 'jogging', probability: 0.9 }, // Afternoon training
    { hour: 17, level: 'moderate', type: 'walking', probability: 0.7 }, // Cool down

    // Evening: 18-22 (Recovery)
    { hour: 18, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 19, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 20, level: 'light', type: 'walking', probability: 0.4 },
    { hour: 21, level: 'light', type: 'walking', probability: 0.3 },

    // Wind down: 22-23
    { hour: 22, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 23, level: 'sedentary', type: 'walking', probability: 0.1 },
  ],
};

/**
 * Sedentary Archetype
 * - Work from home, minimal movement
 * - Low step count
 * - Irregular activity
 */
const SEDENTARY: ArchetypeDefinition = {
  id: 'sedentary',
  name: 'Sedentary',
  description: 'Minimal daily movement',
  dailyStepGoal: 4000,
  schedule: [
    // Night: 0-7 (Sleep)
    { hour: 0, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 1, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 2, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 3, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 4, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 5, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 6, level: 'sleep', type: 'walking', probability: 0 },

    // Morning: 7-9
    { hour: 7, level: 'sedentary', type: 'walking', probability: 0.4 },
    { hour: 8, level: 'light', type: 'walking', probability: 0.3 },
    { hour: 9, level: 'sedentary', type: 'walking', probability: 0.3 },

    // Day: 10-17 (Mostly sedentary)
    { hour: 10, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 11, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 12, level: 'light', type: 'walking', probability: 0.3 }, // Lunch
    { hour: 13, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 14, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 15, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 16, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 17, level: 'light', type: 'walking', probability: 0.3 },

    // Evening: 18-23
    { hour: 18, level: 'light', type: 'walking', probability: 0.3 },
    { hour: 19, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 20, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 21, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 22, level: 'sedentary', type: 'walking', probability: 0.1 },
    { hour: 23, level: 'sedentary', type: 'walking', probability: 0.1 },
  ],
};

/**
 * Active Lifestyle Archetype
 * - Balanced active lifestyle
 * - Regular walks throughout the day
 * - Higher activity in mornings and evenings
 */
const ACTIVE: ArchetypeDefinition = {
  id: 'active',
  name: 'Active Lifestyle',
  description: 'Regular activity throughout the day',
  dailyStepGoal: 12000,
  schedule: [
    // Night: 0-6 (Sleep)
    { hour: 0, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 1, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 2, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 3, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 4, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 5, level: 'sleep', type: 'walking', probability: 0 },

    // Morning: 6-9
    { hour: 6, level: 'moderate', type: 'walking', probability: 0.8 }, // Morning walk
    { hour: 7, level: 'moderate', type: 'jogging', probability: 0.6 }, // Sometimes jog
    { hour: 8, level: 'light', type: 'walking', probability: 0.7 },

    // Midday: 9-12
    { hour: 9, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 10, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 11, level: 'moderate', type: 'walking', probability: 0.6 },

    // Lunch: 12-13
    { hour: 12, level: 'moderate', type: 'walking', probability: 0.7 }, // Lunch walk

    // Afternoon: 13-17
    { hour: 13, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 14, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 15, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 16, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 17, level: 'moderate', type: 'walking', probability: 0.7 },

    // Evening: 18-21
    { hour: 18, level: 'vigorous', type: 'jogging', probability: 0.7 }, // Evening exercise
    { hour: 19, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 20, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 21, level: 'light', type: 'walking', probability: 0.4 },

    // Wind down: 22-23
    { hour: 22, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 23, level: 'sedentary', type: 'walking', probability: 0.1 },
  ],
};

/**
 * Flexible Worker Archetype
 * - Works from home with flexible schedule
 * - Irregular activity patterns throughout the day
 * - Activity spread across different times
 */
const FLEXIBLE_WORKER: ArchetypeDefinition = {
  id: 'flexible',
  name: 'Flexible Worker',
  description: 'Work from home with flexible hours',
  dailyStepGoal: 7000,
  schedule: [
    // Night: 0-6 (Sleep)
    { hour: 0, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 1, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 2, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 3, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 4, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 5, level: 'sleep', type: 'walking', probability: 0 },

    // Late morning start: 6-9
    { hour: 6, level: 'sedentary', type: 'walking', probability: 0.3 },
    { hour: 7, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 8, level: 'moderate', type: 'walking', probability: 0.6 }, // Morning activity
    { hour: 9, level: 'light', type: 'walking', probability: 0.4 },

    // Mid-morning work: 10-12
    { hour: 10, level: 'sedentary', type: 'walking', probability: 0.3 },
    { hour: 11, level: 'light', type: 'walking', probability: 0.4 }, // Coffee break

    // Lunch break: 12-14 (flexible timing)
    { hour: 12, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 13, level: 'moderate', type: 'walking', probability: 0.6 }, // Lunch walk

    // Afternoon: 14-17 (work from home)
    { hour: 14, level: 'sedentary', type: 'walking', probability: 0.3 },
    { hour: 15, level: 'light', type: 'walking', probability: 0.4 }, // Afternoon break
    { hour: 16, level: 'moderate', type: 'walking', probability: 0.5 }, // Mid-afternoon walk
    { hour: 17, level: 'light', type: 'walking', probability: 0.4 },

    // Evening: 18-21 (higher activity)
    { hour: 18, level: 'moderate', type: 'walking', probability: 0.7 }, // Evening walk
    { hour: 19, level: 'moderate', type: 'walking', probability: 0.6 },
    { hour: 20, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 21, level: 'light', type: 'walking', probability: 0.4 },

    // Wind down: 22-23
    { hour: 22, level: 'sedentary', type: 'walking', probability: 0.2 },
    { hour: 23, level: 'sedentary', type: 'walking', probability: 0.1 },
  ],
};

/**
 * Shift Worker Archetype
 * - Works irregular shifts (night shifts, rotating schedule)
 * - Sleep during day, active at night
 * - Activity patterns inverted from typical schedule
 */
const SHIFT_WORKER: ArchetypeDefinition = {
  id: 'shift',
  name: 'Shift Worker',
  description: 'Night shift worker with inverted schedule',
  dailyStepGoal: 6500,
  schedule: [
    // Night shift work: 0-7 (active during night)
    { hour: 0, level: 'moderate', type: 'walking', probability: 0.5 }, // Night shift activity
    { hour: 1, level: 'light', type: 'walking', probability: 0.4 },
    { hour: 2, level: 'moderate', type: 'walking', probability: 0.5 },
    { hour: 3, level: 'light', type: 'walking', probability: 0.4 }, // Night break
    { hour: 4, level: 'moderate', type: 'walking', probability: 0.5 },
    { hour: 5, level: 'light', type: 'walking', probability: 0.4 },
    { hour: 6, level: 'moderate', type: 'walking', probability: 0.5 },

    // Morning commute home: 7-8
    { hour: 7, level: 'moderate', type: 'walking', probability: 0.6 }, // Commute home

    // Day sleep: 8-15
    { hour: 8, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 9, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 10, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 11, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 12, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 13, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 14, level: 'sleep', type: 'walking', probability: 0 },

    // Wake up and evening routine: 15-18
    { hour: 15, level: 'sedentary', type: 'walking', probability: 0.3 },
    { hour: 16, level: 'light', type: 'walking', probability: 0.5 }, // Afternoon wake-up
    { hour: 17, level: 'moderate', type: 'walking', probability: 0.6 }, // Errands/exercise
    { hour: 18, level: 'moderate', type: 'walking', probability: 0.6 },

    // Pre-shift routine: 19-22
    { hour: 19, level: 'moderate', type: 'walking', probability: 0.6 }, // Meal prep/activities
    { hour: 20, level: 'light', type: 'walking', probability: 0.5 },
    { hour: 21, level: 'light', type: 'walking', probability: 0.4 },

    // Preparing for shift: 22-23
    { hour: 22, level: 'moderate', type: 'walking', probability: 0.6 }, // Commute to work
    { hour: 23, level: 'moderate', type: 'walking', probability: 0.5 }, // Start of shift
  ],
};

// Export all archetypes
export const ARCHETYPES: Record<string, ArchetypeDefinition> = {
  office: OFFICE_WORKER,
  athlete: ATHLETE,
  sedentary: SEDENTARY,
  active: ACTIVE,
  flexible: FLEXIBLE_WORKER,
  shift: SHIFT_WORKER,
};

// Helper function to get archetype by ID
export function getArchetype(id: string): ArchetypeDefinition {
  return ARCHETYPES[id] || OFFICE_WORKER;
}

// Helper function to get activity for specific hour
export function getActivityForHour(archetype: ArchetypeDefinition, hour: number): HourlyActivity {
  return archetype.schedule[hour] || archetype.schedule[0];
}
