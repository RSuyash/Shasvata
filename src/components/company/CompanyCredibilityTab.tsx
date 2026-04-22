import React from 'react';
import { CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export function CompanyCredibilityTab({ company }: { company: any }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-indigo-400" /> BRSR Completeness</p>
          <p className="text-3xl font-bold text-white mt-2">100%</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Assurance Grade</p>
          <p className="text-2xl font-bold text-indigo-400 mt-2">Reasonable</p>
          <p className="text-xs text-zinc-500 mt-1">E&Y Inc.</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Credibility Score</p>
          <p className="text-3xl font-bold text-white mt-2">{(company.credibilityScore || 0.95).toFixed(2)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Data Source Integrity</h3>
          <div className="space-y-4 mt-6">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 font-mono font-bold">Tier 1: Regulatory Filings</span>
                <span className="text-emerald-400">85%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '85%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 font-mono font-bold">Tier 2: Audited PDF</span>
                <span className="text-indigo-400">10%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5"><div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '10%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 font-mono font-bold">Tier 3: Voluntary Reports</span>
                <span className="text-amber-400">5%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '5%' }}></div></div>
            </div>
          </div>
        </div>

          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-zinc-400" /> Integrity Flags
          </h3>
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-zinc-200 text-sm">No Greenwashing Signals Detected</h4>
              <p className="text-xs text-zinc-500 mt-1">Compensation claims (RR: {(company.rr || 0).toFixed(2)}) are commensurate with Impact reporting footprint, backed by strong Credibility layer.</p>
            </div>
          </div>
          <div className="mt-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-start gap-4">
            <ShieldCheck className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-zinc-200 text-sm">High YoY Consistency</h4>
              <p className="text-xs text-zinc-500 mt-1">0 Restatements exceeding 3 std deviations from FY23 to FY24.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
