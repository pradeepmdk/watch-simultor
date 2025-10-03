# Archetype Flow Diagram

```
┌─────────────────┐
│   Current Time  │
│   14:30:45      │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│   Get Hour      │    │   Archetype      │
│   hour = 14     │    │   Schedule[14]   │
└─────────────────┘    └──────────────────┘
         │                       │
         └───────────────────────┘
                 ▼
┌─────────────────┐
│   HourlyActivity│
│   {             │
│     hour: 14,   │
│     level: 'moderate' │
│     type: 'walking'   │
│     probability: 0.6  │
│   }             │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│ Probability     │    │ Random Check     │
│ Check           │───▶│ Math.random()    │
│ 0.6 > 0.3?      │    │ < 0.6? ✓         │
└─────────────────┘    └──────────────────┘
         │                       │
         └───────────────────────┘
                 ▼
┌─────────────────┐    ┌──────────────────┐
│   Calculate     │    │   Base Rate      │
│   Step Rate     │    │   walking: 120   │
│                 │    │   jogging: 180   │
│   120 ÷ 60 = 2  │    │   steps/min       │
│   steps/sec      │    │                  │
└─────────────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│ Activity Level  │    │   Multiplier      │
│ moderate        │───▶│   × 0.6           │
│                 │    │   = 1.2 steps/sec │
└─────────────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│ Device State    │    │   State           │
│ ACTIVE          │───▶│   Multiplier      │
│                 │    │   × 1.0           │
│   Final: 1.2    │    │   = 1.2 steps/sec │
│   steps/sec     │    │                   │
└─────────────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│   Accumulate    │    │   Fractional     │
│   Steps         │    │   Accumulation   │
│   +1.2 * Δt     │    │   Keep < 1       │
└─────────────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│   Check >= 1    │    │   Emit Event     │
│   accumulated   │───▶│   NEW_STEP       │
│   >= 1?         │    │   +step count     │
└─────────────────┘    └──────────────────┘
```

## Archetype Examples

### Office Worker (8,000 steps/day)
```
Hour 7 (Morning Commute):
├── level: 'moderate' (0.6x)
├── type: 'walking' (120 steps/min)
├── probability: 0.8
└── Result: ~1.2 steps/sec when active

Hour 10 (Desk Work):
├── level: 'sedentary' (0.05x)
├── type: 'walking' (120 steps/min)
├── probability: 0.3
└── Result: ~0.03 steps/sec (very few steps)
```

### Athlete (15,000 steps/day)
```
Hour 6 (Morning Run):
├── level: 'vigorous' (0.9x)
├── type: 'jogging' (180 steps/min)
├── probability: 0.9
└── Result: ~2.7 steps/sec when active

Hour 22 (Sleep):
├── level: 'sleep' (0.0x)
├── type: 'walking'
├── probability: 0.0
└── Result: 0 steps/sec (always)
```

## Key Points

1. **Time-Based**: Each hour has different activity patterns
2. **Probabilistic**: Random chance determines if steps occur
3. **Multiplicative**: Activity level × State multiplier = final rate
4. **Fractional**: Accumulates over time for precision
5. **Realistic**: Patterns match real human behavior

This creates natural, lifelike step generation that varies by time of day, activity level, and device state! 🏃‍♂️
