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

export function useTimer() {
  const dispatch = useAppDispatch();
  const timerState = useAppSelector((state) => state.timer);
  const timerEngineRef = useRef<TimerEngine | null>(null);

  // Initialize TimerEngine
  useEffect(() => {
    const startDate = timerState.startDate
      ? new Date(timerState.startDate)
      : new Date();

    timerEngineRef.current = new TimerEngine(startDate);

    // Subscribe to timer events
    const handleEvent = (event: TimerEvent) => {
      // Update RTC time
      if (timerEngineRef.current) {
        dispatch(updateCurrentTime(timerEngineRef.current.getRTC()));
      }

      // Add event to log
      dispatch(
        addEvent({
          timestamp: event.simulatedTime.toISOString(),
          type: event.type,
          message: getEventMessage(event),
          data: event.data,
        })
      );

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

  // Sync start/pause state
  useEffect(() => {
    if (!timerEngineRef.current) return;

    if (timerState.isRunning) {
      timerEngineRef.current.start();
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
