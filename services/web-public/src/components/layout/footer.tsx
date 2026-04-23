"use client";

import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Instagram, ArrowUpRight, CircuitBoard, Sparkles, Compass, CheckCircle2 } from "lucide-react";
import { siteConfig, footerLinks } from "@/content/site";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const domains = [
  {
    name: "Tech",
    label: "Web & Operations API",
    icon: CircuitBoard,
    href: "/services/naya-tech",
    color: "from-blue-600 to-cyan-500",
    shadow: "group-hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)]",
    border: "group-hover:border-blue-500/30",
    features: ["Web App Development", "API Infrastructure", "Workflow Automation"]
  },
  {
    name: "Marketing",
    label: "Demand & Growth Loops",
    icon: Sparkles,
    href: "/services/naya-marketing",
    color: "from-purple-600 to-pink-500",
    shadow: "group-hover:shadow-[0_0_40px_-10px_rgba(147,51,234,0.4)]",
    border: "group-hover:border-purple-500/30",
    features: ["B2B Demand Gen", "Content & Social Media", "Performance Ads"]
  },
  {
    name: "Advisory",
    label: "Strategy & GTM Models",
    icon: Compass,
    href: "/services/naya-advisory",
    color: "from-slate-500 to-slate-300",
    shadow: "group-hover:shadow-[0_0_40px_-10px_rgba(148,163,184,0.3)]",
    border: "group-hover:border-slate-400/30",
    features: ["Strategic GTM", "Operating Models", "Data & Research"]
  }
];

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <footer ref={containerRef} className="relative z-10 isolate bg-[#040A15] overflow-hidden text-slate-300">
      
      {/* High-Contrast Vibrant Marquee Strip */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 md:py-4 shadow-[0_0_30px_rgba(79,70,229,0.3)] z-20">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <motion.div
          className="whitespace-nowrap flex items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 15, repeat: Infinity }}
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.3em] uppercase">
              <span className="mx-8 text-white">SPEED</span>
              <span className="text-white/40 max-w-[4px] overflow-hidden">✦</span>
              <span className="mx-8 text-white">CONSISTENCY</span>
              <span className="text-white/40 max-w-[4px] overflow-hidden">✦</span>
              <span className="mx-8 text-white">CONTROL</span>
              <span className="text-white/40 max-w-[4px] overflow-hidden">✦</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Footer Content */}
      <div className="relative pt-20 pb-12">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <motion.div
            animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-[100%] bg-blue-900/30 blur-[150px]"
          />
          <motion.div
            animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-[100%] bg-purple-900/20 blur-[150px]"
          />
        </div>

        <motion.div style={{ y, opacity }} className="container-naya relative z-10">
          <div className="grid gap-x-12 gap-y-16 lg:grid-cols-12 mb-20">
            
            {/* Brand column (Spans 4) */}
            <div className="lg:col-span-4 flex flex-col items-start">
              <Link href="/" className="flex items-center gap-3 group mb-8">
                <div className="flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                  <Image src="/logo-icon.png" alt="Shasvata" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-3xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  Shasvata
                </span>
              </Link>
              <p className="mb-10 text-base leading-relaxed text-slate-400 font-medium max-w-sm">
                We engineer growth infrastructure. Connecting the dots between technology, marketing, and strategy to build operational engines that compound over time.
              </p>
              
              <Link href="/contact" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-px font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-[#040A15]">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3 rounded-full bg-[#040A15] px-8 py-3.5 text-sm md:text-base font-bold text-white transition-all group-hover:bg-[#060D1A] border border-white/5">
                  Book a Growth Audit
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </div>

            {/* Domains Pillar Cards (Spans 6) */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {domains.map((domain) => {
                const Icon = domain.icon;
                return (
                  <Link key={domain.name} href={domain.href} className={`group relative flex flex-col rounded-3xl border border-white/5 bg-white/[0.03] p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.06] backdrop-blur-sm ${domain.shadow} ${domain.border}`}>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${domain.color} text-white shadow-lg ring-1 ring-white/20 relative z-10`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <h3 className="mb-2 text-xl font-bold text-white relative z-10">
                      {domain.name}
                    </h3>
                    <p className="mb-6 text-sm text-slate-400 leading-relaxed font-medium relative z-10">
                      {domain.label}
                    </p>

                    <div className="mt-8 space-y-3 relative z-10 border-t border-white/10 pt-6">
                      {domain.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 text-transparent bg-clip-text bg-gradient-to-br ${domain.color} opacity-70`} />
                          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Social & Company Links (Spans 2) */}
            <div className="lg:col-span-2 flex flex-col pt-2 border-t border-white/10 lg:border-t-0 lg:pt-0">
              <p className="mb-6 text-xs font-black uppercase tracking-widest text-slate-600">
                Connect
              </p>
              <div className="flex flex-col gap-5 mb-12">
                {[
                  { name: "LinkedIn", icon: Linkedin, href: siteConfig.social.linkedin },
                  { name: "Twitter", icon: Twitter, href: siteConfig.social.twitter },
                  { name: "Instagram", icon: Instagram, href: siteConfig.social.instagram },
                ].map((social) => (
                  <a key={social.name} href={social.href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-sm font-semibold text-slate-500 transition-colors hover:text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-white/10">
                      <social.icon className="h-5 w-5" />
                    </span>
                    {social.name}
                  </a>
                ))}
              </div>

              <p className="mb-6 text-xs font-black uppercase tracking-widest text-slate-600">
                Company
              </p>
              <ul className="space-y-4" role="list">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 font-semibold transition-colors hover:text-white flex items-center gap-2 group"
                    >
                      <span className="w-0 h-px bg-white transition-all group-hover:w-3 opacity-0 group-hover:opacity-100" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Legal Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8 pb-4">
            <p className="text-xs font-medium text-slate-600">
              © {new Date().getFullYear()} Shasvata Private Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
