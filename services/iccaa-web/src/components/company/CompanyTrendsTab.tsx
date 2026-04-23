import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const MOCK_TRENDS_DATA = [
  { year: 'FY20', company: 0.65, peer: 0.55 },
  { year: 'FY21', company: 0.68, peer: 0.58 },
  { year: 'FY22', company: 0.72, peer: 0.65 },
  { year: 'FY23', company: 0.75, peer: 0.62 },
  { year: 'FY24', company: 0.82, peer: 0.60 },
];

export function CompanyTrendsTab({ company }: { company: any }) {
  const [trendMetric, setTrendMetric] = useState('RR');

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Performance History vs Peer Median (5-Yr)</h3>
            <p className="text-sm text-white font-medium mt-1">Comparing <span className="text-indigo-400">{trendMetric}</span> against the <span className="text-zinc-400">{company.sector} median</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg border border-zinc-700 hidden sm:inline-block">Select Metric:</span>
            <select 
              value={trendMetric}
              onChange={(e) => setTrendMetric(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
                <option value="RR">Responsibility Ratio (RR)</option>
                <option value="VBI">Voluntary Behavior Index</option>
                <option value="Impact">Impact Score</option>
            </select>
          </div>
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_TRENDS_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
              <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              <Line type="monotone" dataKey="company" name={company.name} stroke="#34d399" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="peer" name={`${company.sector} Median`} stroke="#71717a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
