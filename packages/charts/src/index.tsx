import type { ReactNode } from "react";
import { brandColors } from "@shasvata/tokens";

export function ChartShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sv-chart">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      style={{
        border: `1px solid ${brandColors.lightGreen}`,
        minHeight: 160,
        display: "grid",
        placeItems: "center",
        color: brandColors.stoneGray
      }}
    >
      {label}
    </div>
  );
}

export const MetricTrendPlaceholder = () => <Placeholder label="Metric trend placeholder" />;
export const SectorScatterPlaceholder = () => <Placeholder label="Sector scatter placeholder" />;
export const CompareBarsPlaceholder = () => <Placeholder label="Compare bars placeholder" />;
export const ConfidenceHeatmapPlaceholder = () => <Placeholder label="Confidence heatmap placeholder" />;
