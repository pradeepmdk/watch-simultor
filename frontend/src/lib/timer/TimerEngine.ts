/**
 * Timer Engine - Milestone 2
 * Implements adjustable speed timer with RTC simulation
 * Emits NEW_SECOND and NEW_MINUTE interrupts
 */

import { TimerEvent, RTCTime, EventListener } from './types';

export class TimerEngine {
  private isRunning: boolean = false;
  private speed: number = 1;
  private currentTime: Date;
  private realStartTime: number = 0;
  private simulatedStartTime: number = 0;
  private lastSecond: number = 0;
  private lastMinute: number = 0;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;

  private listeners: Map<string, Set<EventListener>> = new Map([
    ['NEW_SECOND', new Set()],
    ['NEW_MINUTE', new Set()],
    ['NEW_STEP', new Set()],
    ['NEW_STATE', new Set()],
  ]);

  constructor(startDate?: Date) {
    this.currentTime = startDate || new Date();
    this.lastSecond = this.currentTime.getSeconds();
    this.lastMinute = this.currentTime.getMinutes();
  }

  /**
   * Start the timer
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.realStartTime = performance.now();
    this.simulatedStartTime = this.currentTime.getTime();
    this.lastFrameTime = this.realStartTime;
    this.tick();
  }

  /**
   * Pause the timer
   */
  pause(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Reset the timer to a new start time
   */
  reset(startDate?: Date): void {
    this.pause();
    this.currentTime = startDate || new Date();
    this.lastSecond = this.currentTime.getSeconds();
    this.lastMinute = this.currentTime.getMinutes();
  }

  /**
   * Set playback speed (1-1000)
   */
  setSpeed(speed: number): void {
    if (speed < 1 || speed > 1000) {
      console.warn('Speed must be between 1 and 1000');
      return;
    }
    this.speed = speed;
  }

  /**
   * Get current playback speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Main tick loop using requestAnimationFrame for smooth operation
   */
  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const realDeltaMs = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate simulated time delta based on speed
    const simulatedDeltaMs = realDeltaMs * this.speed;

    // Update current simulated time
    const newSimulatedTime = this.currentTime.getTime() + simulatedDeltaMs;
    this.currentTime = new Date(newSimulatedTime);

    // Check for second boundary crossing
    const currentSecond = this.currentTime.getSeconds();
    if (currentSecond !== this.lastSecond) {
      this.emitEvent({
        type: 'NEW_SECOND',
        timestamp: Date.now(),
        simulatedTime: new Date(this.currentTime),
        data: { second: currentSecond }
      });
      this.lastSecond = currentSecond;
    }

    // Check for minute boundary crossing
    const currentMinute = this.currentTime.getMinutes();
    if (currentMinute !== this.lastMinute) {
      this.emitEvent({
        type: 'NEW_MINUTE',
        timestamp: Date.now(),
        simulatedTime: new Date(this.currentTime),
        data: { minute: currentMinute }
      });
      this.lastMinute = currentMinute;
    }

    // Schedule next tick
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * RTC API: Get current simulated time
   */
  getRTC(): RTCTime {
    return {
      year: this.currentTime.getFullYear(),
      month: this.currentTime.getMonth() + 1, // 1-12
      day: this.currentTime.getDate(),
      hour: this.currentTime.getHours(),
      minute: this.currentTime.getMinutes(),
      second: this.currentTime.getSeconds(),
      millisecond: this.currentTime.getMilliseconds(),
      dayOfWeek: this.currentTime.getDay(), // 0-6
    };
  }

  /**
   * Get current simulated time as Date object
   */
  getCurrentTime(): Date {
    return new Date(this.currentTime);
  }

  /**
   * Get current simulated time as ISO string
   */
  getCurrentTimeISO(): string {
    return this.currentTime.toISOString();
  }

  /**
   * Get elapsed simulated time in milliseconds
   */
  getElapsedSimulatedMs(): number {
    return this.currentTime.getTime() - this.simulatedStartTime;
  }

  /**
   * Get elapsed real time in milliseconds
   */
  getElapsedRealMs(): number {
    if (!this.isRunning) return 0;
    return performance.now() - this.realStartTime;
  }

  /**
   * Check if timer is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Subscribe to timer events
   */
  addEventListener(eventType: 'NEW_SECOND' | 'NEW_MINUTE' | 'NEW_STEP' | 'NEW_STATE', listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unsubscribe from timer events
   */
  removeEventListener(eventType: 'NEW_SECOND' | 'NEW_MINUTE' | 'NEW_STEP' | 'NEW_STATE', listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(event: TimerEvent): void {
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
  destroy(): void {
    this.pause();
    this.listeners.forEach(set => set.clear());
  }
}
