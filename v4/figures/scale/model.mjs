// F3 · the spend steelyard — the one model the poise, the beam, the tongue, the readout and the board all read.
// Sources:
//   Ramp AI Index, June 2026 (as reported), 70,000+ US businesses, AI spend per employee per month, annualized here (× 12):
//     median business $11.38 / mo → $137 / yr; 90th percentile $611 / mo → $7,332 / yr;
//     top 1% $7,449 / mo → $89,388 / yr (growing ~14% month over month)
//   Jensen Huang, on the record (Tom's Hardware): "if that $500,000 engineer did not consume at least $250,000 worth
//     of tokens, I'm going to be deeply alarmed" → the bar is $250,000 / yr, half a $500,000 salary.
// Between the states the spend is interpolated on a log scale (the beam is a log beam).
export const SALARY = 500000;
export const BAR = 250000;
export const STATES = [
  { label: "median", name: "Median", spend: 137, share: "0.03%" },
  { label: "90th pct", name: "90th pct", spend: 7332, share: "1.5%" },
  { label: "top 1%", name: "Top 1%", spend: 89388, share: "18%" },
  { label: "Jensen", name: "Jensen", spend: 250000, share: "50%" },
];
export const LAST = STATES.length - 1;
export const KEY = 0; // the median: the gap is the point
// The tilt is illustrative: it grows with how many ×10s the spend sits below the bar, 6° at the median, level at the bar.
export const MAX_TILT = 6;
export function spendAt(u) {
  const s = Math.min(LAST, Math.max(0, u));
  const i = Math.min(LAST - 1, Math.floor(s));
  const t = s - i;
  const a = Math.log10(STATES[i].spend), b = Math.log10(STATES[i + 1].spend);
  return Math.pow(10, a + (b - a) * t);
}
export function tiltOf(spend) {
  const gap = Math.max(0, Math.log10(250000) - Math.log10(spend));
  const most = Math.log10(250000) - Math.log10(137);
  return 6 * Math.sqrt(Math.min(1, gap / most));
}
export const compact = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e4 ? `$${Math.round(v / 1e3)}K` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${Math.round(v)}`);
export const full = (v) => "$" + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const shareOf = (v) => { const p = (v / 500000) * 100; return (p < 0.1 ? p.toFixed(2) : p < 10 ? p.toFixed(1) : p.toFixed(0)) + "%"; };
