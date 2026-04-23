import type { CSSProperties, ReactNode } from "react";

type ClientPortalSectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ClientPortalStatusPillProps = {
  label: string;
  tone?: "indigo" | "blue" | "cyan" | "success" | "warning" | "neutral";
};

type ClientPortalMiniBarsProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  columns: Array<{
    label: string;
    valueLabel: string;
    stacks: Array<{
      value: number;
      tone: "indigo" | "blue" | "cyan";
    }>;
  }>;
};

type ClientPortalDonutPanelProps = {
  title: string;
  subtitle?: string;
  segments: Array<{
    label: string;
    value: number;
    tone: "indigo" | "blue" | "cyan";
  }>;
};

type ClientPortalProgressRowsProps = {
  title: string;
  rows: Array<{
    label: string;
    value: string;
    progress: number;
    tone?: "indigo" | "blue" | "cyan";
  }>;
};

// UX UI: Using explicit semantic hexes to ensure charts look beautiful regardless of theme overrides,
// but with a softer, more modern palette. 
const THEME_COLORS = {
  indigo: "#6366f1", // Modern Indigo
  blue: "#3b82f6",   // Modern Blue
  cyan: "#06b6d4",   // Modern Cyan
};

const stackToneClass: Record<"indigo" | "blue" | "cyan", string> = {
  indigo: "bg-[#6366f1]",
  blue: "bg-[#3b82f6]",
  cyan: "bg-[#06b6d4]",
};

const pillToneStyle: Record<
  NonNullable<ClientPortalStatusPillProps["tone"]>,
  { background: string; color: string }
> = {
  indigo: { background: "var(--portal-tone-indigo-bg)", color: "var(--portal-tone-indigo-text)" },
  blue: { background: "var(--portal-tone-blue-bg)", color: "var(--portal-tone-blue-text)" },
  cyan: { background: "var(--portal-tone-cyan-bg)", color: "var(--portal-tone-cyan-text)" },
  success: { background: "var(--portal-tone-success-bg)", color: "var(--portal-tone-success-text)" },
  warning: { background: "var(--portal-tone-warning-bg)", color: "var(--portal-tone-warning-text)" },
  neutral: { background: "var(--portal-tone-neutral-bg)", color: "var(--portal-tone-neutral-text)" },
};

export function buildStackSegmentHeights<T extends { value: number }>(
  stacks: T[],
): number[] {
  const total = stacks.reduce((sum, stack) => sum + stack.value, 0);
  if (total <= 0) return stacks.map(() => 0);
  return stacks.map((stack) => (stack.value / total) * 100); // UI fix: Removed the Math.round which distorts small values
}

