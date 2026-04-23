"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DesktopNavProps = {
  isScrolled: boolean;
  servicesOpen: boolean;
  onServicesEnter: () => void;
  onServicesLeave: () => void;
  onMobileToggle: () => void;
  isMobileOpen: boolean;
};

export function DesktopNav({
  isScrolled,
  servicesOpen,
  onServicesEnter,
  onServicesLeave,
  onMobileToggle,
  isMobileOpen
}: DesktopNavProps) {
  const headerLinks = [
    { label: "Pricing", href: "/pricing" },
    { label: "Tech", href: "/services/naya-tech" },
    { label: "Marketing", href: "/services/naya-marketing" },
    { label: "Advisory", href: "/services/naya-advisory" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 group relative z-10 shrink-0">
        <div className="flex items-center justify-center transition-transform group-hover:scale-105">
          <Image src="/logo-icon.png" alt="N" width={32} height={32} className="object-contain" />
        </div>
        <span className={cn(
          "font-display font-black text-xl tracking-tight hidden sm:block transition-colors",
          isScrolled ? "text-slate-900" : "text-slate-900"
        )}>
          Shasvata
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className={cn(
          "flex items-center rounded-full border p-1 transition-all duration-300",
          isScrolled 
            ? "bg-white/80 border-slate-200/50 shadow-sm" 
            : "bg-white/5 border-white/10 backdrop-blur-md"
        )}>
          <div
            className="relative px-5 py-2"
            onMouseEnter={onServicesEnter}
            onMouseLeave={onServicesLeave}
          >
            <Link
              href="/services"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 outline-none",
                servicesOpen 
                  ? "text-[rgb(var(--naya-blue))]" 
                  : isScrolled
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-700 hover:text-slate-900"
              )}
            >
              Services
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  servicesOpen && "rotate-180 text-[rgb(var(--naya-blue))]"
                )}
              />
            </Link>
          </div>

          <div className={cn("h-4 w-px mx-1", isScrolled ? "bg-slate-200" : "bg-white/10")} />

          {headerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "px-5 py-2 text-sm font-semibold transition-colors duration-200 outline-none",
                isScrolled
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-700 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CTA / Mobile Toggle */}
      <div className="flex items-center gap-4 shrink-0">
        <Link
          href="/pricing"
          className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[rgb(var(--naya-blue))] hover:bg-blue-600 rounded-full transition-all shadow-lg shadow-[rgb(var(--naya-blue))]/20 hover:shadow-[rgb(var(--naya-blue))]/40 hover:-translate-y-0.5"
        >
          Start with packages
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          onClick={onMobileToggle}
          className={cn(
            "md:hidden flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md border",
            isScrolled
              ? "bg-white/80 border-slate-200 text-slate-800"
              : "bg-white/5 border-slate-200/50 text-slate-800"
          )}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </>
  );
}
