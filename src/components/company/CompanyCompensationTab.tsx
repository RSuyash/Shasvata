import React from 'react';
import { Leaf, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const MOCK_COMP_BREAKDOWN = [
  { year: 'FY20', carbon: 120, recs: 50, nature: 30, csr: 10 },
  { year: 'FY21', carbon: 130, recs: 60, nature: 35, csr: 15 },
  { year: 'FY22', carbon: 160, recs: 100, nature: 50, csr: 30 },
  { year: 'FY23', carbon: 200, recs: 150, nature: 80, csr: 35 },
  { year: 'FY24', carbon: 280, recs: 220, nature: 120, csr: 45 },
];

export function CompanyCompensationTab({ company }: { company: any }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Leaf className="w-3 h-3 text-emerald-400" /> Compensation Score</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{(company.compensationScore || 0.58).toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Carbon Ratio</p>
          <p className="text-3xl font-bold text-white mt-2">12.5% <span className="text-sm text-zinc-500 font-normal">of Scope 1</span></p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Nature Actions</p>
          <p className="text-3xl font-bold text-white mt-2">4 <span className="text-sm text-zinc-500 font-normal">Verified Projects</span></p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Compensation Instrument Mix (5-Year Trend)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_COMP_BREAKDOWN} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              <Bar dataKey="carbon" name="Carbon Credits" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="recs" name="RECs" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="nature" name="Nature Actions" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="csr" name="Env. CSR Spend" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Detailed Actions (FY24)</h3>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                 <div className="font-bold text-amber-500 text-sm">Environmental CSR Spend</div>
                 <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">Grade A</span>
              </div>
              <p className="text-white text-lg font-mono mb-2">₹45.2 Crore</p>
              <p className="text-xs text-zinc-500 border-l-2 border-amber-900/50 pl-3 italic">"Invested in community water harvesting structures and habitat restoration in operational vicinities."</p>
            </div>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-emerald-400 text-sm">Carbon Credit Retirement</div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">Grade A</span>
              </div>
              <p className="text-white text-lg font-mono mb-2">280,000 tCO2e</p>
              <p className="text-xs text-zinc-500 border-l-2 border-zinc-700 pl-3 italic">"The company retired verified offsets aligned with VCS standards from the wind energy portfolio..."</p>
            </div>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-indigo-400 text-sm">Afforestation Area</div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[10px] border border-amber-500/20">Grade B</span>
              </div>
              <p className="text-white text-lg font-mono mb-2">2,400 Hectares</p>
              <p className="text-xs text-zinc-500 border-l-2 border-zinc-700 pl-3 italic">"Planted 4.5 million saplings across mining reclamation zones."</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-rose-900/50 pb-4 flex items-center justify-between">
            Missing Data <AlertTriangle className="w-4 h-4 text-rose-500" />
          </h3>
          <div className="space-y-3">
            <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl flex justify-between items-center">
              <span className="text-sm text-rose-400/80">Green Credits (MoEF)</span>
              <span className="bg-rose-500/10 text-rose-500 font-bold text-[10px] px-2 py-0.5 rounded">D</span>
            </div>
            <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl flex justify-between items-center">
              <span className="text-sm text-rose-400/80">Biodiversity Pledges</span>
              <span className="bg-rose-500/10 text-rose-500 font-bold text-[10px] px-2 py-0.5 rounded">D</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 border-dashed p-3 rounded-xl flex justify-between items-center opacity-80 mt-2">
              <span className="text-sm text-zinc-500 italic">Internal pricing models</span>
              <span className="bg-zinc-800 text-zinc-500 font-bold text-[10px] px-2 py-0.5 rounded">Not Disclosed</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-6 text-center">Missing metrics are scored as zero to maintain conservative estimates.</p>
        </div>
      </div>
    </div>
  );
}
