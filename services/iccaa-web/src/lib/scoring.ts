export function getConfidenceColor(grade: 'A' | 'B' | 'C' | 'D') {
  switch (grade) {
    case 'A': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    case 'B': return 'text-sky-400 border-sky-500/20 bg-sky-500/10';
    case 'C': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    case 'D': return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
    default: return 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10';
  }
}
