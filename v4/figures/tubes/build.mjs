// F11 · The chain of command — an Anatomy figure for the v4 talk.
// A pneumatic-tube message system on a stepped stand. The AI lead's desk (front left) has a send console with a
// lever and a capsule rack; one riser climbs to a diverter manifold whose shuttle picks one of three tubes, and the
// tubes run up the steps to three offices — CFO, CIO, CEO — each with a receiver, a bin and a card holder.
// Send the capsule (the one red thing) to an office: the shuttle switches, the capsule rides that tube, drops into the
// bin, and the office's card rises with the one sentence it can sign. "All three" raises every card.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../_anatomy/kit/iso-kit.mjs";
import { kitScript } from "../_anatomy/inline-kit.mjs";
import { PAPER_CSS } from "../_anatomy/paper.mjs";
import { STAGE_CSS } from "../_anatomy/stage.mjs";
import { EMBED_CSS, EMBED_JS, writeSnapshot } from "../_anatomy/embed.mjs";
// lathe.mjs and tube.mjs are vendored from the Anatomy skill into ./vendor (build time only; the page never loads them)
import * as G from "./vendor/lathe.mjs";
import { tubePieces, tubeSvg } from "./vendor/tube.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 476;
const AZIMUTH = 30;

// ---------- world plan (x, y on the floor, z up; the chain climbs toward −y) ----------
const FLOOR = [16, 52, 88];               // office floors: each office one step up the chain
const BOOTH_D = 116;
const Y = [0, -BOOTH_D, -2 * BOOTH_D];      // +y edge of each office (offices are BOOTH_D deep along y)
const WALL_H = 48;
const TX = -44;                           // every tube runs at this x
const TR = 3.6;                           // tube radius
const OUT = [84, 116, 148];               // diverter outlet heights = the run height of each tube
const DROP = Y.map((y) => y - 13);        // where each tube drops into its receiver
const REC_H = 26;
const rec = (i) => ({ x: -51, y: Y[i] - 20, w: 14, d: 14, r: 1.2 });
const CARD_SIZE = 7.2;                    // card type: the longest line (19 characters) fills the card
const CARD_Z = 12, CARD_H = Math.round(6.6 + 2.02 * CARD_SIZE), CARD_DROP = CARD_Z + CARD_H + 3;
const card = (i) => ({ x: -1, y: Y[i] - BOOTH_D + 5, w: 2, d: BOOTH_D - 28, r: 0.3 });
const DIV = { x: -56, y: 30, w: 24, d: 22, r: 1.5 };
const DIV_Z0 = 64, DIV_Z1 = 158;
const INLET_Z = 74, IN_Y = 41;
const SLOT = { y0: 46, y1: 50, z0: 79, z1: 153 };
const SHUT = { x: -32, y: 45.2, w: 3, d: 5.6, r: 0.6 }; // the diverter shuttle (built at outlet 0)
const DESK = { x: 18, y: 8, w: 60, d: 78, r: 2 };
const DESK_Z = 30, DESK_T = 3, DESK_TOP = DESK_Z + DESK_T;
const CONSOLE = { x: 20, y: 32, w: 18, d: 18, r: 1.5 };
const CON_H = 6, CON_TOP = DESK_TOP + CON_H;
const CRADLE = [29, IN_Y];
const CAP_L = 13, CAP_R = 2.8;            // the capsule
const BELL_Z = 54, RISER_Z = 59;
const LEVER = { pivot: [CONSOLE.x + CONSOLE.w + 0.3, CONSOLE.y + 4, DESK_TOP + 3], len: 10, rest: 0.35, pulled: 1.75 };
const BEND_RISER = 7, BEND_TUBE = 9;
const RACK = { x: 24, y: 58, w: 12, d: 18, r: 1.2 };
const BASE_H = 12, FOOT_H = 5;
const YB = -3 * BOOTH_D - 6;
const BASE_RING_PTS = [[-64, YB], [14, YB], [14, 2], [96, 2], [96, 92], [-64, 92]];
const LABEL = { x: 82, y: 22, w: 10, d: 52, r: 1.4 };

const fitPoints = [
  ...BASE_RING_PTS.flatMap(([x, y]) => [[x, y, -BASE_H - FOOT_H], [x, y, 0]]),
  [-58, Y[2] - BOOTH_D, FLOOR[2] + WALL_H], [-58, Y[2], FLOOR[2] + WALL_H], [TX, DROP[2], OUT[2] + 6], [DIV.x, DIV.y + DIV.d, DIV_Z1 + 12],
];
const P = k.fitProjection(fitPoints, WIDTH, HEIGHT, { pad: 16, azimuth: AZIMUTH });
const KS = G.scaleOf(P);
const V = G.viewOf(P);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const slab = (plan, z, h, tone = "mid", { steps = 3, bevel = 0.5, inner = "", crease } = {}) =>
  S(k.slabOf(plan, z, h, P, steps, bevel), { tone, inner, ...(crease ? { crease } : {}) });
const depth = (p) => k.depthOf(p, P);
const poly = (pts, closed = true) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(2)).join(" ")).join("L") + (closed ? "Z" : "");
// a closed polygon on the face x = const (the faces that look at the viewer from the front right)
const faceRect = (x, y0, y1, z0, z1) => poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);
const textOnX = (x, y, z, text, { size, tone = "hi", anchor = "middle", cls = "" }) =>
  `<text class="iso-face-text${cls ? " " + cls : ""}" data-tone="${tone}" transform="${k.sideMatrix([x, y], z, P, "right")}" font-size="${size}" text-anchor="${anchor}">${text}</text>`;

function roundRing(points, r, steps = 4) {
  const out = [];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[(i + n - 1) % n], b = points[i], c = points[(i + 1) % n];
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
    const lu = Math.hypot(...u), lv = Math.hypot(...v);
    const p0 = [b[0] + (u[0] / lu) * r, b[1] + (u[1] / lu) * r], p1 = [b[0] + (v[0] / lv) * r, b[1] + (v[1] / lv) * r];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const q0 = [p0[0] + (b[0] - p0[0]) * t, p0[1] + (b[1] - p0[1]) * t], q1 = [b[0] + (p1[0] - b[0]) * t, b[1] + (p1[1] - b[1]) * t];
      out.push([q0[0] + (q1[0] - q0[0]) * t, q0[1] + (q1[1] - q0[1]) * t]);
    }
  }
  return out;
}

