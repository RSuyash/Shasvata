import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Globe, ChevronDown, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Sectors', path: '/sectors' },
    { name: 'Research', path: '/research' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-zinc-100">
      {/* Navigation Bar (Bento Config) */}
      <header className="sticky top-0 z-50 w-full pt-6 pb-4 bg-[#050505]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-6 md:gap-10 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white group-hover:bg-indigo-500 transition-colors">
                I
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-100">
                ICCAA<span className="text-indigo-500 underline decoration-2 underline-offset-4">OS</span>
              </span>
            </Link>

            <button className="md:hidden p-2 text-zinc-500 hover:text-zinc-300">
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="hidden md:flex bg-zinc-900/80 border border-zinc-800 rounded-full px-6 py-2 items-center gap-8 text-sm font-medium text-zinc-400">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "transition-colors hover:text-white",
                  location.pathname === link.path ? "text-white" : "text-zinc-400"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex-1 max-w-xs hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-2h-4 w-4 text-zinc-500" style={{top: '10px'}} />
              <input
                type="text"
                placeholder="Search database..."
                className="w-full h-9 pl-9 pr-4 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-zinc-600 text-zinc-200"
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <div className="text-right hidden xl:block">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
              <p className="text-sm font-semibold text-zinc-300 leading-none">Public Access</p>
            </div>
            <button className="inline-flex items-center justify-center h-10 px-6 text-sm font-bold text-black bg-white rounded-full hover:bg-zinc-200 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-8 mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>System Operational</span>
          </div>
          <span className="opacity-30">/</span>
          <span className="flex items-center gap-1">
             <Globe className="h-3 w-3" /> ICCAA v2.4.0
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Updated Today</span>
          <span className="opacity-30">/</span>
          <span className="text-zinc-400">Public Accountability Set</span>
        </div>
      </footer>
    </div>
  );
}
