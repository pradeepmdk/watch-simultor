/**
 * New Archetype Definitions
 * Simplified walk/run based step generation
 */

export interface NewArchetypeConfig {
  id: string;
  name: string;
  description: string;
  sleepTime: {
    hour: number;
    randomizationMinutes: number;
    step: number;
  };
  wakeTime: {
    hour: number;
    randomizationMinutes: number;
    step: number;
  };
  walks: {
    stepsPerMinute: number;
    dispersion: number;
    durationMinutes: number;
    frequencyPerWeek: number;
  };
  runs: {
    stepsPerMinute: number;
    dispersion: number;
    durationMinutes: number;
    frequencyPerWeek: number;
  };
  sleepStepsPerHour: number;
}

export const NEW_ARCHETYPES: Record<string, NewArchetypeConfig> = {
  office: {
    id: 'office',
    name: 'Office Worker',
    description: 'Regular office schedule with randomized sleep/wake times',
    sleepTime: {
      hour: 0,
      randomizationMinutes: 60,
      step: 60,
    },
    wakeTime: {
      hour: 8,
      randomizationMinutes: 60,
      step: 60,
    },
    walks: {
      stepsPerMinute: 110,
      dispersion: 10,
      durationMinutes: 10,
      frequencyPerWeek: 7,
    },
    runs: {
      stepsPerMinute: 150,
      dispersion: 15,
      durationMinutes: 10,
      frequencyPerWeek: 3,
    },
    sleepStepsPerHour: 0,
  },
  shift: {
    id: 'shift',
    name: 'Night Shift Worker',
    description: 'Night shift schedule with daytime sleep',
    sleepTime: {
      hour: 9,
      randomizationMinutes: 60,
      step: 60,
    },
    wakeTime: {
      hour: 17,
      randomizationMinutes: 60,
      step: 60,
    },
    walks: {
      stepsPerMinute: 110,
      dispersion: 10,
      durationMinutes: 10,
      frequencyPerWeek: 7,
    },
    runs: {
      stepsPerMinute: 150,
      dispersion: 15,
      durationMinutes: 10,
      frequencyPerWeek: 3,
    },
    sleepStepsPerHour: 0,
  },
};

export function getNewArchetype(id: string): NewArchetypeConfig {
  return NEW_ARCHETYPES[id] || NEW_ARCHETYPES.office;
}

/**
 * Get activity level for a specific hour (compatibility with old archetype system)
 * This is needed by useTimer.ts which expects the old schedule format
 */
export function getActivityForHour(archetype: NewArchetypeConfig, hour: number): { level: number } {
  // During sleep hours, activity level is 0
  const isSleeping =
    archetype.sleepTime.hour < archetype.wakeTime.hour
      ? (hour >= archetype.sleepTime.hour && hour < archetype.wakeTime.hour)
      : (hour >= archetype.sleepTime.hour || hour < archetype.wakeTime.hour);

  if (isSleeping) {
    return { level: 0 }; // SLEEPING
  }

  // During awake hours, default to idle (level 1)
  // The actual walk/run activities are handled by StepGenerator's daily planning
  return { level: 1 }; // IDLE
}
