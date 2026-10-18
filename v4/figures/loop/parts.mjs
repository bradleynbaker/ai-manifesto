// Fig 1 · The leak loop — geometry and drawing, shared by build.mjs (static SVG, snapshots) and the live page
// (inlined inside a closure, with `k` bound to the kit). Everything that moves is a pure function of one pose:
//   pose = { s, w, act: [a1..a7], sw, dim, phase, drum }
//   s: the puck's place on the loop (0..LOOP), w: its place on the spur route (null when on the loop),
//   act: each station's action 0..1, sw: the switch at 3 (0 normal, 1 thrown into OWNED), dim: 4–7 dead,
//   phase: chain travel (units), drum: the recorder drum's turn (radians).
import * as k from "../_anatomy/kit/iso-kit.mjs";

// ---------- world plan (units ≈ px of a bench model; x, y on the floor, z up) ----------
export const W = 640, H = 360;
export const T = 10;                                   // conveyor deck top
export const END = 110, RAD = 48;                      // track centreline: two straights, two half circles
export const STRAIGHT = 2 * END, ARC = Math.PI * RAD;
export const LOOP = 2 * STRAIGHT + 2 * ARC;
export const GAUGE = 7;                                // rail offset either side of the centreline
export const PLATE = { x: -246, y: -118, w: 492, d: 236, r: 12 };
export const DECK = { x: -174, y: -64, w: 348, d: 128, r: 64 };
// the stations: s on the loop for 1..7 (front straight left→right, right end, back straight right→left)
export const FRONT_X = [-75, 0, 72], BACK_X = [72, 0, -75];
export const S = [35, 110, 182, STRAIGHT + ARC / 2, STRAIGHT + ARC + 38, STRAIGHT + ARC + 110, STRAIGHT + ARC + 185];
// the spur: leaves at the toe 10 past station 3, a quarter circle into the OWNED pen, then straight to the buffer
export const TOE = 10, SPUR_C = [82, 12], SPUR_R = 36, SPUR_ARC = (SPUR_R * Math.PI) / 2, SPUR_STOP = 24.5;
export const SPUR = TOE + SPUR_ARC + SPUR_STOP;
export const PEN = { x: 58, y: -26, w: 78, d: 40, r: 2 };
export const GATE = [104, 130];
const PUCK_R = 7, PUCK_H = 7.4, CAP_R = 4.6, CAP_H = 1.2;
export const PUCK_TOP = T + 0.5 + PUCK_H + CAP_H;

export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -17, 0), [-75, -87, 116], [72, -90, 66], [120, -24, T + 36], [-75, -100, 112]],
  W,
  H,
  { pad: 10, azimuth: 60 },
);

