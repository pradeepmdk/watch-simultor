# Calculation Logic: Seconds, Minutes, & Steps

## 🕐 Timer Engine Logic

### **1. Speed Calculation**
```typescript
// Real time delta (how much real time passed)
const realDeltaMs = now - this.lastFrameTime;

// Simulated time delta (scaled by speed)
const simulatedDeltaMs = realDeltaMs * this.speed;

// Update simulated time
this.currentTime = new Date(this.currentTime.getTime() + simulatedDeltaMs);
```

**Example**: At x10 speed, 100ms real time = 1000ms (1 second) simulated time.

---

### **2. Second Boundary Detection**
```typescript
const currentSecond = this.currentTime.getSeconds();
if (currentSecond !== this.lastSecond) {
  // Emit NEW_SECOND event
  this.emitEvent({
    type: 'NEW_SECOND',
    timestamp: Date.now(),
    simulatedTime: new Date(this.currentTime),
    data: { second: currentSecond }
  });
  this.lastSecond = currentSecond;
}
```

**Result**: Fires exactly when simulated second changes (e.g., 10:30:01 → 10:30:02).

---

### **3. Minute Boundary Detection**
```typescript
const currentMinute = this.currentTime.getMinutes();
if (currentMinute !== this.lastMinute) {
  // Emit NEW_MINUTE event
  this.emitEvent({
    type: 'NEW_MINUTE',
    timestamp: Date.now(),
    simulatedTime: new Date(this.currentTime),
    data: { minute: currentMinute }
  });
  this.lastMinute = currentMinute;
}
```

**Result**: Fires exactly when simulated minute changes (e.g., 10:30:59 → 10:31:00).

---

## 👣 Step Generation Logic

### **1. Activity Determination**
```typescript
// Get current hour activity pattern
const activity = getActivityForHour(this.archetype, hour);

// Check if we should generate steps (probability)
const shouldGenerateSteps = Math.random() < activity.probability;
```

**Activity Levels**:
- `sleep`: 0% (night hours)
- `sedentary`: 5% (minimal movement)
- `light`: 30% (light activity)
- `moderate`: 60% (moderate activity)
- `vigorous`: 90% (high activity)

---

### **2. Step Rate Calculation**
```typescript
// Base step rates per minute
const STEP_RATES = {
  walking: 120,  // 120 steps/min
  jogging: 180,  // 180 steps/min
};

// Convert to steps per second
const baseStepsPerSecond = STEP_RATES[activity.type] / 60;

// Apply activity level multiplier
const activityMultiplier = ACTIVITY_MULTIPLIERS[activity.level];

// Apply device state multiplier (Milestone 4)
const stateMultiplier = 0.0 to 1.0; // SLEEP=0, IDLE=0.3, BACKGROUND=0.7, ACTIVE=1.0

// Final calculation
const stepsPerSecond = baseStepsPerSecond * activityMultiplier * stateMultiplier;
```

**Examples**:
- Office worker, moderate walking: `120/60 * 0.6 * 1.0 = 1.2 steps/sec`
- Athlete, vigorous jogging: `180/60 * 0.9 * 1.0 = 2.7 steps/sec`
- Sedentary, light walking: `120/60 * 0.3 * 0.3 = 0.18 steps/sec` (IDLE state)

---

### **3. Fractional Step Accumulation**
```typescript
// Accumulate fractional steps
this.accumulatedSteps += stepsPerSecond * deltaSeconds;

// Only emit when we have at least 1 whole step
if (this.accumulatedSteps >= 1) {
  const steps = Math.floor(this.accumulatedSteps);
  this.accumulatedSteps -= steps; // Keep fractional part

  // Update counters
  this.totalSteps += steps;
  this.stepsThisMinute += steps;
  this.stepsThisHour += steps;

  // Return step data
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
```

**Why fractional accumulation?**
- Ensures accurate step counting at any speed
- Prevents "missing" steps at high speeds
- Maintains precision even with tiny time deltas

---

## 🔄 Complete Flow (Per Second)

```
1. TimerEngine detects NEW_SECOND boundary
2. Calculates simulatedDeltaSeconds (realDeltaMs * speed / 1000)
3. Gets current device state & multiplier from StateMachine
4. StepGenerator calculates steps for this second
5. Accumulates fractional steps
6. If ≥1 whole step: emit NEW_STEP event
7. Update chart data (hourly/daily arrays)
8. On NEW_MINUTE: update StateMachine with activity patterns
9. StateMachine may emit NEW_STATE event if state changes
```

---

## 📊 Real-Time Calculation Examples

### **At x1 speed (real-time)**:
- Real: 1000ms → Simulated: 1000ms (1 second)
- If activity = 1.2 steps/sec, generate ~1.2 steps
- Accumulate 1 step, keep 0.2 for next second

### **At x100 speed**:
- Real: 10ms → Simulated: 1000ms (1 second)
- Same activity generates same ~1.2 steps
- Fractional accumulation ensures accuracy

### **At x1000 speed**:
- Real: 1ms → Simulated: 1000ms (1 second)
- Still generates accurate step counts
- No precision loss due to accumulation

---

## 🎯 Key Principles

1. **Time Scaling**: All calculations use simulated time, not real time
2. **Event Boundaries**: Events fire exactly on second/minute boundaries
3. **Fractional Precision**: Steps accumulate fractionally for accuracy
4. **State Modulation**: Device state affects step generation probability
5. **Activity Patterns**: Archetype schedules determine when/how much activity
6. **Speed Independence**: Logic works identically at any speed (x1 to x1000)

---

## 📈 Data Flow Summary

```
TimerEngine (seconds/minutes)
    ↓
StepGenerator (steps based on activity + state)
    ↓
StateMachine (device state changes based on activity)
    ↓
EventBus (NEW_SECOND, NEW_MINUTE, NEW_STEP, NEW_STATE)
    ↓
Redux State (chart data + event log)
    ↓
UI Components (charts + event display)
```

This ensures accurate, speed-independent simulation that behaves identically whether running at real-time or 1000x speed!
