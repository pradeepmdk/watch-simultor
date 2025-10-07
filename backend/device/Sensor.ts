/**
 * Sensor.js - User Behavior Simulation Module (Milestone 3 & 4)
 *
 * Purpose: Simulates user behavior and device state
 * - Generates step events based on archetype and time
 * - Manages device state machine (IDLE, ACTIVE, SLEEP, etc.)
 * - Modulates step generation based on device state
 */

import { NewStepGenerator } from '../steps/NewStepGenerator';
import { StateMachine } from '../../frontend/src/lib/state/StateMachine';

export class Sensor {
  constructor(archetype = 'office') {
    this.stepGenerator = new NewStepGenerator(archetype);
    this.stateMachine = new StateMachine('IDLE');
    this.stepsInLastMinute = 0;
    this.lastMinute = -1;
    this.listeners = new Map([
      ['NEW_STEP', new Set()],
      ['NEW_STATE', new Set()],
    ]);
  }

  /**
   * Process a device time tick and generate steps/state changes
   * @param {Date} currentTime - Current device time
   * @param {number} deltaSeconds - Simulated time delta (typically 1 second)
   */
  processTick(currentTime, deltaSeconds) {
    // Calculate steps for this tick using new generator
    const stepData = this.stepGenerator.calculateSteps(currentTime, deltaSeconds);

    if (stepData) {
      // Track steps for state machine
      this.stepsInLastMinute += stepData.steps;

      // Emit step event
      this.emitEvent({
        type: 'NEW_STEP',
        timestamp: Date.now(),
        simulatedTime: new Date(currentTime),
        data: {
          ...stepData,
          deviceState: this.stateMachine.getCurrentState(),
        }
      });
    }

    // Update state machine on minute boundary
    const currentMinute = currentTime.getMinutes();
    if (currentMinute !== this.lastMinute) {
      this.updateStateMachine(currentTime);
      this.stepsInLastMinute = 0;
      this.lastMinute = currentMinute;
    }
  }

  /**
   * Update state machine based on current context
   * @private
   */
  updateStateMachine(currentTime) {
    const hour = currentTime.getHours();
    const plan = this.stepGenerator.getCurrentPlan();

    // Determine activity level based on sleep/wake status
    let activityLevel = 'sedentary';
    if (plan) {
      const isSleeping = this.isSleeping(hour, plan.sleepHour, plan.wakeHour);
      activityLevel = isSleeping ? 'sleep' : (this.stepsInLastMinute > 50 ? 'moderate' : 'sedentary');
    }

    // Build state context
    const context = {
      currentTime,
      hour,
      isNight: hour >= 22 || hour < 6,
      stepsInLastMinute: this.stepsInLastMinute,
      totalSteps: this.stepGenerator.getTotalSteps(),
      activityLevel: activityLevel,
      minutesSinceLastActivity: 0, // Calculated by state machine
    };

    // Update state machine
    const stateTransition = this.stateMachine.update(context);

    // If state changed, emit NEW_STATE event
    if (stateTransition) {
      this.emitEvent({
        type: 'NEW_STATE',
        timestamp: Date.now(),
        simulatedTime: new Date(currentTime),
        data: {
          from: stateTransition.from,
          to: stateTransition.to,
          reason: stateTransition.reason,
          timestamp: stateTransition.timestamp.toISOString(),
        }
      });
    }
  }

  /**
   * Check if currently in sleep period
   * @private
   */
  isSleeping(hour, sleepHour, wakeHour) {
    if (sleepHour < wakeHour) {
      // Normal case: sleep 0-8, awake 8-24
      return hour >= sleepHour && hour < wakeHour;
    } else {
      // Night shift: sleep 9-17, awake 17-9
      return hour >= sleepHour || hour < wakeHour;
    }
  }

  /**
   * Set archetype (office, gym, flexible, etc.)
   * @param {string} archetypeId - Archetype identifier
   */
  setArchetype(archetypeId) {
    this.stepGenerator.setArchetype(archetypeId);
  }

  /**
   * Get current archetype
   * @returns {Object} Archetype definition
   */
  getArchetype() {
    return this.stepGenerator.getArchetype();
  }

  /**
   * Get total steps accumulated
   * @returns {number} Total steps
   */
  getTotalSteps() {
    return this.stepGenerator.getTotalSteps();
  }

  /**
   * Get current device state
   * @returns {string} Current state
   */
  getCurrentState() {
    return this.stateMachine.getCurrentState();
  }

  /**
   * Get current daily plan (for debugging)
   * @returns {Object} Current daily plan
   */
  getCurrentPlan() {
    return this.stepGenerator.getCurrentPlan();
  }

  /**
   * Reset sensor state
   */
  reset() {
    this.stepGenerator.reset();
    this.stateMachine = new StateMachine('IDLE');
    this.stepsInLastMinute = 0;
    this.lastMinute = -1;
  }

  /**
   * Subscribe to sensor events
   * @param {string} eventType - 'NEW_STEP' or 'NEW_STATE'
   * @param {Function} listener - Callback function
   */
  addEventListener(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unsubscribe from sensor events
   * @param {string} eventType - 'NEW_STEP' or 'NEW_STATE'
   * @param {Function} listener - Callback function
   */
  removeEventListener(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event to all registered listeners
   * @private
   */
  emitEvent(event) {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.listeners.forEach(set => set.clear());
  }
}
