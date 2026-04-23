type PageGridBackgroundProps = {
  className?: string;
};

export function PageGridBackground({ className = "" }: PageGridBackgroundProps) {
  return (
    <div className={className} aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_52%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.18),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.06),transparent)]" />
    </div>
  );
}