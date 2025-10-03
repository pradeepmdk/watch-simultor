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
} from '../features/timerSlice';
import { TimerEngine } from './TimerEngine';
import { TimerEvent } from './types';
import { StepGenerator } from '../steps/StepGenerator';
import { StateMachine } from '../state/StateMachine';
import { StateContext } from '../state/types';
import { getActivityForHour } from '../steps/archetypes';

export function useTimer() {
  const dispatch = useAppDispatch();
  const timerState = useAppSelector((state) => state.timer);
  const timerEngineRef = useRef<TimerEngine | null>(null);
  const stepGeneratorRef = useRef<StepGenerator | null>(null);
  const stateMachineRef = useRef<StateMachine | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const stepsInLastMinuteRef = useRef<number>(0);
  const lastMinuteRef = useRef<number>(-1);

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
        const now = performance.now();
        const realDeltaMs = now - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = now;

        // Calculate simulated delta based on speed
        const speed = timerEngineRef.current.getSpeed();
        const simulatedDeltaSeconds = (realDeltaMs / 1000) * speed;

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

      // Add other events to log (but throttle NEW_SECOND to avoid spam)
      if (event.type !== 'NEW_SECOND') {
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
