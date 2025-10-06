'use client';

import { useAppDispatch, useAppSelector } from 'energy/lib/hooks';
import {
  startTimer,
  pauseTimer,
  setSpeed as setSpeedAction,
  setStartDate as setStartDateAction,
  setDuration as setDurationAction,
  setArchetype as setArchetypeAction,
  addEvent,
} from 'energy/lib/features/timerSlice';

export function ControlPanel() {
  const dispatch = useAppDispatch();
  const {
    isRunning,
    speed,
    startDate,
    duration,
    archetype,
    progress,
    currentTime,
  } = useAppSelector((state) => state.timer);

  const handleStart = () => {
    dispatch(startTimer());
    dispatch(
      addEvent({
        timestamp: new Date().toISOString(),
        type: 'NEW_STATE',
        message: `Simulation started at speed x${speed}`,
        data: { action: 'start', speed },
      })
    );
  };

  const handlePause = () => {
    dispatch(pauseTimer());
    dispatch(
      addEvent({
        timestamp: new Date().toISOString(),
        type: 'NEW_STATE',
        message: `Simulation paused at speed x${speed}`,
        data: { action: 'pause', speed },
      })
    );
  };

  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0;
  const progressLabel = `${safeProgress.toFixed(2)}%`;

  const handleSaveJSON = () => {
    const data = {
      config: { speed, startDate, duration, archetype },
      currentTime,
      progress,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 shadow-xl w-full">
      {/* Top Row: Speed Control */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs font-medium text-slate-300 whitespace-nowrap">
          Speed
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={speed}
          onChange={(e) => dispatch(setSpeedAction(Number(e.target.value)))}
          aria-label="Speed value"
          className="w-16 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="range"
          min="1"
          max="1000"
          value={speed}
          onChange={(e) => dispatch(setSpeedAction(Number(e.target.value)))}
          aria-label="Speed slider"
          className="flex-1 h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Second Row: Start Date and Duration */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1">
          <label className="text-xs font-medium text-slate-300 whitespace-nowrap">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => dispatch(setStartDateAction(e.target.value))}
            disabled={isRunning}
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-slate-300 whitespace-nowrap">
            Duration
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={duration}
            onChange={(e) => dispatch(setDurationAction(Number(e.target.value)))}
            disabled={isRunning}
            className="w-16 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-xs text-slate-400">Days</span>
        </div>
      </div>

      {/* Third Row: Archetype and Play/Pause Button */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1">
          <label className="text-xs font-medium text-slate-300 whitespace-nowrap">
            Archetype
          </label>
          <select
            value={archetype}
            onChange={(e) => dispatch(setArchetypeAction(e.target.value))}
            disabled={isRunning}
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="office">Office</option>
            <option value="athlete">Athlete</option>
            <option value="sedentary">Sedentary</option>
            <option value="active">Active</option>
          </select>
        </div>
        
        {/* Play/Pause Button */}
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg shadow-green-500/30"
            title="Start"
          >
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg shadow-orange-500/30"
            title="Pause"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Fourth Row: Save Buttons */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={handleSaveJSON}
          className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-200 font-medium py-1.5 px-3 rounded transition-all duration-200 flex items-center justify-center gap-1.5 text-xs"
        >
          Save to JSON
        </button>
        <button
          onClick={handleSaveJSON}
          className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-200 font-medium py-1.5 px-3 rounded transition-all duration-200 flex items-center justify-center gap-1.5 text-xs"
        >
          Gen YYYY-MM-DD_xx_UUUU.json
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 whitespace-nowrap">Est Bar: 0%</span>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">{progressLabel}</span>
      </div>
    </div>
  );
}
