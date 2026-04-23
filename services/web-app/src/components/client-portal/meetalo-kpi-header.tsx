"use client";

import { formatCompactNumber } from "@/lib/utils";

export type MeetaloMetric = {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isUp: boolean;
  };
};

export type MeetaloKPIHeaderProps = {
  metrics: MeetaloMetric[];
};

export function MeetaloKPIHeader({ metrics }: MeetaloKPIHeaderProps) {
  return (
    <section className="mb-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: "var(--portal-muted)" }}
          >
            Workspace pulse
          </p>
          <p
            className="mt-1 text-[13px]"
            style={{ color: "var(--portal-muted)" }}
          >
            The most important delivery and lead signals, without the operator clutter.
          </p>
        </div>
      </div>

      <div
        className="client-portal-tone-transition grid gap-px overflow-hidden rounded-[26px] border animate-in fade-in slide-in-from-top-4 duration-500 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]"
        style={{
          borderColor: "var(--portal-border)",
          background: "var(--portal-border)",
          boxShadow: "var(--portal-shadow)",
        }}
      >
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className="client-portal-tone-transition p-4 lg:p-5"
            style={{ background: "var(--portal-card)" }}
          >
            <p
              className="mb-1 text-[13px] font-medium"
              style={{ color: "var(--portal-muted)" }}
            >
              {metric.label}
            </p>
            <div className="flex items-end gap-2.5">
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: "var(--portal-foreground)" }}
              >
                {metric.value}
              </p>
              {metric.trend && (
                <span
                  className="client-portal-tone-transition flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    background: metric.trend.isUp
                      ? "var(--portal-tone-success-bg)"
                      : "var(--portal-tone-warning-bg)",
                    color: metric.trend.isUp
                      ? "var(--portal-tone-success-text)"
                      : "var(--portal-tone-warning-text)",
                  }}
                >
                  {metric.trend.isUp ? '+' : '-'}{metric.trend.value}% 
                  <span className="material-symbols-outlined text-[14px]">
                    {metric.trend.isUp ? 'trending_up' : 'trending_down'}
                  </span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
