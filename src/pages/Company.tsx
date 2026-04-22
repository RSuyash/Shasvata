import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Users, Calendar, Activity, CheckCircle2, Factory } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_COMPANIES } from '../data/mock';
import { cn } from '../lib/utils';

const formatCr = (val: number) => `₹${(val / 1000).toFixed(1)}k cr`;

const MOCK_SPARKLINE_REVENUE = [
  { year: 'FY20', val: 750000 },
  { year: 'FY21', val: 780000 },
  { year: 'FY22', val: 820000 },
  { year: 'FY23', val: 860000 },
  { year: 'FY24', val: 900000 },
];

export default function Company() {
  const { id } = useParams();
  const company = MOCK_COMPANIES.find(c => c.id === id) || MOCK_COMPANIES[0];
  const [activeTab, setActiveTab] = useState('Profile');

  const tabs = ['Profile', 'Impact', 'Compensation', 'Credibility', 'Trends'];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2 mt-4">
        <div>
          <Link to="/explore" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-white mb-6 transition-colors uppercase tracking-widest">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Universe
          </Link>
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h1 className="text-4xl font-light text-zinc-100 tracking-tight">{company.name}</h1>
            <span className="px-3 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-indigo-400 text-xs font-bold font-mono tracking-widest uppercase">
              {company.ticker}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-zinc-400 font-medium bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
              <Building2 className="h-4 w-4 text-indigo-500" />
              {company.sector}
            </span>
             {company.id === '1' && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs uppercase tracking-widest">
                NIFTY 50
              </span>
            )}
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="flex w-full md:w-auto bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden p-2 gap-2">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-w-[120px] text-center flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Resp. Ratio</div>
            <div className={`text-2xl font-bold font-mono tracking-tighter ${company.rr > 0.7 ? 'text-emerald-400' : 'text-zinc-100'}`}>{company.rr.toFixed(2)}</div>
          </div>
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-w-[120px] text-center flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">VBI</div>
            <div className="text-2xl font-bold font-mono tracking-tighter text-zinc-100">{company.vbi.toFixed(2)}</div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-4 min-w-[100px] text-center flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest mb-1">Credibility</div>
            <div className="text-2xl font-bold font-mono tracking-tighter text-indigo-300">{Math.round(company.credibility * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 hide-scrollbar overflow-x-auto mt-4">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "whitespace-nowrap py-4 border-b-2 font-bold text-sm uppercase tracking-widest transition-colors",
                activeTab === tab
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Placeholder */}
      <div className="mt-4">
        {activeTab === 'Profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Facts */}
            <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Firmographics (FY24)</h3>
              <div className="space-y-4 text-sm mt-8">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-zinc-400 flex items-center gap-3"><Activity className="w-4 h-4 text-zinc-600" /> Market Cap</span>
                  <span className="font-bold text-zinc-100">{formatCr(company.marketCap)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-zinc-400 flex items-center gap-3"><Activity className="w-4 h-4 text-zinc-600" /> Revenue</span>
                  <span className="font-bold text-zinc-100">{formatCr(company.revenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-zinc-400 flex items-center gap-3"><Users className="w-4 h-4 text-zinc-600" /> Employees</span>
                  <span className="font-medium text-zinc-300">389,000+</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-zinc-400 flex items-center gap-3"><MapPin className="w-4 h-4 text-zinc-600" /> Operations</span>
                  <span className="font-medium text-zinc-300">22 Countries</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-400 flex items-center gap-3"><Calendar className="w-4 h-4 text-zinc-600" /> Inc. Year</span>
                  <span className="font-medium text-zinc-300">1973 <span className="text-zinc-600">(51 yrs)</span></span>
                </div>
              </div>
            </div>

            {/* Right Col: Sparklines */}
            <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">5-Year Revenue Trend</h3>
               <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_SPARKLINE_REVENUE} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                      <YAxis tickFormatter={(v) => `${v/1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
                      <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevDark)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Bottom: Map Placeholder */}
             <div className="col-span-1 lg:col-span-3 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[300px] text-zinc-500 relative overflow-hidden">
               <GlobeIcon className="w-64 h-64 mb-4 text-zinc-800/50 absolute -right-16 -bottom-16" />
               <div className="relative z-10 text-center">
                 <GlobeIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                 <p className="font-bold text-zinc-300">Global Presence Map</p>
                 <p className="text-sm mt-2 text-zinc-500 max-w-sm mx-auto">Requires Mapbox GL JS integration to display operations footprint across 22 countries.</p>
               </div>
             </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'Profile' && (
          <div className="p-16 border border-zinc-800/80 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center mt-6">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800">
              <Factory className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-light text-zinc-300 mb-2">{activeTab} Details</h3>
            <p className="text-zinc-500 mt-2 max-w-md leading-relaxed">
              Comprehensive data layers mapping to PRD specifications. Currently in development for Phase 2 implementation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
