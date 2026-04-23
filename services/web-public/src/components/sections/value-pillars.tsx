import { BarChart3, Code2, ShieldCheck, ArrowUpRight } from "lucide-react";

const valuePillars = [
  {
    title: "Naya Marketing",
    eyebrow: "Demand",
    body: "Build a clearer brand presence, reach the right audience, and turn attention into qualified demand.",
    icon: BarChart3,
    accentClassName: "bg-teal-50/50 border-teal-100/50 text-[rgb(var(--naya-teal))]",
    glowClassName: "hover:border-[rgb(var(--naya-teal),0.3)] hover:shadow-[0_8px_30px_rgb(var(--naya-teal),0.08)]", 
  },
  {
    title: "Naya Technology",
    eyebrow: "Operations",
    body: "Remove manual drag with systems, automations, and tools that make execution faster and more consistent.",
    icon: Code2,
    accentClassName: "bg-blue-50/50 border-blue-100/50 text-[rgb(var(--naya-blue))]",
    glowClassName: "hover:border-[rgb(var(--naya-blue),0.3)] hover:shadow-[0_8px_30px_rgb(var(--naya-blue),0.08)]",
  },
  {
    title: "Naya Advisory",
    eyebrow: "Direction",
    body: "Bring clarity to priorities, decision-making, and the next moves that keep growth moving forward.",
    icon: ShieldCheck,
    accentClassName: "bg-purple-50/50 border-purple-100/50 text-[rgb(var(--naya-navy))]",
    glowClassName: "hover:border-[rgb(var(--naya-navy),0.3)] hover:shadow-[0_8px_30px_rgb(var(--naya-navy),0.08)]",
  },
] as const;

export function ValuePillarsSection() {
  return (
    <section
      id="value-pillars"
      // Reduced vertical padding to keep it within the viewport
      className="relative overflow-hidden border-y border-slate-200 bg-[#f8fafc] py-12 text-[rgb(var(--naya-navy))] md:py-16"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-[0.12]" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.12),transparent)]"
        aria-hidden="true"
      />

      <div className="container-naya relative z-10 mx-auto px-4 lg:px-8">
        
        {/* TOP-SPLIT HEADER: Fixes the empty top-right corner and saves vertical space */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:mb-12 lg:flex-row lg:items-end lg:gap-12">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-slate-500 uppercase">
              Why clients choose Shasvata
            </p>
            <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-display font-black leading-[1.05] tracking-tight text-slate-950">
              Three ways we make growth clearer, cleaner, and easier to scale.
            </h2>
          </div>
          <div className="max-w-md lg:pb-2">
            <p className="text-sm leading-relaxed text-slate-700 md:text-base">
              This is the part of the system clients feel first: better demand quality, fewer operational bottlenecks,
              and more confidence in the decisions behind the work.
            </p>
          </div>
        </div>

        {/* CARDS GRID: Compressed padding and horizontal icon alignment */}
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {valuePillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgb(15_23_42/_0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgb(15_23_42/_0.08)] md:p-7 ${pillar.glowClassName}`}
              >
                <div className="relative z-10">
                  {/* Inline Icon & Eyebrow to save vertical space */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-transform duration-300 group-hover:scale-105 ${pillar.accentClassName}`}>
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors duration-300 group-hover:text-slate-700">
                      {pillar.eyebrow}
                    </p>
                  </div>

                  <h3 className="mb-2.5 text-xl font-extrabold tracking-tight text-slate-900 transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {pillar.body}
                  </p>
                </div>

                {/* Micro-interaction indicator */}
                <div className="absolute right-6 top-6 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100">
                   <ArrowUpRight className="h-5 w-5 text-slate-500" />
                </div>
              </article>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}