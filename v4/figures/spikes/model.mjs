// F6 · the spike press — the one model the gantry, the spikes, the nameplates and the readout all read.
// Sources (Appendix A of the manifesto):
//   spikes: shipped frontier-lab products, in order of public launch —
//           image generation 2022 · software (coding agents) 2024–25 · security 2025 · finance / CFO 2025–26 · legal 2026
//   planes: Artificial Analysis intelligence index, current model comparison —
//           Nemotron 3 Ultra 38 (the leading US open-weight model: runs on your own rungs, uncapped)
//           Opus-class frontier 61 (metered)
//   map:    the labs publish usage classified into 30+ categories of work; this table has 33 cells.
// Column heights (usage density) and spike heights are ILLUSTRATIVE. Only 38 and 61 are real scores.
export const INDEX = { open: 38, frontier: 61 };
export const Z_PER_POINT = 0.9; // world units per index point, for the planes and for the illustrative heights

export const COLS = 11;
export const ROWS = 3;

// Usage density per cell, illustrative, in index-equivalent points. Every routine cell sits under the open plane (38);
// the six dense cells (33–36) are the tallest on the map.
export const DENSITY = [
  [12, 22, 8, 18, 26, 10, 15, 6, 20, 14, 9],
  [35, 14, 24, 9, 34, 19, 11, 23, 36, 13, 17],
  [16, 7, 33, 21, 12, 25, 35, 8, 18, 22, 34],
];

// The spikes, in launch order. `peak` is the illustrative height the press pulls each one to (all above 61).
export const SPIKES = [
  { name: "IMAGE GEN", years: "2022", col: 0, row: 1, peak: 88 },
  { name: "SOFTWARE", years: "2024–25", col: 2, row: 2, peak: 96 },
  { name: "SECURITY", years: "2025", col: 4, row: 1, peak: 90 },
  { name: "FINANCE / CFO", years: "2025–26", col: 6, row: 2, peak: 94 },
  { name: "LEGAL", years: "2026", col: 8, row: 1, peak: 92 },
];
export const YOURS = { name: "YOURS?", col: 10, row: 2 };

export const STATES = ["map", "image 2022", "software 2024–25", "security 2025", "finance 2025–26", "legal 2026", "yours?"];
export const LAST = STATES.length - 1;
export const KEY = 5; // "legal 2026": all five spikes through the frontier plane

export const readoutOf = (n) => (n === 0 ? "the usage map" : n <= SPIKES.length ? `${SPIKES[n - 1].name} · ${SPIKES[n - 1].years}` : "YOURS?");

// The press, as a pure function of u (0 = parked over the map, n = spike n just pulled, LAST = hovering over yours).
// D carries the plan positions and heights (built in build.mjs). Each step i → i+1: lift off the last cap, travel,
// drop onto the dense column, then pull the spike up out of it (the spike's cap rides under the chuck).
export function poseAt(u, D) {
  const s = Math.min(D.last, Math.max(0, u));
  const i = Math.min(D.last - 1, Math.floor(s));
  const f = s - i;
  const ease = (t) => t * t * (3 - 2 * t);
  const seg = (t, a, b) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
  const spot = (n) => (n === 0 ? D.home : D.cells[n - 1]);
  const rest = (n) => (n === 0 ? D.travel : n <= D.spikes ? D.peaks[n - 1] + D.cap : D.hover);
  const tops = D.peaks.map((p, j) => (j < i ? p : null));
  const from = spot(i), to = spot(i + 1);
  const move = seg(f, 0.14, 0.5);
  const x = from[0] + (to[0] - from[0]) * move;
  const y = from[1] + (to[1] - from[1]) * move;
  let z = rest(i) + (D.travel - rest(i)) * seg(f, 0, 0.14);
  if (i < D.spikes) {
    const low = D.bases[i] + D.collar + D.cap;
    if (f > 0.5) z = D.travel + (low - D.travel) * seg(f, 0.5, 0.68);
    if (f > 0.68) {
      const t = D.bases[i] + D.collar + (D.peaks[i] - D.bases[i] - D.collar) * seg(f, 0.68, 1);
      tops[i] = t;
      z = t + D.cap;
    }
  } else if (f > 0.5) z = D.travel + (D.hover - D.travel) * seg(f, 0.5, 1);
  return { x, y, z, tops };
}
