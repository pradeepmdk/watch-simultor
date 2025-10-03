/**
 * useTimer Hook - Manages TimerEngine instance and Redux integration
 */

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  updateCurrentTime,
  addEvent,
  setProgress,
} from '../features/timerSlice';
import { TimerEngine } from './TimerEngine';
import { TimerEvent } from './types';
import { StepGenerator } from '../steps/StepGenerator';

export function useTimer() {
  const dispatch = useAppDispatch();
  const timerState = useAppSelector((state) => state.timer);
  const timerEngineRef = useRef<TimerEngine | null>(null);
  const stepGeneratorRef = useRef<StepGenerator | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Initialize TimerEngine and StepGenerator
  useEffect(() => {
    const startDate = timerState.startDate
      ? new Date(timerState.startDate)
      : new Date();

    timerEngineRef.current = new TimerEngine(startDate);
    stepGeneratorRef.current = new StepGenerator(timerState.archetype);
    lastUpdateTimeRef.current = performance.now();

    // Subscribe to timer events
    const handleEvent = (event: TimerEvent) => {
      // Update RTC time
      if (timerEngineRef.current) {
        dispatch(updateCurrentTime(timerEngineRef.current.getRTC()));
      }

      // Generate steps on each second
      if (event.type === 'NEW_SECOND' && stepGeneratorRef.current && timerEngineRef.current) {
        const currentTime = timerEngineRef.current.getCurrentTime();
        const now = performance.now();
        const realDeltaMs = now - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = now;

        // Calculate simulated delta based on speed
        const speed = timerEngineRef.current.getSpeed();
        const simulatedDeltaSeconds = (realDeltaMs / 1000) * speed;

        const stepData = stepGeneratorRef.current.calculateSteps(currentTime, simulatedDeltaSeconds);

        if (stepData) {
          // Emit NEW_STEP event
          dispatch(
            addEvent({
              timestamp: event.simulatedTime.toISOString(),
              type: 'NEW_STEP',
              message: `Steps: +${stepData.steps} (Total: ${stepData.totalSteps})`,
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

      // Update progress
      if (event.type === 'NEW_MINUTE') {
        updateProgress();
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
