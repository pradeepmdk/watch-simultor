/**
 * useTimer Hook - Manages TimerEngine, StepGenerator, and StateMachine integration
 */

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  updateCurrentTime,
  addEvent,
  setProgress,
  addStepsToHour,
  addStepsToDay,
  addMinuteSteps,
  pauseTimer,
} from '../features/timerSlice';
import { TimerEngine } from './TimerEngine';
import { TimerEvent } from './types';
import { StepGenerator } from '../steps/StepGenerator';
import { StateMachine } from '../state/StateMachine';
import { StateContext } from '../state/types';
import { getActivityForHour } from '../steps/archetypes_new';

export function useTimer() {
  const dispatch = useAppDispatch();
  const timerState = useAppSelector((state) => state.timer);
  const timerEngineRef = useRef<TimerEngine | null>(null);
  const stepGeneratorRef = useRef<StepGenerator | null>(null);
  const stateMachineRef = useRef<StateMachine | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const stepsInLastMinuteRef = useRef<number>(0);
  const lastMinuteRef = useRef<number>(-1);
  const secondCounterRef = useRef<number>(0);

  // Initialize TimerEngine, StepGenerator, and StateMachine
  useEffect(() => {
    const startDate = timerState.startDate
      ? new Date(timerState.startDate)
      : new Date();

    timerEngineRef.current = new TimerEngine(startDate);
    stepGeneratorRef.current = new StepGenerator(timerState.archetype);
    stateMachineRef.current = new StateMachine('IDLE'); // Start in IDLE state
    lastUpdateTimeRef.current = performance.now();

    // Subscribe to timer events
    const handleEvent = (event: TimerEvent) => {
      // Update RTC time
      if (timerEngineRef.current) {
        dispatch(updateCurrentTime(timerEngineRef.current.getRTC()));
      }

      // Generate steps on each second (with state machine integration)
      if (event.type === 'NEW_SECOND' && stepGeneratorRef.current && timerEngineRef.current && stateMachineRef.current) {
        const currentTime = timerEngineRef.current.getCurrentTime();
        
        // Use fixed 1 second delta for step generation (simulated time, not real time)
        // This ensures consistent step generation regardless of speed
        const simulatedDeltaSeconds = 1;

        // Get current state multiplier
        const stateMultiplier = stateMachineRef.current.getStateMultiplier();
        const deviceState = stateMachineRef.current.getCurrentState();

        const stepData = stepGeneratorRef.current.calculateSteps(
          currentTime,
          simulatedDeltaSeconds,
          stateMultiplier,
          deviceState
        );

        if (stepData) {
          // Track steps for state machine
          stepsInLastMinuteRef.current += stepData.steps;

          // Calculate hour and day indices for chart data
          const startDate = new Date(timerState.startDate);
          const elapsedMs = currentTime.getTime() - startDate.getTime();
          const hourIndex = Math.floor(elapsedMs / (1000 * 60 * 60)) % 168; // Wrap at 168 hours
          const dayIndex = Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) % 365; // Wrap at 365 days

          // Add steps to hourly and daily charts
          dispatch(addStepsToHour({ hourIndex, steps: stepData.steps }));
          dispatch(addStepsToDay({ dayIndex, steps: stepData.steps }));

          // Emit NEW_STEP event
          dispatch(
            addEvent({
              timestamp: event.simulatedTime.toISOString(),
              type: 'NEW_STEP',
              message: `Steps: +${stepData.steps} (Total: ${stepData.totalSteps}) [${deviceState}]`,
              data: stepData,
            })
          );
        }
      }

      // Add events to log (throttle NEW_SECOND to avoid spam - log every 10th second)
      let shouldLogEvent = true;
      if (event.type === 'NEW_SECOND') {
        secondCounterRef.current += 1;
        shouldLogEvent = secondCounterRef.current % 10 === 0;
      }
      
      if (shouldLogEvent) {
        dispatch(
          addEvent({
            timestamp: event.simulatedTime.toISOString(),
            type: event.type,
            message: getEventMessage(event),
            data: event.data,
          })
        );
      }

      // Update progress and state machine on minute boundary
      if (event.type === 'NEW_MINUTE') {
        updateProgress();

        // Update state machine
        if (stateMachineRef.current && timerEngineRef.current && stepGeneratorRef.current) {
          const currentTime = timerEngineRef.current.getCurrentTime();
          const hour = currentTime.getHours();
          const minute = currentTime.getMinutes();

          // Reset minute counter
          if (minute !== lastMinuteRef.current) {
            // Save minute steps data for JSON export
            const year = currentTime.getFullYear();
            const month = String(currentTime.getMonth() + 1).padStart(2, '0');
            const day = String(currentTime.getDate()).padStart(2, '0');
            const hourStr = String(hour).padStart(2, '0');
            const minuteStr = String(minute).padStart(2, '0');
            const timestamp = `${year}-${month}-${day} ${hourStr}:${minuteStr}:00`;
            
            dispatch(addMinuteSteps({
              timestamp,
              steps: stepsInLastMinuteRef.current,
            }));

            const archetype = stepGeneratorRef.current.getArchetype();
            const activity = getActivityForHour(archetype, hour);

            // Build state context
            const context: StateContext = {
              currentTime,
              hour,
              isNight: hour >= 22 || hour < 6,
              stepsInLastMinute: stepsInLastMinuteRef.current,
              totalSteps: stepGeneratorRef.current.getTotalSteps(),
              activityLevel: activity.level,
              minutesSinceLastActivity: 0, // Calculated by state machine
            };

            // Update state machine
            const stateTransition = stateMachineRef.current.update(context);

            // If state changed, emit NEW_STATE event
            if (stateTransition) {
              const serializedTransition = {
                ...stateTransition,
                timestamp: stateTransition.timestamp.toISOString(),
              };
              dispatch(
                addEvent({
                  timestamp: currentTime.toISOString(),
                  type: 'NEW_STATE',
                  message: `State: ${stateTransition.from} → ${stateTransition.to} (${stateTransition.reason})`,
                  data: serializedTransition,
                })
              );
            }

            // Reset minute step counter
            stepsInLastMinuteRef.current = 0;
            lastMinuteRef.current = minute;
          }
        }
      }
    };

    timerEngineRef.current.addEventListener('NEW_SECOND', handleEvent);
    timerEngineRef.current.addEventListener('NEW_MINUTE', handleEvent);

    return () => {
      if (timerEngineRef.current) {
        timerEngineRef.current.destroy();
      }
    };
  }, [timerState.startDate, dispatch]);

  // Sync speed changes
  useEffect(() => {
    if (timerEngineRef.current) {
      timerEngineRef.current.setSpeed(timerState.speed);
    }
  }, [timerState.speed]);

  // Sync archetype changes
  useEffect(() => {
    if (stepGeneratorRef.current) {
      stepGeneratorRef.current.setArchetype(timerState.archetype);
    }
  }, [timerState.archetype]);

  // Sync start/pause state
  useEffect(() => {
    if (!timerEngineRef.current) return;

    if (timerState.isRunning) {
      timerEngineRef.current.start();
      lastUpdateTimeRef.current = performance.now();
    } else {
      timerEngineRef.current.pause();
    }
  }, [timerState.isRunning]);

  // Update progress based on elapsed time
  const updateProgress = () => {
    if (!timerEngineRef.current) return;

    const startDate = new Date(timerState.startDate);
    const currentTime = timerEngineRef.current.getCurrentTime();
    const elapsedMs = currentTime.getTime() - startDate.getTime();
    const totalMs = timerState.duration * 24 * 60 * 60 * 1000;
    const progress = Math.min(100, (elapsedMs / totalMs) * 100);

    dispatch(setProgress(progress));

    // Auto-stop when simulation completes
    if (progress >= 100 && timerState.isRunning) {
      dispatch(pauseTimer());
      dispatch(
        addEvent({
          timestamp: currentTime.toISOString(),
          type: 'NEW_STATE',
          message: `Simulation completed - ${timerState.duration} days simulated`,
          data: { action: 'auto_stop', duration: timerState.duration, progress: 100 },
        })
      );
    }
  };

  return {
    timerEngine: timerEngineRef.current,
    stepGenerator: stepGeneratorRef.current,
    stateMachine: stateMachineRef.current,
    getRTC: () => timerEngineRef.current?.getRTC() || null,
    getCurrentTime: () => timerEngineRef.current?.getCurrentTime() || new Date(),
  };
}

function getEventMessage(event: TimerEvent): string {
  switch (event.type) {
    case 'NEW_SECOND':
      return `Timer tick - Second: ${event.data?.second}`;
    case 'NEW_MINUTE':
      return `Minute changed - Minute: ${event.data?.minute}`;
    case 'NEW_STEP':
      return `Step detected - Total: ${event.data?.steps}`;
    case 'NEW_STATE':
      return `State changed to ${event.data?.state}`;
    default:
      return 'Unknown event';
  }
}
