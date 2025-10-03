'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const stepsPerHourData = [
  { hour: '0', steps: 120 },
  { hour: '1', steps: 80 },
  { hour: '2', steps: 50 },
  { hour: '3', steps: 30 },
  { hour: '4', steps: 20 },
  { hour: '5', steps: 100 },
  { hour: '6', steps: 450 },
  { hour: '7', steps: 780 },
];

const stepsPerDayData = [
  { day: 'Mon', steps: 8500 },
  { day: 'Tue', steps: 9200 },
  { day: 'Wed', steps: 7800 },
  { day: 'Thu', steps: 10500 },
  { day: 'Fri', steps: 9800 },
  { day: 'Sat', steps: 12000 },
  { day: 'Sun', steps: 11500 },
];

export function VisualizationPanel() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
        <h2 className="text-2xl font-semibold text-white">Visualization</h2>
      </div>

      <div className="space-y-8">
        {/* Steps per Hour Chart */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Steps per Hour
            </h3>
            <span className="text-sm text-slate-400">Last 8 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stepsPerHourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="hour"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line
                type="monotone"
                dataKey="steps"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Steps per Day Chart */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Steps per Day
            </h3>
            <span className="text-sm text-slate-400">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stepsPerDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar
                dataKey="steps"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
