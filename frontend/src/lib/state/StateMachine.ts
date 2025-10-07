import {
  DeviceState,
  StateContext,
  StateTransitionRule,
  StateTransitionEvent,
  STATE_CONFIGS,
} from './types';

export class StateMachine {
  private currentState: DeviceState;
  private transitionHistory: StateTransitionEvent[] = [];
  private stepsInLastMinute: number = 0;
  private minutesSinceLastActivity: number = 0;
  private lastActivityCheckTime: Date;

  // Transition rules evaluated in priority order
  private readonly transitionRules: StateTransitionRule[] = [
    // SLEEP transitions (highest priority)
    {
      from: 'SLEEP',
      to: 'ACTIVE',
      priority: 100,
      condition: (ctx) => ctx.stepsInLastMinute > 20 && !ctx.isNight,
    },
    {
      from: 'SLEEP',
      to: 'IDLE',
      priority: 90,
      condition: (ctx) => !ctx.isNight && ctx.stepsInLastMinute === 0,
    },

    // IDLE transitions
    {
      from: 'IDLE',
      to: 'SLEEP',
      priority: 95,
      condition: (ctx) => ctx.isNight && ctx.stepsInLastMinute === 0 && ctx.minutesSinceLastActivity > 30,
    },
    {
      from: 'IDLE',
      to: 'ACTIVE',
      priority: 85,
      condition: (ctx) => ctx.stepsInLastMinute > 30,
    },
    {
      from: 'IDLE',
      to: 'BACKGROUND',
      priority: 80,
      condition: (ctx) => ctx.stepsInLastMinute > 10 && ctx.stepsInLastMinute <= 30,
    },

    // BACKGROUND transitions
    {
      from: 'BACKGROUND',
      to: 'SLEEP',
      priority: 92,
      condition: (ctx) => ctx.isNight && ctx.stepsInLastMinute === 0 && ctx.minutesSinceLastActivity > 30,
    },
    {
      from: 'BACKGROUND',
      to: 'ACTIVE',
      priority: 88,
      condition: (ctx) => ctx.stepsInLastMinute > 50,
    },
    {
      from: 'BACKGROUND',
      to: 'IDLE',
      priority: 75,
      condition: (ctx) => ctx.stepsInLastMinute === 0 && ctx.minutesSinceLastActivity > 5,
    },

    // ACTIVE transitions
    {
      from: 'ACTIVE',
      to: 'SLEEP',
      priority: 93,
      condition: (ctx) => ctx.isNight && ctx.stepsInLastMinute === 0 && ctx.minutesSinceLastActivity > 15,
    },
    {
      from: 'ACTIVE',
      to: 'BACKGROUND',
      priority: 78,
      condition: (ctx) => ctx.stepsInLastMinute > 0 && ctx.stepsInLastMinute < 20,
    },
    {
      from: 'ACTIVE',
      to: 'IDLE',
      priority: 70,
      condition: (ctx) => ctx.stepsInLastMinute === 0 && ctx.minutesSinceLastActivity > 3,
    },
  ];

  constructor(initialState: DeviceState = 'IDLE') {
    this.currentState = initialState;
    this.lastActivityCheckTime = new Date();
  }

  /**
   * Update state based on current context
   */
  public update(context: StateContext): StateTransitionEvent | null {
    // Update internal counters
    this.stepsInLastMinute = context.stepsInLastMinute;

    if (context.stepsInLastMinute > 0) {
      this.minutesSinceLastActivity = 0;
      this.lastActivityCheckTime = context.currentTime;
    } else {
      const timeDiff = context.currentTime.getTime() - this.lastActivityCheckTime.getTime();
      this.minutesSinceLastActivity = Math.floor(timeDiff / 60000);
    }

    // Add computed values to context
    const enrichedContext: StateContext = {
      ...context,
      minutesSinceLastActivity: this.minutesSinceLastActivity,
    };

    // Find applicable transition rules for current state
    const applicableRules = this.transitionRules
      .filter(rule => rule.from === this.currentState)
      .sort((a, b) => b.priority - a.priority); // Highest priority first

    // Evaluate rules in priority order
    for (const rule of applicableRules) {
      if (rule.condition(enrichedContext)) {
        return this.transition(rule.to, this.getTransitionReason(rule, enrichedContext));
      }
    }

    return null; // No transition
  }

