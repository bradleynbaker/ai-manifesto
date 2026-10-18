// F5 · Two doors — the one model the packets, the turnstile, the drop bar, the counter and the board all read.
// Sources (the manifesto's verified appendix):
//   PagerDuty survey, June 11 2026, n = 1,250 office professionals at companies with ≥ $500M revenue:
//     66% have used AI tools they believed weren't allowed; 88% have shared work information through them;
//     81% believe leadership plays by different rules.
//   Consumer terms (Anthropic, Aug 2025): consumer plans carry the training setting, with 5-year retention if it is on;
//     commercial, enterprise, API and government traffic is excluded from training.
// The packet flow, its speed and the turnstile's count are illustrative: they show where work goes, not how much.

export const SURVEY = { date: "June 11 2026", n: 1250, used: 66, shared: 88, rules: 81 };
export const STATES = ["contract", "capped", "side door"];
export const KEY = 2; // the state that proves the slide's title

// targets per state: block = turnstile bar down, exec = the corner office's share out the side door, all = everyone's
export const TARGETS = [
  { block: 0, exec: 0, all: 0, board: 0 },
  { block: 1, exec: 1, all: 0, board: 0 },
  { block: 1, exec: 1, all: 1, board: 1 },
];

// ---------- the plan (world units; x, y on the floor, z up) ----------
export const FLOOR = 3;          // floor and paving tops
export const LX = -80;           // the front lane (through the front door and the turnstile)
export const AY = 0;             // the cross aisle (to the side door)
export const EDGE_Y = 116;       // the plinth's front-left edge
export const EDGE_X = 150;       // the plinth's front-right edge
export const BAR_STOP = 93.8;    // a packet's centre when it rests against the dropped bar at the pen's gate
export const SPEED = 12;         // units a second (illustrative)
export const SLOTS = 18;         // the stream on the shared aisle has 18 slots, 9 units apart (15 in use)
export const PITCH = 9;
export const PACKET = 6;         // a packet is a 6 × 6 × 4 box

const ROW_A = [-60, -20, 20, 60];  // desks along the back-right wall (x of each desk)
const ROW_B = [-62, -30];          // desks along the back-left wall (y of each desk)

// each desk: where its packets appear, the two routes, and which stream slots it fills
export const DESKS = [
  ...ROW_A.map((x, i) => ({ id: `A${i + 1}`, start: [x + 23, -67], front: [[x + 23, AY], [LX, AY], [LX, EDGE_Y]], side: [[x + 23, AY], [EDGE_X, AY]] })),
  ...ROW_B.map((y, i) => ({ id: `B${i + 1}`, start: [-96, y + 23], front: [[LX, y + 23], [LX, EDGE_Y]], side: [[-70, y + 23], [-70, AY], [EDGE_X, AY]] })),
  { id: "EXEC", exec: true, start: [66, 27], front: [[66, AY], [LX, AY], [LX, EDGE_Y]], side: [[66, AY], [EDGE_X, AY]] },
];
// the corner office sends every 54 units, each open desk every 81 (illustrative: the corner office is the busiest)
const SLOT_OF = { EXEC: [0, 6, 12], A1: [1, 10], A2: [2, 11], A3: [4, 13], A4: [5, 14], B1: [7, 16], B2: [8, 17] };

function routeOf(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  return { points, cum, length: cum[cum.length - 1] };
}
// arc length at which a route first reaches a point that lies on it
function sAt(route, [px, py]) {
  for (let i = 1; i < route.points.length; i++) {
    const [ax, ay] = route.points[i - 1], [bx, by] = route.points[i];
    const len = route.cum[i] - route.cum[i - 1];
    const t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / (len * len);
    const qx = ax + (bx - ax) * t, qy = ay + (by - ay) * t;
    if (t >= -1e-9 && t <= 1 + 1e-9 && Math.hypot(qx - px, qy - py) < 1e-6) return route.cum[i - 1] + len * t;
  }
  throw new Error("point not on route");
}

export const ROUTES = DESKS.flatMap((desk, d) =>
  ["front", "side"].map((kind) => {
    const r = routeOf([desk.start, ...desk[kind]]);
    const every = (PITCH * SLOTS) / SLOT_OF[desk.id].length;
    // stagger: the reference point is the door each route leaves by, so the stream there runs one packet per slot
    const ref = sAt(r, kind === "front" ? [LX, 60] : [96, AY]);
    const phase = (((SLOT_OF[desk.id][0] * PITCH - ref) % every) + every) % every;
    return { desk: d, exec: !!desk.exec, kind, ...r, every, phase, bar: kind === "front" ? sAt(r, [LX, BAR_STOP]) : 0 };
  }),
);

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;

export function pointOn(route, s) {
  const { points, cum } = route;
  let i = 1;
  while (i < points.length - 1 && cum[i] < s) i++;
  const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
  return [lerp(points[i - 1][0], points[i][0], t), lerp(points[i - 1][1], points[i][1], t)];
}

// every visible packet at time t for the eased mix { block, exec, all }:
// a front route's packets jam in the 56 units before the bar when it is down (they close up and crawl at 70% speed; the
// front one is refused at the bar); packets that were already past the bar fade as it drops.
export function packetsAt(t, mix) {
  const out = [];
  const QUEUE = 56, SQUEEZE = 0.7;
  for (const r of ROUTES) {
    const side = r.exec ? Math.max(mix.exec, mix.all) : mix.all;
    const share = r.kind === "side" ? side : 1 - side;
    if (share < 0.02) continue;
    const base = (((t * SPEED - r.phase) % r.every) + r.every) % r.every;
    for (let s0 = base; s0 < r.length; s0 += r.every) {
      let s = s0, alpha = share * smooth(0, 6, s0) * (1 - smooth(r.length - 14, r.length, s0));
      if (r.kind === "front" && mix.block > 0) {
        const q0 = r.bar - QUEUE, qEnd = q0 + QUEUE / SQUEEZE;
        if (s0 > q0 && s0 <= qEnd) {
          const u = (s0 - q0) / (qEnd - q0);
          s = lerp(s0, q0 + QUEUE * u, mix.block);
          alpha *= lerp(1, 1 - smooth(0.9, 1, u), mix.block);
        } else if (s0 > qEnd) alpha *= 1 - mix.block;
      }
      if (alpha < 0.02) continue;
      const [x, y] = pointOn(r, s);
      const slot = r.exec && y > 19.5 && x > 50 ? "E" : r.kind === "front" && y > 61 ? "B" : r.kind === "side" && x > 95.5 ? "C" : "A";
      out.push({ x, y, alpha: Math.min(1, alpha), slot });
    }
  }
  return out;
}

// packets a second through the turnstile while it is open (one per stream slot)
export const RATE = (SPEED / PITCH) * (15 / 18);
export const pad4 = (n) => String(Math.floor(n) % 10000).padStart(4, "0");
