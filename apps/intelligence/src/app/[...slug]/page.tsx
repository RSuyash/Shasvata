import { CompareBarsPlaceholder, MetricTrendPlaceholder } from "@shasvata/charts";
import { EmptyState, PageShell } from "@shasvata/ui";

const routeLabels: Record<string, string> = {
  explore: "Explore",
  companies: "Companies",
  sectors: "Sectors",
  compare: "Compare",
  reports: "Reports",
  methodology: "Methodology",
  data: "Data",
  "api-docs": "API Docs"
};

export default async function IntelligenceRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const route = slug.join("/");
  const title = routeLabels[route] || "Intelligence foundation";

  return (
    <PageShell title={title} eyebrow="Shasvata Intelligence">
      {route === "compare" ? <CompareBarsPlaceholder /> : <MetricTrendPlaceholder />}
      <EmptyState title="Static fixture route" body="Final data exploration UI is intentionally deferred." />
    </PageShell>
  );
}
