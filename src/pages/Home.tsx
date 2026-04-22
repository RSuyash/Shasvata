import React from 'react';
import { ArrowRight, BarChart3, Database, FileText, CheckCircle2, TrendingUp, AlertTriangle, Info, BookOpen, Shield, Users, Search, Building2 } from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, 
  BarChart, Bar, Cell
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { SCATTER_DATA, TOP_10_COMPANIES, BOTTOM_10_COMPANIES } from '../data/mock/companies';
import { SECTOR_MEDIAN_RR } from '../data/mock/sectors';
import { cn } from '../lib/utils';

// Helper for formatting large numbers
const formatCr = (val: number) => `₹${(val / 1000).toFixed(1)}k cr`;

// Custom Tooltip for Scatter Plot
const ScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900/90 p-4 border border-zinc-800 shadow-xl rounded-xl text-sm max-w-[250px] text-zinc-300">
        <p className="font-bold text-white border-b border-zinc-800 pb-2 mb-2">{data.name}</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <span className="text-zinc-500">Sector:</span>
          <span className="font-medium text-zinc-100">{data.sector}</span>
          <span className="text-zinc-500">Revenue:</span>
          <span className="font-medium text-emerald-400">{formatCr(data.revenue)}</span>
          <span className="text-zinc-500">Resp. Ratio:</span>
          <span className="font-medium text-white">{data.rr.toFixed(2)}</span>
          <span className="text-zinc-500">Mkt Cap:</span>
          <span className="font-medium text-zinc-100">{formatCr(data.marketCap)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-grow">
      
      {/* Trust Strip */}
      <div className="md:col-span-4 bg-zinc-900 border border-zinc-800 py-3 px-6 rounded-2xl flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-bold text-zinc-500 uppercase tracking-widest">
        <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-400" /> Public-Data-Led</span>
        <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-400" /> Auditability-First</span>
        <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Transparent Methodology</span>
      </div>

      {/* Row 2: Hero Panel (Span 2x2) */}
      <section className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-[2rem] p-10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <GlobeIcon className="w-96 h-96" />
        </div>
        
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Platform Status: Live (FY2024 Data)
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-zinc-100 leading-tight mb-6">
            India's Corporate Climate <br/><span className="font-bold text-indigo-500">Accountability Platform.</span>
          </h1>
          <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-sm">
            Transparent, public-data-backed intelligence evaluating how listed companies balance financial growth with environmental responsibility.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link to="/explore" className="bg-white text-black px-8 py-3 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950">
              Explore Universe
            </Link>
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                 <BarChart3 className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-700 text-[10px] flex items-center justify-center font-bold text-white tracking-widest">+1k</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs directly flowing into grid */}
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Target Status</p>
          <div className="text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-400/10 rounded-lg">+0.05</div>
        </div>
        <div>
          <p className="text-5xl font-bold italic tracking-tighter text-white">0.45</p>
          <p className="text-zinc-400 text-sm mt-1 font-medium">Median Resp. Ratio</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Behavior</p>
          <div className="text-indigo-400 text-xs font-bold px-2 py-1 bg-indigo-500/10 rounded-lg">+0.02</div>
        </div>
        <div>
          <p className="text-5xl font-bold italic tracking-tighter text-white">0.32</p>
          <p className="text-zinc-400 text-sm mt-1 font-medium">Voluntary Behavior Index</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">BRSR Assurance</p>
        <p className="text-3xl font-bold text-white">42%</p>
        <p className="text-xs text-zinc-500 mt-2">of top 1,000</p>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Comp. Disclosure</p>
        <p className="text-3xl font-bold text-white">68%</p>
        <p className="text-xs text-zinc-500 mt-2">of top 1,000</p>
      </div>

      {/* Row 4: Primary Visualization & League Tables */}
      <section className="md:col-span-2 md:row-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                Scale vs. Responsibility <Info className="h-3 w-3" />
              </p>
              <h2 className="text-lg font-bold text-white">Market Position Map</h2>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis 
                    dataKey="revenue" 
                    type="number" 
                    name="Revenue" 
                    scale="log" 
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `₹${val/1000}k`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#71717a' }}
                  />
                  <YAxis 
                    dataKey="rr" 
                    type="number" 
                    name="Responsibility Ratio"
                    domain={[0, 2]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#71717a' }}
                  />
                  <ZAxis dataKey="marketCap" range={[50, 400]} name="Market Cap" />
                  <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#3f3f46' }} />
                  <Scatter name="Companies" data={SCATTER_DATA} fillOpacity={0.8} onClick={(e: any) => e && e.payload && navigate(`/company/${e.payload.id}`)} style={{ cursor: 'pointer' }}>
                    {SCATTER_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSectorColor(entry.sector)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
          </div>
      </section>

      {/* Right Panel: League Tables */}
      <section className="md:col-span-2 md:row-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col gap-8">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Top Performers (RR)
            </p>
            <div className="rounded-2xl border border-zinc-800/50 overflow-hidden bg-zinc-900/20">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800/30 text-zinc-500 font-medium text-xs">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Company</th>
                    <th className="text-right py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {TOP_10_COMPANIES.map((c) => (
                    <tr key={c.id} onClick={() => navigate(`/company/${c.id}`)} className="hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                      <td className="py-3 px-4 font-bold text-zinc-300 truncate max-w-[150px] group-hover:text-white">{c.name}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20 group-hover:bg-emerald-500/20">
                          {c.rr.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500 rotate-180" />
              Bottom Performers (RR)
            </p>
            <div className="rounded-2xl border border-zinc-800/50 overflow-hidden bg-zinc-900/20">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800/30 text-zinc-500 font-medium text-xs">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Company</th>
                    <th className="text-right py-3 px-4 font-bold tracking-widest uppercase text-[10px]">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {BOTTOM_10_COMPANIES.map((c) => (
                    <tr key={c.id} onClick={() => navigate(`/company/${c.id}`)} className="hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                      <td className="py-3 px-4 font-bold text-zinc-300 truncate max-w-[150px] group-hover:text-white">{c.name}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 font-semibold text-xs border border-rose-500/20 group-hover:bg-rose-500/20">
                          {c.rr.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </section>

      {/* Row 5: Sector Bar Chart */}
      <section className="md:col-span-4 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Median Responsibility Ratio by Sector</p>
          <Link to="/sectors" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center">
            View Sector Detail <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SECTOR_MEDIAN_RR}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="sector" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
                width={160}
              />
              <Tooltip 
                cursor={{ fill: '#27272a' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }}
                 formatter={(value: number) => [value.toFixed(2), 'Median RR']}
              />
              <Bar dataKey="rr" radius={[0, 4, 4, 0]} barSize={20} onClick={(data) => navigate('/sectors')} style={{ cursor: 'pointer' }}>
                {SECTOR_MEDIAN_RR.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSectorColor(entry.sector)} fillOpacity={0.9} className="hover:opacity-100 transition-opacity drop-shadow-sm" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Row 6: Insight Cards */}
      <section className="md:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <InsightCard 
          title="Sector Divergence"
          text="The Energy sector emits 4x the intensity of the IT sector, but compensates at only 1.2x the rate, driving down its median."
          tag="Data Insight"
          linkTo="/reports"
        />
        <InsightCard 
          title="Offset Quality Gap"
          text="Only 18% of top 1,000 companies disclose carbon credit retirements using verified international standards."
          tag="Credibility Warning"
          warning
          linkTo="/reports"
        />
        <InsightCard 
          title="The Compliance Ceiling"
          text="Sharp drop-off in voluntary nature actions. 64% of companies disclose exactly the BRSR minimum."
          tag="Policy Implication"
          linkTo="/reports"
        />
      </section>

      {/* Storytelling Block: Why ICCAA? */}
      <section className="md:col-span-4 border-t border-zinc-800/50 pt-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-light text-zinc-100 mb-6">Why this platform exists</h2>
            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                Sustainability data in India is highly fragmented across BRSR filings, annual reports, and government portals. Existing ESG tools compare absolute emission values without normalizing for financial scale, making fair benchmarking impossible.
              </p>
              <p>
                Crucially, there is a blind spot between <strong className="text-zinc-100">mandatory compliance</strong> and <strong className="text-zinc-100">voluntary action</strong>. We built ICCAA to extract, normalize, and score public disclosures directly, revealing what companies actually do to compensate for their impact.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-2xl">
                <Search className="w-5 h-5 text-indigo-400 mb-3" />
                <h4 className="font-bold text-white text-sm mb-1">Structured Dataset</h4>
                <p className="text-xs text-zinc-500">1,000 companies tracked natively from BRSR and filings.</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-2xl">
                <BookOpen className="w-5 h-5 text-emerald-400 mb-3" />
                <h4 className="font-bold text-white text-sm mb-1">Transparent Model</h4>
                <p className="text-xs text-zinc-500">No black-box ESG scores. Everything is linked to sources.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-[2rem]">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">How ICCAA Scores</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center font-bold text-rose-500 font-mono">1</div>
                <div>
                  <h4 className="font-bold text-zinc-200">Impact Score</h4>
                  <p className="text-sm text-zinc-400 mt-1">Normalizes Scope 1 & 2 emissions, water, and waste by revenue.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-emerald-500 font-mono">2</div>
                <div>
                  <h4 className="font-bold text-zinc-200">Compensation Score</h4>
                  <p className="text-sm text-zinc-400 mt-1">Quantifies carbon credits, RECs, green credits, and nature actions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center font-bold text-indigo-500 font-mono">3</div>
                <div>
                  <h4 className="font-bold text-zinc-200">Responsibility Ratio (RR)</h4>
                  <p className="text-sm text-zinc-400 mt-1">Ratio of Compensation to Impact. Enables fair cross-sector comparison.</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-zinc-800">
                <Link to="/methodology" className="text-sm font-bold text-indigo-400 hover:text-white transition-colors flex items-center gap-2">
                  Read Full Methodology <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="md:col-span-4 mt-8 pb-12">
        <h3 className="text-center text-2xl font-light text-zinc-300 mb-8">Who it serves</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-3xl text-center">
            <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">For Researchers</h4>
            <p className="text-sm text-zinc-400">Transparent methodology, comparable metrics, and export-ready data for academic analysis.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-3xl text-center">
            <BarChart3 className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">For Investors & Analysts</h4>
            <p className="text-sm text-zinc-400">Structured screening layer evaluating corporate accountability and disclosure quality.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-3xl text-center">
            <Building2 className="w-8 h-8 text-amber-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">For ESG Teams</h4>
            <p className="text-sm text-zinc-400">Peer benchmarking, disclosure visibility, and competitive credibility positioning.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

function InsightCard({ title, text, tag, warning, linkTo }: { title: string, text: string, tag: string, warning?: boolean, linkTo?: string }) {
  const CardContent = () => (
    <>
      <div className={cn(
        "text-[10px] font-bold uppercase tracking-widest mb-4 block",
        warning ? "text-amber-500" : "text-indigo-400"
      )}>
        {tag}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
      </div>
    </>
  );

  return linkTo ? (
    <Link to={linkTo} className="group bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between hover:bg-zinc-900/60 transition-all hover:border-zinc-700/80 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
      <CardContent />
    </Link>
  ) : (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between">
      <CardContent />
    </div>
  );
}

function Activity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

// Simple color map for sectors
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

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
