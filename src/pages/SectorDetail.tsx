import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, Info, BarChart4 } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, Cell } from 'recharts';
import { MOCK_COMPANIES, SCATTER_DATA } from '../data/mock/companies';
import { SECTOR_MEDIAN_RR } from '../data/mock/sectors';

export default function SectorDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || '');
  const companies = MOCK_COMPANIES.filter(c => c.sector === decodedName);
  
  if (!name || companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-light text-white mb-2">Sector Not Found</h2>
        <p className="text-zinc-500 mb-6">The requested sector does not exist in the prototype dataset.</p>
        <Link to="/sectors" className="px-6 py-2 bg-zinc-800 text-white rounded-lg font-bold">Return to Sectors</Link>
      </div>
    );
  }

  const medianRR = SECTOR_MEDIAN_RR.find(s => s.sector === decodedName)?.rr || 0;
  
  const sectorScatter = SCATTER_DATA.filter(d => d.sector === decodedName);
  const topPerformers = [...companies].sort((a,b) => b.rr - a.rr).slice(0, 3);
  const bottomPerformers = [...companies].sort((a,b) => a.rr - b.rr).slice(0, 3);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-12">
        <Link to="/sectors" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Sectors
        </Link>
        <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">{decodedName}</h1>
        <p className="text-zinc-400 max-w-2xl text-lg mb-8">
          Analysis of the {decodedName} sector's climate responsibility performance, tracking impact vs compensation across {companies.length} representative companies.
        </p>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Sector Median RR</p>
            <p className="text-2xl text-white font-mono">{medianRR.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Tracked Companies</p>
            <p className="text-2xl text-white font-mono">{companies.length}</p>
          </div>
          <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Avg Credibility</p>
            <p className="text-2xl text-white font-mono">{(companies.reduce((acc,c) => acc + c.credibilityScore, 0)/companies.length).toFixed(2)}</p>
          </div>
          <div className="bg-zinc-950/50 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Top Performer</p>
            <p className="text-lg text-emerald-400 font-bold truncate">{topPerformers[0]?.name}</p>
          </div>
        </div>
      </div>

      {/* Peer Scatter Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-white">Peer Positioning Overview</h2>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1 flex items-center gap-2">
            <BarChart4 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Revenue vs RR</span>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis type="number" dataKey="revenue" name="Revenue" tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="rr" name="Responsibility Ratio" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <ZAxis type="number" range={[100, 500]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#f4f4f5' }} />
              <Scatter name="Companies" data={sectorScatter} fill="#4f46e5">
                {sectorScatter.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.rr > 1 ? '#10b981' : entry.rr > 0.5 ? '#eab308' : '#ef4444'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2"><Activity className="w-4 h-4" /> Top Performers</h2>
          <div className="space-y-4">
            {topPerformers.map((comp, idx) => (
              <Link key={comp.id} to={`/company/${comp.id}`} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs">{idx + 1}</div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{comp.name}</h3>
                    <p className="text-xs text-zinc-500">{comp.ticker}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-mono font-bold text-sm">{comp.rr.toFixed(2)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RR</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-rose-500 mb-6 flex items-center gap-2"><Activity className="w-4 h-4" /> Bottom Performers</h2>
          <div className="space-y-4">
             {bottomPerformers.map((comp, idx) => (
              <Link key={comp.id} to={`/company/${comp.id}`} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs border border-rose-900/30 text-rose-500/50">{companies.length - bottomPerformers.length + idx + 1}</div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{comp.name}</h3>
                    <p className="text-xs text-zinc-500">{comp.ticker}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-rose-400 font-mono font-bold text-sm">{comp.rr.toFixed(2)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RR</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Block */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 shrink-0 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
          <Info className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-indigo-300 mb-2">Disclosure Pattern Insights</h3>
          <p className="text-indigo-200/70 text-sm leading-relaxed max-w-3xl">
            In the {decodedName} sector, companies typically struggle with comprehensive Scope 3 reporting and tend to utilize localized afforestation offsets compared to verified international market credits. The sector's median Response Ratio indicates an ongoing structural deficit in compensation against total operational impact.
          </p>
        </div>
      </div>

    </div>
  );
}
