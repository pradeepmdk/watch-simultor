'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTimer } from 'energy/lib/timer/useTimer';

export function VisualizationPanel() {
  const { stepGenerator } = useTimer();

  // Get hourly step distribution from archetype
  const stepsPerHourData = useMemo(() => {
    if (!stepGenerator) {
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString(),
        steps: 0,
      }));
    }

    const distribution = stepGenerator.getHourlyDistribution();
    return distribution.map((item) => ({
      hour: item.hour.toString(),
      steps: item.steps,
    }));
  }, [stepGenerator]);

  // Calculate expected daily total
  const expectedDailySteps = useMemo(() => {
    if (!stepGenerator) return 0;
    return stepGenerator.getExpectedDailySteps();
  }, [stepGenerator]);

  // Show archetype info
  const archetypeInfo = useMemo(() => {
    if (!stepGenerator) return null;
    const archetype = stepGenerator.getArchetype();
    return {
      name: archetype.name,
      goal: archetype.dailyStepGoal,
    };
  }, [stepGenerator]);
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-2xl font-semibold text-white">Visualization</h2>
        </div>
        {archetypeInfo && (
          <div className="text-right">
            <div className="text-sm text-slate-400">{archetypeInfo.name}</div>
            <div className="text-xs text-slate-500">
              Goal: {archetypeInfo.goal.toLocaleString()} steps/day
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Steps per Hour Chart */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Steps per Hour (Expected Pattern)
            </h3>
            <span className="text-sm text-slate-400">24-hour distribution</span>
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

        {/* Expected Daily Steps */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Expected Daily Steps
            </h3>
            <span className="text-sm text-slate-400">Total: {expectedDailySteps.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                {expectedDailySteps.toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm">steps per day</div>
              {archetypeInfo && (
                <div className="mt-4 text-slate-500 text-xs">
                  {expectedDailySteps >= archetypeInfo.goal ? (
                    <span className="text-green-400">✓ Meets daily goal</span>
                  ) : (
                    <span className="text-orange-400">
                      {((expectedDailySteps / archetypeInfo.goal) * 100).toFixed(0)}% of goal
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
