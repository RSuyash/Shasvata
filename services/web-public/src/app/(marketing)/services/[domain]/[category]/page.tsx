import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  findNodeBySlug,
  getChildrenOf,
  buildBreadcrumbs,
  buildServicePath,
  domainAccent,
} from "@/lib/taxonomy-helpers";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ServiceCard } from "@/components/ui/service-card";
import { serviceTaxonomyNodeSeeds } from "@/data/service-taxonomy";

type Params = { domain: string; category: string };

/* ─── Static params ───────────────────────────────────────── */
export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  const domains = serviceTaxonomyNodeSeeds.filter((n) => n.kind === "DOMAIN");

  for (const dom of domains) {
    const cats = serviceTaxonomyNodeSeeds.filter(
      (n) => n.parentId === dom.id && n.kind === "CATEGORY"
    );
    for (const cat of cats) {
      out.push({ domain: dom.slug, category: cat.slug });
    }
  }
  return out;
}

/* ─── Metadata ────────────────────────────────────────────── */
export function generateMetadata({ params }: { params: Params }): Metadata {
  const cat = findNodeBySlug(params.category);
  if (!cat) return { title: "Not Found" };

  const domain = findNodeBySlug(params.domain);
  return {
    title: `${cat.label} — ${domain?.label || "Services"}`,
    description: cat.summary || cat.description || `${cat.label} services by Shasvata.`,
  };
}

/* ─── Page ────────────────────────────────────────────────── */
export default function CategoryPage({ params }: { params: Params }) {
  const domain = findNodeBySlug(params.domain);
  const category = findNodeBySlug(params.category);

  if (!domain || domain.kind !== "DOMAIN") notFound();
  if (!category || category.kind !== "CATEGORY") notFound();
  if (category.parentId !== domain.id) notFound();

  const services = getChildrenOf(category.id);
  const accent = domainAccent[domain.domain];
  const crumbs = buildBreadcrumbs(category.id);

  // Related categories (siblings)
  const siblingCategories = getChildrenOf(domain.id).filter((c) => c.id !== category.id);

  return (
    <section className="section-y">
      <div className="container-naya">
        {/* Breadcrumbs */}
        <Breadcrumbs items={crumbs} className="mb-8" />

        {/* Hero */}
        <div className="max-w-3xl mb-14">
          <span className={`badge ${accent.bg} ${accent.text} ${accent.border} mb-4`}>
            {domain.label}
          </span>
          <h1 className="text-fluid-xl mb-4">{category.label}</h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            {category.summary || category.description}
          </p>
        </div>

        {/* Services grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc, i) => (
            <ServiceCard
              key={svc.id}
              node={svc}
              href={buildServicePath(svc)}
              index={i}
            />
          ))}
        </div>

        {/* Related categories */}
        {siblingCategories.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-bold mb-6">
              Other {domain.label} categories
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siblingCategories.map((sib) => (
                <Link key={sib.id} href={buildServicePath(sib)} className="group">
                  <div className="card-hover flex items-center gap-4 p-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text} text-sm font-bold`}>
                      {accent.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[rgb(var(--naya-blue))] transition-colors truncate">
                        {sib.label}
                      </h3>
                      {sib.summary && (
                        <p className="text-xs text-slate-400 truncate">{sib.summary}</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 flex-shrink-0 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="card-base max-w-xl mx-auto p-8">
            <h3 className="text-xl font-bold mb-2">Interested in {category.label}?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Let's discuss how these services can fit your growth roadmap.
            </p>
            <Link href="/contact" className="btn-primary">
              Get in Touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
