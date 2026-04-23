import Link from "next/link";
import type { ClientPortalBreadcrumb } from "@/lib/portal-nav";

export function ClientPortalBreadcrumbs(props: {
  items: ClientPortalBreadcrumb[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs">
      {props.items.map((item, index) => {
        const isLast = index === props.items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition hover:opacity-80"
                style={{ color: "var(--portal-badge-text)" }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? "var(--portal-foreground)" : "var(--portal-muted)",
                }}
              >
                {item.label}
              </span>
            )}
            {!isLast ? (
              <span aria-hidden="true" style={{ color: "var(--portal-muted)" }}>
                /
              </span>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