// ---------- the capsule (shared with the page: screen-space runs → markup) ----------
// runs: [{ pts: [[x, y], …], a: true end at the start?, b: true end at the end? }]; w: screen width of the capsule.
function capsuleMarkup(runs, w) {
  const LX = -0.55, LY = -0.835;
  const f = (v) => v.toFixed(2);
  const edge = [], body = [], shine = [], dotsE = [], dotsB = [];
  for (const run of runs) {
    const pts = run.pts;
    if (pts.length < 2) continue;
    const d = "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join("L");
    edge.push(d);
    body.push(d);
    const ends = [];
    if (run.a) ends.push(pts[0]);
    if (run.b) ends.push(pts[pts.length - 1]);
    for (const p of ends) {
      dotsE.push(`<circle class="cap-dot-edge" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(w / 2 + 0.6)}"/>`);
      dotsB.push(`<circle class="cap-dot" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(w / 2)}"/>`);
    }
    // the shine: offset toward the light, trimmed off the domes
    const off = w * 0.24;
    const sh = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)];
      let tx = q[0] - p[0], ty = q[1] - p[1];
      const len = Math.hypot(tx, ty) || 1;
      tx /= len; ty /= len;
      let nx = -ty, ny = tx;
      if (nx * LX + ny * LY < 0) { nx = -nx; ny = -ny; }
      sh.push([pts[i][0] + nx * off, pts[i][1] + ny * off]);
    }
    let lo = 0, hi = sh.length - 1;
    const trim = (from, dir) => { let i = from, walked = 0; while (i + dir >= 0 && i + dir < sh.length && walked < w * 0.45) { walked += Math.hypot(sh[i + dir][0] - sh[i][0], sh[i + dir][1] - sh[i][1]); i += dir; } return i; };
    if (run.a) lo = trim(0, 1);
    if (run.b) hi = trim(sh.length - 1, -1);
    if (hi - lo >= 1) shine.push("M" + sh.slice(lo, hi + 1).map((p) => f(p[0]) + " " + f(p[1])).join("L"));
  }
  if (!edge.length) return "";
  return dotsE.join("") + `<path class="cap-edge" style="stroke-width:${f(w + 1.2)}" d="${edge.join("")}"/>` + dotsB.join("") + `<path class="cap-body" style="stroke-width:${f(w)}" d="${body.join("")}"/>` + (shine.length ? `<path class="cap-shine" style="stroke-width:${f(w * 0.22)}" d="${shine.join("")}"/>` : "");
}
const CAP_W = 2 * CAP_R * KS;

// ---------- occluders the capsule can go inside or behind ----------
const BOXES = [
  { min: [DIV.x, DIV.y, DIV_Z0], max: [DIV.x + DIV.w, DIV.y + DIV.d, DIV_Z1] },
  { min: [CONSOLE.x, CONSOLE.y, DESK_TOP], max: [CONSOLE.x + CONSOLE.w, CONSOLE.y + CONSOLE.d, CON_TOP] },
  ...[0, 1, 2].map((i) => ({ min: [rec(i).x, rec(i).y, FLOOR[i]], max: [rec(i).x + rec(i).w, rec(i).y + rec(i).d, FLOOR[i] + REC_H] })),
];
function hiddenAt(p) {
  for (const { min, max } of BOXES) {
    if (p.every((v, i) => v > min[i] + 1e-6 && v < max[i] - 1e-6)) return true;
    let t0 = 1e-6, t1 = 1e9, hit = true;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(V[i]) < 1e-9) { if (p[i] < min[i] || p[i] > max[i]) { hit = false; break; } continue; }
      let a = (min[i] - p[i]) / V[i], b = (max[i] - p[i]) / V[i];
      if (a > b) [a, b] = [b, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
      if (t0 > t1) { hit = false; break; }
    }
    if (hit) return true;
  }
  return false;
}

// ---------- routes ----------
const riserLine = G.fillet([[CRADLE[0], CRADLE[1], RISER_Z], [CRADLE[0], CRADLE[1], INLET_Z], [DIV.x + DIV.w, IN_Y, INLET_Z]], BEND_RISER, 10);
const tubeLine = (i) => G.fillet([[TX, DIV.y, OUT[i]], [TX, DROP[i], OUT[i]], [TX, DROP[i], FLOOR[i] + REC_H]], BEND_TUBE, 12);
const TUBES = [0, 1, 2].map(tubeLine);
const SPACING = 0.5;
const CAP_ROUTES = [0, 1, 2].map((i) => {
  const a = G.fillet([[CRADLE[0], CRADLE[1], CON_TOP + 1.2], [CRADLE[0], CRADLE[1], INLET_Z], [TX, IN_Y, INLET_Z]], BEND_RISER, 10);
  const pts = [...a, [TX, IN_Y, OUT[i]], ...TUBES[i], [TX, DROP[i], FLOOR[i] + 10]];
  const dense = G.resample(pts, SPACING);
  return { scr: dense.map((p) => at(p).map((v) => Math.round(v * 100) / 100)), hid: dense.map((p) => (hiddenAt(p) ? 1 : 0)), step: G.pathLength(pts) / (dense.length - 1) };
});
const HOME_S = CAP_L / 2;
const endS = (r) => (CAP_ROUTES[r].scr.length - 1) * CAP_ROUTES[r].step - CAP_L / 2 - 0.5;

