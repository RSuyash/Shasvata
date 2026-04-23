"use client";

import { useState, useEffect, useRef } from "react";
import { useScroll, useSpring, useTransform, motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ServiceTaxonomyResponse } from "@/lib/service-taxonomy";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { ServicesDropdown } from "./services-dropdown";

type AdvancedNavbarProps = {
  taxonomy: ServiceTaxonomyResponse;
};

export function AdvancedNavbar({ taxonomy }: AdvancedNavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  
  // High-performance scroll tracking using Framer Motion (avoids React re-renders for styling)
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 400, damping: 40 });
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const navVariants = {
    top: {
      width: "100%",
      borderRadius: "0px",
      backgroundColor: "rgba(255, 255, 255, 0)",
      borderColor: "rgba(255, 255, 255, 0)",
      boxShadow: "none",
      y: 0,
      paddingLeft: "0px",
      paddingRight: "0px",
    },
    scrolled: {
      width: "1240px",
      borderRadius: "40px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderColor: "rgba(255, 255, 255, 0.3)",
      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
      y: 16,
      paddingLeft: "24px",
      paddingRight: "24px",
    }
  };

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Advanced hover intent logic for dropdown
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleServicesEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 250); // Generous bridge time for mouse movement
  };

  return (
    <>
      <header className="fixed inset-0 top-0 h-0 w-full z-[100] pointer-events-none flex justify-center">
        {/* Dynamic Island Container - physical spring variants */}
        <motion.nav
          variants={navVariants}
          initial={false}
          animate={isScrolled ? "scrolled" : "top"}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="pointer-events-auto flex h-[4.5rem] items-center justify-between border-b border-transparent backdrop-blur-2xl px-6 md:px-0 relative"
        >
          <div className="w-full h-full flex items-center justify-between px-6 max-w-7xl mx-auto">
            <DesktopNav 
              isScrolled={isScrolled} 
              servicesOpen={servicesOpen} 
              onServicesEnter={handleServicesEnter} 
              onServicesLeave={handleServicesLeave}
              onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              isMobileOpen={isMobileMenuOpen}
            />

            <AnimatePresence>
              {servicesOpen && (
                <ServicesDropdown 
                  taxonomy={taxonomy} 
                  onMouseEnter={handleServicesEnter} 
                  onMouseLeave={handleServicesLeave} 
                />
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      </header>

      <MobileNav 
        isOpen={isMobileMenuOpen} 
        taxonomy={taxonomy} 
      />
    </>
  );
}
