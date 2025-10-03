'use client';

import { VisualizationPanel } from './VisualizationPanel';
import { ControlPanel } from './ControlPanel';
import { EventLogPanel } from './EventLogPanel';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Watch Simulator Dashboard
          </h1>
        </header>

        {/* Main Layout */}
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
