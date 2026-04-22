import React from 'react';
import { FileText, ArrowRight, Download, BarChart3, Database } from 'lucide-react';

export default function Reports() {
  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full gap-8">
      
      {/* Header */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Database className="w-96 h-96" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-light text-zinc-100 mb-6 tracking-tight">Reports & Insights</h1>
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Methodology notes, sector briefs, and aggregate insights derived from the ICCAA database. Representational prototypes for the demo framework.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 mt-6 bg-zinc-800/80 border border-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Illustrative Prototype Content
          </div>
        </div>
      </section>

      {/* Report Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Core Methodology */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between hover:bg-zinc-900/60 transition-all group">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest rounded">Methodology Note</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">The 3-Layer Scoring Model</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">Detailed technical specification of how Impact, Compensation, and Credibility scores are calculated, including regression formulas and source tiering.</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
             <span className="text-xs text-zinc-500 font-medium">May 15, 2024</span>
             <button className="text-zinc-300 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">Read <ArrowRight className="w-3 h-3" /></button>
          </div>
        </div>

        {/* Sector Brief */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between hover:bg-zinc-900/60 transition-all group">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded">Sector Brief</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">Energy Transition Gap</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">An analysis of top Indian energy producers, tracking the widening gap between mandatory emissions reporting and voluntary afforestation efforts.</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
             <span className="text-xs text-zinc-500 font-medium">Jun 02, 2024</span>
             <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">Read <ArrowRight className="w-3 h-3" /></button>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between hover:bg-zinc-900/60 transition-all group">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest rounded">Market Analysis</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">Offset Quality & Greenwashing</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">Examining the reliance on unregulated local certificates versus verified standard offsets (VCS/GS) within the NIFTY 50 cohort.</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
             <span className="text-xs text-zinc-500 font-medium">Jul 18, 2024</span>
             <button className="text-amber-500 hover:text-amber-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">Read <ArrowRight className="w-3 h-3" /></button>
          </div>
        </div>

      </section>
      
      {/* Download Dataset Call to action */}
      <section className="bg-gradient-to-r from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 mt-4">
        <div>
          <h3 className="text-2xl font-bold text-indigo-100 mb-2">ICCAA Bulk Dataset</h3>
          <p className="text-indigo-200/60 text-sm max-w-md">Download the complete FY2024 snapshot (1,000 companies) including raw BRSR extractions and derived scores.</p>
        </div>
        <button className="shrink-0 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-indigo-400">
          <Download className="w-4 h-4" /> Download .CSV (Mock)
        </button>
      </section>

    </div>
  );
}