// the visible runs of a capsule centred at s on route r
function capsuleRuns(route, s) {
  const { scr, hid, step } = route;
  const a = s - CAP_L / 2, b = s + CAP_L / 2;
  const n = scr.length;
  const sample = (u) => {
    const x = Math.max(0, Math.min(n - 1, u / step));
    const i = Math.min(n - 2, Math.floor(x)), t = x - i;
    return [scr[i][0] + (scr[i + 1][0] - scr[i][0]) * t, scr[i][1] + (scr[i + 1][1] - scr[i][1]) * t];
  };
  const hidden = (u) => hid[Math.max(0, Math.min(n - 1, Math.round(u / step)))] === 1;
  const runs = [];
  let cur = null;
  const N = Math.max(4, Math.ceil(CAP_L / step));
  for (let j = 0; j <= N; j++) {
    const u = a + ((b - a) * j) / N;
    if (hidden(u)) { if (cur) { cur.b = false; runs.push(cur); cur = null; } continue; }
    if (!cur) cur = { pts: [], a: j === 0, b: true };
    cur.pts.push(sample(u));
  }
  if (cur) runs.push(cur);
  return runs;
}

// a capsule lying in a bin: a straight axis, both ends true
const binAxis = (i) => [at([-33.4, Y[i] - 19.2, FLOOR[i] + 6.8]), at([-33.4, Y[i] - 6.2, FLOOR[i] + 6.8])];
const binRuns = (i) => {
  const [p, q] = binAxis(i);
  return [{ pts: Array.from({ length: 9 }, (_, j) => [p[0] + ((q[0] - p[0]) * j) / 8, p[1] + ((q[1] - p[1]) * j) / 8]), a: true, b: true }];
};

// ---------- the bench ----------
const BASE_RING = roundRing(BASE_RING_PTS, 8, 4);
function bench() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -64, y: YB, w: 78, d: 92 - YB, r: 8 }, -BASE_H - FOOT_H, BASE_H, P)}"/>`);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: 14, y: 2, w: 82, d: 90, r: 8 }, -BASE_H - FOOT_H, BASE_H, P)}"/>`);
  const feet = [[-54, YB + 10], [4, YB + 10], [-54, YB / 2], [4, YB / 2], [-54, 82], [86, 82], [86, 12]];
  for (const [x, y] of feet.sort((a, b) => depth([a[0], a[1], 0]) - depth([b[0], b[1], 0]))) {
    out.push(S(k.cylinder(x, y, 7, -BASE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.extrude(BASE_RING, -BASE_H, BASE_H, P, { convex: false }), { tone: "lo", inner: L(k.ringSeam(BASE_RING, -BASE_H / 2, P), { tone: "faint" }) }));
  // groove inset round the top
  const inset = roundRing([[-59, YB + 5], [9, YB + 5], [9, -3], [91, -3], [91, 87], [-59, 87]], 5, 4);
  out.push(L(k.onTop(inset, 0, P, true), { tone: "faint" }));
  const screws = [[-55, YB + 9], [5, YB + 9], [87, 6], [87, 83], [-55, 83]];
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // label plate: three rule lines that stand for printed text
  out.push(S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "mid", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P, 3), { tone: "faint" }));
  [[34, 3.4], [26, 5.6], [30, 7.8]].forEach(([len, dx]) => out.push(L(k.lineOnTop([LABEL.x + dx, LABEL.y + LABEL.d - 6], [LABEL.x + dx, LABEL.y + LABEL.d - 6 - len], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + 5, LABEL.y + 3.4, 0.8]), at([LABEL.x + 5, LABEL.y + LABEL.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ---------- an office ----------
const POSTS = [
  { booth: 0, y: -58, tubes: [1, 2] },
  { booth: 1, y: -BOOTH_D - 58, tubes: [2] },
];
const CLAMP_R = TR * 1.35, CLAMP_T = 2.4;

function office(i, state) {
  const out = [];
  const F = FLOOR[i], y0 = Y[i];
  const plinth = { x: -58, y: y0 - BOOTH_D, w: 64, d: BOOTH_D, r: 1.2 };
  // the step: a plinth whose height is the office's place in the chain
  const seams = [];
  for (let z = 18; z < F - 15; z += 18) seams.push(L(k.sideSeam(plinth, z, P, 3), { tone: "faint" }));
  out.push(slab(plinth, 0, F, "mid", { steps: 3, bevel: 0.6, inner: seams.join("") }));
  // nameplate on the step's face
  const plate = { x: 6, y: y0 - 88, w: 1.2, d: 40, r: 0.3 };
  out.push(slab(plate, F - 13, 11, "mid", { steps: 2, bevel: 0.3 }));
  out.push(D([at([7.2, y0 - 85, F - 7.5]), at([7.2, y0 - 51, F - 7.5])], { size: 0.45 }));
  out.push(textOnX(7.25, y0 - 68, F - 10.3, M.OFFICES[i].id, { size: 8, cls: "plate-text" }));
  // back wall with a framed board on it
  const wall = { x: -58, y: y0 - BOOTH_D, w: 6, d: BOOTH_D, r: 0.6 };
  out.push(slab(wall, F, WALL_H, "mid", { steps: 2, bevel: 0.4, inner: L(k.sideSeam(wall, F + 3, P, 2), { tone: "faint" }) }));
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-2)" d="${faceRect(-52, y0 - 104, y0 - 62, F + 24, F + 42)}"/>`);
  out.push(L(faceRect(-52, y0 - 104, y0 - 62, F + 24, F + 42), { tone: "lo" }));
  out.push(L(faceRect(-52, y0 - 101.5, y0 - 64.5, F + 26.2, F + 39.8), { tone: "faint" }));
  if (i === 2) {
    const end = { x: -58, y: y0 - BOOTH_D, w: 44, d: 4, r: 0.6 };
    out.push(slab(end, F, WALL_H, "mid", { steps: 2, bevel: 0.4 }));
  }
  // tube posts standing on this wall
  for (const post of POSTS.filter((p) => p.booth === i)) {
    const top = OUT[Math.max(...post.tubes)] - CLAMP_R;
    const plan = { x: -56.5, y: post.y - CLAMP_T / 2, w: 3, d: CLAMP_T, r: 0.3 };
    out.push(slab({ x: -57.2, y: post.y - 2.6, w: 4.4, d: 5.2, r: 0.4 }, F + WALL_H, 1.2, "mid", { steps: 2 }));
    out.push(slab(plan, F + WALL_H + 1.2, top - F - WALL_H - 1.2, "mid", { steps: 2, bevel: 0.2 }));
    for (const t of post.tubes) {
      const armTop = OUT[t] - CLAMP_R;
      out.push(slab({ x: -56.5, y: post.y - CLAMP_T / 2, w: 12.5, d: CLAMP_T, r: 0.3 }, armTop - 2.6, 2.6, "mid", { steps: 2, bevel: 0.2 }));
    }
  }
  // the receiver, its bin, and the capsule if one was delivered here
  const R = rec(i);
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(R, 1), F, 0.1, P)}" style="filter:blur(2px)"/>`);
  out.push(slab(R, F, REC_H, "hi", { steps: 3, bevel: 0.5, inner: L(k.sideSeam(R, F + REC_H - 5, P, 3), { tone: "faint" }) }));
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-0)" d="${faceRect(R.x + R.w, y0 - 18, y0 - 8, F + 6, F + 15)}"/>`);
  out.push(L(faceRect(R.x + R.w, y0 - 18, y0 - 8, F + 6, F + 15), { tone: "mid" }));
  out.push(D([at([R.x + R.w, y0 - 18.6, F + 20]), at([R.x + R.w, y0 - 7.4, F + 20])], { size: 0.45 }));
  out.push(slab({ x: R.x + R.w, y: y0 - 21, w: 7, d: 16.5, r: 0.8 }, F, 4, "mid", { steps: 2, bevel: 0.3 }));
  out.push(slab({ x: R.x + R.w + 6, y: y0 - 21, w: 1.2, d: 16.5, r: 0.3 }, F + 4, 2, "mid", { steps: 2 }));
  out.push(`<g data-part="bin-${i}" style="opacity:${state.bins[i]}">${capsuleMarkup(binRuns(i), CAP_W)}</g>`);
  // the card holder: a slot in the floor, two posts, and the card that rises between them
  const C = card(i);
  out.push(L(k.planOutline({ x: -1.6, y: C.y - 0.5, w: 3.2, d: C.d + 1, r: 0.6 }, F, P, 2), { tone: "lo" }));
  const holderPost = (y) => slab({ x: -2, y, w: 4, d: 2.5, r: 0.4 }, F, CARD_Z + CARD_H + 4, "mid", { steps: 2, bevel: 0.3 });
  out.push(holderPost(C.y - 2.5));
  const clip = [[1, C.y - 4, F], [1, C.y + C.d + 4, F]].map(at);
  const clipD = `M${clip[0][0]} ${clip[0][1]}L${clip[1][0]} ${clip[1][1]}L${clip[1][0]} ${clip[1][1] - 400}L${clip[0][0]} ${clip[0][1] - 400}Z`;
  out.push(`<clipPath id="tb-card-${i}"><path d="${clipD}"/></clipPath>`);
  out.push(`<g clip-path="url(#tb-card-${i})"><g data-part="card-${i}" transform="${k.translateAlong(P, [0, 0, (state.cards[i] - 1) * CARD_DROP])}">${cardSvg(i)}</g></g>`);
  out.push(holderPost(C.y + C.d));
  out.push(D([at([0, C.y - 1.25, F + CARD_Z + CARD_H + 4]), at([0, C.y + C.d + 1.25, F + CARD_Z + CARD_H + 4])], { size: 0.45 }));
  return out.join("");
}

