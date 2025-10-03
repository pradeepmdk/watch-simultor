# Quick Reference: Calculation Formulas

## 🕐 Time Calculations

### Simulated Time Delta
```
simulatedDeltaMs = realDeltaMs × speed
simulatedDeltaSeconds = simulatedDeltaMs / 1000
```

### Boundary Detection
```
NEW_SECOND: when currentTime.getSeconds() changes
NEW_MINUTE: when currentTime.getMinutes() changes
```

---

## 👣 Step Calculations

### Base Step Rates (steps per minute)
```
Walking: 120 steps/min
Jogging: 180 steps/min
```

### Activity Level Multipliers
```
Sleep:      0.0  (no activity)
Sedentary:  0.05 (minimal movement)
Light:      0.3  (light activity)
Moderate:   0.6  (moderate activity)
Vigorous:   0.9  (high activity)
```

### Device State Multipliers
```
SLEEP:      0.0  (no steps during sleep)
IDLE:       0.3  (reduced activity)
BACKGROUND: 0.7  (moderate reduction)
ACTIVE:     1.0  (full activity)
```

### Final Step Rate Formula
```
stepsPerSecond = (STEP_RATE[type] / 60) × ACTIVITY_MULTIPLIER[level] × STATE_MULTIPLIER[state]
```

### Fractional Accumulation
```
accumulatedSteps += stepsPerSecond × deltaSeconds

if accumulatedSteps ≥ 1:
  steps = floor(accumulatedSteps)
  accumulatedSteps -= steps  # keep fractional part
  emit NEW_STEP event
```

---

## 📊 Examples

### Example 1: Office Worker, Moderate Walking, Active State
```
Base: 120 steps/min ÷ 60 = 2 steps/sec
Activity: × 0.6 = 1.2 steps/sec
State: × 1.0 = 1.2 steps/sec
→ ~1.2 steps per second
```

### Example 2: Athlete, Vigorous Jogging, Active State
```
Base: 180 steps/min ÷ 60 = 3 steps/sec
Activity: × 0.9 = 2.7 steps/sec
State: × 1.0 = 2.7 steps/sec
→ ~2.7 steps per second
```

### Example 3: Sedentary Person, Light Activity, Idle State
```
Base: 120 steps/min ÷ 60 = 2 steps/sec
Activity: × 0.3 = 0.6 steps/sec
State: × 0.3 = 0.18 steps/sec
→ ~0.18 steps per second (very few steps)
```

---

## 🎯 Key Points

1. **Time scaling** affects how fast simulated time advances
2. **Step rates** are based on activity type + level
3. **State multipliers** reduce/increase activity based on device state
4. **Fractional accumulation** ensures precision at any speed
5. **Boundary detection** fires events exactly on time changes
6. **Activity patterns** determine when/where steps occur

---

## 🔍 Debugging

### Check Time Flow
```
Real time: performance.now()
Simulated time: timerEngine.getCurrentTime()
Speed factor: timerEngine.getSpeed()
```

### Check Step Generation
```
Activity: getActivityForHour(archetype, hour)
Base rate: STEP_RATES[activity.type] / 60
Final rate: base × activity × state
Accumulation: stepGenerator.accumulatedSteps
```

### Check Events
```
NEW_SECOND: every simulated second
NEW_MINUTE: every simulated minute
NEW_STEP: when steps ≥ 1
NEW_STATE: when device state changes
```
