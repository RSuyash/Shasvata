import React from 'react';
import { Activity, MapPin, Users, Calendar, Building2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCr = (val: number) => `₹${(val / 1000).toFixed(1)}k cr`;

const MOCK_SPARKLINE_REVENUE = [
  { year: 'FY20', val: 750000 },
  { year: 'FY21', val: 780000 },
  { year: 'FY22', val: 820000 },
  { year: 'FY23', val: 860000 },
  { year: 'FY24', val: 900000 },
];

export function CompanyProfileTab({ company }: { company: any }) {
  return (
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

        <div className="col-span-1 lg:col-span-3 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[300px] text-zinc-500 relative overflow-hidden">
          <GlobeIcon className="w-64 h-64 mb-4 text-zinc-800/50 absolute -right-16 -bottom-16" />
          <div className="relative z-10 text-center">
            <GlobeIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="font-bold text-zinc-300">Global Presence Map</p>
            <p className="text-sm mt-2 text-zinc-500 max-w-sm mx-auto">Requires Mapbox GL JS integration to display operations footprint across 22 countries. <span className="block mt-2 font-bold text-xs text-zinc-600 uppercase tracking-widest">Illustrative prototype content</span></p>
          </div>
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
