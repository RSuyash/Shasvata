import React from 'react';
import { BookOpen, FileText, CheckCircle2, Shield, Info, Scale, AlertTriangle, Layers } from 'lucide-react';
import { MOCK_RESEARCH } from '../data/mock/research';

function ScoreFormulaCard({ title, formula, explanation }: { title: string; formula: string; explanation: string }) {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">{title}</p>
      <div className="font-mono text-2xl text-indigo-300 mb-4">{formula}</div>
      <p className="text-sm leading-relaxed text-zinc-400">{explanation}</p>
    </div>
  );
}

export default function Research() {
  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto py-8">
      
      {/* Header */}
      <div className="text-center pt-8 pb-12 border-b border-zinc-800/50">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
          <Shield className="w-3 h-3" /> External Data Layer
        </div>
        <h1 className="text-4xl md:text-5xl font-light text-zinc-100 mb-6 tracking-tight">Methodology & Research</h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          ICCAA uses a transparent, fully reproducible scoring model anchored strictly in public disclosures. We evaluate impact against scale, and compare voluntary behavior against mandatory baselines.
        </p>
      </div>

      {/* The 3-Score Model */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 md:p-12">
        <h2 className="text-2xl font-light text-white mb-8 flex items-center gap-3">
          <Layers className="text-indigo-400" /> The 3-Score Accountability Model
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {MOCK_RESEARCH.formulas.map((formula, index) => (
            <div key={index}>
              <ScoreFormulaCard
                title={formula.title}
                formula={formula.formula}
                explanation={formula.explanation}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Primary Derived Metrics */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 md:p-12">
        <h2 className="text-2xl font-light text-white mb-8 flex items-center gap-3">
          <Scale className="text-emerald-400" /> Primary Derived Metrics
        </h2>
        
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Responsibility Ratio (RR)</h3>
              <p className="text-sm text-zinc-400 mb-4">
                The core ranking metric of ICCAA. It directly answers the question: "Is the company's restorative behavior proportional to its environmental damage?"
              </p>
              <div className="bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-xl font-mono text-sm text-zinc-300 inline-block">
                RR = Compensation Score (C) / Impact Score (I)
              </div>
            </div>
            <div className="w-full md:w-64 bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">RR Interpretation</div>
              <ul className="text-xs space-y-2">
                <li className="flex justify-between"><span className="text-zinc-400">&lt; 0.20</span> <span className="text-rose-400">Minimal</span></li>
                <li className="flex justify-between"><span className="text-zinc-400">0.20 - 0.40</span> <span className="text-amber-400">Low</span></li>
                <li className="flex justify-between"><span className="text-zinc-400">0.40 - 0.70</span> <span className="text-zinc-300">Moderate</span></li>
                <li className="flex justify-between"><span className="text-zinc-400">&gt; 0.70</span> <span className="text-emerald-400">Strong</span></li>
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Voluntary Behavior Index (VBI)</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Isolates discretionary sustainability actions from BRSR-mandated compliance. A high VBI indicates a company actively sharing forward-looking targets, TCFD alignments, or Scope 3 disclosures entirely by choice.
            </p>
            <div className="bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-xl font-mono text-sm text-zinc-300 inline-block">
              VBI = Voluntary Actions Extracted / 20 Total Benchmarks
            </div>
          </div>
        </div>
      </section>

      {/* Source Hierarchy & Confidence */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 md:p-12">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-2xl font-light text-white flex items-center gap-3">
            <FileText className="text-amber-400" /> Source Data Hierarchy
          </h2>
        </div>
        
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          Not all public data is equal. ICCAA assigns a confidence weight to every extracted metric based on its origin document. These exact flags appear on every data cell across the platform.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {MOCK_RESEARCH.sourceTiers.map((tier, index) => (
             <div key={index} className="flex gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl items-center">
                <div className="w-12 text-center font-black text-indigo-400 text-xl font-mono">T{tier.tier}</div>
                <div>
                  <div className="font-bold text-zinc-200">{tier.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{tier.examples}</div>
                </div>
             </div>
          ))}
        </div>
      </section>

      {/* Limitations & Roadmap */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 md:p-12 mb-12">
        <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="text-rose-400" /> Prototype Scope & Limitations
        </h2>
        
        <div className="prose prose-invert max-w-none text-zinc-400 text-sm">
          <p>
            The current build of ICCAA is a <strong>Phase 1 Production Prototype</strong>. While the framework and calculations represent the final methodology, the user interface currently relies on representative demonstration data simulating India's top 1,000 listed companies.
          </p>
          <ul className="mt-4 space-y-2">
            <li><strong>Data Gap Assumption:</strong> Because carbon and green credit registries in India are not fully centralized, roughly 75% of companies may receive a "D" limit on compensation metrics in the live pipeline. This is a deliberate transparency feature, not a bug.</li>
            <li><strong>Scope 3 Omission:</strong> Scope 3 (supply chain) emissions are explicitly excluded from Version 1.0 due to severe variance in domestic calculation standards.</li>
            <li><strong>Sector Median Replacing Outliers:</strong> To prevent extreme skew, Tier 3 reporting outliers exceeding 3 standard deviations are automatically replaced with the sector median and flagged for review.</li>
          </ul>
        </div>
      </section>

    </div>
  );
}
