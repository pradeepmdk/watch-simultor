# Watch Simulator - Quick Start Guide

## 🚀 Start the App

```bash
npm run dev
```

Open: **http://localhost:3002**

## 📊 Dashboard Overview

```
┌─────────────────────────────────────────┬──────────────────────┐
│  📈 VISUALIZATION PANEL                 │  📝 EVENT LOG        │
│  - Hourly step distribution chart       │  - Real-time events  │
│  - Expected daily steps                 │  - Color-coded       │
│  - Archetype info                       │  - Filterable        │
├─────────────────────────────────────────┤  - Auto-scroll       │
│  🎮 CONTROL PANEL                       │                      │
│  - Speed slider (1x-1000x)              │                      │
│  - Start/Pause button                   │                      │
│  - Archetype selector                   │                      │
│  - Date & duration inputs               │                      │
├─────────────────────────────────────────┤                      │
│  🔄 STATE PANEL                         │                      │
│  - Current device state                 │                      │
│  - State distribution chart             │                      │
│  - Step multiplier display              │                      │
└─────────────────────────────────────────┴──────────────────────┘
```

## 🎯 Quick Test Scenarios

### 1. Basic Simulation (30 seconds)
1. Select **"Athlete"** archetype
2. Set speed to **x100**
3. Click **"Start"**
4. Watch:
   - ✅ Events appear in log
   - ✅ Steps accumulate
   - ✅ State changes (IDLE → ACTIVE)
   - ✅ Chart shows athlete pattern (15,000 steps/day)

### 2. Full Day Simulation (90 seconds)
1. Select **"Office Worker"** archetype
2. Set speed to **x1000**
3. Set start time to **00:00**
4. Click **"Start"**
5. Observe:
   - ✅ Night: SLEEP state (no steps)
   - ✅ Morning: IDLE → ACTIVE (commute)
   - ✅ Day: IDLE (desk work)
   - ✅ Evening: ACTIVE → IDLE (commute home)
   - ✅ Total: ~8,000 steps

### 3. State Transition Test
1. Select **"Active Lifestyle"** archetype
2. Speed **x10**
3. Start at **10:00 AM**
4. Watch state panel:
   - ✅ IDLE (low activity)
   - ✅ BACKGROUND (light walking)
   - ✅ ACTIVE (exercise detected)
   - ✅ State distribution updates

## 🏆 Features Checklist

### Milestone 1 - Dashboard ✅
- [x] 4-panel responsive layout
- [x] Dark theme with gradients
- [x] Real-time charts (Recharts)
- [x] Event log with filtering

### Milestone 2 - Timer ✅
- [x] Speed control (1x-1000x)
- [x] High-precision timing
- [x] NEW_SECOND/NEW_MINUTE events
- [x] RTC time display
- [x] No desync at any speed

### Milestone 3 - Steps ✅
- [x] 4 archetypes (Office, Athlete, Sedentary, Active)
- [x] Walking (120 spm) & Jogging (180 spm)
- [x] 5 activity levels
- [x] Fractional accumulation
- [x] Hourly distribution charts

### Milestone 4 - State Machine ✅
- [x] 4 states (SLEEP/IDLE/BACKGROUND/ACTIVE)
- [x] Automatic transitions
- [x] Step modulation (0%, 30%, 70%, 100%)
- [x] State visualization
- [x] NEW_STATE events

## 🎨 Archetypes

| Archetype | Daily Goal | Pattern |
|-----------|-----------|---------|
| 😴 **Office Worker** | 8,000 steps | Commute peaks (8-9am, 5-6pm), lunch walk |
| 🏃 **Athlete** | 15,000 steps | Morning run (6-8am), evening workout (5-7pm) |
| 🛋️ **Sedentary** | 4,000 steps | Minimal movement, basic needs only |
| 🚶 **Active** | 12,000 steps | Regular activity throughout day |

## 🔄 Device States

| State | Icon | Multiplier | When |
|-------|------|-----------|------|
| **SLEEP** | 😴 | 0% | Night (22:00-06:00) + no activity |
| **IDLE** | 💤 | 30% | Sedentary, >3min inactive |
| **BACKGROUND** | 📱 | 70% | Light activity (10-30 steps/min) |
| **ACTIVE** | 🏃 | 100% | Exercise, >30 steps/min |

## 📈 Event Types

- ⏱️ **NEW_SECOND**: Timer tick (every second)
- ⏰ **NEW_MINUTE**: Minute boundary (every 60s)
- 👣 **NEW_STEP**: Steps detected (varies by activity)
- 🔄 **NEW_STATE**: Device state changed

## 🛠️ Controls

### Speed Slider
- **1x**: Real-time (1 sim second = 1 real second)
- **x10**: 10x faster (1 sim minute = 6 real seconds)
- **x100**: 100x faster (1 sim hour = 36 real seconds)
- **x1000**: 1000x faster (1 sim day = 86 real seconds)

### Buttons
- **▶️ Start**: Begin simulation
- **⏸️ Pause**: Pause simulation
- **💾 Save**: Export to JSON
- **🗑️ Clear Events**: Clear event log

## 📚 Documentation

- **MILESTONE_2.md**: Timer technical details
- **MILESTONE_3.md**: Step generator architecture
- **MILESTONE_4.md**: State machine implementation
- **TESTING_GUIDE.md**: 19 test procedures
- **PROJECT_COMPLETE.md**: Full project summary

## ⚡ Performance Tips

1. **High Speed Testing**: Use x1000 for quick 24h simulation
2. **State Analysis**: Let simulation run 5+ min for accurate state distribution
3. **Chart Updates**: Switch archetypes to see different patterns
4. **Event Filtering**: Use filter buttons to focus on specific event types

## 🐛 Troubleshooting

### No step events appearing?
- Check current time - might be during sleep hours
- Switch to different archetype (try Athlete)
- Ensure simulation is running (not paused)

### UI freezing at high speeds?
- Close browser dev tools (logging slows rendering)
- Reduce speed temporarily
- Clear event log

### Charts not updating?
- Charts show **expected pattern**, not real-time accumulation
- Change archetype to see update
- This is correct behavior!

## ✅ Success Indicators

You'll know it's working when:
- ✅ Events stream continuously in log panel
- ✅ RTC time advances at selected speed
- ✅ Steps accumulate in event messages
- ✅ State changes based on activity
- ✅ Charts reflect archetype pattern
- ✅ State distribution updates over time

---

**Status**: 🎉 All 4 Milestones Complete
**Server**: http://localhost:3002
**Ready**: Production-quality simulator!
