"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/taxonomy-helpers";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** Currently active node — last item won't be a link */
  className?: string;
};

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm ${className}`}
    >
      <Link
        href="/"
        className="flex items-center text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        return (
          <span key={item.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
            {isLast ? (
              <span className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-500 hover:text-slate-800 transition-colors truncate max-w-[140px] sm:max-w-none"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
