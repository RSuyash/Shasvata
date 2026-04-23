import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  findNodeBySlug,
  getChildrenOf,
  buildBreadcrumbs,
  buildServicePath,
  domainAccent,
} from "@/lib/taxonomy-helpers";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { serviceTaxonomyNodeSeeds, serviceTaxonomyEdgeSeeds } from "@/data/service-taxonomy";

type Params = { domain: string; category: string; service: string };

/* ─── Static params ───────────────────────────────────────── */
export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  const domains = serviceTaxonomyNodeSeeds.filter((n) => n.kind === "DOMAIN");

  for (const dom of domains) {
    const cats = serviceTaxonomyNodeSeeds.filter(
      (n) => n.parentId === dom.id && n.kind === "CATEGORY"
    );
    for (const cat of cats) {
      const svcs = serviceTaxonomyNodeSeeds.filter(
        (n) => n.parentId === cat.id && (n.kind === "SERVICE" || n.kind === "CAPABILITY")
      );
      for (const svc of svcs) {
        out.push({ domain: dom.slug, category: cat.slug, service: svc.slug });
      }
    }
  }
  return out;
}

/* ─── Metadata ────────────────────────────────────────────── */
export function generateMetadata({ params }: { params: Params }): Metadata {
  const svc = findNodeBySlug(params.service);
  if (!svc) return { title: "Not Found" };

  const category = findNodeBySlug(params.category);
  return {
    title: `${svc.label} — ${category?.label || "Services"}`,
    description: svc.summary || svc.description || `${svc.label} by Shasvata.`,
  };
}

/* ─── Page ────────────────────────────────────────────────── */
export default function ServicePage({ params }: { params: Params }) {
  const domain = findNodeBySlug(params.domain);
  const category = findNodeBySlug(params.category);
  const service = findNodeBySlug(params.service);

  if (!domain || domain.kind !== "DOMAIN") notFound();
  if (!category || category.kind !== "CATEGORY") notFound();
  if (!service || (service.kind !== "SERVICE" && service.kind !== "CAPABILITY")) notFound();
  if (service.parentId !== category.id) notFound();
  if (category.parentId !== domain.id) notFound();

  const accent = domainAccent[domain.domain];
  const crumbs = buildBreadcrumbs(service.id);

  // Find related services via edges
  const relatedEdges = serviceTaxonomyEdgeSeeds.filter(
    (e) => e.sourceId === service.id || e.targetId === service.id
  );
  const relatedIds = relatedEdges.map((e) =>
    e.sourceId === service.id ? e.targetId : e.sourceId
  );
  const relatedNodes = relatedIds
    .map((id) => serviceTaxonomyNodeSeeds.find((n) => n.id === id))
    .filter(Boolean) as typeof serviceTaxonomyNodeSeeds;

  // Sibling services in same category
  const siblings = getChildrenOf(category.id).filter((s) => s.id !== service.id);

  return (
    <section className="section-y">
      <div className="container-naya">
        {/* Breadcrumbs */}
        <Breadcrumbs items={crumbs} className="mb-8" />

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className={`badge ${accent.bg} ${accent.text} ${accent.border}`}>
                {domain.label}
              </span>
              <span className="badge bg-slate-50 text-slate-500 border-slate-200">
                {category.label}
              </span>
            </div>

            <h1 className="text-fluid-xl mb-4">{service.label}</h1>

            {(service.description || service.summary) && (
              <p className="text-lg text-slate-500 leading-relaxed mb-8">
                {service.description || service.summary}
              </p>
            )}

            {/* What's included */}
            <div className="card-base p-8 mb-8">
              <h2 className="text-lg font-bold mb-5">What this typically includes</h2>
              <div className="space-y-3">
                {[
                  "Discovery & current-state audit",
                  "Strategy & roadmap design",
                  "Implementation & execution",
                  "Measurement & optimization",
                  "Ongoing support & iteration",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How we deliver */}
            <div className="card-base p-8">
              <h2 className="text-lg font-bold mb-5">Our delivery approach</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { phase: "Phase 0", title: "Discovery", desc: "Audit + strategy + clear scope" },
                  { phase: "Phase 1", title: "Build", desc: "Focused execution against plan" },
                  { phase: "Phase 2", title: "Improve", desc: "Optimize based on real results" },
                  { phase: "Phase 3", title: "Compound", desc: "Scale what's working, retire what isn't" },
                ].map((step) => (
                  <div key={step.phase} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <span className="step-dot flex-shrink-0 text-xs">{step.phase.charAt(step.phase.length - 1)}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA card */}
            <div className="card-glow p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-2">Interested in {service.label}?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Book a free Growth Audit to see how this fits your current situation.
              </p>
              <Link href="/contact" className="btn-primary w-full justify-center">
                Book Growth Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-4 p-3 rounded-xl bg-slate-50 text-center">
                <p className="text-xs text-slate-400">
                  Or WhatsApp us directly
                </p>
                <a
                  href="https://wa.me/919284620279"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  +91 928 462 0279
                </a>
              </div>
            </div>

            {/* Related services */}
            {relatedNodes.length > 0 && (
              <div className="card-base p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Related Services
                </h3>
                <div className="space-y-2">
                  {relatedNodes.map((rel) => {
                    const edge = relatedEdges.find((e) => e.sourceId === rel.id || e.targetId === rel.id);
                    return (
                      <Link
                        key={rel.id}
                        href={buildServicePath(rel)}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 mt-0.5 group-hover:text-[rgb(var(--naya-blue))] transition-colors" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                            {rel.label}
                          </p>
                          {edge?.note && (
                            <p className="text-xs text-slate-400 mt-0.5">{edge.note}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Siblings */}
            {siblings.length > 0 && (
              <div className="card-base p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Other {category.label} Services
                </h3>
                <div className="space-y-1.5">
                  {siblings.map((sib) => (
                    <Link
                      key={sib.id}
                      href={buildServicePath(sib)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-600 hover:text-slate-900"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {sib.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
