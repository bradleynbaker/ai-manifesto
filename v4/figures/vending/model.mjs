// Fig 7 · One token, four prices — the one model the crank, the drum counter, the readout and the board all read.
// Sources (the manifesto's Figure 9 and its appendix):
//   owned vs cloud: Lenovo 2026 TCO study (a vendor study): 5-year lifecycle, zero residual, 12% maintenance, $0.12/kWh.
//     The same open model on owned capacity costs $0.97 per M tokens at 5.3 hours a day of real work — parity with
//     on-demand cloud GPU at $0.97 / M. Owned cost per token falls as 1 / utilization: $/M = 0.97 × 5.3 / hours.
//     About a 5.2-month break-even for an 8-GPU system against on-demand cloud.
//   frontier API: ~$12 / M, a blended coding rate (Brad's read of list pricing).
//   wrapped federal LLM: up to $45 / M (Brad's read of list pricing).
export const CLOUD = 0.97;
export const BREAK_EVEN_H = 5.3;
export const FRONTIER = 12;
export const WRAPPED = 45;
export const PAYBACK_MONTHS = 5.2;
export const H_MIN = 1;
export const H_MAX = 24;

export const STATES = [
  { label: "1 h", hours: 1 },
  { label: "3 h", hours: 3 },
  { label: "5.3 h · break-even", hours: 5.3 },
  { label: "12 h · a native's day", hours: 12 },
];
export const KEY = 3; // "12 h · a native's day" proves the slide title

export function owned(hours) {
  const h = Math.min(H_MAX, Math.max(H_MIN, hours));
  return (CLOUD * BREAK_EVEN_H) / h;
}

export function verdict(price) {
  if (price <= CLOUD + 1e-9) return "Owned capacity wins — this is your natives' duty cycle.";
  if (price <= FRONTIER) return "Owned already beats the frontier API blended rate.";
  return "Renting wins — until the natives show up.";
}

export const money = (v) => "$" + v.toFixed(2);
export const hoursText = (h) => (Math.abs(h - Math.round(h)) < 0.05 ? String(Math.round(h)) : h.toFixed(1)) + " h";
