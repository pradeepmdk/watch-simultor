# Archetype System: How Person Types Drive Step Generation

## 🎭 **Archetype Overview**

Archetypes are the **personality profiles** that determine when, how much, and what type of activity occurs throughout the day. Each archetype represents a different lifestyle with realistic activity patterns.

---

## 📊 **Archetype Structure**

### **Basic Properties**
```typescript
interface ArchetypeDefinition {
  id: string;              // Unique identifier ('office', 'athlete', etc.)
  name: string;           // Display name ('Office Worker')
  description: string;    // Short description
  dailyStepGoal: number;  // Target steps per day (8,000 for office)
  schedule: HourlyActivity[]; // 24-hour activity schedule
}
```

### **Hourly Activity Pattern**
```typescript
interface HourlyActivity {
  hour: number;              // 0-23 (hour of day)
  level: ActivityLevel;      // 'sleep' | 'sedentary' | 'light' | 'moderate' | 'vigorous'
  type: ActivityType;        // 'walking' | 'jogging'
  probability: number;       // 0-1 (chance of activity this hour)
}
```

---

## 🏢 **Available Archetypes**

### **1. Office Worker** (8,000 steps/day)
**Pattern:** Sedentary job with commute breaks
- **6-7 AM**: Moderate walking (morning commute)
- **9-5 PM**: Sedentary (desk work) with light breaks
- **12 PM**: Moderate walking (lunch break)
- **5-6 PM**: Moderate walking (evening commute)
- **10 PM-6 AM**: Sleep (no activity)

### **2. Athlete** (15,000 steps/day)
**Pattern:** Training-focused lifestyle
- **6-7 AM**: Vigorous jogging (morning run)
- **3-4 PM**: Vigorous jogging (afternoon training)
- **10 AM-2 PM**: Moderate walking (active recovery)
- **Consistent high activity** throughout day

### **3. Sedentary** (4,000 steps/day)
**Pattern:** Minimal movement lifestyle
- **Most hours**: Sedentary (very low activity)
- **Brief periods**: Light activity for basic needs
- **12 PM**: Light walking (lunch)
- **Very low probability** of movement

### **4. Active Lifestyle** (12,000 steps/day)
**Pattern:** Balanced active routine
- **6-8 AM**: Moderate walking/jogging (morning activity)
- **Multiple periods**: Moderate walking throughout day
- **6-7 PM**: Vigorous jogging (evening exercise)
- **Regular activity** with good work-life balance

---

## ⚙️ **How Archetypes Drive Step Generation**

### **Step 1: Get Current Hour's Activity**
```typescript
// Get activity pattern for current hour
const activity = getActivityForHour(archetype, currentTime.getHours());

// Example: Office worker at 7 AM
activity = {
  hour: 7,
  level: 'moderate',      // Activity intensity
  type: 'walking',        // Walking or jogging
  probability: 0.8        // 80% chance of activity
}
```

### **Step 2: Probability Check**
```typescript
// Random check: should we generate steps this second?
const shouldGenerateSteps = Math.random() < activity.probability;

// Example: 80% probability = 8/10 chance of activity
if (Math.random() < 0.8) {
  // Generate steps
} else {
  // No steps this second
}
```

### **Step 3: Calculate Step Rate**
```typescript
// Base step rate for activity type
const baseStepsPerMinute = STEP_RATES[activity.type];
const baseStepsPerSecond = baseStepsPerMinute / 60;

// Apply activity level multiplier
const activityMultiplier = ACTIVITY_MULTIPLIERS[activity.level];

// Apply device state multiplier (Milestone 4)
const finalStepsPerSecond = baseStepsPerSecond * activityMultiplier * stateMultiplier;
```

**Real Examples:**
- **Office Worker, 7 AM, Moderate Walking:**
  - Base: `120 steps/min ÷ 60 = 2 steps/sec`
  - Activity: `× 0.6 = 1.2 steps/sec`
  - State: `× 1.0 (ACTIVE) = 1.2 steps/sec`

