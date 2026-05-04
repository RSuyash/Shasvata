import { EmptyState, HealthPanel, PageShell } from "@shasvata/ui";

export default function AppHome() {
  return (
    <PageShell title="Shasvata App" eyebrow="Workspace shell">
      <HealthPanel service="app" />
      <EmptyState
        title="Authentication not implemented in foundation sprint."
        body="This local mock workspace exists to prove app routing and platform API connectivity boundaries."
      />
    </PageShell>
  );
}
