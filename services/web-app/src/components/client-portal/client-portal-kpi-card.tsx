type ClientPortalKpiCardProps = {
  label: string;
  value: string;
  detail: string;
  change?: string;
  tone?: "indigo" | "blue" | "cyan" | "slate";
};

const toneMap: Record<
  NonNullable<ClientPortalKpiCardProps["tone"]>,
  {
    dot: string;
    badgeBackground: string;
    badgeColor: string;
  }
> = {
  indigo: {
    dot: "var(--portal-tone-indigo)",
    badgeBackground: "var(--portal-tone-indigo-bg)",
    badgeColor: "var(--portal-tone-indigo-text)",
  },
  blue: {
    dot: "var(--portal-tone-blue)",
    badgeBackground: "var(--portal-tone-blue-bg)",
    badgeColor: "var(--portal-tone-blue-text)",
  },
  cyan: {
    dot: "var(--portal-tone-cyan)",
    badgeBackground: "var(--portal-tone-cyan-bg)",
    badgeColor: "var(--portal-tone-cyan-text)",
  },
  slate: {
    dot: "var(--portal-tone-neutral)",
    badgeBackground: "var(--portal-tone-neutral-bg)",
    badgeColor: "var(--portal-tone-neutral-text)",
  },
};

export function ClientPortalKpiCard({
  label,
  value,
  detail,
  change,
  tone = "indigo",
}: ClientPortalKpiCardProps) {
  const palette = toneMap[tone];

  return (
    <article
      className="client-portal-tone-transition rounded-2xl border p-4 lg:p-5"
      style={{
        borderColor: "var(--portal-border)",
        background: "var(--portal-card)",
        boxShadow: "var(--portal-shadow)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: palette.dot }}
          />
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--portal-muted)]">
            {label}
          </p>
        </div>
        {change ? (
          <span
            className="client-portal-tone-transition rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider"
            style={{
              background: palette.badgeBackground,
              color: palette.badgeColor,
            }}
          >
            {change}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-2xl font-semibold text-[var(--portal-foreground)]">
        {value}
      </p>
      <p className="mt-1.5 text-[12px] text-[var(--portal-muted)]">{detail}</p>
    </article>
  );
}