- **Athlete, 6 AM, Vigorous Jogging:**
  - Base: `180 steps/min ÷ 60 = 3 steps/sec`
  - Activity: `× 0.9 = 2.7 steps/sec`
  - State: `× 1.0 (ACTIVE) = 2.7 steps/sec`

### **Step 4: Fractional Accumulation**
```typescript
// Accumulate steps over time
accumulatedSteps += finalStepsPerSecond * deltaSeconds;

// Only emit when we have whole steps
if (accumulatedSteps >= 1) {
  const steps = Math.floor(accumulatedSteps);
  accumulatedSteps -= steps; // Keep remainder
  
  emitNewStepEvent(steps);
}
```

---

## 🎯 **Archetype Impact on Simulation**

### **Daily Step Totals**
- **Office Worker**: ~8,000 steps (realistic for desk job)
- **Athlete**: ~15,000 steps (training-focused)
- **Sedentary**: ~4,000 steps (minimal activity)
- **Active**: ~12,000 steps (balanced lifestyle)

### **Activity Patterns**
- **Time-of-Day Variation**: Different archetypes have different peak hours
- **Weekend vs Weekday**: Some archetypes could have different weekend patterns
- **Probability Distribution**: Creates natural variation in step timing

### **State Machine Integration**
Archetypes provide the **activity context** that the state machine uses:
- High activity hours → More likely to transition to ACTIVE state
- Low activity hours → More likely to transition to IDLE state
- Sleep hours → Always SLEEP state regardless of archetype

---

## 🔧 **Adding New Archetypes**

### **Template Structure**
```typescript
const NEW_ARCHETYPE: ArchetypeDefinition = {
  id: 'custom',
  name: 'Custom Lifestyle',
  description: 'Your description here',
  dailyStepGoal: 10000,
  schedule: [
    // 24 hours of activity patterns
    { hour: 0, level: 'sleep', type: 'walking', probability: 0 },
    { hour: 1, level: 'sleep', type: 'walking', probability: 0 },
    // ... continue for all 24 hours
    { hour: 23, level: 'sedentary', type: 'walking', probability: 0.1 },
  ],
};
```

### **Design Guidelines**
1. **Sleep Hours**: 22:00-06:00 should be `level: 'sleep'`, `probability: 0`
2. **Activity Peaks**: Add realistic activity peaks (commutes, exercise, meals)
3. **Probability Balance**: Higher probability for consistent activities
4. **Step Goal Match**: Daily total should roughly match `dailyStepGoal`

### **Integration Steps**
1. Add to `ARCHETYPES` record in `archetypes.ts`
2. Update UI dropdown in `ControlPanel.tsx`
3. Test with different speeds (x1, x100, x1000)

---

## 📈 **Visualization Impact**

Archetypes directly drive the **hourly step charts**:
- **X-axis**: 168 hours (7 days)
- **Y-axis**: Steps per hour
- **Pattern**: Visible daily rhythms based on archetype schedule
- **Smoothing**: Hann window shows activity trends

**Example Charts:**
- **Office Worker**: Peaks at 7-8 AM, 12 PM, 5-6 PM (commute/lunch)
- **Athlete**: High activity 6-7 AM, 3-4 PM (training sessions)
- **Sedentary**: Flat line with minimal peaks (basic needs only)

---

## 🎮 **Testing Archetypes**

### **Quick Test**
1. Select archetype in dropdown
2. Set speed to x10
3. Start simulation for 30 seconds
4. Check event log for step patterns
5. Switch archetypes and compare

### **Full Day Test**
1. Set speed to x1000
2. Set duration to 7 days
3. Run full simulation (~10 seconds real time)
4. Analyze hourly chart patterns
5. Check total steps vs daily goal

### **State Integration Test**
1. Use Active Lifestyle archetype
2. Run at x100 speed
3. Watch state panel transitions
4. Note how archetype activity drives state changes

---

Archetypes are the **behavioral foundation** of the simulator, creating realistic step patterns that match different lifestyles and drive both step generation and device state transitions! 🏃‍♂️
