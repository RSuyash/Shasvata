type PortalActionMenuItem = {
  label: string;
  href: string;
  external?: boolean;
};

export function PortalActionMenu({
  items,
  align = "right",
  triggerLabel,
}: {
  items: PortalActionMenuItem[];
  align?: "left" | "right";
  triggerLabel?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <details className="group relative">
      <summary
        className={`cursor-pointer list-none rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)] ${
          triggerLabel
            ? "inline-flex min-h-10 items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
            : "flex h-10 w-10 items-center justify-center text-base"
        }`}
      >
        {triggerLabel ? (
          <>
            <span>{triggerLabel}</span>
            <span aria-hidden="true" className="text-sm leading-none text-[var(--portal-muted)]">
              ▾
            </span>
          </>
        ) : (
          <span className="tracking-[0.22em]">...</span>
        )}
      </summary>

      <div
        className={`absolute top-12 z-20 min-w-[12rem] rounded-[22px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-2 shadow-[0_24px_80px_rgba(15,23,42,0.18)] ${
          align === "left" ? "left-0" : "right-0"
        }`}
      >
        {items.map((item) => (
          <a
            key={`${item.label}-${item.href}`}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
            className="flex rounded-[16px] px-3 py-2.5 text-sm text-[var(--portal-foreground)] transition hover:bg-[var(--portal-surface-soft)]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </details>
  );
}
