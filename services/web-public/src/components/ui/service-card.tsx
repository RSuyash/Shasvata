"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceTaxonomyNodeSeed } from "@/data/service-taxonomy";
import { domainAccent } from "@/lib/taxonomy-helpers";

type ServiceCardProps = {
  node: ServiceTaxonomyNodeSeed;
  href: string;
  index: number;
};

export function ServiceCard({ node, href, index }: ServiceCardProps) {
  const accent = domainAccent[node.domain];

  return (
    <Link href={href} className="group">
      <div className="card-hover relative flex flex-col justify-between min-h-[180px]">
        {/* Index badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${accent.bg} ${accent.text} ring-1 ${accent.border}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-[rgb(var(--naya-blue))] transition-colors">
            {node.label}
          </h3>
          {node.summary && (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {node.summary}
            </p>
          )}
          {node.description && !node.summary && (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {node.description}
            </p>
          )}
        </div>

        {/* Kind badge */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-slate-400">
            {node.kind === "CATEGORY" ? "Category" : "Service"}
          </span>
        </div>
      </div>
    </Link>
  );
}
