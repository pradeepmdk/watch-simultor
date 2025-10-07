/**
 * Simulator.js - Main Simulation Orchestrator
 *
 * Purpose: Coordinates the entire simulation
 * - Creates and manages Device instance
 * - Manages SimulationTimer (wall time clock)
 * - Bridges wall time to device time
 * - Provides unified control interface
 */

import { Device } from '../device/Device';
import { SimulationTimer } from './SimulationTimer';

export class Simulator {
  constructor(config = {}) {
    const {
      startDate,
      archetype = 'office',
      speed = 1,
      duration = 7, // days
    } = config;

    this.config = {
      startDate: startDate || new Date(),
      archetype,
      speed,
      duration,
    };

    // Create device instance
    this.device = new Device({
      startDate: this.config.startDate,
      archetype: this.config.archetype,
    });

    // Create simulation timer (wall time adapter)
    this.simulationTimer = new SimulationTimer(this.config.speed);

    // Connect simulation timer to device
    this.simulationTimer.setTickCallback((deltaMs) => {
      this.device.tick(deltaMs);
    });

    // Event listeners
    this.listeners = new Map([
      ['NEW_SECOND', new Set()],
      ['NEW_MINUTE', new Set()],
      ['NEW_STEP', new Set()],
      ['NEW_STATE', new Set()],
    ]);

    // Forward device events to simulator listeners
    this.setupEventForwarding();

    // Progress tracking
    this.simulatedStartTime = this.config.startDate.getTime();
    this.totalDurationMs = this.config.duration * 24 * 60 * 60 * 1000;
  }

  /**
   * Setup event forwarding from Device to Simulator
   * @private
   */
  setupEventForwarding() {
    const eventTypes = ['NEW_SECOND', 'NEW_MINUTE', 'NEW_STEP', 'NEW_STATE'];

    eventTypes.forEach(eventType => {
      this.device.addEventListener(eventType, (event) => {
        // Forward to simulator listeners
        this.emitEvent(event);

        // Check for auto-stop
        if (this.shouldAutoStop()) {
          this.pause();
          this.emitEvent({
            type: 'SIMULATION_COMPLETE',
            timestamp: Date.now(),
            simulatedTime: this.device.getCurrentTime(),
            data: {
              duration: this.config.duration,
              totalSteps: this.device.getTotalSteps(),
            }
          });
        }
      });
    });
  }

  /**
   * Start the simulation
   */
  start() {
    this.simulationTimer.start();
  }

  /**
   * Pause the simulation
   */
  pause() {
    this.simulationTimer.pause();
  }

  /**
   * Reset the simulation
   * @param {Object} newConfig - Optional new configuration
   */
  reset(newConfig = {}) {
    this.pause();

    // Merge new config with existing
    this.config = { ...this.config, ...newConfig };

    // Reset device
    this.device.reset(this.config.startDate);
    if (newConfig.archetype) {
      this.device.setArchetype(newConfig.archetype);
    }

    // Reset simulation timer
    this.simulationTimer.reset();
    if (newConfig.speed) {
      this.simulationTimer.setSpeed(newConfig.speed);
    }

    // Reset progress tracking
    this.simulatedStartTime = this.config.startDate.getTime();
    this.totalDurationMs = this.config.duration * 24 * 60 * 60 * 1000;
  }

  /**
   * Set simulation speed (1-1000)
   * @param {number} speed - Speed multiplier
   */
  setSpeed(speed) {
    this.config.speed = speed;
    this.simulationTimer.setSpeed(speed);
  }

  /**
   * Get current simulation speed
   * @returns {number} Speed multiplier
   */
  getSpeed() {
    return this.simulationTimer.getSpeed();
  }

  /**
   * Set user archetype
   * @param {string} archetypeId - Archetype identifier
   */
  setArchetype(archetypeId) {
    this.config.archetype = archetypeId;
    this.device.setArchetype(archetypeId);
  }

  /**
   * Get simulation progress (0-100)
   * @returns {number} Progress percentage
   */
  getProgress() {
    const currentTime = this.device.getCurrentTime();
    const elapsedMs = currentTime.getTime() - this.simulatedStartTime;
    return Math.min(100, (elapsedMs / this.totalDurationMs) * 100);
  }

  /**
   * Check if simulation should auto-stop
   * @private
   * @returns {boolean} Should stop
   */
  shouldAutoStop() {
    return this.getProgress() >= 100 && this.simulationTimer.getIsRunning();
  }

  /**
   * Get current simulation state
   * @returns {Object} State object
   */
  getState() {
    return {
      isRunning: this.simulationTimer.getIsRunning(),
      speed: this.simulationTimer.getSpeed(),
      progress: this.getProgress(),
      currentTime: this.device.getCurrentTime(),
      rtc: this.device.getRTC(),
      totalSteps: this.device.getTotalSteps(),
      deviceState: this.device.getCurrentState(),
      archetype: this.config.archetype,
      duration: this.config.duration,
    };
  }

  /**
   * Get device RTC
   * @returns {Object} RTC time components
   */
  getRTC() {
    return this.device.getRTC();
  }

  /**
   * Get current device time
   * @returns {Date} Current device time
   */
  getCurrentTime() {
    return this.device.getCurrentTime();
  }

  /**
   * Get hourly step distribution
   * @returns {Array} Distribution data
   */
  getHourlyDistribution() {
    return this.device.getHourlyDistribution();
  }

  /**
   * Subscribe to simulation events
   * @param {string} eventType - Event type
   * @param {Function} listener - Callback function
   */
  addEventListener(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    } else {
      // Create new listener set for custom events
      this.listeners.set(eventType, new Set([listener]));
    }
  }

  /**
   * Unsubscribe from simulation events
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
          console.error(`Error in simulator event listener for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Clean up simulation resources
   */
  destroy() {
    this.pause();
    this.device.destroy();
    this.simulationTimer.destroy();
    this.listeners.forEach(set => set.clear());
  }
}
