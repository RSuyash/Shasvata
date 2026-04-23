import React from 'react';
import { Factory, Activity, ShieldCheck, PieChart as PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie, LineChart, Line } from 'recharts';

const MOCK_GHG_TREND = [
  { year: 'FY20', scope1: 450, scope2: 120 },
  { year: 'FY21', scope1: 460, scope2: 125 },
  { year: 'FY22', scope1: 440, scope2: 110 },
  { year: 'FY23', scope1: 430, scope2: 95 },
  { year: 'FY24', scope1: 410, scope2: 80 },
];

const MOCK_ENERGY_MIX = [
  { name: 'Renewable', value: 35, fill: '#34d399' },
  { name: 'Non-Renewable', value: 65, fill: '#f43f5e' },
];

const MOCK_WATER_WASTE = [
  { year: 'FY20', water: 11000, waste: 750 },
  { year: 'FY21', water: 11500, waste: 780 },
  { year: 'FY22', water: 11800, waste: 800 },
  { year: 'FY23', water: 12100, waste: 820 },
  { year: 'FY24', water: 12450, waste: 840 },
];

const MOCK_INTENSITY_TREND = [
  { year: 'FY20', intensity: 52.4 },
  { year: 'FY21', intensity: 51.0 },
  { year: 'FY22', intensity: 49.5 },
  { year: 'FY23', intensity: 48.8 },
  { year: 'FY24', intensity: 48.2 },
];

export function CompanyImpactTab({ company }: { company: any }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Factory className="w-3 h-3 text-rose-400" /> Total Scope 1+2</p>
          <p className="text-3xl font-bold text-white mt-2">4,208k <span className="text-lg text-zinc-500 font-normal">tCO2e</span></p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Activity className="w-3 h-3 text-amber-400" /> Carbon Intensity</p>
          <p className="text-3xl font-bold text-white mt-2">48.2 <span className="text-lg text-zinc-500 font-normal">tCO2e / ₹cr</span></p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Overall Impact Score</p>
          <p className="text-3xl font-bold text-white mt-2">{(company.impactScore || 0.76).toFixed(2)} <span className="text-sm font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded ml-2 align-middle">HIGH</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">GHG Emissions Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_GHG_TREND} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa', paddingTop: '10px' }} />
                <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#f43f5e" radius={[0, 0, 4, 4]} />
                <Bar dataKey="scope2" name="Scope 2" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between">
           <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Energy Mix (FY24)</h3>
           </div>
           <div className="flex-1 flex items-center justify-center -mt-6">
             <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_ENERGY_MIX}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {MOCK_ENERGY_MIX.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Intensity Trend (Scope 1+2 / Rev)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_INTENSITY_TREND} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
                <Line type="monotone" dataKey="intensity" name="tCO2e / ₹Cr" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Water & Waste Generation</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_WATER_WASTE} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="water" name="Water (KL)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="waste" name="Waste (MT)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 mt-2 overflow-hidden">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Environmental Data Log (FY24)</h3>
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/30 text-zinc-500 font-medium text-xs">
              <tr>
                <th className="text-left py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Metric</th>
                <th className="text-right py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Value</th>
                <th className="text-left py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Unit</th>
                <th className="text-center py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <tr className="hover:bg-zinc-800/30">
                <td className="py-3 px-4 font-medium text-zinc-300">Scope 1 Emissions</td>
                <td className="py-3 px-4 text-right font-mono">4,120,000</td>
                <td className="py-3 px-4 text-zinc-500">tCO2e</td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">A</span></td>
              </tr>
               <tr className="hover:bg-zinc-800/30">
                <td className="py-3 px-4 font-medium text-zinc-300">Water Consumption</td>
                <td className="py-3 px-4 text-right font-mono">12,450</td>
                <td className="py-3 px-4 text-zinc-500">KL</td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">A</span></td>
              </tr>
              <tr className="hover:bg-zinc-800/30">
                <td className="py-3 px-4 font-medium text-zinc-300 flex items-center gap-2">Hazardous Waste</td>
                <td className="py-3 px-4 text-right font-mono">840</td>
                <td className="py-3 px-4 text-zinc-500">MT</td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-xs border border-amber-500/20">B</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
