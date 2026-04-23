"use client";

import { useEffect, useRef } from "react";
import { HeroBackdropGraphic } from "./backdrop-graphics";

type HeroBackdropProps = {
  className?: string;
};

export function HeroBackdrop({ className = "" }: HeroBackdropProps) {
  // We use refs to mutate the DOM directly, bypassing React re-renders entirely for max FPS
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !containerRef.current) return;

    let ticking = false;

    const updateParallax = () => {
      if (!containerRef.current) return;
      
      const viewportHeight = window.innerHeight;
      // Calculate progress (0 to 1) based on scroll
      const rawReveal = window.scrollY / (viewportHeight * 1.05);
      const reveal = Math.min(Math.max(rawReveal, 0), 1);

      // Update a single CSS variable on the container. 
      // The browser's compositor thread handles the rest via CSS calc()
      containerRef.current.style.setProperty("--scroll", reveal.toString());
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Initialize position
    updateParallax();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#fafafa] ${className}`}
      style={{
        // Initialize CSS variable
        "--scroll": "0",
        // Shell calculations
        opacity: "calc(1 - var(--scroll) * 0.06)",
        transform: "translate3d(0, calc(var(--scroll) * 12px), 0)",
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* 1. Base Ambient Light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(240,245,255,0.85)_40%,rgba(255,255,255,1)_100%)] mix-blend-overlay" />
      
      {/* 2. Scroll-Reactive Vignette (Darkens edges slightly as you scroll down) */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.03)_100%)]"
        style={{ opacity: "calc(var(--scroll) * 1.5)" }}
      />
      
      {/* 3. Noise Overlay */}
      <div className="noise-overlay absolute inset-0 opacity-[0.65] mix-blend-multiply" />

      {/* 4. The Graphic Container */}
      <div className="absolute left-1/2 top-[46%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center md:top-[44%]">
        <div className="relative h-[760px] w-[760px] md:h-[860px] md:w-[860px]">
          
          {/* Secondary Parallax Glow (Moves slower than the main graphic for depth) */}
          <div 
            className="absolute inset-0 rounded-full bg-blue-400/10 blur-[100px] will-change-transform"
            style={{
              transform: "translate3d(0, calc(var(--scroll) * 40px), 0) scale(calc(1 + var(--scroll) * 0.1))",
              opacity: "calc(1 - var(--scroll) * 0.5)"
            }}
          />

          {/* Main Hero Graphic */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              // Hero calculations completely handled by CSS calc()
              opacity: "calc(1 - var(--scroll) * 0.78)",
              transform: "translate3d(0, calc(var(--scroll) * 88px), 0) scale(calc(1 + var(--scroll) * 0.02))",
            }}
          >
            <HeroBackdropGraphic className="h-full w-full drop-shadow-sm" />
          </div>
          
        </div>
      </div>
    </div>
  );
}