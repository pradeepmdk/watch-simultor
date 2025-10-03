# Calculation Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Real Time     │    │   Speed Factor   │    │ Simulated Time  │
│   (performance) │───▶│   (x1 to x1000) │───▶│   (Date object)  │
│   100ms         │    │   x100           │    │   10 seconds    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Second Boundary │    │ Minute Boundary  │    │   Activity      │
│ Detection       │───▶│ Detection        │───▶│   Pattern       │
│ (10:30:01)      │    │ (10:31:00)       │    │   (archetype)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Base Rate      │    │ Activity Level   │    │ State Multiplier│
│  walking:120/min│───▶│ moderate:0.6     │───▶│ ACTIVE:1.0      │
│  jogging:180/min│    │ vigorous:0.9     │    │ IDLE:0.3        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Steps/Second    │    │   Accumulate     │    │   Emit Event    │
│ 1.2 steps/sec   │───▶│   Fractional     │───▶│ NEW_STEP +count │
│ (calculate)     │    │   (keep <1)      │    │ (when ≥1)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Chart Update    │    │ State Machine    │    │ Event Log       │
│ (hourly/daily)  │    │ (SLEEP→ACTIVE)   │    │ (all events)     │
│ arrays          │    │ update           │    │ display          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Step-by-Step Calculation:

### 1. Time Scaling
```
Real Δt = 100ms
Speed = x10
Simulated Δt = 100ms × 10 = 1000ms = 1 second
```

### 2. Boundary Detection
```
Current time: 10:30:45.500
Last second: 45
Current second: 45
→ No NEW_SECOND event

Current time: 10:30:46.000
Last second: 45
Current second: 46
→ Emit NEW_SECOND event!
```

### 3. Step Calculation
```
Activity: moderate walking
Base rate: 120 steps/min = 2 steps/sec
Activity multiplier: 0.6
State multiplier: 1.0 (ACTIVE)
Final rate: 2 × 0.6 × 1.0 = 1.2 steps/sec
```

### 4. Accumulation
```
Previous accumulation: 0.3
Current delta: 1 second × 1.2 = 1.2
Total: 0.3 + 1.2 = 1.5
→ Emit 1 step, keep 0.5 for next second
```

### 5. Event Generation
```
Type: NEW_STEP
Data: {
  steps: 1,
  totalSteps: 1547,
  activityType: "walking",
  deviceState: "ACTIVE"
}
```

This ensures perfect accuracy regardless of simulation speed!
