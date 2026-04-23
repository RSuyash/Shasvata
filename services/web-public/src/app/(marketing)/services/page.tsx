"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles, Compass } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { getDomains, getChildrenOf, buildServicePath, domainAccent } from "@/lib/taxonomy-helpers";

// The badge component with a continuous animated gradient glow
function SystemBadge({ text }: { text: string }) {
  return (
    <div className="relative group flex items-center justify-center">
      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[rgb(var(--naya-blue))] to-[rgb(var(--naya-green))] opacity-30 blur-md group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse" />
      <div className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/70 px-4 py-1.5 backdrop-blur-md shadow-sm">
        <div className="flex gap-0.5 items-end h-3">
          <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-1 rounded-full bg-[rgb(var(--naya-blue))]" />
          <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-1 rounded-full bg-[rgb(var(--naya-green))]" />
          <motion.div animate={{ height: [12, 6, 12] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-1 rounded-full bg-slate-300" />
        </div>
        <span className="text-[0.65rem] font-bold tracking-widest text-[rgb(var(--naya-navy))] uppercase">
          {text}
        </span>
      </div>
    </div>
  );
}

const domainIcons: Record<string, React.ElementType> = {
  MARKETING: Sparkles,
  TECH: Layers,
  ADVISORY: Compass,
};

// 3D Tilt Card Component mimicking WebGL interactions
function TiltCard({ children, accentClass, href }: { children: React.ReactNode; accentClass: string; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useMotionTemplate`${mouseYSpring}deg`;
  const rotateY = useMotionTemplate`${mouseXSpring}deg`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate rotation limits (-5 to 5 degrees)
    const rX = ((mouseY / height) - 0.5) * -10;
    const rY = ((mouseX / width) - 0.5) * 10;
    
    x.set(rY);
    y.set(rX);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative flex h-full w-full flex-col group [perspective:1000px] cursor-pointer"
    >
      <Link href={href} className="absolute inset-0 z-20" aria-label="Explore domain" />
      <div className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgb(0,0,0,0.06)] transition-colors duration-500 hover:bg-white/60`}>
        
        {/* Animated fluid blob inside the card */}
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${accentClass} opacity-10 blur-[80px] mix-blend-multiply group-hover:scale-150 transition-transform duration-1000`} style={{ backgroundColor: "currentColor" }} />
        <div className={`absolute -bottom-20 -left-20 h-64 w-64 rounded-full ${accentClass} opacity-10 blur-[60px] mix-blend-multiply group-hover:scale-150 transition-transform duration-1000 delay-100`} style={{ backgroundColor: "currentColor" }} />
        
        {/* Shine effect on hover */}
        <motion.div 
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ transform: "translateZ(10px)" }}
        />

        <div className="relative z-20 p-8 xl:p-10 flex flex-col h-full" style={{ transform: "translateZ(30px)" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesIndexPage() {
  const domains = getDomains();

  // Entrance animations config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative isolate overflow-hidden bg-[#fafafa] min-h-screen text-[rgb(var(--naya-navy))] flex flex-col pt-16 md:pt-20">
      {/* Animated Mesh Background simulating WebGL */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-blue-50/80 via-[#fafafa] to-transparent" />
      <motion.div 
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        className="fixed inset-0 -z-10 opacity-30 mix-blend-soft-light pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-6 flex-1 flex flex-col md:h-[calc(100vh-80px)] pb-6">
        
        {/* Top 30% Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full shrink-0 flex flex-col items-center justify-center text-center py-6 md:py-10 md:h-[32%]"
        >
          <div className="mb-4 md:mb-6">
            <SystemBadge text="SERVICE CATALOG" />
          </div>

          <h1 className="max-w-4xl text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold tracking-tight text-[rgb(var(--naya-navy))] drop-shadow-sm leading-[1.05] mb-4 md:mb-6">
            Intelligence & Execution, <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--naya-blue))] via-indigo-500 to-[rgb(var(--naya-green))] animate-gradient-x">Working As One.</span>
          </h1>

          <p className="max-w-2xl text-base md:text-lg lg:text-xl font-medium leading-relaxed text-slate-500/90 text-balance">
            Three interconnected domains — Marketing, Technology, and Advisory — designed to build infrastructure that compounds over time.
          </p>
        </motion.div>

        {/* Bottom 70% Cards Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full flex-1 min-h-0 grid md:grid-cols-3 gap-6 lg:gap-8 pb-4"
        >
          {domains.map((domain) => {
            const accent = domainAccent[domain.domain];
            const categories = getChildrenOf(domain.id);
            const Icon = domainIcons[domain.domain] || Layers;
            const path = buildServicePath(domain);

            return (
              <motion.div key={domain.id} variants={itemVariants} className="h-full">
                <TiltCard accentClass={accent.text} href={path}>
                  
                  {/* Header Row */}
                  <div className="mb-6 lg:mb-8 flex items-center justify-between">
                    <div className="relative group/icon flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_2px_10px_rgb(0,0,0,0.05)] ring-1 ring-slate-100/50 transition-transform duration-500 hover:scale-110">
                      {/* Icon inner glow */}
                      <div className={`absolute inset-0 rounded-2xl ${accent.text} opacity-20 blur-md`} style={{ backgroundColor: "currentColor" }} />
                      <Icon className={`relative z-10 h-8 w-8 ${accent.text}`} />
                    </div>
                    <span className="rounded-full bg-white/50 px-3 py-1.5 text-[0.65rem] font-bold tracking-widest text-slate-500 border border-slate-200/50 backdrop-blur-sm shadow-sm uppercase">
                      {categories.length} Categories
                    </span>
                  </div>

                  {/* Body */}
                  <h2 className={`mb-3 text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 transition-colors duration-300 group-hover:${accent.text}`}>
                    {domain.label}
                  </h2>
                  
                  <p className="text-sm xl:text-base text-slate-500 leading-relaxed max-w-sm mb-6 flex-shrink-0">
                    {domain.description || domain.summary}
                  </p>

                  <div className="my-auto" /> {/* Spacer */}

                  {/* List */}
                  <div className="flex flex-col gap-2.5 xl:gap-3.5 mb-8">
                    {categories.map((cat, idx) => (
                      <motion.div 
                        key={cat.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                        className="flex items-center gap-3 group/item"
                      >
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100/50 transition-transform group-hover/item:scale-110`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${accent.text}`} style={{ backgroundColor: "currentColor" }} />
                        </div>
                        <span className="text-sm xl:text-base font-semibold text-slate-700/80 group-hover/item:text-slate-900 transition-colors">
                          {cat.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* View Deep Link */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-200/40 pt-6">
                    <span className={`text-sm xl:text-base font-bold tracking-wide ${accent.text}`}>
                      View All Inside {domain.label.split(" ")[1] || domain.label}
                    </span>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 transition-all duration-300 group-hover:translate-x-2 group-hover:shadow-md ${accent.text}`}>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
