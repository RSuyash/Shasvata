import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, ChevronRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TOP_10_COMPANIES } from '../data/mock/companies';
import { SECTOR_MEDIAN_RR } from '../data/mock/sectors';

// Filter mock companies to just IT/Energy conceptually or re-use TOP_10 for a sector split.
// Here we'll generate specific tables dynamically.
const ENERGY_COMPANIES = TOP_10_COMPANIES.slice(0, 3).map(c => ({...c, sector: 'Energy'}));
const NIFTY_MEDIAN_RR = 0.45;

function getSectorColor(sector: string) {
  const colors: Record<string, string> = {
    'Energy': '#f97316',
    'Materials': '#64748b',
    'Information Technology': '#6366f1',
    'Financials': '#8b5cf6',
    'Consumer Staples': '#10b981',
    'Consumer Discretionary': '#fbbf24',
    'Communication Services': '#ec4899',
    'Utilities': '#f43f5e',
    'Health Care': '#14b8a6',
    'Industrials': '#a855f7'
  };
  return colors[sector] || '#71717a';
}

export default function Sectors() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <section className="text-center py-6">
        <h1 className="text-4xl md:text-5xl font-light text-zinc-100 mb-4 tracking-tight">Sector Intelligence</h1>
        <p className="text-lg text-zinc-400 font-medium max-w-2xl mx-auto">
          Comparative analysis and aggregate benchmarks across standard industry classifications.
        </p>
      </section>

      {/* Aggregate Bar Chart */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 md:p-12">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Median RR by Sector</h2>
            <p className="text-sm text-zinc-500">Cross-industry benchmarking</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold font-mono tracking-tighter text-indigo-400">{NIFTY_MEDIAN_RR}</div>
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">NIFTY 50 Median</p>
          </div>
        </div>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SECTOR_MEDIAN_RR}
              margin={{ top: 5, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis 
                dataKey="sector" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: '#71717a' }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
                domain={[0, 1]}
              />
              <Tooltip 
                cursor={{ fill: '#27272a' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }}
                 formatter={(value: number) => [value.toFixed(2), 'Median RR']}
              />
              <Bar dataKey="rr" radius={[4, 4, 0, 0]} barSize={40}>
                {SECTOR_MEDIAN_RR.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSectorColor(entry.sector)} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Sector Deep Dive Module */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-bold uppercase tracking-widest text-zinc-400">
                Sector Spotlight
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Energy Transition Gap</h2>
              <p className="text-zinc-400 leading-relaxed text-sm">
                The Energy sector consistently ranks highest in <strong>Impact Intensity</strong> but falls below the NIFTY 50 median in <strong>Compensation Scoring</strong>. This structural gap highlights a profound disconnect between production footprints and structural rehabilitation mechanisms.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Median RR</p>
                 <p className="text-2xl font-bold text-rose-400">0.24</p>
               </div>
               <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Median Assurance</p>
                 <p className="text-2xl font-bold text-indigo-400">Limited</p>
               </div>
            </div>

            <Link to="/compare" className="inline-flex items-center justify-center w-full sm:w-auto h-12 px-8 text-sm font-bold text-black bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-white rounded-xl hover:bg-zinc-200 transition-colors">
              Compare Energy Companies <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Sector Leaders</h3>
            <div className="rounded-2xl border border-zinc-800/50 overflow-hidden bg-zinc-900/40">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800/80 text-zinc-500 font-medium text-xs">
                  <tr>
                    <th className="text-left py-4 px-5 font-bold tracking-widest uppercase text-[10px]">Company</th>
                    <th className="text-right py-4 px-5 font-bold tracking-widest uppercase text-[10px]">RR Score</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {ENERGY_COMPANIES.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => navigate(`/company/${c.id}`)}
                      className="hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-5 font-bold text-zinc-300 group-hover:text-white transition-colors">{c.name}</td>
                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono text-sm border border-zinc-700">
                          {c.rr.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center text-zinc-600 group-hover:text-indigo-400 pr-4">
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-xs text-zinc-500 mt-4 leading-relaxed bg-zinc-800/20 p-4 rounded-xl border border-zinc-800/50">
               <strong>Insight:</strong> The majority of energy sector compensation relies on internal energy efficiency upgrades rather than verified carbon sequestering projects, suppressing the external Compensation Score multiplier.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
