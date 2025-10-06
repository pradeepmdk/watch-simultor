# Timepiece Simulator - Phase 1 Requirements

## Project Overview

This is **Phase 1** of a timepiece simulator that will serve as a benchmark for developing and testing sleep-wake cycle calculation modules in an environment close to a real timepiece device.

### Purpose
- Simulate a watch/timepiece environment with adjustable playback speed
- Generate realistic step data based on user archetypes
- Provide a testing platform for sleep-wake cycle calculations
- Support modular architecture for future extensions (CALC, CONTROLLER, Watch Face modules)

---

## Milestones

### Milestone 1: Dashboard Layout ✅
Build a functional dashboard with three panels:
- **Panel A**: Visualization (Steps/Hour and Steps/Day plots)
- **Panel B**: Control Panel (simulation setup and controls)
- **Panel C**: Event Log Panel (scrollable event logs)

### Milestone 2: Timer Engine ✅
Implement a time engine with:
- Adjustable playback speed (x1 to x1000)
- RTC (Real-Time Clock) simulator
- Event delivery system

### Milestone 3: Step Generator ✅
Implement step generation with:
- Person archetype presets (Office, Athlete, Sedentary, Active)
- Realistic step patterns based on time of day
- NEW_STEP event generation

### Milestone 4: State Machine ✅
Add simulated user/device states:
- SLEEP
- IDLE
- BACKGROUND
- ACTIVE

---

## Event System

### Event Types

The simulator generates four types of events, all delivered in chronological order:

#### 1. NEW_SECOND
- **Trigger**: Every simulated second
- **Throttling**: Logged every 10th second to avoid spam (seconds 10, 20, 30, 40, 50, 60)
- **Speed Impact**: 
  - At x1 speed: Triggers every 1 real second
  - At x100 speed: Triggers every 10ms (100 times faster)
  - At x1000 speed: Triggers every 1ms (1000 times faster)
- **Data**: Current second value
- **Format**: `YYYY-MM-DD HH:MM:SS`
- **Example**: `2025-10-03 05:30:10 - Timer tick - Second: 10`

#### 2. NEW_MINUTE
- **Trigger**: Every simulated minute (when second reaches 60)
- **Throttling**: None (all minute events are logged)
- **Speed Impact**:
  - At x1 speed: Triggers every 60 real seconds
  - At x100 speed: Triggers every 0.6 real seconds
  - At x1000 speed: Triggers every 0.06 real seconds (60ms)
- **Data**: Current minute value, minute step count
- **Format**: `YYYY-MM-DD HH:MM:SS`
- **Actions**: 
  - Resets minute step counter
  - Saves minute step data for JSON export
  - Updates state machine context

#### 3. NEW_STEP
- **Trigger**: When step generator produces steps (based on archetype and time)
- **Frequency**: Varies by archetype and activity level
  - Office: More steps during work hours (9-17), fewer at night
  - Athlete: High step count during exercise periods
  - Sedentary: Low step count throughout day
  - Active: Moderate-high step count during waking hours
- **Throttling**: None (all step events are logged)
- **Speed Impact**: Steps are generated per simulated second, so faster speed = more steps generated faster
- **Data**: 
  - Steps added
  - Total steps
  - Device state (SLEEP/IDLE/BACKGROUND/ACTIVE)
- **Format**: `YYYY-MM-DD HH:MM:SS`
- **Example**: `Steps: +5 (Total: 1234) [ACTIVE]`

#### 4. NEW_STATE
- **Trigger**: When device/user state changes
- **State Transitions**:
  - **SLEEP** → IDLE: When waking up (typically 6-7 AM)
  - **IDLE** → BACKGROUND: When minimal activity detected
  - **BACKGROUND** → ACTIVE: When significant steps detected
  - **ACTIVE** → BACKGROUND: When activity decreases
  - **Any** → SLEEP: During night hours (22:00-06:00) with low activity
- **Throttling**: None (all state changes are logged)
- **Speed Impact**: State changes occur based on simulated time and step patterns
- **Data**: 
  - Previous state
  - New state
  - Reason for transition
  - Current time context
