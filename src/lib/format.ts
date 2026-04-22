export function formatCr(val: number) {
  return `₹${(val / 1000).toFixed(1)}k cr`;
}

export function formatPct(val: number) {
  return `${Math.round(val * 100)}%`;
}

export function rrTone(rr: number) {
  if (rr >= 0.7) return 'strong';
  if (rr >= 0.4) return 'moderate';
  return 'weak';
}
