"use client";

import { useRef, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles, Compass } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import {
  findNodeBySlug,
  getChildrenOf,
  buildBreadcrumbs,
  buildServicePath,
  domainAccent,
} from "@/lib/taxonomy-helpers";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const domainIcons: Record<string, React.ElementType> = {
  MARKETING: Sparkles,
  TECH: Layers,
  ADVISORY: Compass,
};

// Continuous animated gradient badge
function SystemBadge({ text, bgClass, textClass }: { text: string; bgClass: string; textClass: string }) {
  return (
    <div className="relative group flex items-center justify-center">
      <div className={`absolute -inset-0.5 rounded-full opacity-30 blur-md group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse ${textClass}`} style={{ backgroundColor: "currentColor" }} />
      <div className={`relative flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 backdrop-blur-md shadow-[0_2px_10px_rgb(0,0,0,0.05)] ${bgClass}`}>
        <div className="flex gap-[3px] items-center h-4">
          <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className={`w-1 rounded-full ${textClass}`} style={{ backgroundColor: "currentColor" }} />
          <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }} className={`w-1 rounded-full ${textClass}`} style={{ backgroundColor: "currentColor" }} />
          <motion.div animate={{ height: [14, 8, 14] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }} className="w-1 rounded-full bg-slate-300" />
        </div>
        <span className={`text-[0.65rem] font-bold tracking-widest uppercase ${textClass}`}>
          {text}
        </span>
      </div>
    </div>
  );
}

// 3D Tilt Card Component mimicking WebGL interactions for Categories
function TiltCategoryCard({ children, accentClass, href, index }: { children: React.ReactNode; accentClass: string; href: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 40 });

  const rotateX = useMotionTemplate`${mouseYSpring}deg`;
  const rotateY = useMotionTemplate`${mouseXSpring}deg`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Rotation limits (-4 to 4 degrees)
    const rX = ((mouseY / height) - 0.5) * -8;
    const rY = ((mouseX / width) - 0.5) * 8;
    
    x.set(rY);
    y.set(rX);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Staggered animation
  const variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={variants}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative flex h-full w-full flex-col group [perspective:1000px] cursor-pointer"
    >
      <Link href={href} className="absolute inset-0 z-20" aria-label="Explore category" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgb(0,0,0,0.06)] transition-colors duration-500 hover:bg-white/60">
        
        {/* Animated fluid blobs inside the card */}
        <div className={`absolute -right-20 -top-20 h-56 w-56 rounded-full ${accentClass} opacity-[0.08] blur-[60px] mix-blend-multiply group-hover:scale-150 transition-transform duration-1000`} style={{ backgroundColor: "currentColor" }} />
        <div className={`absolute -bottom-20 -left-20 h-56 w-56 rounded-full ${accentClass} opacity-[0.08] blur-[50px] mix-blend-multiply group-hover:scale-150 transition-transform duration-1000 delay-100`} style={{ backgroundColor: "currentColor" }} />
        
        {/* Shine effect on hover */}
        <motion.div 
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ transform: "translateZ(10px)" }}
        />

        <div className="relative z-20 p-8 flex flex-col h-full" style={{ transform: "translateZ(30px)" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function DomainPage() {
  const params = useParams();
  const domainSlug = params?.domain as string;

  const domain = useMemo(() => findNodeBySlug(domainSlug), [domainSlug]);
  
  if (!domain || domain.kind !== "DOMAIN") {
    return notFound();
  }

  const categories = getChildrenOf(domain.id);
  const accent = domainAccent[domain.domain];
  const crumbs = buildBreadcrumbs(domain.id);
  const Icon = domainIcons[domain.domain] || Layers;

  // Entrance animations config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
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

      {/* Abstract Glowing Orb for Domain Context */}
      <div className={`fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] ${accent.text} opacity-[0.03] blur-[120px] pointer-events-none`} style={{ backgroundColor: "currentColor" }} />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-6 flex-1 flex flex-col pb-12">
        
        <div className="w-full flex justify-start my-4">
          <Breadcrumbs items={crumbs} />
        </div>

        {/* Top 30-40% Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full shrink-0 flex flex-col items-center justify-center text-center py-6 md:py-10 mb-8"
        >
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-6 relative">
              <div className={`absolute inset-0 ${accent.text} opacity-20 blur-xl rounded-full`} style={{ backgroundColor: "currentColor" }} />
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-slate-100 ${accent.text}`}>
                <Icon className="h-10 w-10" />
              </div>
            </div>
            <SystemBadge text={`${domain.domain.replace('_', ' ')} DOMAIN`} bgClass="bg-white/80" textClass={accent.text} />
          </div>

          <h1 className="max-w-4xl text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-[rgb(var(--naya-navy))] drop-shadow-sm leading-[1.05] mb-6">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600`}>
              {domain.label}
            </span>
          </h1>

          <p className="max-w-3xl text-lg md:text-xl font-medium leading-relaxed text-slate-500/90 text-balance">
            {domain.description || domain.summary}
          </p>
        </motion.div>

        {/* Bottom Categories Grid Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr"
        >
          {categories.map((cat, i) => {
            const services = getChildrenOf(cat.id);
            const path = buildServicePath(cat);

            return (
              <TiltCategoryCard key={cat.id} accentClass={accent.text} href={path} index={i}>
                {/* Header Sequence */}
                <div className="mb-6 flex items-center justify-between">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm ${accent.bg} ${accent.text} ring-1 ring-white/50 backdrop-blur-md`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-white/50 px-3 py-1 text-[0.6rem] font-bold tracking-widest text-slate-400 border border-slate-200/50 shadow-sm uppercase">
                    {services.length} Services
                  </span>
                </div>

                {/* Body Content */}
                <h3 className={`text-2xl font-bold tracking-tight text-slate-900 mb-3 group-hover:${accent.text} transition-colors duration-300`}>
                  {cat.label}
                </h3>

                {cat.summary && (
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                    {cat.summary}
                  </p>
                )}

                <div className="my-auto" />

                {/* Services List Preview */}
                <div className="mt-auto flex flex-col gap-2.5 mb-8">
                  <h4 className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Architecture</h4>
                  {services.slice(0, 3).map((svc, idx) => (
                    <motion.div 
                      key={svc.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                      className="flex items-center gap-2.5 group/item"
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${accent.text} opacity-50 shadow-sm`} style={{ backgroundColor: "currentColor" }} />
                      <span className="text-sm font-semibold text-slate-600 group-hover/item:text-slate-900 transition-colors">
                        {svc.label}
                      </span>
                    </motion.div>
                  ))}
                  {services.length > 3 && (
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span className="text-xs font-semibold text-slate-400">
                        + {services.length - 3} additional services...
                      </span>
                    </div>
                  )}
                </div>

                {/* Interactive Deep Link */}
                <div className="border-t border-slate-200/40 pt-6 flex flex-row items-center justify-between">
                  <span className={`text-sm font-bold tracking-wide ${accent.text}`}>
                    Explore Platform
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:translate-x-1 group-hover:shadow-md ${accent.text}`}>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

              </TiltCategoryCard>
            );
          })}
        </motion.div>

        {/* Global Action CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center pb-24"
        >
          <div className="relative inline-flex flex-col items-center p-8 rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/60 shadow-lg">
            <h3 className="text-2xl font-extrabold mb-2 text-slate-900">Configure Your Core Structure</h3>
            <p className="text-base text-slate-500 mb-6 max-w-md">
              Need architectural planning? Book a free Growth Audit and let us map the exact combination of services required.
            </p>
            <Link 
              href="/contact" 
              className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${accent.bg} hover:brightness-110`}
            >
              Book Growth Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
