# Archetype Quick Reference

## 🏢 **Office Worker** (8,000 steps/day)
**Sedentary job with commute breaks**

| Hour | Activity | Level | Probability | Steps/sec (ACTIVE) |
|------|----------|-------|-------------|-------------------|
| 0-5 | Sleep | sleep | 0% | 0 |
| 6 | Morning prep | light | 70% | ~0.42 |
| 7 | Morning commute | **moderate** | **80%** | **~1.2** |
| 8 | To work | light | 60% | ~0.36 |
| 9-10 | Desk work | sedentary | 30% | ~0.018 |
| 11 | Break | light | 40% | ~0.24 |
| 12 | **Lunch walk** | **moderate** | **70%** | **~1.2** |
| 13-15 | Desk work | sedentary | 30% | ~0.018 |
| 16 | Afternoon break | light | 40% | ~0.24 |
| 17 | **Evening commute** | **moderate** | **80%** | **~1.2** |
| 18-21 | Evening | light | 40-60% | ~0.24-0.36 |
| 22-23 | Wind down | sedentary | 10-20% | ~0.006-0.012 |

## 🏃 **Athlete** (15,000 steps/day)
**Training-focused lifestyle**

| Hour | Activity | Level | Probability | Steps/sec (ACTIVE) |
|------|----------|-------|-------------|-------------------|
| 0-4 | Sleep | sleep | 0% | 0 |
| 5 | Early prep | light | 60% | ~0.36 |
| 6-7 | **Morning run** | **vigorous** | **90%** | **~2.7** |
| 8-9 | Recovery | moderate | 50-60% | ~0.9-1.08 |
| 10-13 | Active recovery | moderate | 60-70% | ~1.08-1.26 |
| 14-15 | Afternoon prep | moderate | 60-70% | ~1.08-1.26 |
| 16-17 | **Afternoon training** | **vigorous** | **90%** | **~2.7** |
| 18-21 | Recovery | moderate | 50-60% | ~0.9-1.08 |
| 22-23 | Wind down | sedentary | 10-20% | ~0.006-0.012 |

## 🛋️ **Sedentary** (4,000 steps/day)
**Minimal movement lifestyle**

| Hour | Activity | Level | Probability | Steps/sec (ACTIVE) |
|------|----------|-------|-------------|-------------------|
| 0-6 | Sleep | sleep | 0% | 0 |
| 7-8 | Basic morning | sedentary | 30-40% | ~0.018-0.024 |
| 9-11 | Work from home | sedentary | 20% | ~0.012 |
| 12 | **Lunch** | **light** | **30%** | **~0.18** |
| 13-17 | Minimal activity | sedentary | 20% | ~0.012 |
| 18-21 | Evening basics | light | 30% | ~0.18 |
| 22-23 | Wind down | sedentary | 10% | ~0.006 |

## 🚶 **Active Lifestyle** (12,000 steps/day)
**Balanced active routine**

| Hour | Activity | Level | Probability | Steps/sec (ACTIVE) |
|------|----------|-------|-------------|-------------------|
| 0-5 | Sleep | sleep | 0% | 0 |
| 6 | **Morning walk** | **moderate** | **80%** | **~1.44** |
| 7 | Sometimes jog | moderate | 60% | ~1.08 |
| 8 | Light activity | light | 70% | ~0.42 |
| 9-11 | Regular activity | moderate | 60% | ~1.08 |
| 12 | **Lunch walk** | **moderate** | **70%** | **~1.26** |
| 13-16 | Active day | moderate | 50-60% | ~0.9-1.08 |
| 17 | Evening walk | moderate | 70% | ~1.26 |
| 18 | **Evening exercise** | **vigorous** | **70%** | **~2.1** |
| 19-20 | Recovery | light | 40-50% | ~0.24-0.3 |
| 21 | Light evening | light | 40% | ~0.24 |
| 22-23 | Wind down | sedentary | 10-20% | ~0.006-0.012 |

## 📊 **Key Multipliers**

### Activity Level Multipliers
```
sleep:      0.0   (no steps)
sedentary:  0.05  (minimal movement)
light:      0.3   (light activity)
moderate:   0.6   (moderate activity)
vigorous:   0.9   (high activity)
```

### Device State Multipliers
```
SLEEP:      0.0   (no steps during sleep)
IDLE:       0.3   (reduced activity)
BACKGROUND: 0.7   (moderate reduction)
ACTIVE:     1.0   (full activity)
```

### Step Rate Bases
```
Walking: 120 steps/minute = 2 steps/second
Jogging: 180 steps/minute = 3 steps/second
```

## 🎯 **Usage in Code**

```typescript
// Get activity for current hour
const activity = getActivityForHour(archetype, currentHour);

// Calculate final step rate
const baseRate = STEP_RATES[activity.type] / 60;  // steps/sec
const activityMult = ACTIVITY_MULTIPLIERS[activity.level];
const stateMult = getCurrentStateMultiplier();
const finalRate = baseRate * activityMult * stateMult;

// Example: Office worker, moderate walking, ACTIVE state
// 2.0 × 0.6 × 1.0 = 1.2 steps/second
```

## 🔍 **Testing Tips**

- **Office Worker**: Look for commute peaks (7-8 AM, 5-6 PM)
- **Athlete**: Watch for training sessions (6-7 AM, 3-4 PM)
- **Sedentary**: Expect very few steps, mostly at meal times
- **Active**: Consistent moderate activity throughout day

Archetypes create realistic step patterns that match different lifestyles! 🏃‍♂️
