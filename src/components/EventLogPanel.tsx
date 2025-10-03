'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'energy/lib/hooks';
import { clearEvents } from 'energy/lib/features/timerSlice';

const eventTypeColors = {
  NEW_SECOND: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NEW_MINUTE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  NEW_STEP: 'bg-green-500/20 text-green-400 border-green-500/30',
  NEW_STATE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const eventTypeIcons = {
  NEW_SECOND: '⏱️',
  NEW_MINUTE: '⏰',
  NEW_STEP: '👣',
  NEW_STATE: '🔄',
};

export function EventLogPanel() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.timer.events);
  const [filter, setFilter] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new events arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(event => event.type === filter);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-2xl font-semibold text-white">Event Log</h2>
        </div>
        <span className="text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
          {filteredEvents.length} events
        </span>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          All
        </button>
        {Object.keys(eventTypeColors).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === type
                ? eventTypeColors[type as keyof typeof eventTypeColors]
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {eventTypeIcons[type as keyof typeof eventTypeIcons]} {type.replace('NEW_', '')}
          </button>
        ))}
      </div>

      {/* Event List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 min-h-[400px]"
      >
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📭</div>
              <p>No events to display</p>
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      eventTypeColors[event.type]
                    }`}>
                      {eventTypeIcons[event.type]} {event.type}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{event.message}</p>
                  {event.data && (
                    <pre className="mt-2 text-xs text-slate-400 bg-slate-800/50 rounded px-2 py-1 font-mono overflow-x-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear Button */}
      <button
        onClick={() => dispatch(clearEvents())}
        className="w-full mt-4 bg-slate-700/30 hover:bg-red-500/20 border border-slate-600 hover:border-red-500/50 text-slate-400 hover:text-red-400 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear All Events
      </button>
    </div>
  );
}
