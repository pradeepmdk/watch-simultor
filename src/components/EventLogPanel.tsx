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
  const [maxEvents, setMaxEvents] = useState<number>(100);
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

  // Limit events to maxEvents (newest first)
  const limitedEvents = filteredEvents.slice(-maxEvents);

  // Format timestamp to YYYY-MM-DD HH:MM:SS
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 shadow-2xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">Event Log</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Max:</span>
          <select
            value={maxEvents}
            onChange={(e) => setMaxEvents(Number(e.target.value))}
            aria-label="Maximum events to display"
            className="text-xs bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value={100}>100</option>
            <option value={1000}>1000</option>
          </select>
          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
            {limitedEvents.length} events
          </span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
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
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === type
                ? eventTypeColors[type as keyof typeof eventTypeColors]
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {eventTypeIcons[type as keyof typeof eventTypeIcons]} {type.replace('NEW_', '')}
          </button>
        ))}
      </div>

      {/* Event List - Compact View */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 pr-1"
      >
        {limitedEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">No events to display</p>
            </div>
          </div>
        ) : (
          limitedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-900/30 border-l-2 hover:bg-slate-900/50 transition-all px-2 py-1 text-xs"
              style={{ borderLeftColor: event.type === 'NEW_SECOND' ? '#60a5fa' : event.type === 'NEW_MINUTE' ? '#a78bfa' : event.type === 'NEW_STEP' ? '#4ade80' : '#fb923c' }}
            >
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded font-medium border flex-shrink-0 ${
                  eventTypeColors[event.type]
                }`}>
                  {eventTypeIcons[event.type]}
                </span>
                <span className="text-slate-500 font-mono flex-shrink-0">
                  {formatTimestamp(event.timestamp)}
                </span>
                <span className="text-slate-300 truncate flex-1">{event.message}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear Button */}
      <button
        onClick={() => dispatch(clearEvents())}
        className="w-full mt-3 bg-slate-700/30 hover:bg-red-500/20 border border-slate-600 hover:border-red-500/50 text-slate-400 hover:text-red-400 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear All Events
      </button>
    </div>
  );
}
