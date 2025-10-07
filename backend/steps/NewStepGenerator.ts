/**
 * StepGenerator - Redesigned for continuous day-by-day generation
 *
 * Features:
 * - Continuous, potentially endless generation
 * - Daily activity planning (walks and runs scheduled at day start)
 * - Sleep/wake time randomization (±1 hour)
 * - Two activity peaks: walks (110 steps/min) and runs (150 steps/min)
 * - Zero steps during sleep hours
 */

import { NewArchetypeConfig, getNewArchetype } from './archetypes_new';

interface ActivityBlock {
  type: 'walk' | 'run';
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  stepsPerMinute: number;
}

interface DailyPlan {
  date: string; // YYYY-MM-DD
  sleepHour: number; // Randomized sleep time
  wakeHour: number; // Randomized wake time
  activities: ActivityBlock[]; // Scheduled walks and runs
}

export class NewStepGenerator {
  private archetype: NewArchetypeConfig;
  private currentPlan: DailyPlan | null = null;
  private lastDate: string = '';
  private currentDayOfWeek: number = 0; // 0 = Sunday, 6 = Saturday
  private totalSteps: number = 0;
  private stepsThisMinute: number = 0;
  private lastMinute: number = -1;
  private accumulatedSteps: number = 0;

  constructor(archetypeId: string = 'office') {
    this.archetype = getNewArchetype(archetypeId);
  }

  /**
   * Plan activities for the next day
   * Called when a new day starts
   */
  private planDailyActivities(currentDate: Date): DailyPlan {
    const dateStr = this.formatDate(currentDate);

    // Randomize sleep and wake times (discrete steps)
    const sleepHour = this.randomizeTime(
      this.archetype.sleepTime.hour,
      this.archetype.sleepTime.randomizationMinutes,
      this.archetype.sleepTime.step
    );

    const wakeHour = this.randomizeTime(
      this.archetype.wakeTime.hour,
      this.archetype.wakeTime.randomizationMinutes,
      this.archetype.wakeTime.step
    );

    // Calculate awake hours
    const activities: ActivityBlock[] = [];

    // Determine if we should have walks today (based on weekly frequency)
    const shouldWalk = Math.random() < (this.archetype.walks.frequencyPerWeek / 7);
    if (shouldWalk) {
      // Schedule walks randomly during awake hours
      const numWalks = 1 + Math.floor(Math.random() * 3); // 1-3 walks per day
      for (let i = 0; i < numWalks; i++) {
        const walkTime = this.getRandomAwakeTime(wakeHour, sleepHour);
        activities.push({
          type: 'walk',
          startHour: walkTime.hour,
          startMinute: walkTime.minute,
          durationMinutes: this.archetype.walks.durationMinutes,
          stepsPerMinute: this.getStepsWithDispersion(
            this.archetype.walks.stepsPerMinute,
            this.archetype.walks.dispersion
          ),
        });
      }
    }

    // Determine if we should have runs today (2-3 times per week)
    const shouldRun = Math.random() < (this.archetype.runs.frequencyPerWeek / 7);
    if (shouldRun) {
      const runTime = this.getRandomAwakeTime(wakeHour, sleepHour);
      activities.push({
        type: 'run',
        startHour: runTime.hour,
        startMinute: runTime.minute,
        durationMinutes: this.archetype.runs.durationMinutes,
        stepsPerMinute: this.getStepsWithDispersion(
          this.archetype.runs.stepsPerMinute,
          this.archetype.runs.dispersion
        ),
      });
    }

    // Sort activities by time
    activities.sort((a, b) => {
      const aTime = a.startHour * 60 + a.startMinute;
      const bTime = b.startHour * 60 + b.startMinute;
      return aTime - bTime;
    });

    return {
      date: dateStr,
      sleepHour,
      wakeHour,
      activities,
    };
  }

  /**
   * Randomize time within specified range with discrete steps
   */
  private randomizeTime(baseHour: number, randomizationMinutes: number, stepMinutes: number): number {
    const maxSteps = Math.floor(randomizationMinutes / stepMinutes);
    const steps = Math.floor(Math.random() * (2 * maxSteps + 1)) - maxSteps; // -maxSteps to +maxSteps
    const offsetMinutes = steps * stepMinutes;
    const totalMinutes = baseHour * 60 + offsetMinutes;

    // Wrap around 24 hours
    return Math.floor((totalMinutes + 24 * 60) % (24 * 60) / 60);
  }

  /**
   * Get random time during awake hours
   */
  private getRandomAwakeTime(wakeHour: number, sleepHour: number): { hour: number; minute: number } {
    // Calculate awake hours range
    let awakeHours: number;
    if (sleepHour > wakeHour) {
      awakeHours = sleepHour - wakeHour;
    } else {
      awakeHours = (24 - wakeHour) + sleepHour;
    }

    // Random minute within awake period
    const randomMinute = Math.floor(Math.random() * (awakeHours * 60));
    const totalMinutes = wakeHour * 60 + randomMinute;

    return {
      hour: Math.floor(totalMinutes / 60) % 24,
      minute: totalMinutes % 60,
    };
  }