function cardSvg(i) {
  const F = FLOOR[i], C = card(i);
  const z0 = F + CARD_Z, z1 = z0 + CARD_H;
  const out = [];
  out.push(S(k.slabOf(C, z0, CARD_H, P, 2), { tone: "hi", crease: "lo" }));
  out.push(`<path class="card-face" d="${faceRect(C.x + C.w, C.y + 0.3, C.y + C.d - 0.3, z0, z1)}"/>`);
  out.push(L(faceRect(C.x + C.w, C.y + 1.8, C.y + C.d - 1.8, z0 + 1.5, z1 - 1.5), { tone: "faint" }));
  const size = CARD_SIZE;
  const [l1, l2] = M.OFFICES[i].card;
  const mid = C.y + C.d / 2;
  out.push(textOnX(C.x + C.w + 0.02, mid, z1 - 3.4 - size * 0.72, l1, { size, cls: "card-text" }));
  out.push(textOnX(C.x + C.w + 0.02, mid, z1 - 3.4 - size * 0.72 - size * 1.3, l2, { size, cls: "card-text" }));
  out.push(S(k.slabOf(C, z0, CARD_H, P, 2), { tone: "hi", crease: "lo" }).replace(/<path class="iso-fill[^>]*>|<path class="iso-(shade|top)[^>]*>/g, ""));
  return out.join("");
}

// ---------- tubes, clamps, couplings ----------
function flange(centre, axis, r, thick, { tone = "hi", bolts = 0 } = {}) {
  const F = G.frameAlong(centre, axis);
  let svg = S(G.disc(-thick / 2, thick / 2, r, F, P), { tone });
  const towards = G.dot3(F.a, V) > 0 ? thick / 2 : -thick / 2;
  if (bolts && Math.abs(G.dot3(F.a, V)) > 0.2) svg += D(G.dotsOf(F, towards, r * 0.74, bolts, P, { all: true }), { size: 0.42, tone: "mid" });
  return { depth: depth(centre), svg };
}
function tubeLayer() {
  const items = [];
  const T = 1.6;
  TUBES.forEach((line, i) => {
    const total = G.pathLength(line);
    const gaps = [[0, T], [total - T, total]];
    // clamps where the posts hold the tube
    for (const post of POSTS.filter((p) => p.tubes.includes(i))) {
      const s = DIV.y - post.y;
      gaps.push([s - CLAMP_T / 2, s + CLAMP_T / 2]);
      items.push(flange([TX, post.y, OUT[i]], [0, 1, 0], CLAMP_R, CLAMP_T, { tone: "mid" }));
    }
    // a coupling on each long run
    if (i > 0) {
      const y = i === 1 ? -96 : -120;
      const s = DIV.y - y;
      gaps.push([s - 2.2, s + 2.2]);
      const c = flange([TX, y, OUT[i]], [0, 1, 0], TR * 1.3, 4.4, { tone: "hi" });
      const F = G.frameAlong([TX, y, OUT[i]], [0, 1, 0]);
      c.svg = S(G.disc(-2.2, 2.2, TR * 1.3, F, P), { tone: "hi", inner: L(G.arcOf(F, 0, TR * 1.3, P), { tone: "faint" }) });
      items.push(c);
    }
    for (const piece of tubePieces(line, TR, P, { maxLength: 22, gaps })) items.push({ depth: G.dot3(piece.mid, V), svg: tubeSvg(piece, { tone: "hi" }) });
    items.push(flange([TX, DIV.y - T / 2, OUT[i]], [0, -1, 0], TR * 1.5, T));
    items.push(flange([TX, DROP[i], FLOOR[i] + REC_H + T / 2], [0, 0, 1], TR * 1.5, T, { bolts: 6 }));
  });
  return items.sort((a, b) => a.depth - b.depth).map((item) => item.svg).join("");
}

