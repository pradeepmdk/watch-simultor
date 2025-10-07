/**
 * Device.js - Device Orchestrator
 *
 * Purpose: Main device controller that orchestrates Timer and Sensor
 * - Coordinates device clock and sensor behavior
 * - Provides unified interface for simulation control
 * - Manages event aggregation from Timer and Sensor
 */

import { Timer } from './Timer';
import { Sensor } from './Sensor';

export class Device {
  constructor(config = {}) {
    const { startDate, archetype = 'office' } = config;

    // Initialize device components
    this.timer = new Timer(startDate);
    this.sensor = new Sensor(archetype);

    // Event aggregation
    this.listeners = new Map([
      ['NEW_SECOND', new Set()],
      ['NEW_MINUTE', new Set()],
      ['NEW_STEP', new Set()],
      ['NEW_STATE', new Set()],
    ]);

    // Connect device components
    this.setupEventForwarding();
  }

  /**
   * Setup event forwarding from Timer and Sensor to Device
   * @private
   */
  setupEventForwarding() {
    // Forward timer events
    this.timer.addEventListener('NEW_SECOND', (event) => {
      // Process sensor on each second tick
      const deltaSeconds = 1; // Fixed 1-second delta for consistent behavior
      this.sensor.processTick(event.simulatedTime, deltaSeconds);

      // Forward the event
      this.emitEvent(event);
    });

    this.timer.addEventListener('NEW_MINUTE', (event) => {
      this.emitEvent(event);
    });

    // Forward sensor events
    this.sensor.addEventListener('NEW_STEP', (event) => {
      this.emitEvent(event);
    });

    this.sensor.addEventListener('NEW_STATE', (event) => {
      this.emitEvent(event);
    });
  }

  /**
   * Receive tick signal from SimulationTimer
   * @param {number} deltaMs - Milliseconds to advance device time
   */
  tick(deltaMs) {
    this.timer.tick(deltaMs);
  }

  /**
   * Get device RTC (Real-Time Clock)
   * @returns {Object} Time components
   */
  getRTC() {
    return this.timer.getRTC();
  }

  /**
   * Get current device time
   * @returns {Date} Current device time
   */
  getCurrentTime() {
    return this.timer.getCurrentTime();
  }

  /**
   * Get current device time as ISO string
   * @returns {string} ISO formatted time
   */
  getCurrentTimeISO() {
    return this.timer.getCurrentTimeISO();
  }

  /**
   * Set user archetype (office, gym, flexible, etc.)
   * @param {string} archetypeId - Archetype identifier
   */
  setArchetype(archetypeId) {
    this.sensor.setArchetype(archetypeId);
  }

  /**
   * Get current archetype
   * @returns {Object} Archetype definition
   */
  getArchetype() {
    return this.sensor.getArchetype();
  }

  /**
   * Get total steps accumulated
   * @returns {number} Total steps
   */
  getTotalSteps() {
    return this.sensor.getTotalSteps();
  }

  /**
   * Get current device state
   * @returns {string} Current state (IDLE, ACTIVE, SLEEP, etc.)
   */
  getCurrentState() {
    return this.sensor.getCurrentState();
  }

  /**
   * Get hourly step distribution
   * @returns {Array} Array of {hour, steps} objects
   */
  getHourlyDistribution() {
    return this.sensor.getHourlyDistribution();
  }

  /**
   * Get expected daily steps
   * @returns {number} Expected daily steps
   */
  getExpectedDailySteps() {
    return this.sensor.getExpectedDailySteps();
  }

  /**
   * Reset device to initial state
   * @param {Date} startDate - New start date (optional)
   */
  reset(startDate) {
    this.timer.reset(startDate);
    this.sensor.reset();
  }

  /**
   * Subscribe to device events
   * @param {string} eventType - Event type
   * @param {Function} listener - Callback function
   */
  addEventListener(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unsubscribe from device events
   * @param {string} eventType - Event type
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
          console.error(`Error in device event listener for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Clean up device resources
   */
  destroy() {
    this.timer.destroy();
    this.sensor.destroy();
    this.listeners.forEach(set => set.clear());
  }
}
