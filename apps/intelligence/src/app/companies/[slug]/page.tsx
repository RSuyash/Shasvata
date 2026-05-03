import { ConfidenceBadge, MetricCard, PageShell, SourceBadge } from "@shasvata/ui";
import companies from "../../../../../../db/fixtures/intelligence/companies.json";
import metrics from "../../../../../../db/fixtures/intelligence/metrics.json";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallbackCompany = companies[0] ?? {
    slug,
    name: "Unknown sample company",
    sector: "Unknown",
    status: "sample"
  };
  const company = companies.find((item) => item.slug === slug) || fallbackCompany;
  const companyMetrics = metrics.filter((metric) => metric.entitySlug === company.slug);

  return (
    <PageShell title={company.name} eyebrow={company.sector}>
      <div className="sv-grid">
        {companyMetrics.map((metric) => (
          <div key={metric.metricKey}>
            <MetricCard label={metric.label} value={metric.value} unit={metric.unit} />
            <p>
              <ConfidenceBadge grade={metric.confidenceGrade as "A" | "B" | "C" | "D"} />{" "}
              <SourceBadge label={metric.sourceLabel} />
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
