# Watch Simulator - Testing Guide

## Quick Start

1. **Start the dev server**: `npm run dev`
2. **Open browser**: Navigate to http://localhost:3002
3. **Check layout**: Verify 3-panel dashboard (Visualization left top, Controls left bottom, Event Log right full height)

## Milestone 3 - Step Generator Testing

### Test 1: Basic Step Generation

**Objective**: Verify steps generate according to archetype

**Steps**:
1. Select "Office Worker" archetype
2. Set speed to x1
3. Click "Start"
4. Observe Event Log panel

**Expected Results**:
- NEW_SECOND events appear every second
- NEW_MINUTE events appear every 60 seconds
- NEW_STEP events appear periodically
- Step counts vary based on time of day (more during work hours for office worker)
- Visualization panel shows Office Worker pattern (8,000 steps/day goal)

**Pass Criteria**: ✅ Events appear in correct sequence, step counts reasonable for archetype

---

### Test 2: Archetype Switching

**Objective**: Verify changing archetype updates visualization

**Steps**:
1. Start with "Office Worker" archetype
2. Observe hourly distribution chart and daily step goal
3. Pause the simulation
4. Change archetype to "Athlete"
5. Resume simulation

**Expected Results**:
- Hourly distribution chart updates immediately to show athlete pattern
- Expected daily steps changes from 8,000 to 15,000
- Archetype name updates in visualization panel header
- Step generation follows new archetype pattern
- Higher step counts during training hours (6-8am, 5-7pm)

**Pass Criteria**: ✅ All visualizations update immediately, new pattern reflects athlete schedule

---

### Test 3: Speed Scaling x1

**Objective**: Verify real-time step generation accuracy

**Steps**:
1. Select "Active Lifestyle" archetype
2. Set speed to x1
3. Set start time to 10:00 AM (moderate activity hour)
4. Run for 60 real seconds

**Expected Results**:
- NEW_SECOND events appear every 1 real second
- NEW_STEP events appear several times (based on activity level)
- RTC time advances by exactly 60 seconds
- Total step count is reasonable (~100-150 steps for active archetype)
- No desync or drift

**Pass Criteria**: ✅ Time advances accurately, step counts match expected pattern

---

### Test 4: Speed Scaling x100

**Objective**: Verify step generation at moderate high speed

**Steps**:
1. Select "Athlete" archetype
2. Set speed to x100
3. Set start time to 6:00 AM (morning training)
4. Run for 10 real seconds

**Expected Results**:
- RTC advances by ~16.7 minutes (1000 seconds)
- NEW_SECOND events appear rapidly
- NEW_STEP events show high step counts (jogging during training)
- Event log shows continuous activity
- No missing events or gaps
- Visualization remains responsive

**Pass Criteria**: ✅ Time advances correctly (100x), step counts proportional to speed increase

---

### Test 5: Speed Scaling x1000 (Extreme)

**Objective**: Verify fractional step accumulation at extreme speed

**Steps**:
1. Select "Sedentary" archetype (lower step rate)
2. Set speed to x1000
3. Run for 5 real seconds

**Expected Results**:
- RTC advances by ~83 minutes (5000 seconds)
- Rapid event stream (may throttle display)
- Step counts accumulate accurately despite high speed
- Total steps after 83 minutes matches expected pattern
- No crashes or UI freezing
- Fractional steps not lost

**Pass Criteria**: ✅ Simulation remains stable, total step count accurate (no missing steps)

---

### Test 6: Hourly Activity Pattern

**Objective**: Verify steps follow archetype hourly schedule

**Steps**:
1. Select "Office Worker" archetype
2. Set speed to x100
3. Start at 8:00 AM
4. Run until 2:00 PM (covers work hours including lunch)

**Expected Results**:
- Higher step counts during:
  - 8-9 AM (morning commute)
  - 12-1 PM (lunch break)
- Lower step counts during:
  - 10-11 AM (desk work)
  - 2-5 PM (afternoon work)
- Event log shows varied step count messages
- Hourly chart accurately represents the pattern

**Pass Criteria**: ✅ Step generation matches hourly schedule defined in archetype

---

### Test 7: Cross-Midnight Boundary

**Objective**: Verify activity changes at day boundaries

**Steps**:
1. Select "Athlete" archetype
2. Set speed to x500
3. Start at 11:30 PM
4. Run for 2 minutes (crosses midnight)

**Expected Results**:
- Low/no steps before midnight (sleep)
- Transition to new day at 00:00
- Continue low steps after midnight (still sleep time)
- Day of week increments correctly
- No crashes or errors at boundary

**Pass Criteria**: ✅ Smooth transition across midnight, activity continues correctly

---

### Test 8: Full Day Simulation

**Objective**: Verify 24-hour step accuracy

**Steps**:
1. Select "Active Lifestyle" archetype
2. Set speed to x1000
3. Start at 00:00 (midnight)
4. Run for ~90 seconds (24 hours simulated)
5. Track final total step count

**Expected Results**:
- RTC advances through full 24 hours
- Step events throughout entire period
- Final step count close to 12,000 (Active archetype goal)
- Variation acceptable (±5-10%)
- No desync or drift
- Event log shows varied activity

**Pass Criteria**: ✅ Total steps ~12,000 ±10%, no performance degradation

---

### Test 9: Walking vs Jogging Activities

**Objective**: Verify different activity types generate different step rates

