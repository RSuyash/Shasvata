"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, CircuitBoard, Sparkles, Compass } from "lucide-react";
import type { ServiceTaxonomyResponse } from "@/lib/service-taxonomy";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  isOpen: boolean;
  taxonomy: ServiceTaxonomyResponse;
};

const domainsData = [
  { name: "Tech", icon: CircuitBoard, href: "/services/naya-tech", color: "text-[rgb(var(--naya-blue))]" },
  { name: "Marketing", icon: Sparkles, href: "/services/naya-marketing", color: "text-purple-500" },
  { name: "Advisory", icon: Compass, href: "/services/naya-advisory", color: "text-slate-600" }
];

export function MobileNav({ isOpen, taxonomy }: MobileNavProps) {
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const headerLinks = [
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)", transition: { duration: 0.2 } }}
          className="fixed inset-x-0 top-[4.5rem] bottom-0 z-[90] bg-slate-50 md:hidden flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
            <div className="space-y-6">
              
              {/* Services Accordion */}
              <div className="border-b border-slate-200 pb-6">
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="flex w-full items-center justify-between py-2 text-2xl font-bold tracking-tight text-slate-900 outline-none"
                >
                  Services
                  <ChevronRight
                    className={cn(
                      "h-6 w-6 text-slate-400 transition-transform duration-300",
                      mobileServicesOpen && "rotate-90 text-[rgb(var(--naya-blue))]"
                    )}
                  />
                </button>
                
                <AnimatePresence>
                  {mobileServicesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-4 pt-4 pb-2">
                        {domainsData.map((dConfig) => {
                          const Icon = dConfig.icon;
                          return (
                            <Link 
                              key={dConfig.name}
                              href={dConfig.href}
                              className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:ring-[rgb(var(--naya-blue))]"
                            >
                              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50/50 ring-1 ring-slate-200/50 ${dConfig.color}`}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <span className="text-lg font-bold text-slate-900 group-hover:text-[rgb(var(--naya-blue))] transition-colors">
                                {dConfig.name}
                              </span>
                            </Link>
                          );
                        })}
                        <Link href="/services" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900">
                          Explore all services <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Standard Links */}
              <div className="flex flex-col gap-6 pt-2">
                {headerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-2xl font-bold tracking-tight text-slate-900 hover:text-[rgb(var(--naya-blue))] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <Link
              href="/pricing"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[rgb(var(--naya-blue))] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[rgb(var(--naya-blue))]/20 hover:bg-blue-600 hover:-translate-y-0.5 transition-all"
            >
              Start with packages
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
