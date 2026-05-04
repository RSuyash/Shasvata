import { Badge, MetricCard, PageShell } from "@shasvata/ui";
import companies from "../../../../db/fixtures/intelligence/companies.json";
import metrics from "../../../../db/fixtures/intelligence/metrics.json";

export default function AdminHome() {
  return (
    <PageShell title="Shasvata Admin" eyebrow="Operator foundation">
      <p>
        <Badge>Foundation admin shell only. Secure auth must be enabled before production use.</Badge>
      </p>
      <div className="sv-grid">
        <MetricCard label="Sample entities" value={companies.length} />
        <MetricCard label="Sample metrics" value={metrics.length} />
      </div>
    </PageShell>
  );
}
