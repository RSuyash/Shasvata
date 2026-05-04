import type { ReactNode } from "react";
import { brandColors, confidenceGrades, type ConfidenceGrade } from "@shasvata/tokens";

type BaseProps = {
  children?: ReactNode;
  className?: string;
};

const merge = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export function Button({ children, className }: BaseProps) {
  return (
    <button
      className={merge("sv-button", className)}
      style={{
        background: brandColors.deepForest,
        color: brandColors.white,
        border: 0,
        borderRadius: 6,
        padding: "0.65rem 0.9rem",
        fontWeight: 700
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: BaseProps) {
  return <section className={merge("sv-card", className)}>{children}</section>;
}

export function Badge({ children, className }: BaseProps) {
  return <span className={merge("sv-badge", className)}>{children}</span>;
}

export function PageShell({
  title,
  eyebrow,
  children
}: BaseProps & { title: string; eyebrow?: string }) {
  return (
    <main className="sv-shell">
      {eyebrow ? <p className="sv-eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {children}
    </main>
  );
}

export function HealthPanel({ service, ok = true }: { service: string; ok?: boolean }) {
  return (
    <Card>
      <h2>{service} health</h2>
      <Badge>{ok ? "healthy" : "unavailable"}</Badge>
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <h2>{title}</h2>
      <p>{body}</p>
    </Card>
  );
}

export function DataTable({
  columns,
  rows
}: {
  columns: string[];
  rows: Array<Record<string, ReactNode>>;
}) {
  return (
    <table className="sv-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column}>{row[column]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MetricCard({
  label,
  value,
  unit
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <Card>
      <p className="sv-eyebrow">{label}</p>
      <strong className="sv-metric">
        {value}
        {unit ? ` ${unit}` : ""}
      </strong>
    </Card>
  );
}

export function ConfidenceBadge({ grade }: { grade: ConfidenceGrade }) {
  const meta = confidenceGrades[grade];
  return <Badge>{grade} - {meta.label}</Badge>;
}

export function SourceBadge({ label }: { label: string }) {
  return <Badge>{label}</Badge>;
}

export function CitationPopover({ citation }: { citation: string }) {
  return <span title={citation}>Citation</span>;
}

export function MethodologyCallout({ version }: { version: string }) {
  return (
    <Card>
      <h2>Methodology {version}</h2>
      <p>Foundation scoring uses sample data and must be manually reviewed before production use.</p>
    </Card>
  );
}
