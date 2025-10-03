# Milestone 3 – Step Generator

**Status**: ✅ **COMPLETE**

## Overview

The Step Generator module generates realistic step patterns based on user archetypes. It integrates with the Timer Engine to emit NEW_STEP events according to archetype-specific activity schedules, supporting both walking and jogging activity types.

## Architecture

### Components

1. **archetypes.ts** - Archetype definitions with hourly schedules
2. **StepGenerator.ts** - Step calculation engine with fractional accumulation
3. **Integration** - Connected via `useTimer` hook to Redux state

### Data Flow

```
Timer (NEW_SECOND) → StepGenerator.calculateSteps()
                   ↓
          Fractional accumulation
                   ↓
         NEW_STEP event emission
                   ↓
          Redux state update
                   ↓
    VisualizationPanel displays data
```

## Archetype System

### Archetype Structure

Each archetype defines:
- **name**: Display name
- **dailyStepGoal**: Target steps per day
- **schedule**: 24-hour activity pattern
  - **hour**: 0-23
  - **type**: 'walking' | 'jogging'
  - **level**: 'sleep' | 'sedentary' | 'light' | 'moderate' | 'vigorous'

### Activity Levels

Activity multipliers determine step rate within activity type:

```typescript
ACTIVITY_MULTIPLIERS = {
  sleep: 0,        // No steps
  sedentary: 0.1,  // Minimal movement
  light: 0.3,      // Light activity
  moderate: 0.6,   // Moderate activity
  vigorous: 1.0    // Full activity
}
```

### Step Rates

Base step rates per activity type:

```typescript
STEP_RATES = {
  walking: 120,  // steps per minute
  jogging: 180   // steps per minute
}
```

**Calculation**: `stepsPerSecond = (STEP_RATES[type] / 60) * ACTIVITY_MULTIPLIERS[level]`

### Built-in Archetypes

#### 1. OFFICE_WORKER
- **Goal**: 8,000 steps/day
- **Pattern**: Weekday-focused with commute and lunch walks
- **Peak Hours**: 8-9am (commute), 12-1pm (lunch), 5-6pm (commute)
- **Weekends**: Reduced activity

#### 2. ATHLETE
- **Goal**: 15,000 steps/day
- **Pattern**: High-intensity training sessions
- **Peak Hours**: 6-8am (morning run), 5-7pm (evening workout)
- **Characteristics**: Jogging activities, vigorous intensity

#### 3. SEDENTARY
- **Goal**: 4,000 steps/day
- **Pattern**: Minimal movement throughout day
- **Peak Hours**: Light activity for basic needs only
- **Characteristics**: Mostly sedentary with occasional light walking

#### 4. ACTIVE
- **Goal**: 12,000 steps/day
- **Pattern**: Regular activity distributed throughout day
- **Peak Hours**: Multiple activity periods
- **Characteristics**: Balanced walking with moderate intensity

## Implementation Details

### Fractional Step Accumulation

To ensure accuracy at high simulation speeds:

```typescript
this.accumulatedSteps += stepsPerSecond * deltaSeconds;

if (this.accumulatedSteps >= 1) {
  const steps = Math.floor(this.accumulatedSteps);
  this.accumulatedSteps -= steps; // Preserve fractional remainder
  return { steps, totalSteps, ... };
}
```

**Why This Matters**:
- At speed x1000, 1 real second = 1000 simulated seconds = 16.67 simulated minutes
- Without accumulation, fractional steps would be lost
- Accumulation ensures every step is counted across speed changes

### Activity Selection

```typescript
function getActivityForHour(archetype: Archetype, hour: number): Activity {
  return archetype.schedule.find(s => s.hour === hour) || DEFAULT_SEDENTARY;
}
```

Activities are selected based on current simulated hour, not real time.

### Hourly Distribution

For visualization purposes:

```typescript
getHourlyDistribution(): Array<{ hour: number; steps: number }> {
  return this.archetype.schedule.map(activity => ({
    hour: activity.hour,
    steps: this.calculateExpectedStepsForHour(activity)
  }));
}
```

Shows expected step pattern based on archetype schedule.

### Daily Step Total

```typescript
getExpectedDailySteps(): number {
  return this.archetype.schedule.reduce((total, activity) => {
    return total + this.calculateExpectedStepsForHour(activity);
  }, 0);
}
```

Calculates total expected steps for a full 24-hour period.

## Integration with Timer

### Event Flow

```typescript
// In useTimer.ts
const handleEvent = (event: TimerEvent) => {
  if (event.type === 'NEW_SECOND' && stepGeneratorRef.current) {
    const realDeltaMs = performance.now() - lastRealTimeRef.current;
    const simulatedDeltaSeconds = (realDeltaMs / 1000) * speed;

    const stepData = stepGeneratorRef.current.calculateSteps(
      currentTime,
      simulatedDeltaSeconds
    );

    if (stepData) {
      dispatch(addEvent({
        type: 'NEW_STEP',
        message: `Steps: +${stepData.steps} (Total: ${stepData.totalSteps})`,
        data: stepData
      }));
    }

    lastRealTimeRef.current = performance.now();
  }
};
```

