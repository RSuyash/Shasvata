import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-black text-[rgb(var(--naya-sky)/0.15)] mb-4">404</p>
      <h1 className="text-2xl font-display font-black mb-3 text-[hsl(var(--foreground))]">
        This page does not exist — but your growth problems do.
      </h1>
      <p className="text-[hsl(var(--muted-foreground))] mb-8 max-w-sm">
        The page you were looking for isn't here. Let's get you somewhere useful.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
        <Link href="/contact" className="btn-primary gap-2">
          Talk to us instead <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
