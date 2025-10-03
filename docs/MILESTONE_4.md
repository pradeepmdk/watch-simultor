# Milestone 4 – State Machine

**Status**: ✅ **COMPLETE**

## Overview

The State Machine module implements device state management with automatic transitions based on user activity and time. It modulates step generation according to the current device state, providing realistic simulation of a smartwatch's power and activity modes.

## Architecture

### Components

1. **types.ts** - State types, configurations, and transition interfaces
2. **StateMachine.ts** - Core state transition engine with rule-based logic
3. **useTimer.ts** - Integration with timer and step generator
4. **StatePanel.tsx** - Visual state display component

### Data Flow

```
Timer (NEW_MINUTE) → Build StateContext
                   ↓
         StateMachine.update(context)
                   ↓
           Evaluate transition rules
                   ↓
         State changed? → NEW_STATE event
                   ↓
    Get state multiplier → StepGenerator
                   ↓
         Modulated step generation
                   ↓
    UI updates (StatePanel, EventLog)
```

## Device States

### State Definitions

#### 1. SLEEP 😴
- **Step Multiplier**: 0% (no tracking)
- **Description**: Device in sleep mode - no activity tracking
- **Typical Hours**: 22:00 - 06:00 (night time)
- **Use Case**: Battery conservation, user sleeping
- **Color**: Dark slate (#1e293b)

**Entry Conditions**:
- Night time (22:00-06:00) AND no steps in last minute AND >15-30min inactivity

#### 2. IDLE 💤
- **Step Multiplier**: 30% (minimal tracking)
- **Description**: Device idle - minimal activity detection
- **Typical Hours**: Sedentary periods during day
- **Use Case**: User sitting, watching TV, working at desk
- **Color**: Slate (#475569)

**Entry Conditions**:
- No steps AND 3-5min of inactivity
- Daytime with no activity
- Transition down from ACTIVE/BACKGROUND

#### 3. BACKGROUND 📱
- **Step Multiplier**: 70% (reduced tracking)
- **Description**: Background tracking - normal activity detection
- **Typical Hours**: Light activity periods
- **Use Case**: Walking slowly, household tasks, casual movement
- **Color**: Blue (#3b82f6)

**Entry Conditions**:
- 10-30 steps/minute (light activity)
- Transition down from ACTIVE
- Transition up from IDLE

#### 4. ACTIVE 🏃
- **Step Multiplier**: 100% (full tracking)
- **Description**: Active mode - full activity tracking
- **Typical Hours**: Exercise, walking, jogging
- **Use Case**: Workout, commute, active tasks
- **Color**: Green (#10b981)

**Entry Conditions**:
- >30-50 steps/minute (moderate to high activity)
- Any significant movement detected

## State Transition System

### Transition Rules

Transitions are evaluated **every minute** based on priority (higher = evaluated first):

#### High Priority Transitions (90-100)
1. **Any → SLEEP** (Priority 90-95)
   - Night time + no activity + 15-30min idle
   - Ensures device sleeps when user sleeps

2. **SLEEP → ACTIVE** (Priority 100)
   - >20 steps/min during daytime
   - Waking up with activity

3. **SLEEP → IDLE** (Priority 90)
   - Daytime + no steps
   - Waking up without activity

#### Medium Priority Transitions (75-88)
4. **IDLE → ACTIVE** (Priority 85)
   - >30 steps/min
   - Starting exercise or active task

5. **BACKGROUND → ACTIVE** (Priority 88)
   - >50 steps/min
   - Increasing activity intensity

6. **IDLE → BACKGROUND** (Priority 80)
   - 10-30 steps/min
   - Light activity starting

#### Low Priority Transitions (70-78)
7. **ACTIVE → BACKGROUND** (Priority 78)
   - <20 steps/min from active state
   - Slowing down from exercise

8. **BACKGROUND → IDLE** (Priority 75)
   - No steps + >5min idle
   - Activity ceasing

9. **ACTIVE → IDLE** (Priority 70)
   - No steps + >3min idle
   - Exercise/activity ended

### State Context

Transitions are evaluated based on:

```typescript
interface StateContext {
  currentTime: Date;
  hour: number;                    // 0-23
  isNight: boolean;                // 22:00-06:00
  stepsInLastMinute: number;       // Steps in previous minute
  totalSteps: number;              // Cumulative steps
  activityLevel: string;           // From archetype schedule
  minutesSinceLastActivity: number; // Idle duration
}
```

### Transition Reasons

Each transition includes a human-readable reason:

- **Night + inactivity**: "Night time with 25min inactivity"
- **High activity**: "High activity detected (65 steps/min)"
- **Light activity**: "Light activity detected (18 steps/min)"
- **Slowing down**: "Activity decreasing (15 steps/min)"
- **Idle timeout**: "8min without activity"

## Step Modulation

### How It Works

```typescript
// Base step calculation (Milestone 3)
const baseSteps = baseRate * activityMultiplier;

// Apply state multiplier (Milestone 4)
const finalSteps = baseSteps * stateMultiplier;
```

### Examples

**Scenario 1: Active Jogging**
- Base rate: 180 steps/min (jogging)
- Activity multiplier: 1.0 (vigorous)
- State: ACTIVE (1.0x)
- **Result**: 180 steps/min (full tracking)

**Scenario 2: Background Walking**
- Base rate: 120 steps/min (walking)
- Activity multiplier: 0.6 (moderate)
- State: BACKGROUND (0.7x)
- **Result**: 50.4 steps/min (70% of normal)

**Scenario 3: Idle Sitting**
- Base rate: 120 steps/min (walking)
- Activity multiplier: 0.1 (sedentary)
- State: IDLE (0.3x)
- **Result**: 3.6 steps/min (30% of already low activity)

**Scenario 4: Sleep Mode**
- Base rate: Any
- Activity multiplier: 0 (sleep)
- State: SLEEP (0x)
- **Result**: 0 steps/min (no tracking)

### Fractional Preservation

State multipliers work with existing fractional accumulation:

```typescript
// In StepGenerator.calculateSteps()
this.accumulatedSteps += stepsPerSecond * stateMultiplier * deltaSeconds;

if (this.accumulatedSteps >= 1) {
  const steps = Math.floor(this.accumulatedSteps);
  this.accumulatedSteps -= steps; // Preserve fractional part
  return { steps, stateMultiplier, deviceState, ... };
}
```

No steps are lost even with multiple multipliers at high speeds.

## State Visualization

### StatePanel Component

Located in left column below Controls panel, displays:

1. **Current State Card**
   - Large emoji icon (😴💤📱🏃)
   - State name and description
   - Step multiplier percentage
   - Color-coded border and background

2. **State Distribution**
   - Bar chart showing time % in each state
   - Real-time percentage calculations
   - Color-coded progress bars
   - Historical state tracking

3. **State Legend**
   - Quick reference for all states
   - Step multiplier percentages
   - Icons and descriptions

### Event Integration

NEW_STATE events appear in EventLogPanel:
- 🔄 Orange color-coding
- Transition direction (FROM → TO)
- Transition reason explanation
- Timestamp for tracking

## Implementation Details

### Minute-Based Updates

State machine updates **every minute** (not every second) to:
- Reduce computational overhead
- Provide stable state transitions
- Allow meaningful activity windows
- Track "steps in last minute" metric

### Activity Tracking

```typescript
// In useTimer.ts
const stepsInLastMinuteRef = useRef<number>(0);

// On each step event
stepsInLastMinuteRef.current += stepData.steps;

// On minute boundary
const context: StateContext = {
  stepsInLastMinute: stepsInLastMinuteRef.current,
  // ... other context
};

const transition = stateMachine.update(context);

// Reset for next minute
stepsInLastMinuteRef.current = 0;
```

### State History

StateMachine maintains transition history:
- Last 50 transitions stored
- Used for state distribution calculation
- Available for analytics

```typescript
getTransitionHistory(): StateTransitionEvent[];
getStateDistribution(): Record<DeviceState, number>;
```

### Idempotency

Transitions only occur when state changes:

```typescript
if (newState === this.currentState) {
  return null; // No transition
}
```

Prevents duplicate NEW_STATE events.

## Integration Points

### With Timer (Milestone 2)

- State machine initialized in useTimer hook
- Updates triggered on NEW_MINUTE events
- Uses RTC time for hour/day calculations

### With Step Generator (Milestone 3)

- State multiplier applied to step calculations
- Works with archetype-based step rates
- Preserves fractional accumulation
- Steps tracked for state transitions

### With Redux State

- NEW_STATE events dispatched to event log
- State transitions tracked in event stream
- No separate Redux slice needed (managed in useTimer)

## Testing Scenarios

### Test 1: Night Sleep Transition

**Steps**:
1. Start simulation at 21:00
2. Set archetype with sleep schedule
3. Run at x100 speed through midnight

**Expected**:
- IDLE → SLEEP around 22:00-23:00
- Step tracking stops (0% multiplier)
- NEW_STATE event emitted

### Test 2: Morning Wake Up

**Steps**:
1. Start at 05:00 in SLEEP state
2. Wait for 06:00 with light activity

**Expected**:
- SLEEP → IDLE at 06:00 (daytime, no steps)
- Or SLEEP → ACTIVE (if steps detected)
- Step tracking resumes

### Test 3: Exercise Session

**Steps**:
1. Start at 10:00 in IDLE
2. Switch to Athlete archetype
3. Fast-forward to training hour (06:00 or 17:00)

**Expected**:
- IDLE → BACKGROUND (light activity starts)
- BACKGROUND → ACTIVE (activity increases >50 steps/min)
- 100% step tracking during ACTIVE
- ACTIVE → BACKGROUND → IDLE (cool down)

### Test 4: Desk Work Period

**Steps**:
1. Office Worker archetype
2. Set time to 10:00 (desk work hour)
3. Observe state over 1 hour

**Expected**:
- Mostly IDLE state (minimal steps)
- 30% step multiplier
- Occasional BACKGROUND for bathroom breaks

### Test 5: State Distribution

**Steps**:
1. Run full 24-hour simulation
2. Check state distribution percentages

**Expected**:
- SLEEP: ~25-35% (night hours)
- IDLE: ~30-40% (sedentary periods)
- BACKGROUND: ~15-25% (light activity)
- ACTIVE: ~10-15% (exercise/commute)

### Test 6: High-Speed Stability

**Steps**:
1. Run at x1000 speed
2. Monitor state transitions
3. Check for errors or crashes

**Expected**:
- Smooth state transitions
- No missing events
- UI remains responsive
- Accurate state distribution

## Files Created/Modified

### Created
- `src/lib/state/types.ts` - State types and configurations
- `src/lib/state/StateMachine.ts` - State transition engine
- `src/components/StatePanel.tsx` - State visualization component
- `MILESTONE_4.md` - This documentation

### Modified
- `src/lib/steps/StepGenerator.ts` - Added state multiplier to step calculation
- `src/lib/timer/useTimer.ts` - Integrated StateMachine, state context building, NEW_STATE events
- `src/components/Dashboard.tsx` - Added StatePanel to layout
- `src/components/EventLogPanel.tsx` - Already supported NEW_STATE events

## Acceptance Criteria

✅ **State machine with 4 states implemented**
- SLEEP (0%), IDLE (30%), BACKGROUND (70%), ACTIVE (100%)
- Each state has configuration, color, icon, description

✅ **State transitions based on activity and time**
- 9 transition rules with priorities
- Minute-based evaluation
- Context-aware conditions (time, steps, idle duration)

✅ **Step generation modulated by device state**
- State multiplier applied to step calculations
- Works with archetype and activity multipliers
- Fractional accumulation preserved

✅ **State visualization in dashboard**
- StatePanel shows current state and distribution
- Real-time updates
- Color-coded indicators
- State history tracking

✅ **State-aware event logging**
- NEW_STATE events with transitions
- Transition reasons provided
- Event log integration with filtering

## Technical Highlights

1. **Priority-Based Rules**: Ensures critical transitions (sleep, wake) happen first
2. **Minute Window**: Stable state transitions with meaningful activity tracking
3. **Multiplier Stacking**: State * Activity * Base rate for realistic modulation
4. **History Tracking**: State distribution analytics over time
5. **No State Drift**: Idempotent transitions prevent duplicate events
6. **Performance**: Minute-based updates (not second) for efficiency

## State Transition Examples

### Example 1: Full Day Cycle

```
00:00 - SLEEP (night, no activity)
06:15 - SLEEP → IDLE (daytime, waking up)
08:45 - IDLE → BACKGROUND (morning walk starts)
09:00 - BACKGROUND → ACTIVE (commute jogging)
09:30 - ACTIVE → IDLE (arrived at work)
12:15 - IDLE → BACKGROUND (lunch walk)
12:45 - BACKGROUND → IDLE (back at desk)
17:30 - IDLE → ACTIVE (evening workout)
18:15 - ACTIVE → BACKGROUND (cool down)
18:30 - BACKGROUND → IDLE (home, relaxing)
22:30 - IDLE → SLEEP (bedtime)
```

### Example 2: Athlete Training

```
06:00 - SLEEP → ACTIVE (morning run, high steps)
        Steps: 180/min * 1.0 (vigorous) * 1.0 (active) = 180/min
06:45 - ACTIVE → BACKGROUND (cooldown)
        Steps: 120/min * 0.3 (light) * 0.7 (background) = 25/min
07:00 - BACKGROUND → IDLE (shower, breakfast)
        Steps: 120/min * 0.1 (sedentary) * 0.3 (idle) = 3.6/min
```

## Usage Example

```typescript
// Create state machine
const stateMachine = new StateMachine('IDLE');

// Build context from current conditions
const context: StateContext = {
  currentTime: new Date(),
  hour: 14,
  isNight: false,
  stepsInLastMinute: 45,
  totalSteps: 3200,
  activityLevel: 'moderate',
  minutesSinceLastActivity: 0,
};

// Update state (evaluates transitions)
const transition = stateMachine.update(context);

if (transition) {
  console.log(`State changed: ${transition.from} → ${transition.to}`);
  console.log(`Reason: ${transition.reason}`);
}

// Get current state multiplier
const multiplier = stateMachine.getStateMultiplier(); // 0, 0.3, 0.7, or 1.0

// Apply to step generation
const modulatedSteps = baseSteps * multiplier;
```

## Performance Notes

- State evaluation: O(n) where n = number of rules (~9)
- Minute-based updates: ~1 evaluation/min at x1 speed
- History storage: O(1) push with max 50 entries
- Distribution calculation: O(m) where m = transitions (~50)
- Memory usage: Minimal (<1KB per state machine instance)

## Next Steps (Future Enhancements)

- **Power Management**: Battery level simulation based on state
- **Adaptive Transitions**: Learn user patterns for smarter transitions
- **Custom States**: User-defined states with custom multipliers
- **State Scheduling**: Pre-programmed state changes for testing
- **Analytics Dashboard**: Detailed state usage patterns and insights

## Comparison with Previous Milestones

| Milestone | Focus | Key Innovation |
|-----------|-------|----------------|
| 1 | Dashboard | 3-panel responsive layout |
| 2 | Timer | High-precision time with speed scaling |
| 3 | Steps | Archetype-based realistic patterns |
| 4 | State | **Context-aware activity modulation** |

Milestone 4 completes the simulation by adding intelligent device behavior that responds to user activity and time, providing the most realistic smartwatch simulation experience.

---

**Project Status**: ✅ **ALL 4 MILESTONES COMPLETE**