// ---------- small 3D helpers: a convex solid drawn with the kit's tones ----------
const D2R = Math.PI / 180;
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const viewOf = (p) => {
  const a = p.azimuth * D2R, e = p.elevation * D2R;
  return [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
};
const VIEW = viewOf(P);
function hull2(points) {
  const s = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of s) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = s.length - 1; i >= 0; i--) { const p = s[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
// verts: [[x,y,z]], faces: vertex loops; groups: faces in one group (a round side) share no crease
export function convex({ verts, faces, groups }) {
  const n = verts.length;
  const c = verts.reduce((s, v) => [s[0] + v[0] / n, s[1] + v[1] / n, s[2] + v[2] / n], [0, 0, 0]);
  const pts = verts.map((v) => k.iso(v, P));
  const [lx, ly] = [-Math.sin(P.azimuth * D2R), Math.cos(P.azimuth * D2R)];
  const info = faces.map((f, i) => {
    let nn = [0, 0, 0];
    for (let j = 0; j < f.length; j++) {
      const a = verts[f[j]], b = verts[f[(j + 1) % f.length]];
      nn[0] += (a[1] - b[1]) * (a[2] + b[2]); nn[1] += (a[2] - b[2]) * (a[0] + b[0]); nn[2] += (a[0] - b[0]) * (a[1] + b[1]);
    }
    const len = Math.hypot(...nn) || 1;
    nn = nn.map((v) => v / len);
    const fc = f.reduce((s, j) => [s[0] + verts[j][0] / f.length, s[1] + verts[j][1] / f.length, s[2] + verts[j][2] / f.length], [0, 0, 0]);
    if (dot3(nn, sub3(fc, c)) < 0) nn = nn.map((v) => -v);
    return { f, n: nn, facing: dot3(nn, VIEW) > 1e-6, g: groups ? groups[i] : i };
  });
  const shades = [[], [], [], []], top = [];
  for (const { f, n: nn, facing } of info) {
    if (!facing) continue;
    const d = k.pathOf(f.map((j) => pts[j]), true);
    if (nn[2] > 0.6) { top.push(d); continue; }
    const h = Math.hypot(nn[0], nn[1]) || 1;
    const lit = nn[2] < -0.2 ? 0 : ((nn[0] / h) * lx + (nn[1] / h) * ly + 1) / 2;
    shades[Math.min(3, Math.max(0, Math.floor(lit * 4)))].push(d);
  }
  const edges = new Map();
  info.forEach((fi, i) => fi.f.forEach((a, j) => {
    const b = fi.f[(j + 1) % fi.f.length];
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!edges.has(key)) edges.set(key, { a, b, fs: [] });
    edges.get(key).fs.push(i);
  }));
  const outline = [], crease = [];
  for (const { a, b, fs } of edges.values()) {
    const seg = k.pathOf([pts[a], pts[b]]);
    if (fs.length === 1) { if (info[fs[0]].facing) outline.push(seg); continue; }
    const [p, q] = [info[fs[0]], info[fs[1]]];
    if (p.facing !== q.facing) outline.push(seg);
    else if (p.facing && p.g !== q.g) crease.push(seg);
  }
  return { fill: k.pathOf(hull2(pts), true), outline: outline.join(""), crease: crease.join(""), top: top.join(""), shades: shades.map((s) => s.join("")) };
}
const BOX_FACES = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
// an oriented box: centre c and three half-axis vectors
export function obox(c, u, v, w) {
  const verts = [];
  for (let i = 0; i < 8; i++) {
    const su = i & 1 ? 1 : -1, sv = i & 2 ? 1 : -1, sw = i & 4 ? 1 : -1;
    verts.push([0, 1, 2].map((j) => c[j] + su * u[j] + sv * v[j] + sw * w[j]));
  }
  return { verts, faces: BOX_FACES };
}
// a bar between two points, width b across (horizontal) and t thick
export function bar(a, b2, wid, thick) {
  const d = sub3(b2, a), len = Math.hypot(...d) || 1, ax = d.map((v) => v / len);
  let side = [-ax[1], ax[0], 0];
  const sl = Math.hypot(...side);
  side = sl < 1e-6 ? [1, 0, 0] : side.map((v) => v / sl);
  const up = [ax[1] * side[2] - ax[2] * side[1], ax[2] * side[0] - ax[0] * side[2], ax[0] * side[1] - ax[1] * side[0]];
  const c = [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2, (a[2] + b2[2]) / 2];
  return obox(c, ax.map((v) => (v * len) / 2), side.map((v) => (v * wid) / 2), up.map((v) => (v * thick) / 2));
}
// a prism along x: section [[y, z], …] from x0 to x1 (a round section shares one side group)
export function prismX(section, x0, x1, round = false) {
  const m = section.length;
  const verts = [...section.map(([y, z]) => [x0, y, z]), ...section.map(([y, z]) => [x1, y, z])];
  const faces = [section.map((_, i) => i), section.map((_, i) => m + i)];
  const groups = ["c0", "c1"];
  for (let i = 0; i < m; i++) { faces.push([i, (i + 1) % m, m + ((i + 1) % m), m + i]); groups.push(round ? "side" : `s${i}`); }
  return { verts, faces, groups };
}
export const circleYZ = (cy, cz, r, steps = 28) => Array.from({ length: steps }, (_, i) => [cy + r * Math.cos((i / steps) * 2 * Math.PI), cz + r * Math.sin((i / steps) * 2 * Math.PI)]);
// a cone standing on z0 with its point at z1 (or hanging, point down, when z1 < z0)
export function cone(cx, cy, z0, r, z1, steps = 24) {
  const verts = Array.from({ length: steps }, (_, i) => [cx + r * Math.cos((i / steps) * 2 * Math.PI), cy + r * Math.sin((i / steps) * 2 * Math.PI), z0]);
  verts.push([cx, cy, z1]);
  const faces = [verts.slice(0, steps).map((_, i) => i)], groups = ["base"];
  for (let i = 0; i < steps; i++) { faces.push([i, (i + 1) % steps, steps]); groups.push("side"); }
  return { verts, faces, groups };
}
// the visible half of a ring round an x axis (a rib on a motor), ending on the silhouette
export function arcX(x, cy, cz, r, steps = 20) {
  const f = Math.atan2(VIEW[2], VIEW[1]);
  return k.pathOf(Array.from({ length: steps + 1 }, (_, i) => {
    const a = f - Math.PI / 2 + (i / steps) * Math.PI;
    return k.iso([x, cy + r * Math.cos(a), cz + r * Math.sin(a)], P);
  }));
}

// ---------- drawing shorthands ----------
export const at = (p) => k.iso(p, P);
export const S_ = (paths, style) => k.solidSvg(paths, style);
export const C_ = (geo, style) => k.solidSvg(convex(geo), style);
export const L_ = (d, style) => k.lineSvg(d, style);
export const D_ = (points, style) => k.dotsSvg(points, style);
const depthXY = (x, y, z = 0) => k.depthOf([x, y, z], P);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => { const c = clamp01(t); return c * c * (3 - 2 * c); };
const cyl = (x, y, r, z, h, steps = 28, bevel = 0) => k.cylinder(x, y, r, z, h, P, steps, bevel);
const slab = (plan, z, h, steps = 3, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
const screws = (pts, z) => L_(pts.map(([x, y]) => k.ring(x, y, 1.6, z, P, 14)).join(""), { tone: "lo" }) + D_(pts.map(([x, y]) => at([x, y, z])), { size: 0.45 });

// ---------- the loop ----------
export function loopAt(s0) {
  let s = ((s0 % LOOP) + LOOP) % LOOP;
  if (s < STRAIGHT) return { x: -END + s, y: RAD, dx: 1, dy: 0 };
  s -= STRAIGHT;
  if (s < ARC) { const t = s / RAD; return { x: END + RAD * Math.sin(t), y: RAD * Math.cos(t), dx: Math.cos(t), dy: -Math.sin(t) }; }
  s -= ARC;
  if (s < STRAIGHT) return { x: END - s, y: -RAD, dx: -1, dy: 0 };
  s -= STRAIGHT;
  const t = s / RAD;
  return { x: -END - RAD * Math.sin(t), y: -RAD * Math.cos(t), dx: -Math.cos(t), dy: Math.sin(t) };
}
export function spurAt(w0) {
  const w = Math.max(0, Math.min(SPUR, w0));
  if (w <= TOE) return loopAt(S[2] + w);
  const v = w - TOE;
  if (v < SPUR_ARC) { const t = v / SPUR_R; return { x: SPUR_C[0] + SPUR_R * Math.sin(t), y: SPUR_C[1] + SPUR_R * Math.cos(t), dx: Math.cos(t), dy: -Math.sin(t) }; }
  return { x: SPUR_C[0] + SPUR_R, y: SPUR_C[1] - (v - SPUR_ARC), dx: 0, dy: -1 };
}
export const puckAt = (pose) => (pose.w == null ? loopAt(pose.s) : spurAt(pose.w));
// outward normal of the loop at s is (-dy, dx)
const offLoop = (s, off) => { const p = loopAt(s); return [p.x - p.dy * off, p.y + p.dx * off]; };
const loopRun = (s0, s1, off, step = 3) => {
  const n = Math.max(1, Math.ceil(Math.abs(s1 - s0) / step));
  return Array.from({ length: n + 1 }, (_, i) => offLoop(s0 + ((s1 - s0) * i) / n, off));
};
const spurArc = (t0, t1, r, step = 3) => {
  const n = Math.max(1, Math.ceil((Math.abs(t1 - t0) * r) / step));
  return Array.from({ length: n + 1 }, (_, i) => { const t = t0 + ((t1 - t0) * i) / n; return [SPUR_C[0] + r * Math.sin(t), SPUR_C[1] + r * Math.cos(t)]; });
};
// a low rail: a ribbon from the deck to h, top line mid, foot line lo
function rail(points, h = 2.2, closed = false) {
  const top = points.map(([x, y]) => at([x, y, T + h])), bot = points.map(([x, y]) => at([x, y, T]));
  const m = points.length, quads = [];
  for (let i = 0; i < (closed ? m : m - 1); i++) { const j = (i + 1) % m; quads.push(k.pathOf([top[i], top[j], bot[j], bot[i]], true)); }
  const outline = closed ? k.pathOf(top, true) + k.pathOf(bot, true) : k.pathOf([...top, ...[...bot].reverse()], true);
  return `<path class="iso-shade" data-shade="2" d="${quads.join("")}"/>` + (closed ? L_(k.pathOf(bot, true), { tone: "lo" }) + L_(k.pathOf(top, true), { tone: "mid" }) : L_(outline, { tone: "mid" }));
}
// where the spur's outer rail crosses the loop's inner rail (the frog)
const FROG = (() => {
  let best = 0, err = 1e9;
  for (let t = 0.3; t < 1.4; t += 0.0005) {
    const x = SPUR_C[0] + (SPUR_R + GAUGE) * Math.sin(t), y = SPUR_C[1] + (SPUR_R + GAUGE) * Math.cos(t);
    const dIn = x <= END ? Math.abs(y - (RAD - GAUGE)) : Math.abs(Math.hypot(x - END, y) - (RAD - GAUGE));
    if (dIn < err) { err = dIn; best = t; }
  }
  const x = SPUR_C[0] + (SPUR_R + GAUGE) * Math.sin(best);
  return { t: best, s: x <= END ? x + END : STRAIGHT + Math.asin(Math.min(1, (x - END) / (RAD - GAUGE))) * RAD };
})();
export const BLADE_T = 40 * D2R; // the thrown blade lies on the chord to the spur's outer rail at 40°
const BLADE_PIVOT = [SPUR_C[0], RAD + GAUGE];
const BLADE_TIP = [SPUR_C[0] + (SPUR_R + GAUGE) * Math.sin(BLADE_T), SPUR_C[1] + (SPUR_R + GAUGE) * Math.cos(BLADE_T)];
const BLADE_LEN = Math.hypot(BLADE_TIP[0] - BLADE_PIVOT[0], BLADE_TIP[1] - BLADE_PIVOT[1]);
const BLADE_ANG = Math.atan2(BLADE_TIP[1] - BLADE_PIVOT[1], BLADE_TIP[0] - BLADE_PIVOT[0]);

// ---------- the bench ----------
export function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -17, 12, P)}"/>`];
  const byDepth = (pts) => [...pts].sort((a, b) => depthXY(a[0], a[1]) - depthXY(b[0], b[1]));
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S_(cyl(x, y, 8, -17, 1.6, 28), { tone: "lo" }), S_(cyl(x, y, 6, -15.4, 3.4, 28), { tone: "mid" }));
  }
  out.push(S_(slab(PLATE, -12, 12, 8, 1.6), { tone: "lo", inner: L_(k.sideSeam(PLATE, -6, P, 8), { tone: "faint" }) }));
  out.push(L_(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 10), 0));
  // label plate, front left: three rule lines for printed text
  const LB = { x: -236, y: 78, w: 50, d: 22, r: 1.5 };
  out.push(S_(slab(LB, 0, 0.8), { tone: "mid", crease: "none" }), L_(k.planOutline(k.insetPlan(LB, 1.6), 0.8, P, 3), { tone: "faint" }));
  [[34, 6], [26, 10.5], [30, 15]].forEach(([len, dy]) => out.push(L_(k.lineOnTop([LB.x + 5, LB.y + dy], [LB.x + 5 + len, LB.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D_([at([LB.x + LB.w - 3.4, LB.y + 3.4, 0.8]), at([LB.x + LB.w - 3.4, LB.y + LB.d - 3.4, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ---------- the drive (between 7 and 1, behind the left end) ----------
export function drive() {
  const out = [];
  const cy = 0, cz = 14, r = 10;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -240, y: -16, w: 56, d: 32, r: 4 }, 0, 0.1, P)}" style="filter:blur(4px)"/>`);
  // feet under the motor
  for (const x of [-232, -212]) out.push(S_(slab({ x, y: -12, w: 8, d: 24, r: 1 }, 0, 5, 2, 0.4), { tone: "mid" }));
  // motor body with ribs, end bell
  out.push(C_(prismX(circleYZ(cy, cz, 8.4), -242, -236, true), { tone: "mid" }));
  const ribs = [-232, -228, -224, -220, -216, -212].map((x) => arcX(x, cy, cz, r)).join("");
  out.push(C_(prismX(circleYZ(cy, cz, r), -236, -206, true), { tone: "mid", inner: L_(ribs, { tone: "faint" }) }));
  // terminal box on top
  out.push(S_(slab({ x: -226, y: -5, w: 12, d: 10, r: 1 }, cz + r - 1.4, 6, 2, 0.4), { tone: "mid" }));
  out.push(D_([at([-224, -3, cz + r + 4.6]), at([-216, 3, cz + r + 4.6])], { size: 0.4 }));
  // gearbox and output shaft into the deck
  out.push(S_(slab({ x: -206, y: -14, w: 20, d: 28, r: 2 }, 0, 30, 3, 0.8), { tone: "mid", inner: L_(k.sideSeam({ x: -206, y: -14, w: 20, d: 28, r: 2 }, 15, P, 3), { tone: "faint" }) }));
  out.push(screws([[-202, -10], [-190, -10], [-202, 10], [-190, 10]], 30));
  out.push(C_(prismX(circleYZ(0, 6, 5.5), -186, -181, true), { tone: "mid" }));
  out.push(C_(prismX(circleYZ(0, 6, 3), -181, -168, true), { tone: "hi" }));
  return out.join("");
}

// ---------- the deck and everything flat on it ----------
export function deck() {
  const out = [`<path class="iso-halo" d="${k.haloOf(DECK, 0, T, P)}" style="filter:blur(6px)"/>`];
  out.push(S_(slab(DECK, 0, T, 24, 1.2), { tone: "mid", inner: L_(k.sideSeam(DECK, T / 2, P, 24), { tone: "faint" }) }));
  out.push(L_(k.planOutline(k.insetPlan(DECK, 4), T, P, 24), { tone: "faint" }));
  // screws along the straights, between the rails and the deck edge
  const sx = [-100, -50, 0, 50, 100];
  out.push(screws([...sx.map((x) => [x, -60]), ...sx.map((x) => [x, 60])], T));
  return out.join("");
}
// the inspection cover in the middle of the deck
export function cover() {
  const CV = { x: -62, y: -24, w: 94, d: 48, r: 3 };
  const out = [S_(slab(CV, T, 0.6, 3), { tone: "mid", crease: "none" }), L_(k.planOutline(k.insetPlan(CV, 2.2), T + 0.6, P, 3), { tone: "faint" })];
  out.push(screws(k.corners(CV, 5), T + 0.6));
  const LB = { x: -46, y: -9, w: 62, d: 18, r: 1.2 };
  out.push(S_(slab(LB, T + 0.6, 0.6), { tone: "mid", crease: "none" }), L_(k.planOutline(k.insetPlan(LB, 1.4), T + 1.2, P, 3), { tone: "faint" }));
  [[44, 5.5], [32, 9.5], [38, 13.5]].forEach(([len, dy]) => out.push(L_(k.lineOnTop([LB.x + 5, LB.y + dy], [LB.x + 5 + len, LB.y + dy], T + 1.2, P), { tone: "lo", free: true })));
  return out.join("");
}
// the drive wheel in the left end: turns with the chain
export function wheel(phase) {
  const c = [-END, 0], R = 33, out = [];
  out.push(S_(cyl(c[0], c[1], R, T, 1.6, 72, 0.4), { tone: "mid" }));
  out.push(L_(k.ring(c[0], c[1], R - 3, T + 1.6, P, 72), { tone: "faint" }));
  const turn = phase / RAD;
  const holes = Array.from({ length: 6 }, (_, i) => {
    const a = turn + (i * Math.PI) / 3, [hx, hy] = [c[0] + 19 * Math.cos(a), c[1] + 19 * Math.sin(a)];
    return k.ring(hx, hy, 5, T + 1.6, P, 24);
  });
  out.push(`<path class="iso-shade" data-shade="0" d="${holes.join("")}"/>`, L_(holes.join(""), { tone: "lo" }));
  out.push(S_(cyl(c[0], c[1], 8, T + 1.6, 3, 32), { tone: "mid" }), S_(cyl(c[0], c[1], 4.4, T + 4.6, 1.6, 24), { tone: "hi", crease: "lo" }));
  const bolts = Array.from({ length: 6 }, (_, i) => { const a = turn + (i * Math.PI) / 3 + Math.PI / 6; return at([c[0] + 6.2 * Math.cos(a), c[1] + 6.2 * Math.sin(a), T + 4.6]); });
  out.push(D_(bolts, { size: 0.45 }));
  return out.join("");
}
// the OWNED pen's floor, flush in the deck
export function penFloor() {
  return S_(slab(PEN, T, 0.6, 3), { tone: "mid", crease: "none" }) + L_(k.planOutline(k.insetPlan(PEN, 2.4), T + 0.6, P, 3), { tone: "faint" });
}
// the chain slot (main loop and spur) — fills first, then edges with the spur's mouth open
export function slots() {
  const SL = 2.2, out = [];
  const outer = loopRun(0, LOOP, SL, 2.5), inner = loopRun(0, LOOP, -SL, 2.5);
  const spurL = [...spurArc(0, Math.PI / 2, SPUR_R + SL), [SPUR_C[0] + SPUR_R + SL, -20]];
  const spurR = [...spurArc(0, Math.PI / 2, SPUR_R - SL), [SPUR_C[0] + SPUR_R - SL, -20]];
  const onDeck = (pts) => pts.map(([x, y]) => at([x, y, T]));
  const ringD = k.pathOf(onDeck(outer), true) + k.pathOf(onDeck([...inner].reverse()), true);
  const spurD = k.pathOf(onDeck([...spurL, ...[...spurR].reverse()]), true);
  out.push(`<path class="iso-shade" data-shade="0" style="fill-rule:evenodd" d="${ringD}"/>`, `<path class="iso-shade" data-shade="0" d="${spurD}"/>`);
  // the spur's outer edge runs inside the main slot until it crosses the slot's inner edge
  const cut = Math.acos((RAD - SL - SPUR_C[1]) / (SPUR_R + SL));
  const x0 = SPUR_C[0], x1 = SPUR_C[0] + (SPUR_R + SL) * Math.sin(cut);
  out.push(L_(k.pathOf(onDeck(outer), true), { tone: "lo" }));
  out.push(L_(k.pathOf(onDeck(loopRun(x1 + END, x0 + END + LOOP, -SL, 2.5))), { tone: "lo" }));
  out.push(L_(k.pathOf(onDeck([...spurArc(cut, Math.PI / 2, SPUR_R + SL), [SPUR_C[0] + SPUR_R + SL, -20], [SPUR_C[0] + SPUR_R - SL, -20], ...[...spurR].reverse()])), { tone: "lo" }));
  return out.join("");
}
// chain pins riding in the slot
export function chain(phase) {
  const pitch = 7, pts = [];
  const off = ((phase % pitch) + pitch) % pitch;
  for (let s = off; s < LOOP; s += pitch) { const p = loopAt(s); pts.push(at([p.x, p.y, T])); }
  return D_(pts, { size: 0.75, tone: "mid" });
}
export function rails() {
  const out = [];
  const iFrom = FROG.s + 2.2, iTo = SPUR_C[0] + END; // the inner rail is open from the toe to past the frog
  out.push(rail(loopRun(iFrom, iTo + LOOP, -GAUGE, 3)));
  out.push(rail(loopRun(0, LOOP, GAUGE, 3).slice(0, -1), 2.2, true));
  // spur: inner rail from the toe, outer rail from where the thrown blade lands, both to the buffer
  const yEnd = -21;
  out.push(rail([...spurArc(0, Math.PI / 2, SPUR_R - GAUGE), [SPUR_C[0] + SPUR_R - GAUGE, yEnd]]));
  const fr = FROG.t, gap = 2.2 / (SPUR_R + GAUGE);
  out.push(rail(spurArc(BLADE_T, fr - gap, SPUR_R + GAUGE, 2)));
  out.push(rail([...spurArc(fr + gap, Math.PI / 2, SPUR_R + GAUGE), [SPUR_C[0] + SPUR_R + GAUGE, yEnd]]));
  // rail clips
  const clips = [];
  for (let s = 6; s < LOOP; s += 24) for (const o of [-GAUGE - 1.4, GAUGE + 1.4]) { const [x, y] = offLoop(s, o); if (!(x > 74 && x < 128 && y > 30 && o < 0)) clips.push(at([x, y, T])); }
  out.push(D_(clips, { size: 0.5 }));
  // the buffer stop at the end of the spur
  const BF = { x: SPUR_C[0] + SPUR_R - 9, y: yEnd - 1.4, w: 18, d: 1.4, r: 0.4 };
  out.push(S_(slab(BF, T, 6, 2, 0.3), { tone: "mid" }), S_(slab({ x: BF.x + 3, y: yEnd, w: 12, d: 1.5, r: 0.5 }, T + 1.6, 3, 2), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// ---------- the puck (the user's intent): the one lit part, built at the origin ----------
export function puck() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: -6, y: -6, w: 12, d: 12, r: 6 }, T, 0.1, P)}" style="filter:blur(2px);opacity:.5"/>`];
  // ink-black body, a dark top, a pale band and rim so it reads as one solid object
  const ink = (paths, topTone) => `<g class="iso-solid"><path style="fill:var(--anatomy-lit);stroke:none" d="${paths.fill}"/><path style="fill:var(--anatomy-${topTone});stroke:none" d="${paths.top}"/><path class="iso-line" data-tone="lit" d="${paths.outline}"/></g>`;
  out.push(ink(cyl(0, 0, PUCK_R, T + 0.5, PUCK_H, 48), "hi"));
  out.push(`<path class="iso-line" style="stroke:var(--anatomy-face);stroke-width:1.2" d="${k.sideArc(0, 0, PUCK_R, T + 3.4, P, 32)}"/>`);
  out.push(`<path class="iso-line" style="stroke:var(--anatomy-mid)" d="${k.ring(0, 0, PUCK_R - 1, T + 0.5 + PUCK_H, P, 40)}"/>`);
  out.push(ink(cyl(0, 0, CAP_R, T + 0.5 + PUCK_H, CAP_H, 36), "hi"));
  out.push(`<path style="fill:var(--anatomy-face);stroke:none" d="${k.ring(0, 0, 1.5, PUCK_TOP, P, 16)}"/>`);
  return out.join("");
}
export const puckDepth = (pose) => { const p = puckAt(pose); return depthXY(p.x, p.y, T); };
export const puckMove = (pose) => { const p = puckAt(pose); return k.translateAlong(P, [p.x, p.y, 0]); };

// ---------- the OWNED pen (station 8): back and side fences, then the front wall, gate and sign ----------
const POST_H = 9;
function posts(pts) { return pts.sort((a, b) => depthXY(a[0], a[1]) - depthXY(b[0], b[1])).map(([x, y, h = POST_H]) => S_(cyl(x, y, 1.3, T + 0.6, h, 14), { tone: "mid" }) + D_([at([x, y, T + 0.6 + h])], { size: 0.4, tone: "hi" })).join(""); }
export function penBack() {
  const out = [];
  const bx = Array.from({ length: 9 }, (_, i) => PEN.x + 1.5 + (i * (PEN.w - 3)) / 8);
  // two posts of the back fence run up to carry the sign: 8 OWNED, standing clear above the puck
  const tall = [5, 8];
  out.push(posts(bx.map((x, i) => [x, PEN.y + 1.5, tall.includes(i) ? 35 : POST_H])));
  for (const z of [T + 3.8, T + 7.4]) out.push(S_(slab({ x: PEN.x + 1.5, y: PEN.y + 2.8, w: PEN.w - 3, d: 1, r: 0.3 }, z, 1.2, 2), { tone: "mid" }));
  const SG = { x0: bx[5] - 2, x1: bx[8] + 4.5, z0: T + 23.4, z1: T + 34.6 }, SY = PEN.y + 2.8;
  out.push(S_(slab({ x: SG.x0, y: SY, w: SG.x1 - SG.x0, d: 1, r: 0.3 }, SG.z0, SG.z1 - SG.z0, 2), { tone: "hi", crease: "lo" }));
  out.push(plateText({ ...SG, x0: SG.x0 + 0.4, y: SY + 1 }, "8", ["OWNED"], { num: 10, name: 7, lead: 0, tone: "hi" }));
  out.push(D_([[SG.x0 + 1.4, SG.z1 - 1.6], [SG.x1 - 1.4, SG.z1 - 1.6], [SG.x0 + 1.4, SG.z0 + 1.6], [SG.x1 - 1.4, SG.z0 + 1.6]].map(([x, z]) => at([x, SY + 1, z])), { size: 0.45 }));
  const ly = [PEN.y + 1.5 + 9.6, PEN.y + 1.5 + 19.2, PEN.y + 1.5 + 28.8];
  out.push(posts(ly.map((y) => [PEN.x + 1.5, y])));
  for (const z of [T + 3.8, T + 7.4]) out.push(S_(slab({ x: PEN.x + 2.8, y: PEN.y + 1.5, w: 1, d: PEN.d - 3, r: 0.3 }, z, 1.2, 2), { tone: "mid" }));
  return out.join("");
}
export function penFront() {
  const out = [];
  const rx = PEN.x + PEN.w - 1.5;
  for (const z of [T + 3.8, T + 7.4]) out.push(S_(slab({ x: rx - 2.3, y: PEN.y + 1.5, w: 1, d: PEN.d - 3, r: 0.3 }, z, 1.2, 2), { tone: "mid" }));
  out.push(posts([PEN.y + 11.1, PEN.y + 20.7, PEN.y + 30.3].map((y) => [rx, y])));
  // front wall: left of the gate it carries the name, right of it a short return
  const fy = PEN.y + PEN.d - 2;
  const WL = { x: PEN.x, y: fy, w: GATE[0] - 2.4 - PEN.x, d: 2.4, r: 0.5 };
  const WR = { x: GATE[1] + 2.4, y: fy, w: PEN.x + PEN.w - GATE[1] - 2.4, d: 2.4, r: 0.5 };
  const WH = 13;
  for (const w of [WR, WL]) out.push(S_(slab(w, T + 0.6, WH, 2, 0.4), { tone: "mid", inner: L_(k.sideSeam(w, T + 0.6 + WH - 2.2, P, 2), { tone: "faint" }) }));
  out.push(plate({ x0: WL.x + 2, x1: WL.x + WL.w - 2, y: fy + 2.4, z0: T + 1.8, z1: T + 12.4 }, null, ["OWN THE", "BOUNDARY"], { name: 6 }));
  // gate posts and the sign over the gate
  return out.join("");
}

// ---------- name plates on the +y faces ----------
// numeral (big) on the left, the name in lines on the right; face plane y, from x0 to x1, z0 to z1
function plateText(pl, num, lines, { num: NS = 0, name = 6, lead = 0, tone = "hi" } = {}) {
  const out = [];
  const hgt = pl.z1 - pl.z0;
  let x = pl.x0 + 2.2;
  if (num) {
    const base = pl.z0 + (hgt - NS * 0.72) / 2;
    out.push(k.faceTextSvg(k.sideMatrix([x, pl.y], base, P, "left"), num, { size: NS, tone: "hi", anchor: "start" }));
    x += NS * 0.62 + 2.4 + lead;
  }
  const lh = name * 1.14, block = lines.length * lh - (lh - name * 0.72);
  let base = pl.z1 - (hgt - block) / 2 - name * 0.72;
  for (const line of lines) { out.push(k.faceTextSvg(k.sideMatrix([x, pl.y], base, P, "left"), line, { size: name, tone, anchor: "start" })); base -= lh; }
  return out.join("");
}
function plate(pl, num, lines, opts = {}) {
  const out = [];
  out.push(S_(slab({ x: pl.x0, y: pl.y, w: pl.x1 - pl.x0, d: 0.8, r: 0.3 }, pl.z0, pl.z1 - pl.z0, 2), { tone: "mid", crease: "faint" }));
  out.push(plateText({ ...pl, y: pl.y + 0.8 }, num, lines, { num: 13.5, ...opts }));
  out.push(D_([[pl.x0 + 1.3, pl.z1 - 1.3], [pl.x1 - 1.3, pl.z1 - 1.3], [pl.x0 + 1.3, pl.z0 + 1.3], [pl.x1 - 1.3, pl.z0 + 1.3]].map(([x, z]) => at([x, pl.y + 0.8, z])), { size: 0.4 }));
  return out.join("");
}

// ---------- the stations ----------
const FRONT = { y: 72, d: 32, h: 20 }, BACK = { y: -106, d: 34, h: 37 };
function housing(cx, side, num, lines, opts) {
  const b = side === "front" ? FRONT : BACK;
  const plan = { x: cx - 31, y: b.y, w: 62, d: b.d, r: 3 };
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(plan, 3), 0, 0.1, P)}" style="filter:blur(5px)"/>`];
  out.push(S_(slab(plan, 0, b.h, 3, 1), { tone: "mid", inner: L_(k.sideSeam(plan, 3, P, 3), { tone: "faint" }) }));
  out.push(screws(k.corners(plan, 4.5), b.h));
  const z0 = side === "front" ? 5 : 13.5, z1 = b.h - 2.5;
  out.push(plate({ x0: cx - 29, x1: cx + 29, y: plan.y + plan.d, z0, z1 }, String(num), lines, opts));
  return out.join("");
}
const TOP_F = FRONT.h, TOP_B = BACK.h;

// 1 · USAGE EXPLODES: a pin board whose pins shoot up, steeper column by column
export function station1(a, lines) {
  const cx = FRONT_X[0], out = [housing(cx, "front", 1, lines)];
  const PB = { x: cx - 28, y: 76, w: 34, d: 22, r: 2 };
  out.push(S_(slab(PB, TOP_F, 3, 3, 0.5), { tone: "mid" }));
  const z = TOP_F + 3, pins = [];
  for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) {
    const x = PB.x + 4 + c * 6.5, y = PB.y + 4.5 + r * 6.5;
    const hMax = 3 * Math.pow(1.62, c) * (1 + 0.12 * ((c * 7 + r * 3) % 3));
    const t = ease((a * 1.8 - (c * 0.16 + r * 0.05)) / 0.5);
    pins.push({ x, y, h: 0.6 + hMax * t });
  }
  out.push(L_(pins.map((p) => k.ring(p.x, p.y, 2.5, z, P, 16)).join(""), { tone: "lo" }));
  for (const p of pins.sort((u, v) => depthXY(u.x, u.y) - depthXY(v.x, v.y))) {
    out.push(S_(cyl(p.x, p.y, 1.7, z, p.h, 16), { tone: "hi", crease: "lo" }), S_(cyl(p.x, p.y, 2.2, z + p.h, 1, 16), { tone: "hi", crease: "lo" }));
  }
  // a tally wheel on the right: a drum counter with its crank
  const WX = cx + 17, WY = 91, WR = 4.6, WZ = TOP_F + 3 + 5.6;
  out.push(S_(slab({ x: WX - 7, y: WY - 6.5, w: 14, d: 13, r: 1.5 }, TOP_F, 3, 2, 0.5), { tone: "mid" }));
  const turn = a * Math.PI * 1.5;
  out.push(S_(slab({ x: WX - 7, y: WY - 2, w: 2, d: 4, r: 0.5 }, TOP_F + 3, 7, 2), { tone: "mid" }));
  out.push(C_(prismX(circleYZ(WY, WZ, WR, 32), WX - 5, WX + 5, true), { tone: "hi", crease: "lo" }));
  const ribs = Array.from({ length: 10 }, (_, i) => {
    const ang = turn + (i * Math.PI) / 5, nY = Math.cos(ang), nZ = Math.sin(ang);
    const face = nY * VIEW[1] + nZ * VIEW[2];
    return [k.segment([WX - 5, WY + WR * nY, WZ + WR * nZ], [WX + 5, WY + WR * nY, WZ + WR * nZ], P), clamp01(face / 0.5)];
  });
  out.push(k.fadedSvg(ribs, { tone: "lo" }));
  out.push(S_(slab({ x: WX + 5, y: WY - 2, w: 2, d: 4, r: 0.5 }, TOP_F + 3, 7, 2), { tone: "mid" }));
  out.push(C_(prismX(circleYZ(WY, WZ, 1.2, 12), WX + 7, WX + 9.5, true), { tone: "mid" }));
  const ca = turn * 2, hx = WX + 9.5, hz = WZ;
  const tip = [hx + 1.4, WY + 4.4 * Math.cos(ca), hz + 4.4 * Math.sin(ca)];
  out.push(C_(bar([hx, WY, hz], [hx, tip[1], tip[2]], 1.6, 1.4), { tone: "mid" }));
  out.push(C_(prismX(circleYZ(tip[1], tip[2], 1.1, 10), hx + 0.7, hx + 4.4, true), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// 2 · THE METER ARRIVES: a meter that steps flat → session → weekly → pay-as-you-go
export const METER_STOPS = 4;
export function meterAngle(a) {
  const span = 230 * D2R, a0 = -115 * D2R;
  const u = clamp01(a) * (METER_STOPS - 1), i = Math.min(METER_STOPS - 2, Math.floor(u)), f = ease((u - i) * 1.25);
  return a0 + (span * (i + f)) / (METER_STOPS - 1);
}
export function station2(a, lines) {
  const cx = FRONT_X[1], out = [housing(cx, "front", 2, lines)];
  const C = [cx - 9, 87], R = 13.5, z0 = TOP_F, zf = z0 + 9.6;
  out.push(S_(cyl(C[0], C[1], R + 2, z0, 2, 56, 0.4), { tone: "mid" }));
  out.push(S_(cyl(C[0], C[1], R, z0 + 2, 6.6, 56, 0.6), { tone: "mid", inner: L_(k.sideArc(C[0], C[1], R, z0 + 5, P, 32), { tone: "faint" }) }));
  out.push(S_(cyl(C[0], C[1], R - 1.6, z0 + 8.6, 1, 56), { tone: "hi", crease: "lo" }));
  const polar = (ang, r) => [C[0] + Math.sin(ang) * r, C[1] - Math.cos(ang) * r];
  const arcPts = Array.from({ length: 41 }, (_, i) => polar(-115 * D2R + (230 * D2R * i) / 40, R - 4));
  out.push(L_(k.onTop(arcPts, zf, P), { tone: "lo" }));
  const minor = [], major = [];
  for (let i = 0; i <= 12; i++) {
    const ang = -115 * D2R + (230 * D2R * i) / 12, big = i % 4 === 0;
    (big ? major : minor).push(k.lineOnTop(polar(ang, R - 4), polar(ang, R - (big ? 7.4 : 5.8)), zf, P));
  }
  out.push(L_(minor.join(""), { tone: "lo" }), L_(major.join(""), { tone: "hi" }));
  // a filled wedge past the last stop: pay-as-you-go overflow
  const ov = Array.from({ length: 9 }, (_, i) => polar(-115 * D2R + 230 * D2R * (0.82 + (0.18 * i) / 8), R - 4));
  const ovIn = [...ov].reverse().map(([x, y]) => [C[0] + (x - C[0]) * 0.86, C[1] + (y - C[1]) * 0.86]);
  out.push(`<path class="iso-shade" data-shade="0" d="${k.onTop([...ov, ...ovIn], zf, P, true)}"/>`, L_(k.onTop([...ov, ...ovIn], zf, P, true), { tone: "lo" }));
  const ang = meterAngle(a);
  out.push(L_(k.lineOnTop(polar(ang + Math.PI, 3), polar(ang, R - 4.6), zf + 0.3, P), { tone: "hi", free: true }).replace("<path", '<path style="stroke-width:1.6"'));
  out.push(S_(cyl(C[0], C[1], 1.8, zf, 1.2, 16), { tone: "hi", crease: "lo" }));
  // crown and a coin slot box on the right
  out.push(S_(slab({ x: C[0] + R - 0.5, y: C[1] - 2, w: 3.2, d: 4, r: 0.6 }, z0 + 3, 3.4, 2), { tone: "mid" }));
  const SB = { x: cx + 9, y: 78, w: 16, d: 18, r: 2 };
  out.push(S_(slab(SB, z0, 9, 3, 0.6), { tone: "mid", inner: L_(k.sideSeam(SB, z0 + 3, P, 3), { tone: "faint" }) }));
  const slot = { x: SB.x + 3.5, y: SB.y + 8, w: 9, d: 2, r: 1 };
  out.push(`<path class="iso-shade" data-shade="0" d="${k.planOutline(slot, z0 + 9, P, 3)}"/>`, L_(k.planOutline(slot, z0 + 9, P, 3), { tone: "lo" }));
  out.push(screws([[SB.x + 3, SB.y + 3], [SB.x + SB.w - 3, SB.y + SB.d - 3]], z0 + 9));
  return out.join("");
}

// 3 · CAP THE NATIVES: a screw clamp over the track, and the points lever for the switch
export const clampZ = (a) => lerp(T + 19, PUCK_TOP, ease(a));
export function station3(a, sw, lines) {
  const cx = FRONT_X[2], out = [];
  // the switch blade on the deck, its pivot on the outer rail, and the throw rod from the lever box
  const ang = BLADE_ANG * ease(sw);
  const dir = [Math.cos(ang), Math.sin(ang)], nrm = [Math.sin(ang), -Math.cos(ang)];
  const [px, py] = [BLADE_PIVOT[0] + nrm[0] * 1.1, BLADE_PIVOT[1] + nrm[1] * 1.1];
  out.push(C_(obox([px + (dir[0] * BLADE_LEN) / 2, py + (dir[1] * BLADE_LEN) / 2, T + 1.6], [(dir[0] * BLADE_LEN) / 2, (dir[1] * BLADE_LEN) / 2, 0], [nrm[0] * 0.9, nrm[1] * 0.9, 0], [0, 0, 1.6]), { tone: "hi", crease: "lo" }));
  const pin = [px + dir[0] * 12, py + dir[1] * 12];
  out.push(C_(bar([pin[0], pin[1], T + 3.9], [pin[0] + 2, FRONT.y + 2, T + 3.9], 1.6, 1.4), { tone: "mid" }));
  out.push(S_(cyl(pin[0], pin[1], 1.3, T + 3.2, 1.6, 14), { tone: "mid" }), S_(cyl(px, py, 2, T + 3.2, 1.2, 16), { tone: "mid" }), D_([at([px, py, T + 4.4])], { size: 0.45, tone: "hi" }));
  out.push(housing(cx, "front", 3, lines));
  const z0 = TOP_F;
  // points lever on a quadrant, left of the clamp so it never stands in front of the puck
  const LX = cx - 22, LY = 88, lz = z0 + 3;
  out.push(S_(slab({ x: LX - 5, y: LY - 9, w: 10, d: 18, r: 1.5 }, z0, 3, 2, 0.4), { tone: "mid" }));
  const qa = Array.from({ length: 13 }, (_, i) => { const t = (-28 + (56 * i) / 12) * D2R; return [LX, LY + 9 * Math.sin(t), lz + 9 * Math.cos(t)]; });
  out.push(C_(prismX([...qa.map((p) => [p[1], p[2]]), [LY + 4.2, lz], [LY - 4.2, lz]], LX - 2.6, LX - 1.2), { tone: "mid" }));
  const la = (-24 + 50 * ease(sw)) * D2R, len = 19;
  const ltip = [LX, LY + len * Math.sin(la), lz + len * Math.cos(la)];
  out.push(C_(bar([LX, LY, lz], ltip, 1.6, 1.6), { tone: "hi", crease: "lo" }));
  out.push(C_(prismX(circleYZ(ltip[1], ltip[2], 1.5, 14), LX - 2.8, LX + 2.8, true), { tone: "hi", crease: "lo" }));
  out.push(C_(prismX(circleYZ(LY, lz, 1.6, 14), LX - 1.2, LX + 2.4, true), { tone: "mid" }));
  // the clamp: column, arm over the track, collar, screw with its pad and handle
  const CX = cx, CY = 86, pz = clampZ(a), AZ0 = T + 31, AZ1 = AZ0 + 5;
  out.push(S_(cyl(CX, CY, 5.4, z0, 2.4, 28, 0.4), { tone: "mid" }), S_(cyl(CX, CY, 3.2, z0 + 2.4, AZ0 - z0 - 2.4, 24), { tone: "mid", inner: L_(k.sideArc(CX, CY, 3.2, z0 + 9, P, 16), { tone: "faint" }) }));
  const TY = RAD;
  out.push(S_(cyl(CX, TY, 5, pz, 2.4, 28, 0.4), { tone: "hi", crease: "lo" }));
  out.push(S_(cyl(CX, TY, 1.25, pz + 2.4, AZ0 - 3 - pz - 2.4, 16), { tone: "mid", crease: "none" }));
  out.push(S_(cyl(CX, TY, 3.6, AZ0 - 3, 3, 24), { tone: "mid" }));
  out.push(S_(slab({ x: CX - 3, y: TY - 3.5, w: 6, d: CY - TY + 6.5, r: 1 }, AZ0, 5, 2, 0.5), { tone: "mid" }));
  out.push(S_(cyl(CX, TY, 3.8, AZ1, 2.8, 24), { tone: "mid" }));
  const top = pz + 2.4 + 34;
  out.push(S_(cyl(CX, TY, 1.25, AZ1 + 2.8, top - AZ1 - 2.8, 16), { tone: "mid", crease: "none" }));
  out.push(C_(bar([CX - 6, TY, top + 0.8], [CX + 6, TY, top + 0.8], 1.6, 1.6), { tone: "hi", crease: "lo" }));
  out.push(S_(cyl(CX, TY, 1.8, top, 1.6, 14), { tone: "mid" }));
  return out.join("");
}

// 4 · GO PERSONAL: a cabinet beside the right end with a hatch that opens on a phone
export function station4(a, lines) {
  const out = [];
  const CB = { x: 180, y: -24, w: 56, d: 48, r: 3 }, H4 = 24;
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CB, 3), 0, 0.1, P)}" style="filter:blur(5px)"/>`);
  out.push(S_(slab(CB, 0, H4, 3, 1), { tone: "mid", inner: L_(k.sideSeam(CB, 3, P, 3), { tone: "faint" }) }));
  out.push(screws(k.corners(CB, 4.5), H4));
  out.push(plate({ x0: CB.x + 3, x1: CB.x + CB.w - 3, y: CB.y + CB.d, z0: 4.5, z1: H4 - 2.5 }, "4", lines));
  // the hatch opening and what is inside: a personal phone
  const HO = { x: 190, y: -14, w: 34, d: 26, r: 2 };
  out.push(`<path class="iso-shade" data-shade="0" d="${k.planOutline(HO, H4, P, 3)}"/>`, L_(k.planOutline(HO, H4, P, 3), { tone: "lo" }));
  const PH = { x: 198, y: -9, w: 18, d: 16, r: 2.4 };
  out.push(S_(slab(PH, H4 - 1.6, 1.4, 4, 0.3), { tone: "hi", crease: "lo" }), L_(k.planOutline(k.insetPlan(PH, 1.6), H4 - 0.2, P, 4), { tone: "lo" }));
  // the hatch lid, hinged along its back edge, swinging up and away
  const t = ease(a), th = t * 105 * D2R, hy = HO.y, hz = H4 + 0.9;
  const along = [0, Math.cos(th), Math.sin(th)], up = [0, -Math.sin(th), Math.cos(th)];
  const L = HO.d + 2, c = [HO.x + HO.w / 2, hy - 1 + (along[1] * L) / 2, hz + (along[2] * L) / 2];
  out.push(C_(obox([c[0] + up[0] * 0, c[1] + up[1] * 0, c[2] + up[2] * 0], [HO.w / 2 + 1, 0, 0], along.map((v) => (v * L) / 2), up.map((v) => v * 0.9)), { tone: "mid" }));
  const pull = [c[0], hy - 1 + along[1] * (L - 3), hz + along[2] * (L - 3)];
  out.push(C_(obox([pull[0] + up[0] * 1.6, pull[1] + up[1] * 1.6, pull[2] + up[2] * 1.6], [5, 0, 0], along.map((v) => v * 1), up.map((v) => v * 0.7)), { tone: "hi", crease: "lo" }));
  // hinge knuckles
  for (const x of [HO.x + 4, HO.x + HO.w - 8]) out.push(C_(prismX(circleYZ(hy - 1, hz, 1.3, 12), x, x + 4, true), { tone: "mid" }));
  return out.join("");
}

// 5 · PERSONAL ACCOUNTS TRAIN: a recording drum with its pen, and the training toggle
export function station5(a, drum, lines) {
  const cx = BACK_X[0], out = [housing(cx, "back", 5, lines)];
  const z0 = TOP_B, C = [cx - 10, -90], R = 12, zb = z0 + 2, zt = zb + 24;
  out.push(S_(cyl(C[0], C[1], R + 2.4, z0, 2, 48, 0.4), { tone: "mid" }));
  const face = Math.atan2(VIEW[1], VIEW[0]);
  const chart = [zb + 5, zb + 10, zb + 15, zb + 20].map((z) => k.sideArc(C[0], C[1], R, z, P, 32)).join("");
  const ticks = [];
  for (let i = 0; i < 16; i++) {
    const ang = drum + (i * Math.PI) / 8, rel = Math.cos(ang - face);
    if (rel <= 0) continue;
    ticks.push([k.segment([C[0] + R * Math.cos(ang), C[1] + R * Math.sin(ang), zb], [C[0] + R * Math.cos(ang), C[1] + R * Math.sin(ang), zt], P), clamp01(rel / 0.45)]);
  }
  out.push(S_(cyl(C[0], C[1], R, zb, zt - zb, 48), { tone: "hi", crease: "lo", inner: L_(chart, { tone: "faint" }) + k.fadedSvg(ticks, { tone: "faint" }) }));
  out.push(S_(cyl(C[0], C[1], 3, zt, 2, 20), { tone: "mid" }));
  // the trace: written where the pen has been, round the visible half to the limb
  const PA = face + 0.55;
  const traceZ = (local) => zb + 12 + 5.5 * Math.sin(local * 3) + 2.2 * Math.sin(local * 7 + 1);
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const ang = PA + (i / 40) * (face + Math.PI / 2 - PA), local = ang - drum;
    pts.push(at([C[0] + R * Math.cos(ang), C[1] + R * Math.sin(ang), traceZ(local)]));
  }
  out.push(L_(k.pathOf(pts), { tone: "hi" }));
  const pen = [C[0] + R * Math.cos(PA), C[1] + R * Math.sin(PA), traceZ(PA - drum)];
  const POST = [cx + 18, -82];
  out.push(S_(cyl(POST[0], POST[1], 2.6, z0, 1.2, 16), { tone: "mid" }), S_(cyl(POST[0], POST[1], 1.6, z0 + 1.2, 18, 16), { tone: "mid" }));
  const piv = [POST[0], POST[1], z0 + 19.2];
  out.push(C_(bar(piv, [pen[0] + 0.8, pen[1] + 0.3, pen[2] + 1.2], 1.1, 0.9), { tone: "mid" }));
  out.push(S_(cyl(POST[0], POST[1], 2.2, z0 + 18.2, 2.2, 16), { tone: "mid" }));
  out.push(D_([at(pen)], { size: 0.9, tone: "hi" }));
  // the training toggle: off leans back, on leans forward
  const TG = [cx + 20, -96];
  out.push(S_(slab({ x: TG[0] - 4, y: TG[1] - 5, w: 8, d: 10, r: 1 }, z0, 2, 2, 0.4), { tone: "mid" }));
  const ta = (-30 + 60 * ease(a)) * D2R;
  out.push(C_(bar([TG[0], TG[1], z0 + 2], [TG[0], TG[1] + 9 * Math.sin(ta), z0 + 2 + 9 * Math.cos(ta)], 1.4, 1.4), { tone: "hi", crease: "lo" }));
  out.push(S_(cyl(TG[0], TG[1], 1.8, z0 + 2, 1.2, 14), { tone: "mid" }));
  return out.join("");
}

// 6 · INTENT → ROADMAP: a sorting tray of 30 compartments that fills into a map, densest in the middle
export const DENSITY = [
  [1, 1, 2, 2, 1, 1],
  [1, 2, 4, 5, 3, 1],
  [2, 4, 8, 9, 5, 2],
  [1, 3, 7, 8, 4, 2],
  [1, 1, 3, 4, 2, 1],
];
export function station6(a, lines) {
  const cx = BACK_X[1], out = [housing(cx, "back", 6, lines)];
  const z0 = TOP_B, TR = { x: cx - 27, y: -103, w: 54, d: 28, r: 2 };
  const hx = cx - 22 + 44 * ease(a);
  out.push(S_(slab({ x: cx - 30, y: -105.8, w: 60, d: 2.4, r: 0.6 }, z0, 14, 2, 0.3), { tone: "mid" }));
  // the head's guide slot along the rail face: a closed slot, so it has no loose ends
  const slotPts = [[cx - 26, z0 + 9.4], [cx + 26, z0 + 9.4], [cx + 26, z0 + 11.2], [cx - 26, z0 + 11.2]].map(([x, z]) => at([x, -103.4, z]));
  out.push(`<path class="iso-shade" data-shade="0" d="${k.pathOf(slotPts, true)}"/>`, L_(k.pathOf(slotPts, true), { tone: "lo" }));
  out.push(screws([[cx - 28, -104.6], [cx + 28, -104.6]], z0 + 14));
  out.push(S_(slab({ x: hx - 4, y: -107, w: 8, d: 5, r: 1 }, z0 + 14, 4, 2, 0.4), { tone: "mid" }));
  out.push(S_(slab(TR, z0, 3, 3, 0.5), { tone: "mid" }));
  const IN = k.insetPlan(TR, 2), zt = z0 + 3;
  out.push(L_(k.planOutline(IN, zt, P, 3), { tone: "lo" }));
  const cw = IN.w / 6, ch = IN.d / 5, grid = [];
  for (let i = 1; i < 6; i++) grid.push(k.lineOnTop([IN.x + i * cw, IN.y], [IN.x + i * cw, IN.y + IN.d], zt, P));
  for (let j = 1; j < 5; j++) grid.push(k.lineOnTop([IN.x, IN.y + j * ch], [IN.x + IN.w, IN.y + j * ch], zt, P));
  out.push(L_(grid.join(""), { tone: "faint" }));
  // the sorter head on a rail at the back, travelling across as the map fills
  const blocks = [];
  DENSITY.forEach((row, j) => row.forEach((v, i) => {
    const order = (9 - v) / 9 * 0.6 + i * 0.03;
    const t = ease((a * 1.7 - order) / 0.4);
    if (t <= 0.02) return;
    blocks.push({ x: IN.x + i * cw + 1, y: IN.y + j * ch + 0.9, w: cw - 2, d: ch - 1.8, h: (0.8 + v * 1.25) * t });
  }));
  for (const b of blocks.sort((u, v) => depthXY(u.x + u.w / 2, u.y + u.d / 2) - depthXY(v.x + v.w / 2, v.y + v.d / 2)))
    out.push(S_(slab({ x: b.x, y: b.y, w: b.w, d: b.d, r: 0.4 }, zt, b.h, 2), { tone: "hi", crease: "lo" }));
  out.push(C_(bar([hx, -104.5, z0 + 16], [hx, -92.5, z0 + 20.5], 1.8, 1.4), { tone: "mid" }));
  out.push(C_(cone(hx, -91.5, z0 + 22, 2, z0 + 17.6, 16), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// 7 · THE SPIKE EATS THE 80%: a press whose spike comes down on the dense middle of a map
export const ramTip = (a) => lerp(TOP_B + 24, TOP_B + 6.9, ease(a));
export function station7(a, lines) {
  const cx = BACK_X[2], out = [housing(cx, "back", 7, lines)];
  const z0 = TOP_B, AN = { x: cx - 15, y: -98, w: 30, d: 20, r: 1.5 };
  // the column behind, the anvil and its map
  const COL = [cx, -101], HEAD_Z = z0 + 42;
  out.push(S_(cyl(COL[0], COL[1], 6.5, z0, 2.4, 28, 0.4), { tone: "mid" }), S_(cyl(COL[0], COL[1], 4.2, z0 + 2.4, HEAD_Z - z0 - 2.4, 28), { tone: "mid", inner: L_(k.sideArc(COL[0], COL[1], 4.2, z0 + 20, P, 16), { tone: "faint" }) }));
  out.push(S_(slab(AN, z0, 5.6, 3, 0.6), { tone: "mid", inner: L_(k.sideSeam(AN, z0 + 2, P, 3), { tone: "faint" }) }));
  const MP = { x: AN.x + 2.5, y: AN.y + 2.5, w: AN.w - 5, d: AN.d - 5, r: 0.8 }, zm = z0 + 5.6;
  out.push(S_(slab(MP, zm, 0.8, 2), { tone: "hi", crease: "lo" }));
  const gx = [], cwm = MP.w / 5, chm = MP.d / 3;
  for (let i = 1; i < 5; i++) gx.push(k.lineOnTop([MP.x + i * cwm, MP.y], [MP.x + i * cwm, MP.y + MP.d], zm + 0.8, P));
  for (let j = 1; j < 3; j++) gx.push(k.lineOnTop([MP.x, MP.y + j * chm], [MP.x + MP.w, MP.y + j * chm], zm + 0.8, P));
  out.push(L_(gx.join(""), { tone: "faint" }));
  // the dense middle cells, shaded
  const dense = [[1, 1], [2, 1], [3, 1], [2, 0], [2, 2]].map(([i, j]) => k.planOutline({ x: MP.x + i * cwm + 0.6, y: MP.y + j * chm + 0.6, w: cwm - 1.2, d: chm - 1.2, r: 0.3 }, zm + 0.8, P, 2)).join("");
  out.push(`<path class="iso-shade" data-shade="0" d="${dense}"/>`, L_(dense, { tone: "lo" }));
  // the ram: its visible run from the spike's collar up to the head, then the spike
  const tip = ramTip(a), RX = cx, RY = MP.y + 1.5 * chm;
  const ARM = { x: cx - 5, y: -104, w: 10, d: RY - -104 + 6, r: 1.5 };
  out.push(C_(cone(RX, RY, tip + 7, 3.2, tip, 24), { tone: "hi", crease: "lo" }));
  out.push(S_(cyl(RX, RY, 3.6, tip + 7, 2.2, 24), { tone: "mid" }));
  out.push(S_(cyl(RX, RY, 2.6, tip + 9.2, HEAD_Z - tip - 9.2, 20), { tone: "mid", crease: "none", inner: L_(k.sideArc(RX, RY, 2.6, tip + 13, P, 12), { tone: "faint" }) }));
  // the head and its cylinder
  out.push(S_(slab(ARM, HEAD_Z, 7, 3, 0.6), { tone: "mid", inner: L_(k.sideSeam(ARM, HEAD_Z + 3.5, P, 3), { tone: "faint" }) }));
  out.push(screws([[cx, -100.5]], HEAD_Z + 7));
  out.push(S_(cyl(RX, RY, 6.4, HEAD_Z + 7, 16, 32, 0.6), { tone: "mid", inner: L_(k.sideArc(RX, RY, 6.4, HEAD_Z + 12, P, 24) + k.sideArc(RX, RY, 6.4, HEAD_Z + 18, P, 24), { tone: "faint" }) }));
  out.push(S_(cyl(RX, RY, 7.2, HEAD_Z + 23, 2, 32, 0.4), { tone: "mid" }));
  out.push(S_(cyl(RX + 3.4, RY + 1.2, 1.2, HEAD_Z + 25, 3.4, 12), { tone: "mid" }));
  return out.join("");
}

// ---------- the conveyor's control box, front right of the bench ----------
export function controls() {
  const CB = { x: 148, y: 76, w: 46, d: 28, r: 3 }, h = 9, out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CB, 3), 0, 0.1, P)}" style="filter:blur(4px)"/>`);
  out.push(S_(slab(CB, 0, h, 3, 0.8), { tone: "mid", inner: L_(k.sideSeam(CB, 3, P, 3), { tone: "faint" }) }));
  out.push(screws(k.corners(CB, 3.5), h));
  // the emergency stop: a guard ring and a mushroom head
  const E = [CB.x + 13, CB.y + 14];
  out.push(S_(cyl(E[0], E[1], 7.4, h, 1.6, 40, 0.3), { tone: "mid" }));
  out.push(S_(cyl(E[0], E[1], 3, h + 1.6, 2.4, 24), { tone: "mid" }));
  out.push(S_(cyl(E[0], E[1], 5.6, h + 4, 2.6, 40, 0.6), { tone: "hi", crease: "lo" }));
  // start button and a run lamp
  out.push(S_(cyl(CB.x + 30, CB.y + 9, 3.4, h, 1.4, 24), { tone: "mid" }), S_(cyl(CB.x + 30, CB.y + 9, 2.4, h + 1.4, 1.2, 20), { tone: "hi", crease: "lo" }));
  out.push(S_(cyl(CB.x + 38, CB.y + 9, 2.2, h, 2.4, 20), { tone: "mid" }), S_(cyl(CB.x + 38, CB.y + 9, 1.4, h + 2.4, 0.8, 16), { tone: "hi", crease: "lo" }));
  // label strip with rule lines for the printed legend
  const LB = { x: CB.x + 25, y: CB.y + 15, w: 17, d: 9, r: 0.8 };
  out.push(S_(slab(LB, h, 0.5, 2), { tone: "mid", crease: "none" }));
  [[11, 3.2], [8, 6]].forEach(([len, dy]) => out.push(L_(k.lineOnTop([LB.x + 3, LB.y + dy], [LB.x + 3 + len, LB.y + dy], h + 0.5, P), { tone: "lo", free: true })));
  return out.join("");
}

// ---------- anchors (for pointing at a station) ----------
export const ANCHORS = [
  ...FRONT_X.map((x) => [x, 88, TOP_F]),
  [208, 0, 24],
  ...BACK_X.map((x) => [x, -89, TOP_B]),
  [PEN.x + PEN.w / 2, PEN.y + PEN.d / 2, T + 10],
].map((p) => at(p));

// ---------- the whole figure for one pose, in painter's order ----------
export const penDepths = [depthXY(PEN.x + PEN.w / 2, PEN.y + 4, T), depthXY(PEN.x + PEN.w / 2, PEN.y + PEN.d, T)];
export function groups(pose, steps) {
  const L = (i) => steps[i].lines;
  const pd = puckDepth(pose);
  const mid = [
    { id: "penBack", depth: penDepths[0], svg: penBack() },
    { id: "penFront", depth: penDepths[1], svg: penFront() },
  ];
  const at_ = mid.findIndex((m) => m.depth > pd);
  const puckG = { id: "puck", svg: puck(), transform: puckMove(pose) };
  const midOrder = at_ < 0 ? [...mid, puckG] : [...mid.slice(0, at_), puckG, ...mid.slice(at_)];
  const dead = pose.dim > 0.5;
  return [
    { id: "bench", svg: bench() },
    { id: "st7", svg: station7(pose.act[6], L(6)), dead },
    { id: "drive", svg: drive() },
    { id: "st6", svg: station6(pose.act[5], L(5)), dead },
    { id: "st5", svg: station5(pose.act[4], pose.drum, L(4)), dead },
    { id: "deck", svg: deck() },
    { id: "cover", svg: cover() },
    { id: "wheel", svg: wheel(pose.phase) },
    { id: "penFloor", svg: penFloor() },
    { id: "slots", svg: slots() },
    { id: "chain", svg: chain(pose.phase) },
    { id: "rails", svg: rails() },
    { id: "mid", children: midOrder },
    { id: "st1", svg: station1(pose.act[0], L(0)) },
    { id: "st2", svg: station2(pose.act[1], L(1)) },
    { id: "st3", svg: station3(pose.act[2], pose.sw, L(2)) },
    { id: "st4", svg: station4(pose.act[3], L(3)), dead },
    { id: "controls", svg: controls() },
  ];
}
export const DEAD_CSS = `.iso [data-dead]{--anatomy-hi:var(--anatomy-lo);--anatomy-mid:var(--anatomy-faint);--anatomy-lo:var(--anatomy-faint);--anatomy-dot:#c4c4bc}`;
export function groupsSvg(list) {
  const one = (g) => `<g data-part="${g.id}"${g.dead ? " data-dead=\"\"" : ""}${g.transform ? ` transform="${g.transform}"` : ""}>${g.children ? g.children.map(one).join("") : g.svg}</g>`;
  return `<style>${DEAD_CSS}</style>` + list.map(one).join("");
}
// the resting pose of each state (0..6 = steps 1..7, 7 = the break)
export function restPose(i) {
  const act = [0, 0, 0, 0, 0, 0, 0];
  if (i < 7) act[i] = 1;
  return { s: i < 7 ? S[i] : S[2], w: i < 7 ? null : SPUR, act, sw: i < 7 ? 0 : 1, dim: i < 7 ? 0 : 1, phase: i < 7 ? S[i] : S[2] + SPUR, drum: i === 4 ? 2.2 : 0.6 };
}
