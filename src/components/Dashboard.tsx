'use client';

import { VisualizationPanel } from './VisualizationPanel';
import { ControlPanel } from './ControlPanel';
import { EventLogPanel } from './EventLogPanel';
import { useTimer } from 'energy/lib/timer/useTimer';

export default function Dashboard() {
  // Initialize timer engine
  useTimer();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-hidden flex flex-col">
      <div className="max-w-[1920px] mx-auto w-full flex flex-col h-full">
      

        {/* Main Layout - 3 Panel Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* Left Column: Visualization (A) + Controls (B) */}
          <div className="xl:col-span-2 flex flex-col gap-4 overflow-hidden">
            {/* Panel A: Visualization */}
            <div className="flex-1 overflow-hidden">
              <VisualizationPanel />
            </div>

            {/* Panel B: Control Panel */}
            <div className="h-auto flex-shrink-0">
              <ControlPanel />
            </div>
          </div>

          {/* Right Column: Event Log Panel (C) - Full Height */}
          <div className="xl:col-span-1 overflow-hidden">
            <EventLogPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
