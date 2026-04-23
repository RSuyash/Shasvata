import React from 'react';
import { ShieldCheck, Target, Globe, Terminal, User } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col max-w-4xl mx-auto py-12 gap-16">
      
      {/* Header */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-light text-zinc-100 mb-6 tracking-tight">About ICCAA</h1>
        <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">
          India's first public-data-led corporate climate accountability infrastructure.
        </p>
      </section>

      {/* Platform Thesis */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 md:p-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <Target className="text-indigo-400 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-light text-white">The Platform Thesis</h2>
        </div>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>
            Private ESG rating agencies dominate the market with "black-box" models that aggregate hundreds of disconnected data points into a single, opaque score. This creates a system where companies can purchase higher scores through better reporting, rather than better behavior.
          </p>
          <p>
            ICCAA exists to decouple <strong>compliance reporting</strong> from <strong>voluntary restoration</strong>. We believe that true accountability requires evaluating environmental impact proportionally to a company's financial scale, and measuring exactly what that company actively does to neutralize its footprint.
          </p>
          <p>
            By relying strictly on public data sources like the SEBI BRSR mandate, ICCAA democratizes climate intelligence for India.
          </p>
        </div>
      </section>

      {/* Why Now */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 md:p-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Globe className="text-emerald-400 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-light text-white">Why Now?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h3 className="text-white font-bold mb-2">The BRSR Mandate</h3>
            <p>SEBI's Business Responsibility and Sustainability Report (BRSR) now mandates standardized, quantitative disclosures for India's top 1,000 listed companies. ICCAA is the analytical layer built specifically for this new baseline of transparency.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">The Assurance Gap</h3>
            <p>While compliance is increasing, the quality of data remains highly variable. Without a systematic way to verify source tiers and flag year-over-year inconsistencies, greenwashing via reporting remains a significant risk.</p>
          </div>
        </div>
      </section>

      {/* Built By */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-12 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Prototype Scope & Limitations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-400">
          <div>
            <h3 className="text-zinc-300 font-bold mb-2">1. Illustrative Dataset</h3>
            <p>The current data visible across the platform is synthetic and meant strictly for product demonstration. The live extraction and ranking pipelines are under active development and not currently exposed.</p>
          </div>
          <div>
            <h3 className="text-zinc-300 font-bold mb-2">2. Scoring Boundaries</h3>
            <p>The Impact and Compensation algorithms do not yet handle non-listed subsidiaries or complete Scope 3 downstream emissions due to standard reporting opacity.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800/50 pt-12 flex flex-col md:flex-row items-center gap-8 pb-12">
        <div className="w-24 h-24 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center shrink-0">
          <User className="text-zinc-500 w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Built under Shasvata</h3>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            ICCAA is developed independently by Shasvata, focusing on the intersection of climate finance research, data engineering, and public accountability. The platform serves as both a research dataset and a public intelligence utility.
          </p>
          <div className="flex gap-4 mt-6">
            <button className="text-xs font-bold bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg hover:bg-white transition-colors">
              Contact Developer
            </button>
            <button className="text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2">
               <Terminal className="w-3 h-3" /> View Architecture
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
