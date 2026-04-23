"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Menu, X, ArrowRight, ChevronDown, Sparkles, CircuitBoard, Compass, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ServiceTaxonomyResponse } from "@/lib/service-taxonomy";

type NavbarProps = {
  taxonomy: ServiceTaxonomyResponse;
};

export function Navbar({ taxonomy }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [servicesPanelStyle, setServicesPanelStyle] = useState<React.CSSProperties>({});

  const headerLinks = [
    { label: "Tech", href: "/services/naya-tech" },
    { label: "Marketing", href: "/services/naya-marketing" },
    { label: "Advisory", href: "/services/naya-advisory" },
    { label: "About", href: "/about" },
  ] as const;

  const domainMeta = {
    TECH: {
      icon: CircuitBoard,
      label: "Tech",
      accent: "text-[rgb(var(--naya-blue))]",
      glow: "bg-[rgb(var(--naya-blue))]",
      frame: "bg-white/40 border-white/60",
      iconFrame: "bg-white ring-slate-100",
    },
    MARKETING: {
      icon: Sparkles,
      label: "Marketing",
      accent: "text-slate-900",
      glow: "bg-slate-400",
      frame: "bg-white/40 border-white/60",
      iconFrame: "bg-white ring-slate-100",
    },
    ADVISORY: {
      icon: Compass,
      label: "Advisory",
      accent: "text-slate-600",
      glow: "bg-slate-300",
      frame: "bg-white/40 border-white/60",
      iconFrame: "bg-white ring-slate-100",
    },
  } as const;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 250); // Increased delay slightly for smoother bridging
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setServicesOpen(false);
  }, [pathname]);



  const domainOrder: ServiceTaxonomyResponse["roots"][number]["domain"][] = ["TECH", "MARKETING", "ADVISORY"];
  const visibleDomains = domainOrder
    .map((domain) => taxonomy.roots.find((item) => item.domain === domain))
    .filter((domain): domain is ServiceTaxonomyResponse["roots"][number] => Boolean(domain))
    .map((domain) => ({
      ...domain,
      children: domain.children.slice(0, 3),
    }));

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.98, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30, staggerChildren: 0.05, delayChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const servicesPanel = (
    <div 
      className="absolute left-1/2 top-full w-[850px] -translate-x-1/2 pt-5 z-[150]"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <motion.div
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] backdrop-blur-3xl"
      >
        <div className="grid grid-cols-3 gap-4 px-6 py-6 relative">
        {/* Glow behind the menu */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-50 pointer-events-none" />

        {visibleDomains.map((domain) => {
          const meta = domainMeta[domain.domain];
          const Icon = meta.icon;

          return (
            <motion.div key={domain.id} variants={itemVariants} className={cn("group relative flex flex-col space-y-4 rounded-[1.2rem] p-5 border transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1", meta.frame)}>
              {/* Internal glow dot */}
              <div className={`absolute -top-4 -right-4 h-24 w-24 rounded-full ${meta.glow} opacity-[0.05] blur-2xl transition-all duration-700 group-hover:opacity-[0.2] pointer-events-none`} />

              <div className="relative z-10 flex items-center justify-between">
                <div className={cn("flex items-center gap-2.5", meta.accent)}>
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-[0.8rem] ring-1 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", meta.iconFrame, meta.accent)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-current transition-colors">
                    {domain.label}
                  </span>
                </div>
                <Link href={domain.route ?? "/services"} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>

              <div className="relative z-10 space-y-2">
                {domain.children.map((category) => (
                  <Link key={category.id} href={category.route ?? "/services"} className="group/cat block rounded-xl p-2 -mx-2 hover:bg-slate-50 transition-colors">
                    <div className="text-[13px] font-bold text-slate-700 group-hover/cat:text-[rgb(var(--naya-blue))] transition-colors">
                      {category.label}
                    </div>
                    <div className="text-[11px] leading-tight text-slate-500 font-medium mt-0.5 line-clamp-1">
                      {category.summary ?? category.description ?? ""}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="bg-slate-50/80 border-t border-slate-100/50 p-4 flex items-center justify-between px-8">
        <div className="text-xs font-semibold text-slate-500">
          Transform your operational infrastructure.
        </div>
        <Link href="/services" className="text-xs font-bold text-[rgb(var(--naya-blue))] flex items-center gap-1 hover:gap-2 transition-all">
          Explore all services <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <header
        className={cn(
          "fixed z-[100] transition-all duration-500 ease-out flex justify-center",
          scrolled
            ? "top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-full md:max-w-[1240px]"
            : "inset-x-0 top-0 w-full"
        )}
      >
        <motion.nav
          initial={false}
          animate={{
            borderRadius: scrolled ? 40 : 0,
            backgroundColor: scrolled ? "rgba(255, 255, 255, 0.6)" : "transparent",
            borderColor: scrolled ? "rgba(255, 255, 255, 0.5)" : "transparent",
            boxShadow: scrolled ? "0 8px 32px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.4)" : "none",
            paddingLeft: scrolled ? 24 : 0,
            paddingRight: scrolled ? 24 : 0,
          }}
          className={cn(
            "flex h-[4.5rem] items-center justify-between backdrop-blur-2xl transition-all duration-500",
            !scrolled && "container-naya border-b border-slate-200/50"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Shasvata home"
          >
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo-icon.png"
                alt="Shasvata"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-[rgb(var(--naya-navy))]">
              Naya<span className="bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--naya-blue))] to-[rgb(var(--naya-green))]">Growth</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-2 md:flex px-6" role="list">
            <li className="relative" onMouseEnter={handleOpen} onMouseLeave={handleClose}>
              <Link
                href="/services"
                ref={servicesTriggerRef}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-bold transition-all duration-300",
                  servicesOpen ? "bg-slate-100/80 text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
                )}
                aria-expanded={servicesOpen}
                aria-haspopup="menu"
              >
                Services
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", servicesOpen && "rotate-180")} />
              </Link>
              <AnimatePresence>
                {servicesOpen && servicesPanel}
              </AnimatePresence>
            </li>
            {headerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-[15px] font-bold transition-all duration-300",
                    pathname === link.href
                      ? "bg-slate-100/80 text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="group hidden items-center gap-2 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-2.5 text-[15px] font-bold text-white shadow-[0_4px_14px_0_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.25)] md:inline-flex border border-slate-700/50 hover:brightness-110"
            >
              Book Growth Audit
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 md:hidden"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.nav>
      </header>



      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[5rem] z-50 overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] backdrop-blur-3xl md:hidden"
          >
            <div className="container-naya space-y-2 pb-8 pt-4">
              <div className="rounded-[1.5rem] border border-slate-100/80 bg-white/50 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Service Catalog
                  </p>
                </div>
                <div className="space-y-4">
                  {taxonomy.roots.slice(0, 3).map((domain) => (
                    <div key={domain.id} className="space-y-2">
                      <Link
                        href={domain.route ?? "/services"}
                        className="block text-base font-extrabold text-slate-900 hover:text-[rgb(var(--naya-blue))] transition-colors"
                      >
                        {domain.label}
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        {domain.children.slice(0, 2).map((category) => (
                          <Link
                            key={category.id}
                            href={category.route ?? "/services"}
                            className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                          >
                            {category.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {headerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between rounded-[1.2rem] px-5 py-3.5 text-[15px] font-bold transition-colors",
                      pathname === link.href
                        ? "bg-slate-100 text-slate-900"
                        : "bg-white/50 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm border border-slate-100",
                    )}
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Link>
                ))}
              </div>
              <div className="pt-4">
                <Link href="/contact" className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-[15px] font-bold text-white shadow-lg shadow-slate-900/20 active:scale-95 transition-transform">
                  Book Growth Audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
