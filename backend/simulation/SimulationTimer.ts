/**
 * SimulationTimer.js - Wall Time Adapter
 *
 * Purpose: Converts wall time to simulation time based on speed multiplier
 * - Manages the simulation clock (wall time)
 * - Applies speed multiplier (1x to 1000x)
 * - Handles frame skipping for high speeds (>20x)
 * - Provides tick signals to Device
 *
 * Key Concept: This is NOT device time - it's the simulation engine's clock
 * that drives the device at accelerated speeds.
 */

export class SimulationTimer {
  constructor(speedMultiplier = 1) {
    this.speed = speedMultiplier; // 1-1000
    this.isRunning = false;
    this.animationFrameId = null;
    this.timeoutId = null;
    this.lastFrameTime = 0;
    this.realStartTime = 0;
    this.simulatedElapsedMs = 0;
    this.frameIndex = 0; // Track frame count for high-speed optimization

    // Callback to notify device of time progression
    this.onTick = null;
  }

  /**
   * Set callback for tick events
   * @param {Function} callback - Function to call with (deltaMs) on each tick
   */
  setTickCallback(callback) {
    this.onTick = callback;
  }

  /**
   * Start the simulation timer
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.realStartTime = performance.now();
    this.lastFrameTime = this.realStartTime;
    this.tick();
  }

  /**
   * Pause the simulation timer
   */
  pause() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Set speed multiplier (1-1000)
   * @param {number} speed - Speed multiplier
   */
  setSpeed(speed) {
    if (speed < 1 || speed > 1000) {
      console.warn('Speed must be between 1 and 1000');
      return;
    }
    this.speed = speed;
  }

  /**
   * Get current speed multiplier
   * @returns {number} Current speed
   */
  getSpeed() {
    return this.speed;
  }

  /**
   * Get elapsed simulated time in milliseconds
   * @returns {number} Simulated time elapsed
   */
  getElapsedSimulatedMs() {
    return this.simulatedElapsedMs;
  }

  /**
   * Get elapsed real time in milliseconds
   * @returns {number} Real time elapsed
   */
  getElapsedRealMs() {
    if (!this.isRunning) return 0;
    return performance.now() - this.realStartTime;
  }

  /**
   * Check if timer is running
   * @returns {boolean} Running state
   */
  getIsRunning() {
    return this.isRunning;
  }

  /**
   * Main tick loop with high-speed optimization
   * Converts wall time to simulated time based on speed
   * Uses frame skipping and minimum delay for speeds >20x
   * @private
   */
  tick = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const realDeltaMs = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate simulated time delta based on speed
    const simulatedDeltaMs = realDeltaMs * this.speed;
    this.simulatedElapsedMs += simulatedDeltaMs;

    // Increment frame index for high-speed tracking
    this.frameIndex++;

    // Notify device about time progression
    if (this.onTick) {
      this.onTick(simulatedDeltaMs);
    }

    // High-speed optimization: Use setTimeout with 5ms minimum delay for speeds >20x
    // This prevents animation freeze while allowing fast simulation
    if (this.speed > 20) {
      this.timeoutId = setTimeout(this.tick, 5);
    } else {
      // For normal speeds (1x-20x), use requestAnimationFrame for smooth animation
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  };

  /**
   * Reset the simulation timer
   */
  reset() {
    this.pause();
    this.simulatedElapsedMs = 0;
    this.lastFrameTime = 0;
    this.realStartTime = 0;
    this.frameIndex = 0;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.pause();
    this.onTick = null;
  }
}
