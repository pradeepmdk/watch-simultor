'use client';

import { useMemo, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppSelector } from 'energy/lib/hooks';

// Hann window smoothing function
function hannSmooth(data: number[], windowSize: number): number[] {
  const smoothed: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let weightSum = 0;
    
    for (let j = -halfWindow; j <= halfWindow; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < data.length) {
        // Hann window weight
        const weight = 0.5 * (1 - Math.cos(2 * Math.PI * (j + halfWindow) / (windowSize - 1)));
        sum += data[idx] * weight;
        weightSum += weight;
      }
    }
    
    smoothed.push(weightSum > 0 ? sum / weightSum : 0);
  }
  
  return smoothed;
}

export function VisualizationPanel() {
  const [hourlyWindowSize, setHourlyWindowSize] = useState(7);
  const [dailyWindowSize, setDailyWindowSize] = useState(7);
  
  // Get real step data from Redux
  const { hourlySteps, dailySteps } = useAppSelector((state) => state.timer);

  // Prepare hourly chart data (always 168 hours)
  const hourlyChartData = useMemo(() => {
    const smoothed = hannSmooth(hourlySteps, hourlyWindowSize);
    
    return Array.from({ length: 168 }, (_, i) => ({
      index: i,
      hour: `${Math.floor(i / 24)}d ${i % 24}h`,
      steps: hourlySteps[i] || 0,
      smoothed: smoothed[i] || 0,
    }));
  }, [hourlySteps, hourlyWindowSize]);

  // Prepare daily chart data (always 365 days)
  const dailyChartData = useMemo(() => {
    const smoothed = hannSmooth(dailySteps, dailyWindowSize);
    
    return Array.from({ length: 365 }, (_, i) => ({
      day: i + 1,
      steps: dailySteps[i] || 0,
      smoothed: smoothed[i] || 0,
    }));
  }, [dailySteps, dailyWindowSize]);
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-2xl font-semibold text-white">Visualization</h2>
        </div>
      </div>

      <div className="space-y-8">
        {/* Steps per Hour Chart - Always 168 hours (7 days) */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Steps per Hour (7 Days)
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Smoothing:</label>
              <select
                value={hourlyWindowSize}
                onChange={(e) => setHourlyWindowSize(Number(e.target.value))}
                className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600"
              >
                <option value={5}>5h</option>
                <option value={7}>7h</option>
                <option value={9}>9h</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="index"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                interval={23}
                tickFormatter={(value) => `Day ${Math.floor(value / 24) + 1}`}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Steps', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
                labelFormatter={(value) => `Hour ${value}`}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar
                dataKey="steps"
                fill="#3b82f6"
                name="Steps"
                opacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="smoothed"
                stroke="#ef4444"
                strokeWidth={2}
                name={`Smoothed (${hourlyWindowSize}h Hann)`}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Steps per Day Chart - Always 365 days (1 year) */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Steps per Day (365 Days)
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Smoothing:</label>
              <select
                value={dailyWindowSize}
                onChange={(e) => setDailyWindowSize(Number(e.target.value))}
                className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600"
              >
                <option value={7}>7d</option>
                <option value={15}>15d</option>
                <option value={21}>21d</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                interval={29}
                label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Steps', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
                labelFormatter={(value) => `Day ${value}`}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar
                dataKey="steps"
                fill="#10b981"
                name="Steps"
                opacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="smoothed"
                stroke="#f59e0b"
                strokeWidth={2}
                name={`Smoothed (${dailyWindowSize}d Hann)`}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
