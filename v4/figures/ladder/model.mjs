// Fig 8 · the sovereign ladder — the one model the tokens, the gate, the board and the readout all read.
// Numbers (Artificial Analysis comparison page, Opus 5 vs Nemotron 3 Ultra; the manifesto's verified appendix):
//   US OPEN  (Nemotron 3 Ultra): intelligence index 38 · $0.58 per M tokens · 100 tokens/s — run inside, uncapped
//   FRONTIER (Opus 5):           intelligence index 61 · $3.85 per M tokens ·  47 tokens/s — rented outside, metered
// Everything else here (token count, spacing, speed, which token goes where) is illustrative choreography.
// This file is inlined into the page with `export ` stripped, so it must stay import-free.
export const OPEN = { name: "US OPEN", index: 38, price: 0.58, tps: 100 };
export const FRONTIER = { name: "FRONTIER", index: 61, price: 3.85, tps: 47 };

// the beats the presenter clicks through
export const STATES = ["device", "workgroup", "core", "gate", "all"];
export const KEY_STATE = 4;
export const RUNG_NAMES = ["DEVICE", "WORKGROUP", "CORE"];
// which destinations show tokens in each state (1–3 = rungs, 4 = through the gate) and how strongly
export const SHOW = [
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 1, 1, 0],
  [0.32, 0.32, 0.32, 1],
  [1, 1, 1, 1],
];
// the rung each state points at (0-based; 3 = the gate, -1 = all)
export const FOCUS = [0, 1, 2, 3, -1];

// ---------- world plan the tokens ride on (x, y on the floor, z up) ----------
export const LANE_Y = 32;                  // the lane runs along x on every rung and over the deck
export const SLOT_Y = 18;                  // the docking sockets sit just behind the lane
export const RUNG_X = [-246, -146, -46, 54]; // rung r spans RUNG_X[r] .. RUNG_X[r + 1]
export const RUNG_Z = [10, 22, 34];        // rung tops; the deck through the gate is level with rung 3
export const GATE_X = 67;                  // the gatehouse in the fence line
export const TURN_X = 84;                  // the turnstile hub just outside it
export const STAMP_X = 106;                // where the press strips the context tag
export const DOOR_X = 140;                 // the frontier tower's door
export const TOKEN = { half: 3.5, h: 6, tag: 5 };

// a token's path: out of the router, along the rungs, up each riser, and (for the few) through the gate
const MAIN = [
  [-262, LANE_Y, RUNG_Z[0]],
  [RUNG_X[1] - 4.5, LANE_Y, RUNG_Z[0]],
  [RUNG_X[1] - 4.5, LANE_Y, RUNG_Z[1]],
  [RUNG_X[2] - 4.5, LANE_Y, RUNG_Z[1]],
  [RUNG_X[2] - 4.5, LANE_Y, RUNG_Z[2]],
  [DOOR_X + 8, LANE_Y, RUNG_Z[2]],
];

// 30 tokens a cycle: 9 stop on each rung, 3 go through the gate (illustrative mix: most stay inside)
export const N = 30;
export const PERIOD = 18;                  // s per cycle
export const SPEED = 40;                   // world units per s
const ESCALATE = [6, 7, 21];
export const SLOTS = [
  Array.from({ length: 9 }, (_, i) => -236 + i * 10),
  Array.from({ length: 9 }, (_, i) => -136 + i * 10),
  Array.from({ length: 9 }, (_, i) => -36 + i * 10),
];
export const TOKENS = (() => {
  const out = [];
  const used = [0, 0, 0];
  let r = 0;
  for (let i = 0; i < N; i++) {
    if (ESCALATE.includes(i)) { out.push({ i, dest: 4, slot: null }); continue; }
    const dest = (r % 3) + 1;
    r++;
    const k = used[dest - 1]++;
    // later arrivals take the nearer sockets, so a token never slides across one already docked
    out.push({ i, dest, slot: SLOTS[dest - 1][SLOTS[dest - 1].length - 1 - k] });
  }
  return out;
})();

export function routeOf(token) {
  if (token.dest === 4) return MAIN;
  const r = token.dest - 1;
  // the main line up to this rung's lane, then along it to the socket, then back into the socket
  const upTo = [1, 3, 5][r];
  const pts = MAIN.slice(0, upTo);
  const z = RUNG_Z[r];
  return [...pts, [token.slot, LANE_Y, z], [token.slot, SLOT_Y, z]];
}

const lengthOf = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]), 0);
function along(pts, s) {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (s <= l || i === pts.length - 1) {
      const t = l ? Math.min(1, Math.max(0, s / l)) : 1;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    s -= l;
  }
  return pts[pts.length - 1];
}
const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

// where token i is at time t (s): position, opacity, whether it still carries its context tag,
// and how far it has pushed the turnstile / been pressed by the stamp on this pass
export function tokenAt(token, t) {
  const pts = routeOf(token);
  const L = lengthOf(pts);
  const since = t - (token.i * PERIOD) / N;
  const cycles = Math.floor(since / PERIOD);
  const tau = since - cycles * PERIOD;
  const s = Math.min(L, tau * SPEED);
  const p = along(pts, s);
  let alpha = smooth(0, 0.5, tau) * (1 - smooth(PERIOD - 1.1, PERIOD - 0.1, tau));
  const out = { p, alpha, tag: 1, turn: 0, press: 0, cycles, dest: token.dest };
  if (token.dest === 4) {
    alpha *= 1 - smooth(DOOR_X - 1, DOOR_X + 6, p[0]); // into the tower's door
    out.alpha = alpha;
    out.turn = smooth(TURN_X - 9, TURN_X + 9, p[0]);
    out.press = Math.max(0, 1 - Math.abs(p[0] - STAMP_X) / 6);
    out.tag = p[0] < STAMP_X ? 1 : 1 - smooth(STAMP_X, STAMP_X + 2, p[0]);
  }
  out.alpha = alpha;
  return out;
}

// the gate's moving parts for time t: turnstile angle (rad), meter count, stamp travel 0..1
export function gateAt(t) {
  let passes = 0, press = 0;
  for (const token of TOKENS) {
    if (token.dest !== 4) continue;
    const a = tokenAt(token, t);
    passes += a.cycles + a.turn;
    press = Math.max(press, a.press);
  }
  return { turn: (passes * 2 * Math.PI) / 3, count: passes, press: press * press * (3 - 2 * press) };
}

// the frozen moment each state's still picture shows (and reduced motion holds)
export const SNAP_T = (() => {
  const esc = TOKENS.find((tk) => tk.i === ESCALATE[1]);
  const L = lengthOf(MAIN.slice(0, 5)) + (STAMP_X - MAIN[4][0]);
  const atStamp = (esc.i * PERIOD) / N + L / SPEED + PERIOD;
  return [atStamp - 3.2, atStamp - 2.2, atStamp - 1.2, atStamp, atStamp - 0.04];
})();

export const STATE_TEXT = ["Rung 1 · device", "Rung 2 · workgroup", "Rung 3 · core", "Gate · frontier, metered", "Three rungs + one gate"];
