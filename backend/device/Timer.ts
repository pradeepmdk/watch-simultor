/**
 * Timer.js - Device Clock Module (Milestone 2)
 *
 * Purpose: Maintains the simulated device's internal clock
 * - Emits NEW_SECOND and NEW_MINUTE interrupts
 * - Provides RTC (Real-Time Clock) API
 * - Independent of wall time - driven by simulation frames
 *
 * Key Concept: This represents the device's internal clock, not wall time.
 * It receives tick signals and maintains consistent 100ms device time increments.
 */

export class Timer {
  constructor(startDate = new Date()) {
    this.currentTime = new Date(startDate);
    this.lastSecond = this.currentTime.getSeconds();
    this.lastMinute = this.currentTime.getMinutes();
    this.accumulatedMs = 0; // Track accumulated milliseconds for 100ms chunks
    this.listeners = new Map([
      ['NEW_SECOND', new Set()],
      ['NEW_MINUTE', new Set()],
    ]);
  }

  /**
   * Advance device time by specified milliseconds
   * Called by SimulationTimer based on speed multiplier
   * Processes time in consistent 100ms chunks
   *
   * @param {number} deltaMs - Milliseconds to advance (simulated time)
   */
  tick(deltaMs) {
    // Accumulate incoming time delta
    this.accumulatedMs += deltaMs;

    // Process in 100ms chunks to maintain consistent device behavior
    const TICK_INTERVAL_MS = 100;

    while (this.accumulatedMs >= TICK_INTERVAL_MS) {
      // Advance device time by exactly 100ms
      const newTime = this.currentTime.getTime() + TICK_INTERVAL_MS;
      this.currentTime = new Date(newTime);
      this.accumulatedMs -= TICK_INTERVAL_MS;

      // Check for second boundary crossing
      const currentSecond = this.currentTime.getSeconds();
      if (currentSecond !== this.lastSecond) {
        this.emitEvent({
          type: 'NEW_SECOND',
          timestamp: Date.now(), // Wall time
          simulatedTime: new Date(this.currentTime), // Device time
          data: { second: currentSecond }
        });
        this.lastSecond = currentSecond;
      }

      // Check for minute boundary crossing
      const currentMinute = this.currentTime.getMinutes();
      if (currentMinute !== this.lastMinute) {
        this.emitEvent({
          type: 'NEW_MINUTE',
          timestamp: Date.now(), // Wall time
          simulatedTime: new Date(this.currentTime), // Device time
          data: { minute: currentMinute }
        });
        this.lastMinute = currentMinute;
      }
    }
  }

  /**
   * RTC API: Get current simulated device time
   * @returns {Object} Time components (year, month, day, hour, minute, second, etc.)
   */
  getRTC() {
    return {
      year: this.currentTime.getFullYear(),
      month: this.currentTime.getMonth() + 1, // 1-12
      day: this.currentTime.getDate(),
      hour: this.currentTime.getHours(),
      minute: this.currentTime.getMinutes(),
      second: this.currentTime.getSeconds(),
      millisecond: this.currentTime.getMilliseconds(),
      dayOfWeek: this.currentTime.getDay(), // 0-6 (Sunday=0)
    };
  }

  /**
   * Get current device time as Date object
   * @returns {Date} Current simulated time
   */
  getCurrentTime() {
    return new Date(this.currentTime);
  }

  /**
   * Get current device time as ISO string
   * @returns {string} ISO formatted time string
   */
  getCurrentTimeISO() {
    return this.currentTime.toISOString();
  }

  /**
   * Reset timer to a new start time
   * @param {Date} startDate - New start date
   */
  reset(startDate = new Date()) {
    this.currentTime = new Date(startDate);
    this.lastSecond = this.currentTime.getSeconds();
    this.lastMinute = this.currentTime.getMinutes();
    this.accumulatedMs = 0;
  }

  /**
   * Subscribe to timer events
   * @param {string} eventType - 'NEW_SECOND' or 'NEW_MINUTE'
   * @param {Function} listener - Callback function
   */
  addEventListener(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unsubscribe from timer events
   * @param {string} eventType - 'NEW_SECOND' or 'NEW_MINUTE'
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
