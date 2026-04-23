import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { MOCK_COMPANIES } from '../data/mock/companies';
import { cn } from '../lib/utils';

// Import Tab Components
import { CompanyProfileTab } from '../components/company/CompanyProfileTab';
import { CompanyImpactTab } from '../components/company/CompanyImpactTab';
import { CompanyCompensationTab } from '../components/company/CompanyCompensationTab';
import { CompanyCredibilityTab } from '../components/company/CompanyCredibilityTab';
import { CompanyTrendsTab } from '../components/company/CompanyTrendsTab';

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
            <div className="text-2xl font-bold font-mono tracking-tighter text-indigo-300">{Math.round(((company as any).credibilityScore || 0.95) * 100)}%</div>
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

      <div className="mt-4">
        {activeTab === 'Profile' && <CompanyProfileTab company={company} />}
        {activeTab === 'Impact' && <CompanyImpactTab company={company} />}
        {activeTab === 'Compensation' && <CompanyCompensationTab company={company} />}
        {activeTab === 'Credibility' && <CompanyCredibilityTab company={company} />}
        {activeTab === 'Trends' && <CompanyTrendsTab company={company} />}
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
