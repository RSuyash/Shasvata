import React from 'react';
import { Terminal, Copy, CheckCircle2, Server, Key, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApiDocs() {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('curl -X GET "https://api.iccaa.in/v1/companies/RELIANCE" -H "Authorization: Bearer YOUR_API_KEY"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto py-8">
      
      {/* Header */}
      <div className="text-center pt-8 pb-12 border-b border-zinc-800/50">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
          <Terminal className="w-3 h-3" /> Developer API
        </div>
        <h1 className="text-4xl md:text-5xl font-light text-zinc-100 mb-6 tracking-tight">ICCAA Data API</h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Access the full ICCAA universe via our REST API. Programmatic access to over 1,000 public companies' processed environmental damage and compensation metrics.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-12 text-center md:text-left flex flex-col items-center justify-center min-h-[40vh]">
        <Server className="w-16 h-16 text-zinc-700 mb-6" />
        <h2 className="text-2xl font-light text-white mb-4">API Documentation Coming Soon</h2>
        <p className="text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
          The API is currently in private beta with select institutional partners. Public documentation, endpoint specifications, and sandbox access will be available when the platform reaches GA.
        </p>
        
        <div className="flex items-center justify-center w-full max-w-lg mb-8">
           <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 w-full flex items-center justify-between group">
             <code className="text-xs text-indigo-400 font-mono select-all">curl -X GET "https://api.iccaa.in/v1/companies/RELIANCE" -H "Authorization: Bearer YOUR_API_KEY"</code>
             <button 
                onClick={copyToClipboard}
                className="w-8 h-8 rounded shrink-0 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="Copy Example"
             >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
             </button>
           </div>
        </div>

        <button className="px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-zinc-200 transition-colors inline-flex items-center gap-2">
          <Key className="w-4 h-4" /> Request Beta API Key
        </button>
      </div>
      
    </div>
  );
}
