import { ChartShell, ConfidenceHeatmapPlaceholder } from "@shasvata/charts";
import { HealthPanel, MetricCard, PageShell } from "@shasvata/ui";
import companies from "../../../../db/fixtures/intelligence/companies.json";
import methodology from "../../../../db/fixtures/intelligence/methodology.json";

export default function IntelligenceHome() {
  return (
    <PageShell title="Shasvata Intelligence" eyebrow="Fixture-backed product skeleton">
      <div className="sv-grid">
        <HealthPanel service="intelligence app" />
        <MetricCard label="Sample companies" value={companies.length} />
        <MetricCard label="Methodology version" value={methodology.version} />
      </div>
      <p>
        <a href="/explore">Explore</a> | <a href="/companies/reliance-industries-limited">Company</a> |{" "}
        <a href="/compare">Compare</a> | <a href="/methodology">Methodology</a>
      </p>
      <ChartShell title="Confidence coverage">
        <ConfidenceHeatmapPlaceholder />
      </ChartShell>
    </PageShell>
  );
}
