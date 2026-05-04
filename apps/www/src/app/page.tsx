import { Card, PageShell } from "@shasvata/ui";

const links = [
  ["/intelligence", "Intelligence"],
  ["http://localhost:3001", "Insights"],
  ["http://localhost:3003", "App"],
  ["http://localhost:3004", "Admin"]
];

export default function HomePage() {
  return (
    <PageShell title="Shasvata - Sustainability Intelligence Infrastructure" eyebrow="Foundation">
      <p>
        A clean monorepo foundation for Intelligence, Advisory, Connect, Impact, and Academy.
      </p>
      <div className="sv-grid">
        {links.map(([href, label]) => (
          <Card key={href}>
            <a href={href}>{label}</a>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