function riser() {
  const items = [];
  const T = 1.6;
  const total = G.pathLength(riserLine);
  for (const piece of tubePieces(riserLine, TR, P, { maxLength: 22, gaps: [[0, 0.01], [total - T, total]] })) items.push({ depth: G.dot3(piece.mid, V), svg: tubeSvg(piece, { tone: "hi" }) });
  items.push(flange([DIV.x + DIV.w + T / 2, IN_Y, INLET_Z], [1, 0, 0], TR * 1.5, T, { bolts: 6 }));
  return items.sort((a, b) => a.depth - b.depth).map((item) => item.svg).join("");
}

// ---------- the diverter ----------
function diverter(state) {
  const out = [];
  const X = DIV.x + DIV.w;
  // pedestal post
  const PY = IN_Y;
  out.push(slab({ x: -53, y: PY - 9, w: 18, d: 18, r: 1 }, 0, 2, "mid", { steps: 2, bevel: 0.3 }));
  out.push(D([[-51, PY - 7], [-37, PY - 7], [-51, PY + 7], [-37, PY + 7]].map(([x, y]) => at([x, y, 2])), { size: 0.45 }));
  const post = { x: -49, y: PY - 5, w: 10, d: 10, r: 0.8 };
  out.push(slab(post, 2, DIV_Z0 - 2, "mid", { steps: 2, bevel: 0.4, inner: L(k.sideSeam(post, 30, P, 2), { tone: "faint" }) }));
  // the box
  out.push(slab(DIV, DIV_Z0, DIV_Z1 - DIV_Z0, "mid", { steps: 3, bevel: 0.6, inner: L(k.sideSeam(DIV, DIV_Z1 - 6, P, 3), { tone: "faint" }) }));
  out.push(D([[X, DIV.y + 2.4, DIV_Z0 + 3], [X, DIV.y + DIV.d - 2.4, DIV_Z0 + 3], [X, DIV.y + 2.4, DIV_Z1 - 9], [X, DIV.y + DIV.d - 2.4, DIV_Z1 - 9]].map(at), { size: 0.45 }));
  // the slot the shuttle rides in, and one printed name per outlet
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-0)" d="${faceRect(X, SLOT.y0, SLOT.y1, SLOT.z0, SLOT.z1)}"/>`);
  out.push(L(faceRect(X, SLOT.y0, SLOT.y1, SLOT.z0, SLOT.z1), { tone: "lo" }));
  OUT.forEach((z, i) => {
    out.push(L(k.segment([X, SLOT.y0, z], [X, SLOT.y0 - 3.2, z], P), { tone: "mid" }));
    out.push(textOnX(X, SLOT.y0 - 4.4, z - 1.6, M.OFFICES[i].id, { size: 4.4, tone: "mid", anchor: "start" }));
  });
  // cap and the actuator that drives the shuttle
  out.push(slab({ x: DIV.x - 1, y: DIV.y - 1, w: DIV.w + 2, d: DIV.d + 2, r: 1.8 }, DIV_Z1, 3, "mid", { steps: 3, bevel: 0.5 }));
  out.push(S(k.cylinder(TX, IN_Y, 6.5, DIV_Z1 + 3, 7, P, 36, 0.5), { tone: "mid", inner: L(k.sideArc(TX, IN_Y, 6.5, DIV_Z1 + 6, P, 24), { tone: "faint" }) }));
  out.push(S(k.cylinder(TX, IN_Y, 3, DIV_Z1 + 10, 2, P, 24), { tone: "hi" }));
  // the shuttle
  out.push(`<g data-part="shuttle" transform="${k.translateAlong(P, [0, 0, OUT[state.shuttle] - OUT[0]])}">${shuttleSvg()}</g>`);
  return out.join("");
}
function shuttleSvg() {
  const z = OUT[0];
  return S(k.slabOf(SHUT, z - 4, 8, P, 2, 0.3), { tone: "hi", crease: "lo", inner: L(k.sideSeam(SHUT, z, P, 2), { tone: "lo" }) });
}

