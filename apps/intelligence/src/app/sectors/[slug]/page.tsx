import { SectorScatterPlaceholder } from "@shasvata/charts";
import { PageShell } from "@shasvata/ui";

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PageShell title={slug.replaceAll("-", " ")} eyebrow="Sector foundation">
      <SectorScatterPlaceholder />
    </PageShell>
  );
}