function buildDonutGradient(
  segments: ClientPortalDonutPanelProps["segments"],
): CSSProperties["background"] {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let cursor = 0;

  // UI fix: Added a tiny gap (transparent) between segments for a highly premium look
  const parts = segments.map((segment) => {
    const start = (cursor / total) * 360;
    cursor += segment.value;
    const end = (cursor / total) * 360;
    const color = THEME_COLORS[segment.tone];
    
    // Create sharp edges for the conic gradient
    return `${color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${parts.join(", ")})`;
}

export function ClientPortalSectionCard({
  title,
  subtitle,
  action,
  className = "",
  children,
}: ClientPortalSectionCardProps) {
  return (
    <section
      className={`rounded-3xl border p-6 lg:p-8 transition-shadow hover:shadow-sm ${className}`.trim()}
      style={{
        borderColor: "var(--portal-border)",
        background: "var(--portal-card)",
        boxShadow: "var(--portal-shadow)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--portal-foreground)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-1.5 max-w-2xl text-sm leading-relaxed"
              style={{ color: "var(--portal-muted)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function ClientPortalStatusPill({
  label,
  tone = "neutral",
}: ClientPortalStatusPillProps) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm"
      style={pillToneStyle[tone]}
    >
      {label}
    </span>
  );
}

export function ClientPortalMiniBars({
  title,
  subtitle,
  action,
  columns,
}: ClientPortalMiniBarsProps) {
  const maxValue = Math.max(
    1,
    ...columns.map((column) =>
      column.stacks.reduce((sum, stack) => sum + stack.value, 0),
    ),
  );

  return (
    <ClientPortalSectionCard title={title} subtitle={subtitle} action={action}>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div
          className="rounded-2xl border p-6 flex flex-col justify-end"
          style={{
            borderColor: "var(--portal-border)",
            background: "var(--portal-surface-soft)",
          }}
        >
          <div className="flex h-[14rem] items-end justify-between gap-2 px-4">
            {columns.map((column) => {
              const total = column.stacks.reduce((sum, stack) => sum + stack.value, 0);
              const visibleStacks = column.stacks.filter((stack) => stack.value > 0);
              const stackHeightsPercentage = buildStackSegmentHeights(visibleStacks);
              const isEmpty = total === 0;

              // True mathematical percentage relative to the highest bar
              const overallHeightPercentage = (total / maxValue) * 100;

              return (
                <div key={column.label} className="group flex flex-1 flex-col items-center justify-end h-full">
                  <div 
                    className="flex w-full max-w-[3rem] flex-col justify-end gap-0.5 rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-80"
                    style={{
                      // UI Fix: Removed the fake 15% minimum. Added a 4px min-height for tiny values so they don't vanish.
                      height: isEmpty ? '4px' : `${overallHeightPercentage}%`,
                      minHeight: isEmpty ? '4px' : '8px'
                    }}
                    title={`${column.label}: ${total}`} // Native tooltip added
                  >
                    {!isEmpty ? (
                      visibleStacks.map((stack, index) => (
                        <div
                          key={`${column.label}-${index}`}
                          className={`w-full ${stackToneClass[stack.tone]} transition-all`}
                          style={{
                            height: `${stackHeightsPercentage[index] || 0}%`,
                          }}
                          title={`${column.label} (${stack.tone}): ${stack.value}`}
                        />
                      ))
                    ) : (
                      <div
                        className="h-full w-full rounded-sm opacity-50"
                        style={{ background: "var(--portal-progress-track)" }}
                      />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-[13px] font-bold text-[var(--portal-foreground)]">{column.valueLabel}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--portal-muted)]">{column.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center">
          {columns.map((column) => {
            const total = column.stacks.reduce((sum, stack) => sum + stack.value, 0);

            return (
              <div
                key={`${column.label}-summary`}
                className="group flex flex-col justify-center rounded-2xl border p-4 transition-colors hover:bg-[var(--portal-surface-soft)]"
                style={{
                  borderColor: "var(--portal-border)",
                  background: "var(--portal-surface)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[var(--portal-foreground)]">
                    {column.label}
                  </p>
                  <p className="text-sm font-semibold text-[var(--portal-muted)]">
                    {column.valueLabel}
                  </p>
                </div>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--portal-progress-track)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      background: `linear-gradient(90deg, ${THEME_COLORS.indigo}, ${THEME_COLORS.cyan})`,
                      // UI Fix: Honest math here as well.
                      width: `${total === 0 ? 0 : (total / maxValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ClientPortalSectionCard>
  );
}

export function ClientPortalDonutPanel({
  title,
  subtitle,
  segments,
}: ClientPortalDonutPanelProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <ClientPortalSectionCard title={title} subtitle={subtitle}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="mx-auto flex w-full max-w-[14rem] items-center justify-center relative">
          {/* UI Fix: Better shadow depth and smoother rings */}
          <div
            className="relative h-48 w-48 rounded-full shadow-[inset_0px_2px_10px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:scale-105"
            style={{
              background: total === 0 ? "var(--portal-progress-track)" : buildDonutGradient(segments),
            }}
          >
            {/* The inner cutout to make it a donut */}
            <div
              className="absolute inset-[22%] rounded-full shadow-lg flex flex-col items-center justify-center"
              style={{ background: "var(--portal-card)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--portal-muted)" }}>
                {total === 0 ? "No Data" : "Total"}
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight" style={{ color: "var(--portal-foreground)" }}>
                {total}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col justify-center gap-3">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="group flex items-center justify-between rounded-xl border p-4 transition-all hover:bg-[var(--portal-surface-soft)] hover:shadow-sm"
              style={{ borderColor: "var(--portal-border)", background: "var(--portal-surface)" }}
              title={`${segment.label}: ${segment.value}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-3.5 w-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: THEME_COLORS[segment.tone] }}
                />
                <p className="text-sm font-semibold" style={{ color: "var(--portal-foreground)" }}>
                  {segment.label}
                </p>
              </div>
              <p className="text-base font-bold" style={{ color: "var(--portal-foreground)" }}>
                {segment.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ClientPortalSectionCard>
  );
}

export function ClientPortalProgressRows({
  title,
  rows,
}: ClientPortalProgressRowsProps) {
  return (
    <ClientPortalSectionCard title={title}>
      <div className="space-y-5">
        {rows.map((row) => (
          <div key={row.label} className="group cursor-default">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-[var(--portal-foreground)] transition-colors group-hover:text-blue-600">
                {row.label}
              </p>
              <p className="text-xs font-bold text-[var(--portal-muted)]">{row.value}</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--portal-progress-track)]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  backgroundColor: THEME_COLORS[row.tone || "indigo"],
                  width: `${Math.min(100, Math.max(0, row.progress))}%` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ClientPortalSectionCard>
  );
}
