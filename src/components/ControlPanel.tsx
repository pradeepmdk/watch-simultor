'use client';

import { useState } from 'react';

export function ControlPanel() {
  const [speed, setSpeed] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(7);
  const [archetype, setArchetype] = useState('office');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    setIsRunning(true);
    // Simulation logic will be implemented in later milestones
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleSaveJSON = () => {
    // Save simulation data logic
    console.log('Saving to JSON...');
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
        <h2 className="text-2xl font-semibold text-white">Controls</h2>
      </div>

      <div className="space-y-6">
        {/* Speed Control */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Speed: <span className="text-blue-400 font-mono">x{speed}</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="1000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-slate-400 text-sm min-w-[60px] text-right font-mono">
              {speed}x
            </span>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Duration (Days)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Archetype */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Archetype
          </label>
          <select
            value={archetype}
            onChange={(e) => setArchetype(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="office">Office Worker</option>
            <option value="athlete">Athlete</option>
            <option value="sedentary">Sedentary</option>
            <option value="active">Active Lifestyle</option>
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 pt-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
              Pause
            </button>
          )}
        </div>

        {/* Save to JSON */}
        <button
          onClick={handleSaveJSON}
          className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-200 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save to JSON
        </button>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
