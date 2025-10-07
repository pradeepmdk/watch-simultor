# Watch Simulator - Project Architecture

## Overview
The watch simulator is now organized with a clean separation between backend simulation engine and frontend UI components.

## Project Structure

```
watch-simulator/
├── backend/                          # Backend simulation engine
│   ├── device/                       # Device-related modules
│   │   ├── Timer.ts                  # Device clock (100ms ticks)
│   │   ├── Sensor.ts                 # User behavior simulator
│   │   └── Device.ts                 # Device orchestrator
│   │
│   └── simulation/                   # Simulation control modules
│       ├── SimulationTimer.ts        # Wall time adapter (speed control)
│       └── Simulator.ts              # Main simulation orchestrator
│
├── src/                              # Frontend (Next.js/React)
│   ├── app/                          # Next.js App Router
│   ├── components/                   # React components
│   └── lib/                          # Frontend libraries
│       └── simulation/
│           └── useSimulator.ts       # React hook bridging backend
│
├── config.json                       # Global simulation configuration
└── run_simulation.js                 # CLI launcher for testing
```

## Module Responsibilities

### Backend Modules

#### `Timer.ts` - Device Clock
**Purpose**: Maintains the simulated device's internal clock
- Emits `NEW_SECOND` and `NEW_MINUTE` interrupts
- Provides RTC (Real-Time Clock) API
- Independent of wall time - driven by simulation frames

**Key Methods**:
- `tick(deltaMs)` - Advance device time by specified milliseconds
- `getRTC()` - Get current device time components
- `getCurrentTime()` - Get device time as Date object

#### `Sensor.ts` - User Behavior Simulation
**Purpose**: Simulates user behavior and device state
- Generates step events based on archetype and time
- Manages device state machine (IDLE, ACTIVE, SLEEP, etc.)
- Modulates step generation based on device state

**Key Methods**:
- `processTick(currentTime, deltaSeconds)` - Process a time tick
- `setArchetype(archetypeId)` - Change user behavior pattern
- `getTotalSteps()` - Get accumulated steps

#### `Device.ts` - Device Orchestrator
**Purpose**: Main device controller that orchestrates Timer and Sensor
- Coordinates device clock and sensor behavior
- Provides unified interface for simulation control
- Manages event aggregation from Timer and Sensor

**Key Methods**:
- `tick(deltaMs)` - Receive tick signal from SimulationTimer
- `getRTC()` - Get device RTC
- `getTotalSteps()` - Get total steps from sensor

#### `SimulationTimer.ts` - Wall Time Adapter
**Purpose**: Converts wall time to simulation time based on speed multiplier
- Manages the simulation clock (wall time)
- Applies speed multiplier (1x to 1000x)
- Handles frame skipping for high speeds (>20x)
- Provides tick signals to Device

**Key Concepts**:
- This is NOT device time - it's the simulation engine's clock
- Drives the device at accelerated speeds
- Uses `requestAnimationFrame` for smooth operation

**Key Methods**:
- `start()` - Start simulation timer
- `setSpeed(speed)` - Set speed multiplier (1-1000)
- `setTickCallback(callback)` - Set callback for tick events

#### `Simulator.ts` - Main Simulation Orchestrator
**Purpose**: Coordinates the entire simulation
- Creates and manages Device instance
- Manages SimulationTimer (wall time clock)
- Bridges wall time to device time
- Provides unified control interface

**Key Methods**:
- `start()` - Start the simulation
- `pause()` - Pause the simulation
- `setSpeed(speed)` - Set simulation speed
- `getState()` - Get current simulation state
- `addEventListener(type, callback)` - Subscribe to events

### Frontend Modules

#### `useSimulator.ts` - React Hook Bridge
**Purpose**: Bridges the new backend architecture with React frontend
- Wraps the Simulator class for React integration
- Integrates with Redux state management
- Manages event subscriptions and state updates

**Usage**:
```typescript
import { useSimulator } from '../lib/simulation/useSimulator';

export default function Dashboard() {
  useSimulator(); // Initialize and run simulation
  // ... rest of component
}
```

## Time Architecture

### Two Separate Time Domains

1. **Wall Time (SimulationTimer)**:
   - Real-world clock × speed slider
   - Managed by `SimulationTimer`
   - Runs at variable speed (1x to 1000x)
   - Uses `requestAnimationFrame`

2. **Device Time (Timer)**:
   - Simulated device's internal clock
   - Managed by `Timer`
   - Receives consistent 100ms-equivalent ticks
   - Independent of wall clock speed

### Why Separate Time Domains?

JavaScript poorly updates frames at rates > 20x, so to simulate faster speeds (up to x1000):
- Skip "wall time" frames when needed
- Add more "device time" ticks for each frame increment
- Maintain consistent device behavior regardless of speed

### Data Flow

```
SimulationTimer (wall time, variable speed)
    ↓ tick(deltaMs)
Device
    ↓ tick(deltaMs)
Timer (device time, consistent ticks)
    ↓ every second
Sensor (generates steps based on device time)
    ↓ events
Frontend (via useSimulator hook)
    ↓
Redux Store → UI Components
```

## Event System

### Event Types

1. **NEW_SECOND**:
   - Emitted every simulated second
   - Used for high-frequency updates

2. **NEW_MINUTE**:
   - Emitted every simulated minute
   - Used for progress tracking and state machine updates

3. **NEW_STEP**:
   - Emitted when steps are generated
   - Includes step count and total steps

4. **NEW_STATE**:
   - Emitted when device state changes (IDLE → ACTIVE, etc.)
   - Includes transition reason

### Event Flow

```
Timer → Device → Simulator → useSimulator → Redux → UI
Sensor → Device → Simulator → useSimulator → Redux → UI
```

## Configuration

### `config.json`
Global simulation parameters:
```json
{
  "simulation": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "duration": 7,              // days
    "speed": 1,                 // 1x to 1000x
    "archetype": "office",      // office, gym, flexible, shift
    "autoStop": true
  },
  "device": {
    "tickIntervalMs": 100,
    "enableSensors": true
  }
}
```

## Usage

### Frontend (Next.js)
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
```

### CLI Testing
```bash
npm run simulate  # Run CLI simulation
```

### Programmatic Usage
```javascript
import { Simulator } from './backend/simulation/Simulator';

const simulator = new Simulator({
  startDate: new Date(),
  archetype: 'office',
  speed: 10,
  duration: 7
});

simulator.addEventListener('NEW_STEP', (event) => {
  console.log('Steps:', event.data.steps);
});

simulator.start();
```

## Key Design Principles

1. **Separation of Concerns**:
   - Backend handles simulation logic
   - Frontend handles UI and state management
   - Clear interfaces between layers

2. **Event-Driven Architecture**:
   - Modules communicate via events
   - Loose coupling between components
   - Easy to extend with new modules

3. **Time Domain Separation**:
   - Wall time and device time are independent
   - Enables high-speed simulation
   - Maintains consistent device behavior

4. **Scalability**:
   - Easy to add new device components (plug into Device.ts)
   - Clear module boundaries
   - Future-ready for additional features

## Future Enhancements

### Potential Additions to Backend
- Battery module (in `backend/device/Battery.ts`)
- Display module (in `backend/device/Display.ts`)
- GPS module (in `backend/device/GPS.ts`)

### Potential Frontend Improvements
- Move all frontend code to `frontend/` directory
- Separate API routes for backend communication
- WebSocket for real-time updates
- Multiple dashboard views

## Notes

- Backend modules use TypeScript but are compatible with JavaScript via compilation
- Frontend uses Next.js 15 with App Router
- State management via Redux Toolkit
- All backend modules are ES modules
