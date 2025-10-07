/**
 * Step Generator - Milestone 3 & 4
 * Generates step events based on archetype, time, and device state
 */

import {
  ArchetypeDefinition,
  getArchetype,
  getActivityForHour,
  STEP_RATES,
  ACTIVITY_MULTIPLIERS,
} from './archetypes';
import { TimerEvent } from '../timer/types';
import { DeviceState } from '../state/types';

export interface StepData {
  steps: number;
  totalSteps: number;
  stepsThisMinute: number;
  stepsThisHour: number;
  activityType: 'walking' | 'jogging';
  activityLevel: string;
  deviceState?: DeviceState; // Added for Milestone 4
  stateMultiplier?: number; // Added for Milestone 4
}

export class StepGenerator {
  private archetype: ArchetypeDefinition;
  private totalSteps: number = 0;
  private stepsThisMinute: number = 0;
  private stepsThisHour: number = 0;
  private lastMinute: number = -1;
  private lastHour: number = -1;
  private lastSecond: number = -1;
  private accumulatedSteps: number = 0; // For sub-step accumulation

  constructor(archetypeId: string = 'office') {
    this.archetype = getArchetype(archetypeId);
  }

  /**
   * Set new archetype
   */
  setArchetype(archetypeId: string): void {
    this.archetype = getArchetype(archetypeId);
    this.reset();
  }

  /**
   * Reset step counters
   */
  reset(): void {
    this.totalSteps = 0;
    this.stepsThisMinute = 0;
    this.stepsThisHour = 0;
    this.lastMinute = -1;
    this.lastHour = -1;
    this.lastSecond = -1;
    this.accumulatedSteps = 0;
  }

  /**
   * Calculate steps for the current time (with optional state modulation)
   * Returns number of steps generated since last call
   */
  calculateSteps(
    currentTime: Date,
    deltaSeconds: number,
    stateMultiplier: number = 1.0,
    deviceState?: DeviceState
  ): StepData | null {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const second = currentTime.getSeconds();

    // Get activity for current hour
    const activity = getActivityForHour(this.archetype, hour);

    // Check if we should generate steps (based on probability)
    const shouldGenerateSteps = Math.random() < activity.probability;

    if (!shouldGenerateSteps || activity.level === 'sleep') {
      return null;
    }

    // Reset hourly counter on hour change
    if (hour !== this.lastHour) {
      this.stepsThisHour = 0;
      this.lastHour = hour;
    }

    // Reset minute counter on minute change
    if (minute !== this.lastMinute) {
      this.stepsThisMinute = 0;
      this.lastMinute = minute;
    }

    // Calculate steps based on activity
    const baseStepsPerSecond = STEP_RATES[activity.type] / 60; // steps per second
    const activityMultiplier = ACTIVITY_MULTIPLIERS[activity.level];

    // Apply state multiplier (Milestone 4)
    const stepsPerSecond = baseStepsPerSecond * activityMultiplier * stateMultiplier;

    // Accumulate fractional steps
    this.accumulatedSteps += stepsPerSecond * deltaSeconds;

    // Only emit when we have at least 1 whole step
    if (this.accumulatedSteps >= 1) {
      const steps = Math.floor(this.accumulatedSteps);
      this.accumulatedSteps -= steps; // Keep fractional part

      this.totalSteps += steps;
      this.stepsThisMinute += steps;
      this.stepsThisHour += steps;

      return {
        steps,
        totalSteps: this.totalSteps,
        stepsThisMinute: this.stepsThisMinute,
        stepsThisHour: this.stepsThisHour,
        activityType: activity.type,
        activityLevel: activity.level,
        deviceState,
        stateMultiplier,
      };
    }

    return null;
  }

  /**
   * Get current archetype
   */
  getArchetype(): ArchetypeDefinition {
    return this.archetype;
  }

  /**
   * Get total steps
   */
  getTotalSteps(): number {
    return this.totalSteps;
  }

  /**
   * Get steps for specific hour (for visualization)
   */
  getStepsForHour(hour: number): number {
    const activity = getActivityForHour(this.archetype, hour);
    const baseStepsPerMinute = STEP_RATES[activity.type];
    const activityMultiplier = ACTIVITY_MULTIPLIERS[activity.level];
    const minutesActive = 60 * activity.probability;

    return Math.floor(baseStepsPerMinute * activityMultiplier * minutesActive);
  }

  /**
   * Get expected daily steps for visualization
   */
  getExpectedDailySteps(): number {
    let total = 0;
    for (let hour = 0; hour < 24; hour++) {
      total += this.getStepsForHour(hour);
    }
    return total;
  }

  /**
   * Get hourly step distribution for charts
   */
  getHourlyDistribution(): { hour: number; steps: number }[] {
    const distribution = [];
    for (let hour = 0; hour < 24; hour++) {
      distribution.push({
        hour,
        steps: this.getStepsForHour(hour),
      });
    }
    return distribution;
  }
}
