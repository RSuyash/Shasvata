import React, { useState } from 'react';
import { Search, ChevronDown, Rocket, CheckCircle2, Factory, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { MOCK_COMPARE } from '../data/mock/compare';
import { MOCK_COMPANIES } from '../data/mock/companies';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const aId = searchParams.get('a') || '1';
  const bId = searchParams.get('b') || '2';
  
  const [compA, compB] = MOCK_COMPARE.getCompareData(aId, bId);

  const handleSelectorChange = (type: 'a' | 'b', id: string) => {
    if (type === 'a') setSearchParams({ a: id, b: bId });
    else setSearchParams({ a: aId, b: id });
  };

  const MOCK_RADAR_DATA = [
    { subject: 'Impact Mgmt', A: compA.impactScore * 100, B: compB.impactScore * 100 },
    { subject: 'Carbon Offset', A: compA.compensationScore * 100, B: compB.compensationScore * 100 },
    { subject: 'Nature Action', A: compA.vbi * 100, B: compB.vbi * 100 },
    { subject: 'Data Assurance', A: compA.credibilityScore * 100, B: compB.credibilityScore * 100 },
  ];

  const MOCK_BAR_DATA = [
    { metric: 'RR', CompanyA: compA.rr, CompanyB: compB.rr },
    { metric: 'VBI', CompanyA: compA.vbi, CompanyB: compB.vbi },
    { metric: 'Credibility', CompanyA: compA.credibilityScore, CompanyB: compB.credibilityScore },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      
      {/* Header and Selectors */}
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 -mb-4">
        <h1 className="text-3xl font-light text-white mb-6 tracking-tight">Compare Accountability Profiles</h1>
        
        <div className="flex flex-col md:flex-row gap-6 items-center w-full">
          {/* Selector A */}
          <div className="w-full relative">
            <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Company A</label>
            <div className="relative">
              <select 
                value={aId}
                onChange={(e) => handleSelectorChange('a', e.target.value)}
                className="w-full bg-zinc-900 border-2 border-emerald-500/50 rounded-xl py-2 pl-4 pr-10 text-white font-medium focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
              >
                {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="w-10 h-10 shrink-0 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-500 text-sm">
            VS
          </div>

          {/* Selector B */}
          <div className="w-full relative">
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Company B</label>
            <div className="relative">
              <select 
                value={bId}
                onChange={(e) => handleSelectorChange('b', e.target.value)}
                className="w-full bg-zinc-900 border-2 border-indigo-500/50 rounded-xl py-2 pl-4 pr-10 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
              >
                 {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core Metrics Comparison Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Performance Deltas</h3>
           
           <div className="space-y-6">
             {/* RR Row */}
             <div className="flex items-center justify-between border-b border-zinc-800/50 pb-6">
                <div className="w-1/3 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{compA.rr.toFixed(2)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">Company A</p>
                </div>
                <div className="w-1/3 text-center px-4">
                  <p className="text-sm font-bold text-white mb-1">Responsibility Ratio</p>
                  <p className="text-[10px] text-zinc-500">Comp / Impact</p>
                  <div className="mt-2 text-[10px] font-bold text-zinc-300 bg-zinc-800 inline-block px-2 py-1 rounded border border-zinc-700">Diff: {Math.abs(compA.rr - compB.rr).toFixed(2)}</div>
                </div>
                 <div className="w-1/3 text-center">
                  <p className="text-3xl font-bold text-indigo-400">{compB.rr.toFixed(2)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">Company B</p>
                </div>
             </div>

             {/* VBI Row */}
             <div className="flex items-center justify-between border-b border-zinc-800/50 pb-6">
                <div className="w-1/3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{compA.vbi.toFixed(2)}</p>
                </div>
                <div className="w-1/3 text-center px-4">
                  <p className="text-sm font-bold text-white mb-1">Voluntary Index</p>
                </div>
                 <div className="w-1/3 text-center">
                  <p className="text-2xl font-bold text-indigo-400">{compB.vbi.toFixed(2)}</p>
                </div>
             </div>
             
             {/* Credibility Row */}
             <div className="flex items-center justify-between">
                <div className="w-1/3 text-center flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-xl font-bold text-emerald-400">{Math.round(compA.credibilityScore * 100)}%</p>
                </div>
                <div className="w-1/3 text-center px-4">
                  <p className="text-sm font-bold text-white mb-1">Disclosure Credibility</p>
                </div>
                 <div className="w-1/3 text-center flex flex-col items-center">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  </div>
                  <p className="text-xl font-bold text-indigo-400">{Math.round(compB.credibilityScore * 100)}%</p>
                </div>
             </div>
           </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest w-full text-left mb-2">Strategic Profile</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_RADAR_DATA}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name={compA.name} dataKey="A" stroke="#34d399" strokeWidth={2} fill="#34d399" fillOpacity={0.2} />
                <Radar name={compB.name} dataKey="B" stroke="#818cf8" strokeWidth={2} fill="#818cf8" fillOpacity={0.2} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                  itemStyle={{ fontSize: 12 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400"><div className="w-3 h-3 bg-emerald-400/50 border border-emerald-400 rounded-sm"></div> {compA.name}</div>
            <div className="flex items-center gap-2 text-xs text-zinc-400"><div className="w-3 h-3 bg-indigo-400/50 border border-indigo-400 rounded-sm"></div> {compB.name}</div>
          </div>
        </div>

        {/* Grouped Bar for Raw Values */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Normalized Index Scores</h3>
           <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_BAR_DATA}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="metric" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#27272a' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                <Bar dataKey="CompanyA" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="CompanyB" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
