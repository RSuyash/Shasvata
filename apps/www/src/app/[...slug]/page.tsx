import { EmptyState, PageShell } from "@shasvata/ui";

const labels: Record<string, string> = {
  intelligence: "Shasvata Intelligence",
  advisory: "Shasvata Advisory",
  connect: "Shasvata Connect",
  impact: "Shasvata Impact",
  academy: "Shasvata Academy",
  about: "About Shasvata",
  contact: "Contact",
  "legal/privacy": "Privacy",
  "legal/terms": "Terms"
};

export default async function PlaceholderPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const key = slug.join("/");
  const title = labels[key] || "Foundation route";

  return (
    <PageShell title={title} eyebrow="Public site">
      <EmptyState
        title="Placeholder route"
        body="This route exists to prove navigation and app boundaries for the foundation sprint."
      />
    </PageShell>
  );
}