// ---------- the desk ----------
function desk(state) {
  const out = [];
  const ped = { x: 22, y: 62, w: 52, d: 22, r: 1 };
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(DESK, 3), 0, 0.1, P)}" style="filter:blur(4px)"/>`);
  for (const [x, y] of [[22, 10], [70, 10]]) out.push(slab({ x, y, w: 4, d: 4, r: 0.6 }, 0, DESK_Z, "mid", { steps: 2, bevel: 0.3 }));
  out.push(slab(ped, 0, DESK_Z, "mid", { steps: 2, bevel: 0.4, inner: [10, 20].map((z) => L(k.sideSeam(ped, z, P, 2), { tone: "lo" })).join("") }));
  for (const z of [4.4, 14.4, 24.4]) out.push(slab({ x: ped.x + ped.w, y: 69, w: 1.2, d: 8, r: 0.4 }, z, 1.6, "hi", { steps: 2 }));
  out.push(slab(DESK, DESK_Z, DESK_T, "mid", { steps: 3, bevel: 0.8 }));
  // blotter
  const pad = { x: 44, y: 54, w: 18, d: 24, r: 1 };
  out.push(S(k.slabOf(pad, DESK_TOP, 0.6, P, 2), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(pad, 1.4), DESK_TOP + 0.6, P, 2), { tone: "faint" }));
  // capsule rack: two spares and the empty socket the red one came from
  out.push(slab(RACK, DESK_TOP, 5, "mid", { steps: 2, bevel: 0.4 }));
  const sockets = [RACK.y + 4, RACK.y + 9, RACK.y + 14];
  const RT = DESK_TOP + 5;
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-0)" d="${k.planOutline({ x: 30 - CAP_R, y: sockets[0] - CAP_R, w: CAP_R * 2, d: CAP_R * 2, r: CAP_R }, RT, P, 8)}"/>`);
  out.push(L(k.ring(30, sockets[0], CAP_R, RT, P, 24), { tone: "lo" }));
  for (const y of sockets.slice(1)) {
    out.push(S(k.cylinder(30, y, CAP_R, RT, CAP_L - 3, P, 28), { tone: "hi", crease: "lo", inner: L(k.sideArc(30, y, CAP_R, RT + 4, P, 16), { tone: "lo" }) }));
    out.push(S(k.cylinder(30, y, CAP_R * 0.7, RT + CAP_L - 3, 0.8, P, 20), { tone: "hi" }));
  }
  // the AI lead's name block
  const plate = { x: 66, y: 12, w: 2, d: 34, r: 0.3 };
  out.push(slab(plate, DESK_TOP, 8, "mid", { steps: 2, bevel: 0.3 }));
  out.push(textOnX(68.02, 29, DESK_TOP + 2.2, "AI LEAD", { size: 5, cls: "plate-text" }));
  // the send console
  out.push(slab(CONSOLE, DESK_TOP, CON_H, "mid", { steps: 3, bevel: 0.5, inner: L(k.sideSeam(CONSOLE, DESK_TOP + 2, P, 3), { tone: "faint" }) }));
  out.push(D([[CONSOLE.x + 2.4, CONSOLE.y + 2.4], [CONSOLE.x + CONSOLE.w - 2.4, CONSOLE.y + CONSOLE.d - 2.4], [CONSOLE.x + 2.4, CONSOLE.y + CONSOLE.d - 2.4], [CONSOLE.x + CONSOLE.w - 2.4, CONSOLE.y + 2.4]].map(([x, y]) => at([x, y, CON_TOP])), { size: 0.45 }));
  // cradle prongs and the bell mouth the capsule rises into
  out.push(S(k.cylinder(CRADLE[0], CRADLE[1], 5.6, CON_TOP, 0.8, P, 32), { tone: "mid" }));
  out.push(L(k.ring(CRADLE[0], CRADLE[1], CAP_R + 0.4, CON_TOP + 0.8, P, 24), { tone: "lo" }));
  for (const dy of [-4.8, 4.8]) out.push(slab({ x: CRADLE[0] - 0.8, y: CRADLE[1] + dy - 0.8, w: 1.6, d: 1.6, r: 0.3 }, CON_TOP + 0.8, BELL_Z - CON_TOP - 0.8, "mid", { steps: 2 }));
  const bell = G.frameAlong([CRADLE[0], CRADLE[1], BELL_Z], [0, 0, 1]);
  out.push(S(G.solidOf([[0, 6], [1.4, 6], [1.4, 5.2], [RISER_Z - BELL_Z, TR + 0.6]], bell, P), { tone: "hi" }));
  // the lever
  out.push(S(G.disc(0, 1, 2.2, G.frameAlong(LEVER.pivot, [1, 0, 0]), P), { tone: "mid" }));
  out.push(`<g data-part="lever">${leverSvg(state.lever)}</g>`);
  return out.join("");
}
function leverSvg(u) {
  const [px, py, pz] = LEVER.pivot;
  const a = LEVER.rest + (LEVER.pulled - LEVER.rest) * u;
  const tip = [px + 1, py - Math.sin(a) * LEVER.len, pz + Math.cos(a) * LEVER.len];
  const t = at(tip), p = at([px + 1, py, pz]);
  return `<path class="iso-line" data-tone="hi" style="stroke-width:1.6" d="M${p[0].toFixed(2)} ${p[1].toFixed(2)}L${t[0].toFixed(2)} ${t[1].toFixed(2)}"/>` +
    `<circle class="lever-knob" cx="${t[0].toFixed(2)}" cy="${t[1].toFixed(2)}" r="${(1.7 * KS).toFixed(2)}"/>` +
    `<circle class="lever-pin" cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${(0.9 * KS).toFixed(2)}"/>`;
}

// ---------- assemble one state ----------
const FIG_CSS = `
.iso-svg path.cap-edge,.iso-svg path.cap-body,.iso-svg path.cap-shine,svg path.cap-edge,svg path.cap-body,svg path.cap-shine{vector-effect:none}
.cap-edge{fill:none;stroke:var(--anatomy-hi);stroke-linejoin:round}
.cap-body{fill:none;stroke:var(--anatomy-red);stroke-linejoin:round}
.cap-dot-edge{fill:var(--anatomy-hi)}.cap-dot{fill:var(--anatomy-red)}
.cap-shine{fill:none;stroke:#fff;stroke-opacity:.5;stroke-linecap:round;stroke-linejoin:round}
.card-face{fill:var(--anatomy-face)}
.card-text{fill:var(--anatomy-hi);font-weight:700;letter-spacing:0}
.plate-text{fill:var(--anatomy-hi);font-weight:700;letter-spacing:.06em}
.lever-knob{fill:var(--anatomy-hi)}.lever-pin{fill:var(--anatomy-mid)}
`;

function stateOf(i) {
  if (i === M.KEY) return { cards: [1, 1, 1], bins: [0, 0, 0], shuttle: 2, lever: 0, capsule: { route: 2, s: HOME_S, alpha: 1 } };
  return { cards: [0, 1, 2].map((j) => (j === i ? 1 : 0)), bins: [0, 1, 2].map((j) => (j === i ? 1 : 0)), shuttle: i, lever: 0, capsule: { route: i, s: HOME_S, alpha: 0 } };
}