  /**
   * Apply dispersion to steps per minute
   */
  private getStepsWithDispersion(baseSteps: number, dispersion: number): number {
    const randomFactor = (Math.random() * 2 - 1) * dispersion; // -dispersion to +dispersion
    return Math.round(baseSteps + randomFactor);
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Check if currently in sleep period
   */
  private isSleeping(hour: number, sleepHour: number, wakeHour: number): boolean {
    if (sleepHour < wakeHour) {
      // Normal case: sleep 0-8, awake 8-24
      return hour >= sleepHour && hour < wakeHour;
    } else {
      // Night shift: sleep 9-17, awake 17-9
      return hour >= sleepHour || hour < wakeHour;
    }
  }

  /**
   * Find active activity block for current time
   */
  private getActiveActivity(hour: number, minute: number): ActivityBlock | null {
    if (!this.currentPlan) return null;

    const currentMinutes = hour * 60 + minute;

    for (const activity of this.currentPlan.activities) {
      const activityStart = activity.startHour * 60 + activity.startMinute;
      const activityEnd = activityStart + activity.durationMinutes;

      if (currentMinutes >= activityStart && currentMinutes < activityEnd) {
        return activity;
      }
    }

    return null;
  }

  /**
   * Calculate steps for current time
   * Returns step data or null if no steps this tick
   */
  calculateSteps(currentTime: Date, deltaSeconds: number): {
    steps: number;
    totalSteps: number;
    stepsThisMinute: number;
    activityType: 'walk' | 'run' | 'sleep' | 'idle';
    stepsPerMinute?: number;
  } | null {
    const dateStr = this.formatDate(currentTime);
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    // DEBUG: Log every call
    if (Math.random() < 0.001) { // Log ~0.1% of calls to avoid spam
      console.log(`DEBUG calculateSteps called: ${dateStr} ${hour}:${minute}, lastDate=${this.lastDate}`);
    }

    // Check if we need to plan a new day
    if (dateStr !== this.lastDate) {
      console.log(`🔥 DATE CHANGE DETECTED: ${this.lastDate} -> ${dateStr}`);
      this.currentPlan = this.planDailyActivities(currentTime);
      this.lastDate = dateStr;
      this.currentDayOfWeek = currentTime.getDay();

      console.log(`📅 New day planned: ${dateStr}`);
      console.log(`  Sleep: ${this.currentPlan.sleepHour}:00, Wake: ${this.currentPlan.wakeHour}:00`);
      console.log(`  Activities: ${this.currentPlan.activities.length} (${this.currentPlan.activities.map(a => a.type).join(', ')})`);
    }

    // Reset minute counter
    if (minute !== this.lastMinute) {
      this.stepsThisMinute = 0;
      this.lastMinute = minute;
    }

    // Check if sleeping
    if (this.isSleeping(hour, this.currentPlan!.sleepHour, this.currentPlan!.wakeHour)) {
      return null; // Zero steps during sleep
    }

    // Check for active activity (walk or run)
    const activity = this.getActiveActivity(hour, minute);

    if (activity) {
      // Generate steps for walk or run
      const stepsPerSecond = activity.stepsPerMinute / 60;
      this.accumulatedSteps += stepsPerSecond * deltaSeconds;

      if (this.accumulatedSteps >= 1) {
        const steps = Math.floor(this.accumulatedSteps);
        this.accumulatedSteps -= steps;

        this.totalSteps += steps;
        this.stepsThisMinute += steps;

        return {
          steps,
          totalSteps: this.totalSteps,
          stepsThisMinute: this.stepsThisMinute,
          activityType: activity.type,
          stepsPerMinute: activity.stepsPerMinute,
        };
      }
    }

    return null;
  }

  /**
   * Get current daily plan (for debugging/visualization)
   */
  getCurrentPlan(): DailyPlan | null {
    return this.currentPlan;
  }

  /**
   * Get total steps
   */
  getTotalSteps(): number {
    return this.totalSteps;
  }

  /**
   * Reset generator
   */
  reset(): void {
    this.currentPlan = null;
    this.lastDate = '';
    this.totalSteps = 0;
    this.stepsThisMinute = 0;
    this.lastMinute = -1;
    this.accumulatedSteps = 0;
  }

  /**
   * Set archetype
   */
  setArchetype(archetypeId: string): void {
    this.archetype = getNewArchetype(archetypeId);
    this.reset();
  }

  /**
   * Get archetype info
   */
  getArchetype(): NewArchetypeConfig {
    return this.archetype;
  }
}
