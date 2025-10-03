'use client';

import { VisualizationPanel } from './VisualizationPanel';
import { ControlPanel } from './ControlPanel';
import { EventLogPanel } from './EventLogPanel';
import { useTimer } from 'energy/lib/timer/useTimer';

export default function Dashboard() {
  // Initialize timer engine
  useTimer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Watch Simulator Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Phase 1: Timer & Sensor Modules | Supports x1 to x1000 playback speed
          </p>
        </header>

        {/* Main Layout - 3 Panel Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Visualization (A) + Controls (B) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Panel A: Visualization */}
            <VisualizationPanel />

            {/* Panel B: Control Panel */}
            <ControlPanel />
          </div>

          {/* Right Column: Event Log Panel (C) - Full Height */}
          <div className="xl:col-span-1">
            <EventLogPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
