import { sampleArticles, sampleGlossary } from "@shasvata/content";
import { Card, DataTable, EmptyState, PageShell } from "@shasvata/ui";

export default async function InsightsRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const route = slug.join("/") || "articles";

  if (route === "articles") {
    return (
      <PageShell title="Articles" eyebrow="Insights">
        {sampleArticles.map((article) => (
          <Card key={article.slug}>
            <h2>{article.title}</h2>
            <p>{article.body}</p>
          </Card>
        ))}
      </PageShell>
    );
  }

  if (route === "glossary") {
    return (
      <PageShell title="Glossary" eyebrow="Insights">
        <DataTable
          columns={["term", "definition"]}
          rows={sampleGlossary.map((item) => ({ term: item.term, definition: item.definition }))}
        />
      </PageShell>
    );
  }

  return (
    <PageShell title={route.replace("-", " ")} eyebrow="Insights">
      <EmptyState title="Foundation content route" body="Static content architecture is wired." />
    </PageShell>
  );
}