- **Format**: `YYYY-MM-DD HH:MM:SS`
- **Example**: `State changed: IDLE → ACTIVE (reason: high step activity)`

---

## Speed System

### Speed Range: x1 to x1000

The speed multiplier affects how fast simulated time progresses relative to real time:

| Speed | Real Time per Simulated Second | Real Time per Simulated Minute | Real Time per Simulated Hour |
|-------|-------------------------------|-------------------------------|------------------------------|
| x1    | 1 second                      | 60 seconds (1 min)            | 3600 seconds (1 hour)        |
| x10   | 0.1 seconds (100ms)           | 6 seconds                     | 360 seconds (6 min)          |
| x100  | 0.01 seconds (10ms)           | 0.6 seconds                   | 36 seconds                   |
| x1000 | 0.001 seconds (1ms)           | 0.06 seconds (60ms)           | 3.6 seconds                  |

### Event Timing Examples

**At x1 speed (real-time):**
- NEW_SECOND: Every 1 second (throttled to every 10 seconds in log)
- NEW_MINUTE: Every 60 seconds
- NEW_STEP: Variable, based on archetype
- NEW_STATE: When conditions met

**At x100 speed:**
- NEW_SECOND: Every 10ms (throttled to every 100ms in log)
- NEW_MINUTE: Every 600ms
- NEW_STEP: 100x more frequent
- NEW_STATE: 100x faster transitions

**At x1000 speed:**
- NEW_SECOND: Every 1ms (throttled to every 10ms in log)
- NEW_MINUTE: Every 60ms
- NEW_STEP: 1000x more frequent
- NEW_STATE: 1000x faster transitions

---

## RTC (Real-Time Clock) Simulator

### Time Format
All timestamps use **YYYY-MM-DD HH:MM:SS** format for consistency.

### RTC Structure
```typescript
interface RTCTime {
  year: number;
  month: number;      // 1-12
  day: number;        // 1-31
  hour: number;       // 0-23
  minute: number;     // 0-59
  second: number;     // 0-59
  dayOfWeek: number;  // 0-6 (Sunday-Saturday)
}
```

### Time Progression
- Starts at user-defined start date
- Progresses based on speed multiplier
- Handles day/month/year rollovers correctly
- Maintains accurate day of week

---

## Step Generator

### Archetype Presets

#### 1. Office Worker
- **Pattern**: Sedentary during work hours, some activity during breaks
- **Peak Hours**: 12:00-13:00 (lunch), 17:00-19:00 (after work)
- **Low Hours**: 22:00-06:00 (sleep), 09:00-12:00 (desk work)
- **Average Daily Steps**: 5,000-7,000

#### 2. Athlete
- **Pattern**: High activity during training sessions
- **Peak Hours**: 06:00-08:00 (morning run), 17:00-19:00 (evening workout)
- **Low Hours**: 22:00-06:00 (sleep), 13:00-16:00 (rest)
- **Average Daily Steps**: 12,000-18,000

#### 3. Sedentary
- **Pattern**: Minimal activity throughout day
- **Peak Hours**: 12:00-13:00 (lunch walk)
- **Low Hours**: Most of the day
- **Average Daily Steps**: 2,000-4,000

#### 4. Active Lifestyle
- **Pattern**: Consistent moderate activity
- **Peak Hours**: 07:00-09:00, 12:00-13:00, 18:00-20:00
- **Low Hours**: 22:00-06:00 (sleep)
- **Average Daily Steps**: 8,000-12,000

### Step Generation Logic
- Steps are generated per simulated second
- Amount varies based on:
  - Current hour of day
  - Archetype activity pattern
  - Current device state
  - Random variation for realism

---

## State Machine

### States

#### SLEEP
- **When**: Night hours (22:00-06:00) with minimal steps
- **Step Generation**: 0-1 steps per minute
- **Transitions To**: IDLE (when waking up)

#### IDLE
- **When**: Awake but minimal activity
- **Step Generation**: 0-5 steps per minute
- **Transitions To**: 
  - BACKGROUND (some activity detected)
  - SLEEP (night time with no activity)

