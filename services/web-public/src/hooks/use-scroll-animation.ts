"use client";

import { useEffect, useRef } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Adds .in-view class to element when it enters the viewport.
 * Works with the .animate-on-scroll CSS class in globals.css.
 *
 * @example
 * const ref = useScrollAnimation();
 * <div ref={ref} className="animate-on-scroll">...</div>
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {},
): React.RefObject<T> {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("in-view");
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove("in-view");
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * Observes multiple elements. Pass an array of refs or a container ref.
 * Adds .in-view class to each child with .animate-on-scroll.
 */
export function useScrollAnimationGroup<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {},
): React.RefObject<T> {
  const { threshold = 0.1, rootMargin = "0px 0px -40px 0px", once = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(".animate-on-scroll");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("in-view");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            (entry.target as HTMLElement).classList.remove("in-view");
          }
        });
      },
      { threshold, rootMargin },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
