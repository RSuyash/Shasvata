import { EmptyState, PageShell } from "@shasvata/ui";

export default async function WorkspaceRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  return (
    <PageShell title={slug.join("/") || "dashboard"} eyebrow="Mock workspace">
      <EmptyState title="Workspace placeholder" body="Saved entities, reports, API keys, and settings are route shells only." />
    </PageShell>
  );
}