  /**
   * Force a state transition
   */
  private transition(newState: DeviceState, reason: string): StateTransitionEvent | null {
    if (newState === this.currentState) {
      return null;
    }

    const event: StateTransitionEvent = {
      from: this.currentState,
      to: newState,
      timestamp: new Date(),
      reason,
    };

    this.currentState = newState;
    this.transitionHistory.push(event);

    // Keep history limited to last 50 transitions
    if (this.transitionHistory.length > 50) {
      this.transitionHistory.shift();
    }

    return event;
  }

  /**
   * Get current state
   */
  public getCurrentState(): DeviceState {
    return this.currentState;
  }

  /**
   * Get current state configuration
   */
  public getCurrentStateConfig() {
    return STATE_CONFIGS[this.currentState];
  }

  /**
   * Get state multiplier for step calculation
   */
  public getStateMultiplier(): number {
    return STATE_CONFIGS[this.currentState].stepMultiplier;
  }

  /**
   * Get transition history
   */
  public getTransitionHistory(): StateTransitionEvent[] {
    return [...this.transitionHistory];
  }

  /**
   * Reset state machine
   */
  public reset(initialState: DeviceState = 'IDLE'): void {
    this.currentState = initialState;
    this.transitionHistory = [];
    this.stepsInLastMinute = 0;
    this.minutesSinceLastActivity = 0;
    this.lastActivityCheckTime = new Date();
  }

  /**
   * Generate human-readable transition reason
   */
  private getTransitionReason(rule: StateTransitionRule, context: StateContext): string {
    const { from, to } = rule;

    // Sleep transitions
    if (to === 'SLEEP') {
      if (context.isNight && context.minutesSinceLastActivity > 15) {
        return `Night time with ${context.minutesSinceLastActivity}min inactivity`;
      }
    }

    // Active transitions
    if (to === 'ACTIVE') {
      if (context.stepsInLastMinute > 50) {
        return `High activity detected (${context.stepsInLastMinute} steps/min)`;
      }
      if (context.stepsInLastMinute > 20) {
        return `Moderate activity detected (${context.stepsInLastMinute} steps/min)`;
      }
    }

    // Background transitions
    if (to === 'BACKGROUND') {
      if (context.stepsInLastMinute > 10 && context.stepsInLastMinute <= 30) {
        return `Light activity detected (${context.stepsInLastMinute} steps/min)`;
      }
      if (from === 'ACTIVE' && context.stepsInLastMinute < 20) {
        return `Activity decreasing (${context.stepsInLastMinute} steps/min)`;
      }
    }

    // Idle transitions
    if (to === 'IDLE') {
      if (context.minutesSinceLastActivity > 3) {
        return `${context.minutesSinceLastActivity}min without activity`;
      }
      if (!context.isNight && context.stepsInLastMinute === 0) {
        return 'Daytime with no activity';
      }
    }

    return `${from} → ${to}`;
  }

  /**
   * Get state distribution over time (for analytics)
   */
  public getStateDistribution(): Record<DeviceState, number> {
    const distribution: Record<DeviceState, number> = {
      SLEEP: 0,
      IDLE: 0,
      BACKGROUND: 0,
      ACTIVE: 0,
    };

    if (this.transitionHistory.length === 0) {
      distribution[this.currentState] = 100;
      return distribution;
    }

    // Calculate time spent in each state
    const totalTime = Date.now() - this.transitionHistory[0].timestamp.getTime();
    let lastTransition = this.transitionHistory[0];

    for (let i = 1; i < this.transitionHistory.length; i++) {
      const duration = this.transitionHistory[i].timestamp.getTime() - lastTransition.timestamp.getTime();
      distribution[lastTransition.to] += duration;
      lastTransition = this.transitionHistory[i];
    }

    // Add time in current state
    const currentStateDuration = Date.now() - lastTransition.timestamp.getTime();
    distribution[this.currentState] += currentStateDuration;

    // Convert to percentages
    Object.keys(distribution).forEach(state => {
      distribution[state as DeviceState] = (distribution[state as DeviceState] / totalTime) * 100;
    });

    return distribution;
  }
}
