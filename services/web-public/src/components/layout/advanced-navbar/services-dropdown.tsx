"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CircuitBoard, Sparkles, Compass } from "lucide-react";
import type { ServiceTaxonomyResponse } from "@/lib/service-taxonomy";

type ServicesDropdownProps = {
  taxonomy: ServiceTaxonomyResponse;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const domainsData = [
  {
    id: "naya-tech",
    name: "Tech",
    icon: CircuitBoard,
    href: "/services/naya-tech",
    color: "from-[rgb(var(--naya-blue))] to-cyan-400 text-[rgb(var(--naya-blue))]",
    desc: "Web, automation, and API infrastructure.",
    hoverBase: "hover:bg-[rgb(var(--naya-blue))]/5",
    services: ["Web App Development", "SEO & Core Web Vitals", "API Integrations", "Workflow Automation"]
  },
  {
    id: "naya-marketing",
    name: "Marketing",
    icon: Sparkles,
    href: "/services/naya-marketing",
    color: "from-purple-500 to-pink-500 text-purple-600",
    desc: "Demand generation and growth loops.",
    hoverBase: "hover:bg-purple-50",
    services: ["B2B Demand Gen", "Content & Social Media", "Performance Ads", "Revenue Operations"]
  },
  {
    id: "naya-advisory",
    name: "Advisory",
    icon: Compass,
    href: "/services/naya-advisory",
    color: "from-slate-700 to-slate-500 text-slate-700",
    desc: "Operating models and strategic GTM.",
    hoverBase: "hover:bg-slate-50",
    services: ["Strategic GTM", "Operating Models", "Data & Research", "Tech & AI Consulting"]
  }
];

export function ServicesDropdown({ taxonomy, onMouseEnter, onMouseLeave }: ServicesDropdownProps) {
  const menuVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 15, scale: 0.98, filter: "blur(10px)", transition: { duration: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div 
      className="absolute left-1/2 top-full w-[850px] -translate-x-1/2 pt-5 z-[150]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] backdrop-blur-3xl"
      >
        <div className="grid grid-cols-3 gap-4 px-6 py-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-50 pointer-events-none" />

          {domainsData.map((dConfig) => {
            const Icon = dConfig.icon;
            return (
              <motion.div key={dConfig.id} variants={itemVariants} className="relative z-10 flex flex-col h-full">
                <Link 
                  href={dConfig.href}
                  className={`group flex flex-col rounded-3xl p-5 transition-all duration-300 ${dConfig.hoverBase} hover:shadow-sm border border-transparent hover:border-black/5 flex-1`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${dConfig.color.split(" ")[0]} text-white shadow-sm ring-1 ring-black/5`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-base font-bold transition-colors ${dConfig.color.split(" ").pop()}`}>
                        {dConfig.name}
                      </span>
                    </div>
                  </div>
                  
                  <span className="mb-4 text-xs font-semibold leading-relaxed text-slate-500 group-hover:text-slate-700 transition-colors">
                    {dConfig.desc}
                  </span>
                  
                  <ul className="flex flex-col gap-2 mt-auto">
                    {dConfig.services.map((srv, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                        <div className={`h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${dConfig.color.split(" ")[0]}`} />
                        {srv}
                      </li>
                    ))}
                  </ul>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="relative z-10 border-t border-slate-200/50 bg-slate-50/50 px-8 py-5 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800">T</div>
              <div className="h-8 w-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-800">M</div>
              <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-800">A</div>
            </div>
            <span className="text-xs font-medium text-slate-500 ml-2">Modular solutions.</span>
          </div>
          <Link href="/services" className="text-xs font-bold text-[rgb(var(--naya-blue))] flex items-center gap-1 hover:gap-2 transition-all bg-white rounded-full px-4 py-2 shadow-sm ring-1 ring-slate-200 hover:shadow-md">
            Explore all services <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
