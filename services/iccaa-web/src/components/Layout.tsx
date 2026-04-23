import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Globe, ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Sectors', path: '/sectors' },
    { name: 'Research', path: '/research' },
    { name: 'Compare', path: '/compare' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-zinc-100">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full pt-6 pb-4 bg-[#050505]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-6 md:gap-10 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <Link to="/" className="flex items-center gap-3 group relative">
              {/* Prototype Badge */}
              <div className="absolute -top-4 -right-16 translate-x-full px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap">
                Prototype Build
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white group-hover:bg-indigo-500 transition-colors">
                I
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-100">
                ICCAA<span className="text-indigo-500 underline decoration-2 underline-offset-4">OS</span>
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex bg-zinc-900/80 border border-zinc-800 rounded-full px-6 py-2 items-center gap-6 text-sm font-medium text-zinc-400">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "transition-colors hover:text-white whitespace-nowrap",
                  location.pathname === link.path ? "text-white" : "text-zinc-400"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4 shrink-0">
             <Link to="/api/docs" className="inline-flex items-center justify-center h-10 px-5 text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
              Get API Access
            </Link>
            <button className="inline-flex items-center justify-center h-10 px-6 text-sm font-bold text-black bg-white rounded-full hover:bg-zinc-200 transition-colors">
              Request Early Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-zinc-800/50 pt-6 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span>Prototype</span>
            </div>
            <span className="opacity-30">/</span>
            <span className="text-zinc-400">Illustrative FY2024 public-data</span>
            <span className="opacity-30">/</span>
            <span className="flex items-center gap-1">
               <Globe className="h-3 w-3" /> Built under Shasvata
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 px-4 py-2 rounded-lg max-w-xl text-center md:text-right">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="text-[10px] sm:text-xs text-indigo-400 font-medium tracking-wide">
              <strong>Notice:</strong> This interface acts as an illustrative prototype framework. All data represents synthetic test state.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