**Steps**:
1. Select "Athlete" archetype (has jogging activities)
2. Set speed to x10
3. Compare step rates during:
   - 3:00 AM (sleep - no steps)
   - 10:00 AM (light walking)
   - 6:00 AM (vigorous jogging)

**Expected Results**:
- Sleep: 0 steps/minute
- Light walking: ~36 steps/minute (120 * 0.3 multiplier)
- Vigorous jogging: ~180 steps/minute (180 * 1.0 multiplier)
- Clear difference in step event frequency

**Pass Criteria**: ✅ Jogging generates ~1.5x more steps than walking at same intensity

---

### Test 10: Event Log Accuracy

**Objective**: Verify event messages contain correct data

**Steps**:
1. Select any archetype
2. Set speed to x10
3. Run for 30 seconds
4. Examine event log messages

**Expected Results**:
- NEW_STEP events show:
  - "+X" steps added
  - "Total: Y" cumulative count
  - Activity type (walking/jogging)
  - Activity level (sleep/sedentary/light/moderate/vigorous)
- Messages are clear and informative
- Total counts increment correctly
- No duplicate messages

**Pass Criteria**: ✅ All event messages accurate and properly formatted

---

## Milestone 2 - Timer Module Testing

### Test 11: Timer Accuracy at x1

**Steps**:
1. Set speed to x1
2. Start simulation
3. Wait for 60 real seconds
4. Check RTC display

**Expected**: RTC advances by exactly 1 minute (60 seconds)

---

### Test 12: Speed Change During Simulation

**Steps**:
1. Start at speed x1
2. After 10 seconds, change to x100
3. After 10 more seconds, change to x1000
4. Verify RTC time accuracy

**Expected**: Time advances correctly at each speed, no jumps or desync

---

### Test 13: Pause and Resume

**Steps**:
1. Start simulation
2. Note current RTC time
3. Pause for 10 real seconds
4. Resume simulation

**Expected**: RTC time remains frozen during pause, resumes accurately

---

## Milestone 1 - Dashboard Layout Testing

### Test 14: Responsive Layout

**Steps**:
1. Resize browser window
2. Test various widths (desktop, tablet, mobile)

**Expected**:
- Desktop: 3-column layout (Viz 2/3, Controls 1/3, Log right)
- Tablet/Mobile: Stacked panels

---

### Test 15: Chart Interactivity

**Steps**:
1. Hover over hourly distribution chart
2. Check tooltip displays

**Expected**: Tooltip shows hour and step count on hover

---

## Performance Testing

### Test 16: Memory Stability

**Steps**:
1. Open browser dev tools (Performance tab)
2. Run simulation at x1000 for 5 minutes
3. Monitor memory usage

**Expected**: No memory leaks, stable memory usage

---

### Test 17: UI Responsiveness

**Steps**:
1. Run simulation at x1000
2. Try interacting with controls
3. Change archetype during high-speed run

**Expected**: UI remains responsive, no freezing

---

## Error Handling

### Test 18: Invalid Speed Values

**Steps**:
1. Try to set speed < 1 or > 1000 via slider

**Expected**: Slider constrained to 1-1000 range

---

### Test 19: Invalid Duration

**Steps**:
1. Try to set duration < 1 or > 30 days

**Expected**: Input constrained to valid range

---

## Regression Testing Checklist

After any code changes, verify:

- ✅ Dashboard loads without errors
- ✅ All three panels visible and properly sized
- ✅ Timer starts and stops correctly
- ✅ Speed slider works
- ✅ Archetype selector works
- ✅ Charts display data
- ✅ Event log shows events
- ✅ RTC time advances
- ✅ No console errors
- ✅ No performance degradation

## Known Behaviors

### Expected Variations
- Step counts may vary ±5-10% from expected daily totals due to:
  - Probabilistic activity selection
  - Fractional step rounding
  - Simulation start/stop times

### Normal Behaviors
- Event log auto-scrolls to latest events
- Events are pruned to most recent 100
- Charts update only when archetype changes
- Speed changes affect future events, not past

## Troubleshooting

### Issue: No step events appearing
- **Check**: Is current simulated time during sleep hours? (Check archetype schedule)
- **Solution**: Fast-forward to daytime hours or change archetype

### Issue: Step counts seem low
- **Check**: Which archetype is selected? Sedentary only generates 4,000/day
- **Solution**: Switch to Athlete (15,000/day) for higher counts

### Issue: UI freezing at high speeds
- **Check**: Is browser dev tools open? (Logging can slow rendering)
- **Solution**: Close dev tools or reduce speed

### Issue: Charts not updating
- **Check**: Did you change archetype? (Charts show pattern, not real-time)
- **Solution**: Charts are correct - they show expected pattern, not accumulation

## Success Criteria Summary

**Milestone 3 Complete** when all these pass:

✅ Four archetypes implemented and selectable
✅ Archetype switching updates visualization
✅ Hourly distribution chart shows correct pattern
✅ Expected daily steps displays correctly
✅ Step events generate during simulation
✅ Steps scale correctly with speed (x1, x100, x1000)
✅ No missing or duplicate step events
✅ Walking (120/min) and jogging (180/min) rates differ
✅ Activity levels modify step rates correctly
✅ Full 24-hour simulation reaches expected total

## Next Milestone Preview

**Milestone 4 - State Machine** will add:
- SLEEP / IDLE / BACKGROUND / ACTIVE states
- State transitions based on activity and time
- State-aware step generation
- State visualization in dashboard