function figure(i) {
  const state = stateOf(i);
  const cap = state.capsule;
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "A pneumatic-tube message system on a stepped stand. At the front left, the AI lead's desk has a send console with a lever, a capsule rack and one red capsule. A riser climbs to a diverter whose shuttle picks one of three tubes; the tubes climb the steps to three offices, CFO, CIO and CEO, each one step higher. Each office has a receiver with a bin and a card holder. CFO card: A cap costs more than capacity. CIO card: IT rules for models. CEO card: Our asset or their training data." +
      (i === M.KEY ? " All three cards are up." : ` The capsule has been delivered to the ${M.OFFICES[i].id} and its card is up.`),
    body: [
      `<style>${FIG_CSS}</style>`,
      bench(),
      office(2, state),
      office(1, state),
      office(0, state),
      tubeLayer(),
      diverter(state),
      riser(),
      desk(state),
      `<g data-part="capsule" style="opacity:${cap.alpha}">${capsuleMarkup(capsuleRuns(CAP_ROUTES[cap.route], cap.s), CAP_W)}</g>`,
    ],
  });
}

// ---------- live ----------
const ANCHORS = [
  ...[0, 1, 2].map((i) => at([0, card(i).y + card(i).d / 2, FLOOR[i] + CARD_Z + CARD_H / 2])),
  at([DESK.x + DESK.w / 2, DESK.y + DESK.d / 2, DESK_TOP]),
];
const live = `
const P = ${JSON.stringify(P)};
const OFFICES = ${JSON.stringify(M.OFFICES)}, ALL = ${JSON.stringify(M.ALL)}, STATES = ${JSON.stringify(M.STATES)};
const ROUTES = ${JSON.stringify(CAP_ROUTES)};
const CAP_L = ${CAP_L}, CAP_W = ${CAP_W}, HOME_S = ${HOME_S};
const END_S = ${JSON.stringify([0, 1, 2].map(endS))};
const OUT = ${JSON.stringify(OUT)}, CARD_DROP = ${CARD_DROP};
const LEVER = ${JSON.stringify(LEVER)}, KS = ${KS};
const ANCHORS = ${JSON.stringify(ANCHORS)};
const at = (p) => iso(p, P);
const capsuleMarkup = ${capsuleMarkup.toString()};
const capsuleRuns = ${capsuleRuns.toString()};
const leverSvg = ${leverSvg.toString()};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s);
const el = {
  capsule: $('[data-part="capsule"]'), shuttle: $('[data-part="shuttle"]'), lever: $('[data-part="lever"]'),
  cards: [0, 1, 2].map((i) => $('[data-part="card-' + i + '"]')), bins: [0, 1, 2].map((i) => $('[data-part="bin-' + i + '"]')),
};
const readout = document.querySelector("[data-readout]");
const board = { office: document.querySelector('[data-board="office"]'), driver: document.querySelector('[data-board="driver"]'), card: document.querySelector('[data-board="card"]'), note: document.querySelector('[data-board="note"]') };
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const glide = (t) => { const a = 0.18; if (t < a) return (t * t) / (2 * a * (1 - a)); if (t > 1 - a) return 1 - ((1 - t) * (1 - t)) / (2 * a * (1 - a)); return (t - a / 2) / (1 - a); };
// the state of the machine
const st = { route: 2, s: HOME_S, alpha: 1, bins: [0, 0, 0], cards: [1, 1, 1], cardT: [1, 1, 1], shuttle: 2, lever: 0 };
let shown = ${M.KEY}, queue = [], step = null, stepT = 0, frame = 0, last = 0, visible = false, touring = !still.matches, held = false, dwell = 0, booted = false;
const TOUR_PAUSE = 2.6;
function plan(target) {
  queue = []; step = null;
  const homeAlready = st.alpha > 0.99 && st.s <= HOME_S + 0.01;
  // 1 · clear: lower the cards that are not wanted, empty the bins, bring the capsule home
  const keep = target === 3 ? [0, 1, 2] : [];
  st.cardT = st.cardT.map((c, i) => (keep.includes(i) ? c : 0));
  if (!homeAlready || st.bins.some((b) => b > 0.01)) {
    const from = { alpha: st.alpha, bins: st.bins.slice() };
    queue.push({ dur: 0.45, update: (t) => { st.alpha = from.alpha * (1 - t); st.bins = from.bins.map((b) => b * (1 - t)); } });
    queue.push({ dur: 0.45, start: () => { st.s = HOME_S; }, update: (t) => { st.alpha = t; } });
  }
  if (target === 3) {
    [0, 1, 2].forEach((i) => queue.push({ dur: 0.28, start: () => { st.cardT[i] = 1; } }));
    queue.push({ dur: 0.5 });
    return;
  }
  // 2 · switch the diverter
  queue.push({ dur: 0.35 + 0.3 * Math.abs(st.shuttle - target), start() { this.from = st.shuttle; }, update(t) { st.shuttle = this.from + (target - this.from) * ease(t); } });
  // 3 · pull the lever and send
  queue.push({ dur: 0.32, update: (t) => { st.lever = ease(t); } });
  const dist = END_S[target] - HOME_S;
  queue.push({ dur: 0.9 + dist / 150, start: () => { st.route = target; st.s = HOME_S; }, update: (t, dt) => { st.s = HOME_S + dist * glide(t); st.lever = Math.max(0, st.lever - dt * 2.4); } });
  // 4 · it drops into the bin; the card rises
  queue.push({ dur: 0.4, start: () => { st.lever = 0; }, update: (t) => { st.bins[target] = t; } });
  queue.push({ dur: 0.6, start: () => { st.cardT[target] = 1; st.alpha = 0; st.s = HOME_S; } });
}
function finish() { while (step || queue.length) { if (!step) { step = queue.shift(); step.start && step.start(); } step.update && step.update(1, 1); step = null; } st.cards = st.cardT.slice(); }
function draw() {
  el.capsule.style.opacity = st.alpha.toFixed(3);
  el.capsule.innerHTML = st.alpha > 0.002 ? capsuleMarkup(capsuleRuns(ROUTES[st.route], st.s), CAP_W) : "";
  el.shuttle.setAttribute("transform", translateAlong(P, [0, 0, (OUT[0] + (OUT[1] - OUT[0]) * Math.min(1, st.shuttle) + (OUT[2] - OUT[1]) * Math.max(0, st.shuttle - 1)) - OUT[0]]));
  el.lever.innerHTML = leverSvg(st.lever);
  st.cards.forEach((c, i) => el.cards[i].setAttribute("transform", translateAlong(P, [0, 0, (c - 1) * CARD_DROP])));
  st.bins.forEach((b, i) => { el.bins[i].style.opacity = b.toFixed(3); });
}
function say(i) {
  const o = i === 3 ? null : OFFICES[i];
  const text = i === 3 ? "all three" : o.id;
  if (readout.textContent !== text) readout.textContent = text;
  board.office.textContent = i === 3 ? "ALL THREE" : o.id;
  board.driver.textContent = (i === 3 ? ALL.driver : o.driver).toUpperCase();
  board.card.textContent = i === 3 ? OFFICES.map((x) => x.sentence).join("  ·  ") : o.sentence;
  board.note.textContent = i === 3 ? ALL.note : o.note;
  stage.setAttribute("aria-valuenow", String(i));
  stage.setAttribute("aria-valuetext", text + ": " + (i === 3 ? ALL.note : o.sentence + " " + o.note));
}
function go(i, snap) {
  shown = i;
  say(i);
  plan(i);
  if (snap || still.matches) { finish(); draw(); return; }
  run();
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (!step && queue.length) { step = queue.shift(); stepT = 0; step.start && step.start(); }
  if (step) {
    stepT += dt;
    const t = Math.min(1, stepT / step.dur);
    step.update && step.update(t, dt);
    if (t >= 1) step = null;
  }
  st.cards = st.cards.map((c, i) => { const v = c + (st.cardT[i] - c) * (1 - Math.exp(-dt / 0.16)); return Math.abs(v - st.cardT[i]) < 0.001 ? st.cardT[i] : v; });
  draw();
  const busy = step || queue.length || st.cards.some((c, i) => c !== st.cardT[i]);
  if (!busy && touring) {
    dwell += dt;
    if (dwell > TOUR_PAUSE) { dwell = 0; go((shown + 1) % STATES.length); }
  }
  frame = visible && (busy || touring) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
let idle = 0, hover = -1, hoverTimer = 0;
const steer = (i) => { touring = false; dwell = 0; clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches && !held; dwell = 0; run(); }, 6000); if (i !== shown) go(i); else run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
const nearest = (event) => {
  const box = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const x = ((event.clientX - box.left) / box.width) * vb.width, y = ((event.clientY - box.top) / box.height) * vb.height;
  let best = 0, bd = Infinity;
  ANCHORS.forEach(([ax, ay], i) => { const d = Math.hypot(ax - x, ay - y); if (d < bd) { bd = d; best = i; } });
  return best;
};
stage.addEventListener("pointermove", (event) => {
  const i = nearest(event);
  if (i === hover) return;
  hover = i; clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => steer(i), 320);
});
stage.addEventListener("pointerleave", () => { hover = -1; clearTimeout(hoverTimer); });
stage.addEventListener("click", (event) => { clearTimeout(hoverTimer); steer(nearest(event)); });
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(3, shown + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, shown - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = 3;
  if (/^[1-4]$/.test(event.key)) to = Number(event.key) - 1;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
say(shown);
draw();
setTimeout(() => { booted = true; }, 0);
window.figureApi = {
  states: STATES,
  set(i) { held = true; touring = false; clearTimeout(idle); go(clamp(Math.round(i), 0, 3), !booted); },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const KEY_SVG = figure(M.KEY);
const body = k.plateHtml({
  fig: "Fig 11",
  title: "The chain of command",
  hint: "Point at an office to send",
  readout: "all three",
  keys: [
    { mark: "red", label: "Capsule: one sentence, sent to one office" },
    { mark: "raised", label: "Card: the sentence that office can sign" },
    { mark: "edge", label: "Diverter shuttle: picks the tube" },
  ],
  caption:
    "Each office gets one sentence, in its own words. The three messages are the manifesto's three drivers, translated per office: pricing for the CFO (a cap costs more than capacity), security for the CIO (IT rules for models: a curated model repo, a shim on every device, retrieval that follows the ACLs you already have), and operations for the CEO (the decision graph is your asset or their training data). Sentences from the manifesto's “Selling up the chain” section; the machine itself is illustrative.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Pneumatic tubes to three offices: arrow keys or 1–4 pick CFO, CIO, CEO or all three" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${M.KEY}">${KEY_SVG}</div>`,
});
const BOARD_CSS = `
.board.tubes{grid-template-columns:auto auto 1fr;align-items:end}
.board.tubes .say{grid-column:1/-1;font-family:var(--anatomy-sans,inherit);font-size:clamp(17px,2vw,22px);line-height:1.4;color:var(--anatomy-strong);font-weight:500}
.board.tubes .card{font-size:clamp(16px,1.8vw,21px);font-weight:700;white-space:normal;line-height:1.3;letter-spacing:.01em}
@media (max-width:700px){.board.tubes{grid-template-columns:1fr}}
`;
const BOARD = `<div class="board tubes" aria-live="polite">
  <div class="cell"><span class="lab">Office</span><span class="num" data-board="office">ALL THREE</span></div>
  <div class="cell"><span class="lab">Driver</span><span class="num" data-board="driver">ALL THREE</span></div>
  <div class="cell"><span class="lab">On the card</span><span class="card" data-board="card">${M.OFFICES.map((x) => x.sentence).join("  ·  ")}</span></div>
  <div class="say" data-board="note">${M.ALL.note}</div>
</div>`;
const figureHtml = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figureHtml === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "The chain of command", theme: "light", body: figureHtml, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${BOARD_CSS}</style>`);
writeSnapshot(HERE, "tubes", KEY_SVG);
M.STATES.forEach((_, i) => writeSnapshot(HERE, `tubes-${i + 1}`, figure(i)));
writeFileSync(join(HERE, "tubes.html"), page);
console.log("wrote tubes.html", (page.length / 1024).toFixed(0) + " KB", "scale", KS.toFixed(3));
