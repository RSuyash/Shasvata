import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_COMPANIES } from '../data/mock/companies';
import { MOCK_SECTORS } from '../data/mock/sectors';

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const navigate = useNavigate();

  const filteredData = MOCK_COMPANIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
           <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
             Explore Universe
           </div>
          <h1 className="text-3xl font-light text-zinc-100 mb-2">Universe Browser</h1>
          <p className="text-zinc-400 max-w-xl">Filter and explore climate accountability data across 1,000 listed companies.</p>
        </div>
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Showing <span className="text-white">{filteredData.length}</span> / 1,000
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zinc-900/40 rounded-[2rem] border border-zinc-800/50">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by company name or ticker..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
          <select 
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none transition-all"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            <option value="All">All Sectors</option>
            {MOCK_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800/50 overflow-hidden shadow-sm p-4">
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/20">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-800/30 border-b border-zinc-800/50 text-zinc-500 font-bold text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:text-zinc-300 transition-colors"><div className="flex items-center gap-1">Company <ArrowUpDown className="h-3 w-3" /></div></th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4 text-right cursor-pointer hover:text-zinc-300 transition-colors"><div className="flex items-center justify-end gap-1">Revenue (₹Cr) <ArrowUpDown className="h-3 w-3" /></div></th>
                <th className="px-6 py-4 text-right cursor-pointer hover:text-zinc-300 transition-colors"><div className="flex items-center justify-end gap-1">Resp. Ratio <ArrowUpDown className="h-3 w-3" /></div></th>
                <th className="px-6 py-4 text-right">VBI</th>
                <th className="px-6 py-4 text-right">Impact Score</th>
                <th className="px-6 py-4 text-right">Credibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredData.length > 0 ? filteredData.map((company) => (
                <tr 
                  key={company.id} 
                  className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/company/${company.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">{company.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{company.ticker}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{company.sector}</td>
                  <td className="px-6 py-4 text-right text-zinc-400 font-mono">{(company.revenue / 1000).toFixed(1)}k</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-semibold text-xs border ${
                      company.rr > 0.7 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      company.rr > 0.4 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {company.rr.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-400">{company.vbi.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-400">{company.impactScore.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${((company as any).credibilityScore || 0.95) > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.round(((company as any).credibilityScore || 0.95) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-zinc-400 w-8 text-xs">{Math.round(((company as any).credibilityScore || 0.95) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4 border border-zinc-700">
                      <Search className="w-5 h-5 text-zinc-500" />
                    </div>
                    <h3 className="text-zinc-300 font-bold mb-1 tracking-tight">No public disclosure found</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">No matching companies were found in the current illustrative prototype dataset. Broaden your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-zinc-900 to-indigo-900/20 border border-zinc-800 rounded-[2rem] p-6 text-center">
        <p className="text-sm text-zinc-400">Want to view and export the entire 1,000 company dataset? <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">Get API Access</a></p>
      </div>
    </div>
  );
}

