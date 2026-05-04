import { EmptyState, PageShell } from "@shasvata/ui";

export default async function AdminRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  return (
    <PageShell title={slug.join("/") || "admin"} eyebrow="Operator console">
      <EmptyState title="Admin placeholder" body="Entities, sources, metrics, score runs, and reports are route shells only." />
    </PageShell>
  );
}