### Speed Scaling

Step calculations automatically scale with timer speed:
- Speed x1: Real-time step generation
- Speed x100: 100x faster step accumulation
- Speed x1000: 1000x faster, no steps missed

## Visualization Integration

### VisualizationPanel Updates

1. **Hourly Distribution Chart**
   - Line chart showing 24-hour step pattern
   - Updates when archetype changes
   - Shows expected pattern, not real-time accumulation

2. **Expected Daily Steps Display**
   - Large centered number with gradient
   - Compares to archetype goal
   - Shows goal achievement percentage

3. **Archetype Info**
   - Display current archetype name
   - Show daily step goal
   - Positioned in panel header

### Data Hooks

```typescript
const { stepGenerator } = useTimer();

const stepsPerHourData = useMemo(() => {
  if (!stepGenerator) return defaultData;
  return stepGenerator.getHourlyDistribution().map(item => ({
    hour: item.hour.toString(),
    steps: item.steps
  }));
}, [stepGenerator]);

const expectedDailySteps = useMemo(() => {
  return stepGenerator?.getExpectedDailySteps() ?? 0;
}, [stepGenerator]);
```

## Testing Scenarios

### 1. Archetype Switching
- Change archetype in ControlPanel
- Verify visualization updates immediately
- Check hourly distribution matches new archetype
- Confirm daily goal updates

### 2. Speed Testing
- **x1**: Verify steps generate at natural rate
- **x10**: Confirm 10x accumulation rate
- **x100**: Check no desync or missing steps
- **x1000**: Validate accuracy at extreme speed

### 3. Event Verification
- Monitor EventLogPanel for NEW_STEP events
- Verify event frequency matches speed setting
- Confirm step counts are accurate
- Check no duplicate or missing events

### 4. Cross-Day Boundary
- Run simulation across midnight (00:00)
- Verify activity changes based on new hour
- Confirm step accumulation continues correctly

### 5. Long Duration
- Run full 24-hour simulation
- Verify total steps match expected daily total
- Check no drift or desync over time

## Acceptance Criteria

✅ **Generate steps according to archetype**
- StepGenerator uses archetype schedules
- Step rates match activity types (walking/jogging)
- Activity levels correctly modify step rates

✅ **Support walking and jogging rates**
- Walking: 120 steps/min
- Jogging: 180 steps/min
- Activity multipliers applied correctly

✅ **Implement 4 archetypes**
- OFFICE_WORKER (8,000 steps/day)
- ATHLETE (15,000 steps/day)
- SEDENTARY (4,000 steps/day)
- ACTIVE (12,000 steps/day)

✅ **Changing archetype updates graphs**
- Hourly distribution chart updates
- Expected daily steps updates
- Archetype info displays correctly

✅ **Step counts scale with speed**
- Fractional accumulation prevents loss
- deltaSeconds * speed applied correctly
- No desync at any speed level

✅ **No missing/duplicate events**
- Fractional accumulation ensures accuracy
- Event emission based on >= 1 step threshold
- Remainder preserved across calculations

## Files Created/Modified

### Created
- `src/lib/steps/archetypes.ts` - Archetype definitions and types
- `src/lib/steps/StepGenerator.ts` - Step calculation engine
- `MILESTONE_3.md` - This documentation

### Modified
- `src/lib/timer/useTimer.ts` - Integrated StepGenerator, NEW_STEP events
- `src/components/VisualizationPanel.tsx` - Display archetype data and hourly distribution
- `src/components/ControlPanel.tsx` - Archetype selector integration

## Technical Highlights

1. **Fractional Accumulation**: Prevents step loss at high speeds
2. **Activity-Based System**: Realistic patterns based on time of day
3. **Type Safety**: Full TypeScript typing for archetypes and activities
4. **Modular Design**: StepGenerator decoupled from UI and timer
5. **Efficient Updates**: useMemo prevents unnecessary recalculations
6. **Scalable Architecture**: Easy to add new archetypes or activity types

## Usage Example

```typescript
// Create step generator with archetype
const generator = new StepGenerator(ATHLETE);

// Calculate steps for time period
const stepData = generator.calculateSteps(currentDate, deltaSeconds);

if (stepData) {
  console.log(`Generated ${stepData.steps} steps`);
  console.log(`Total: ${stepData.totalSteps}`);
  console.log(`Activity: ${stepData.activity.type} (${stepData.activity.level})`);
}

// Get visualization data
const hourlyDistribution = generator.getHourlyDistribution();
const expectedDaily = generator.getExpectedDailySteps();

// Change archetype
generator.setArchetype(OFFICE_WORKER);
```

## Next Steps (Milestone 4)

The State Machine module will build on this foundation by:
- Adding SLEEP/IDLE/BACKGROUND/ACTIVE states
- Modulating step generation based on device state
- Implementing state transition logic
- Creating state-aware visualizations

## Performance Notes

- Step calculation: O(1) per call
- Hourly distribution: O(24) - cached by visualization
- Memory usage: Minimal (single archetype + accumulator)
- No performance degradation at high speeds
