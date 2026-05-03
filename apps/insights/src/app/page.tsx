import { sampleArticles } from "@shasvata/content";
import { Card, PageShell } from "@shasvata/ui";

export default function InsightsHome() {
  return (
    <PageShell title="Shasvata Insights" eyebrow="Academy foundation">
      <div className="sv-grid">
        {sampleArticles.map((article) => (
          <Card key={article.slug}>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
