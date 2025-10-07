'use client';

import { useAppDispatch, useAppSelector } from 'energy/lib/hooks';
import { increment, decrement, incrementByAmount, reset } from 'energy/lib/features/counterSlice';
import { useState } from 'react';

export default function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redux Toolkit Counter</h1>
        <p className="text-gray-600 mb-2">with Local Storage Persistence</p>
        <p className="text-sm text-gray-500">
          Refresh the page to see the counter value persist!
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 min-w-[400px]">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-blue-600 mb-2">{count}</div>
          <div className="text-sm text-gray-500">Current Count</div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(increment())}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              + Increment
            </button>
            <button
              onClick={() => dispatch(decrement())}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              - Decrement
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={incrementAmount}
              onChange={(e) => setIncrementAmount(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
            <button
              onClick={() => dispatch(incrementByAmount(incrementValue))}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
            >
              Add Amount
            </button>
          </div>

          <button
            onClick={() => dispatch(reset())}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-3">How it works:</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ Redux Toolkit for state management</li>
          <li>✅ Local Storage persistence (auto-saves after 500ms)</li>
          <li>✅ State persists across page refreshes</li>
          <li>✅ TypeScript support with typed hooks</li>
          <li>✅ Debounced saves to optimize performance</li>
        </ul>
      </div>
    </div>
  );
}