#### BACKGROUND
- **When**: Light activity detected
- **Step Generation**: 5-20 steps per minute
- **Transitions To**:
  - ACTIVE (high activity detected)
  - IDLE (activity decreases)

#### ACTIVE
- **When**: Significant activity detected
- **Step Generation**: 20-100+ steps per minute
- **Transitions To**: BACKGROUND (activity decreases)

### State Transition Rules
1. **Activity-based**: Steps in last minute determine state
2. **Time-based**: Night hours favor SLEEP state
3. **Hysteresis**: Requires sustained change to prevent rapid switching
4. **Context-aware**: Considers archetype patterns

---

## Data Export

### JSON Export Format
Minute-by-minute step data in simple CSV-like format:

```
YYYY-MM-DD HH:MM:00, N_steps
2025-10-03 09:00:00, 45
2025-10-03 09:01:00, 52
2025-10-03 09:02:00, 38
```

### Filename Format
Auto-generated: `YYYY-MM-DD_SPEEDx_UUID.json`
- Example: `2025-10-06_100x_A3F2.json`
- User can edit filename before saving

---

## Dashboard Panels

### Panel A: Visualization
**Steps per Hour (7 Days)**
- Line chart showing hourly step data
- Smoothing options: 5h, 7h, 9h (Hann window)
- Shows both raw and smoothed data

**Steps per Day (365 Days)**
- Line chart showing daily step totals
- Smoothing options: 7d, 15d, 21d (Hann window)
- Shows both raw and smoothed data

### Panel B: Control Panel
**Controls** (compact horizontal layout):
- Speed: Number input + slider (1-1000)
- Start Date: Date picker (YYYY-MM-DD format)
- Duration: Number input (1-30 days)
- Archetype: Dropdown (Office/Athlete/Sedentary/Active)
- Play/Pause: Circular button (green play, orange pause)
- Filename: Editable text input (auto-generated on start)
- Save: Button showing minute count `Save (N)`
- Progress Bar: Shows simulation progress (0-100%)

### Panel C: Event Log
**Features**:
- Scrollable event list (newest first)
- Filter buttons: All, SECOND, MINUTE, STEP, STATE
- Event count display
- Clear all button
- Color-coded event types:
  - NEW_SECOND: Blue
  - NEW_MINUTE: Purple
  - NEW_STEP: Green
  - NEW_STATE: Orange

**Event Display**:
- Event type badge with icon
- Timestamp (YYYY-MM-DD HH:MM:SS)
- Event message
- Event data (JSON format)

---

## Technical Architecture

### Modular Design
All components are designed to be modular for future extensions:

1. **TimerEngine**: Handles time progression and speed control
2. **StepGenerator**: Generates steps based on archetypes
3. **StateMachine**: Manages device/user states
4. **EventSystem**: Delivers events in order
5. **Dashboard**: UI components (can be replaced/extended)

### Future Extensions
- **CALC Module**: Sleep-wake cycle calculations
- **CONTROLLER Module**: Advanced simulation control
- **Watch Face Module**: Visual watch face representation
- **Browser Widget**: Embeddable widget version

---

## Event Delivery Guarantees

1. **Chronological Order**: All events delivered in simulated time order
2. **No Skipping**: At any speed, all minute boundaries are processed
3. **Atomic Updates**: State changes are atomic and consistent
4. **Throttling**: Only NEW_SECOND events are throttled for display (all still processed internally)

---

## Performance Considerations

### High-Speed Simulation (x1000)
- Events generated every 1ms
- UI updates throttled to prevent lag
- Event log limited to last 100 events
- Charts update efficiently using data aggregation

### Memory Management
- Event log auto-prunes to 100 entries
- Step data stored efficiently in arrays
- No memory leaks in timer/event handlers

---

## Date/Time Consistency

All dates and times throughout the application use **YYYY-MM-DD** format:
- Event timestamps: `YYYY-MM-DD HH:MM:SS`
- Exported data: `YYYY-MM-DD HH:MM:00`
- Filenames: `YYYY-MM-DD_SPEEDx_UUID.json`
- Control panel: `YYYY-MM-DD` (date input)

This ensures visual consistency and easy date matching across the UI.
