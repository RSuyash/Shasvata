import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { insightArticles, insightCategories } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Read insights on growth systems, workflow automation, structured delivery, and practical AI implementation for modern businesses.",
};

export default function InsightsPage() {
  const featured = insightArticles.find((a) => a.featured);
  const rest = insightArticles.filter((a) => !a.featured);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid" aria-hidden="true" />
        <div className="container-naya">
          <p className="eyebrow mb-5">Thinking Out Loud</p>
          <h1 className="text-fluid-2xl font-display font-black mb-5 max-w-3xl text-balance">
            Insights on growth, systems, automation, and{" "}
            <span className="gradient-text-dark dark:gradient-text">practical AI.</span>
          </h1>
          <p className="max-w-2xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
            Clear thinking for founders, operators, and teams building businesses that need
            stronger execution beneath the surface.
          </p>
        </div>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="pb-0 pt-8 bg-[hsl(var(--background))]">
          <div className="container-naya">
            <Link
              href={`/insights/${featured.slug}`}
              className="group block rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-10 transition-all duration-300 hover:border-[rgb(var(--naya-sky)/0.4)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="badge-sky">Featured</span>
                <span className="badge-navy">{featured.category}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-black mb-4 text-balance group-hover:text-[rgb(var(--naya-sky))] transition-colors">
                {featured.title}
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6 max-w-2xl">
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                  <span>{new Date(featured.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--naya-sky))] group-hover:gap-2.5 transition-all">
                  Read article <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Articles grid */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-naya">
          {/* Category filter — visual only, real filtering would use URL params */}
          <div className="mb-8 flex flex-wrap gap-2">
            {insightCategories.map((cat) => (
              <span
                key={cat}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  cat === "All"
                    ? "border-[rgb(var(--naya-sky))] bg-[rgb(var(--naya-sky)/0.1)] text-[rgb(var(--naya-sky))]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[rgb(var(--naya-sky)/0.4)] hover:text-[hsl(var(--foreground))]",
                )}
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={`/insights/${article.slug}`}
                className="group card-hover flex flex-col gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className="badge-navy">{article.category}</span>
                </div>
                <h3 className="font-bold tracking-tight text-[hsl(var(--foreground))] leading-snug group-hover:text-[rgb(var(--naya-sky))] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed flex-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{article.readTime}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--naya-sky))] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y-sm bg-[hsl(var(--muted)/0.3)]">
        <div className="container-narrow text-center">
          <h2 className="text-2xl font-display font-black mb-4">
            Need help applying this thinking to your business?
          </h2>
          <Link href="/contact" className="btn-primary gap-2.5">
            Book a Discovery Call <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
