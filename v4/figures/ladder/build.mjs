// Fig 8 · The sovereign ladder — an Anatomy figure for the v4 talk.
// A fenced yard on a ground plate. Inside the fence, three stepped rungs you own (device, workgroup, core), each with its
// hardware drawn small but real; a router at the foot sends request tokens up the rungs one at a time, and most of them
// dock on a rung. Outside the fence, one gate (a turnstile, a meter and a press that strips the context tag) leads over a
// deck to a much taller rented tower: the frontier. Every token, the turnstile, the meter and the press read model.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../_anatomy/kit/iso-kit.mjs";
import { kitScript } from "../_anatomy/inline-kit.mjs";
import { PAPER_CSS } from "../_anatomy/paper.mjs";
import { STAGE_CSS } from "../_anatomy/stage.mjs";
import { EMBED_CSS, EMBED_JS, writeSnapshot } from "../_anatomy/embed.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLOT = "ladder";
const WIDTH = 760;
const HEIGHT = 470;

// ---------- world plan (x, y on the floor, z up; the camera looks from −x, +y so every riser faces the reader) ----------
const PLATE = { x: -316, y: -104, w: 548, d: 208, r: 10 };
const PLATE_H = 12, FOOT_H = 5;
const FENCE = { x0: -302, x1: M.GATE_X, y0: -90, y1: 90 };
const FENCE_H = 26, RAIL_LO = 6, RAIL_HI = 21, RAIL_T = 1.6;
const GATE = { back: { x: M.GATE_X - 5, y: 8, w: 10, d: 10, r: 1 }, front: { x: M.GATE_X - 5, y: 46, w: 10, d: 10, r: 1 }, h: 64 };
const LINTEL = { x: M.GATE_X - 9, y: 6, w: 18, d: 52, r: 1.5 };
const LINTEL_Z = GATE.h, LINTEL_H = 10, LINTEL_TOP = LINTEL_Z + LINTEL_H;
const METER = [M.GATE_X, 59, 41.5]; // dial centre on the meter box bolted to the front pillar
const METER_BOX = { x: M.GATE_X - 8.5, y: 56, w: 17, d: 3, r: 1 };
const DIAL_R = 7.2;
const DECK = { x: M.RUNG_X[3], y: M.LANE_Y - 10, w: M.DOOR_X - M.RUNG_X[3], d: 20, r: 0.5 };
const DECK_Z = M.RUNG_Z[2];
const COLUMN = { x: M.STAMP_X - 4, y: 6, w: 8, d: 7, r: 1 };
const BEAM = { x: M.STAMP_X - 6, y: 5, w: 12, d: M.LANE_Y + 6 - 5, r: 1.2 };
const BEAM_Z = 56, BEAM_H = 8;
const PAD_REST = 52, PAD_TRAVEL = 6.4, ROD = 10;
const CABINET = { x: 84, y: 48, w: 46, d: 10, r: 1.2 };
const CABINET_H = 28;
const TURN = [M.TURN_X, M.LANE_Y + 8.6], ARM_Z = 46.2, ARM_R = 10;
const TOWER = { x: M.DOOR_X, y: -52, w: 80, d: 104, r: 2 };
const TOWER_Z = 4, TOWER_TOP = 150;
const RUNG_Y0 = -70, RUNG_Y1 = 42;
const rungPlan = (r) => ({ x: M.RUNG_X[r], y: RUNG_Y0, w: M.RUNG_X[r + 1] - M.RUNG_X[r], d: RUNG_Y1 - RUNG_Y0, r: 1 });
const ROUTER = { x: -288, y: 12, w: 38, d: 38, r: 2 };
const ROUTER_H = 24;
const TEXT = 6.6; // the smallest face text: 3.6 units at the token meter's scale, re-measured for this camera in the build log

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(TOWER, 0, TOWER_TOP + 14)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 112, elevation: 32 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const byDepth = (points) => [...points].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
const slab = (plan, z, h, style = {}, steps = 3, bevel = 0.4) => S(k.slabOf(plan, z, h, P, steps, bevel), style);
const cyl = (x, y, r, z, h, style = {}, steps = 24) => S(k.cylinder(x, y, r, z, h, P, steps), style);
const pathAt = (pts, closed = true) => k.pathOf(pts.map(at), closed);
// a rectangle drawn in a vertical face: y = const (front faces) or x = const (risers, the tower's door side)
const rectY = (y, x0, x1, z0, z1) => pathAt([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
const rectX = (x, y0, y1, z0, z1) => pathAt([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);
const textY = (x, y, z, text, style) => k.faceTextSvg(k.sideMatrix([x, y], z, P, "left"), text, style);
const halo = (plan, z, blur = 4) => `<path class="iso-halo" d="${k.haloOf(plan, z, 0.1, P)}" style="filter:blur(${blur}px)"/>`;

// ---------- the ground plate ----------
function ground() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(cyl(x, y, 7, -PLATE_H - FOOT_H, 1.6, { tone: "lo" }, 28));
    out.push(cyl(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, { tone: "mid" }, 28));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // the plinth reads the open model's terms under the yard (the tower carries its own)
  out.push(textY((FENCE.x0 + FENCE.x1) / 2, PLATE.y + PLATE.d, -3.6, "US OPEN 38 · $0.58/M · 100 TOK/S · UNCAPPED", { size: TEXT, tone: "hi", anchor: "middle" }));
  return out.join("");
}

// ---------- the fence: balusters under two rails, posts over both ----------
function fenceRun(from, to, { skipStart = false, skipEnd = false } = {}) {
  const along = from[0] === to[0] ? "y" : "x";
  const len = Math.abs(along === "x" ? to[0] - from[0] : to[1] - from[1]);
  const dir = Math.sign(along === "x" ? to[0] - from[0] : to[1] - from[1]);
  const pt = (s) => (along === "x" ? [from[0] + dir * s, from[1]] : [from[0], from[1] + dir * s]);
  const out = [];
  const bal = [];
  for (let s = 4; s < len - 3; s += 6) {
    const [x, y] = pt(s);
    bal.push(k.segment([x, y, RAIL_LO + 0.8], [x, y, RAIL_HI + 0.8], P));
  }
  out.push(L(bal.join(""), { tone: "faint" }));
  const lo = Math.min(along === "x" ? from[0] : from[1], along === "x" ? to[0] : to[1]);
  for (const z of [RAIL_LO, RAIL_HI]) {
    const plan = along === "x" ? { x: lo, y: from[1] - RAIL_T / 2, w: len, d: RAIL_T, r: 0.3 } : { x: from[0] - RAIL_T / 2, y: lo, w: RAIL_T, d: len, r: 0.3 };
    out.push(slab(plan, z, 1.6, { tone: "mid" }, 2, 0));
  }
  const posts = [];
  const count = Math.max(1, Math.round(len / 42));
  for (let i = 0; i <= count; i++) {
    if ((i === 0 && skipStart) || (i === count && skipEnd)) continue;
    posts.push(pt((len * i) / count));
  }
  for (const [x, y] of byDepth(posts)) {
    out.push(slab({ x: x - 2.2, y: y - 2.2, w: 4.4, d: 4.4, r: 0.6 }, 0, FENCE_H, { tone: "mid" }, 2, 0.4));
    out.push(slab({ x: x - 2.8, y: y - 2.8, w: 5.6, d: 5.6, r: 0.8 }, FENCE_H, 1.4, { tone: "mid" }, 2, 0.3));
    out.push(D([at([x, y, FENCE_H + 1.4])], { size: 0.45 }));
  }
  return out.join("");
}

// ---------- the frontier tower (rented, metered, much taller) ----------
function tower() {
  const out = [halo(k.insetPlan(TOWER, -6), 0, 8)];
  out.push(slab({ x: TOWER.x - 4, y: TOWER.y - 4, w: TOWER.w + 8, d: TOWER.d + 8, r: 2 }, 0, TOWER_Z, { tone: "lo" }, 3, 0.6));
  const FLOORS = [];
  for (let z = 14; z <= 78; z += 16) FLOORS.push(z);
  out.push(S(k.slabOf(TOWER, TOWER_Z, TOWER_TOP - TOWER_Z, P, 3, 1), { tone: "mid", inner: L(FLOORS.map((z) => k.sideSeam(TOWER, z, P, 3)).join(""), { tone: "faint" }) }));
  const fy = TOWER.y + TOWER.d, fx0 = TOWER.x, fx1 = TOWER.x + TOWER.w;
  // curtain wall: one glazed band per floor on the front and the door side, mullions sill to head
  const bands = [], mull = [];
  for (const z of FLOORS) {
    bands.push(rectY(fy, fx0 + 5, fx1 - 5, z + 3.5, z + 11.5));
    for (let x = fx0 + 5 + 7; x < fx1 - 6; x += 7) mull.push(k.segment([x, fy, z + 3.5], [x, fy, z + 11.5], P));
    if (z + 11.5 < DECK_Z - 2 || z + 3.5 > DECK_Z + 21) {
      bands.push(rectX(fx0, TOWER.y + 6, TOWER.y + TOWER.d - 6, z + 3.5, z + 11.5));
      for (let y = TOWER.y + 6 + 7; y < TOWER.y + TOWER.d - 7; y += 7) mull.push(k.segment([fx0, y, z + 3.5], [fx0, y, z + 11.5], P));
    }
  }
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-1)" d="${bands.join("")}"/>`);
  out.push(L(mull.join(""), { tone: "faint" }), L(bands.join(""), { tone: "lo" }));
  // the door the deck runs into, under a canopy
  const dz0 = DECK_Z, dz1 = DECK_Z + 18, dy0 = DECK.y - 1, dy1 = DECK.y + DECK.d + 1;
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-0)" d="${rectX(fx0, dy0, dy1, dz0, dz1)}"/>`);
  out.push(L(rectX(fx0, dy0, dy1, dz0, dz1), { tone: "mid" }));
  out.push(slab({ x: fx0 - 5, y: dy0 - 2, w: 5, d: dy1 - dy0 + 4, r: 0.5 }, dz1 + 1, 1.6, { tone: "mid" }, 2, 0.3));
  // the sign: what is rented here, and on what terms
  const cx = fx0 + TOWER.w / 2;
  out.push(L(rectY(fy, fx0 + 5, fx1 - 5, TOWER_TOP - 60, TOWER_TOP - 5), { tone: "lo" }));
  out.push(D([[fx0 + 7.4, TOWER_TOP - 7.4], [fx1 - 7.4, TOWER_TOP - 7.4], [fx0 + 7.4, TOWER_TOP - 57.6], [fx1 - 7.4, TOWER_TOP - 57.6]].map(([x, z]) => at([x, fy, z])), { size: 0.45 }));
  out.push(textY(cx, fy, TOWER_TOP - 17, "FRONTIER", { size: 13, tone: "hi", anchor: "middle" }));
  out.push(textY(cx, fy, TOWER_TOP - 30, "61 · $3.85/M", { size: 7.4, tone: "hi", anchor: "middle" }));
  out.push(textY(cx, fy, TOWER_TOP - 40, "47 TOK/S", { size: 7.4, tone: "hi", anchor: "middle" }));
  out.push(textY(cx, fy, TOWER_TOP - 53, "METERED", { size: 8, tone: "mid", anchor: "middle" }));
  // cornice and roof plant
  out.push(slab(k.insetPlan(TOWER, -1.6), TOWER_TOP, 3, { tone: "mid" }, 3, 0.6));
  const roof = TOWER_TOP + 3;
  out.push(L(k.planOutline(k.insetPlan(TOWER, 4), roof, P, 3), { tone: "faint" }));
  const units = [[TOWER.x + 12, TOWER.y + 14], [TOWER.x + 12, TOWER.y + 50], [TOWER.x + 46, TOWER.y + 14]];
  for (const [x, y] of byDepth(units)) {
    out.push(slab({ x, y, w: 24, d: 24, r: 1.5 }, roof, 8, { tone: "mid" }, 3, 0.6));
    out.push(L(k.ring(x + 12, y + 12, 8.5, roof + 8, P, 36) + k.ring(x + 12, y + 12, 2, roof + 8, P, 16), { tone: "lo" }));
    out.push(L([0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI) / 3; return k.lineOnTop([x + 12 + 2 * Math.cos(a), y + 12 + 2 * Math.sin(a)], [x + 12 + 8.5 * Math.cos(a), y + 12 + 8.5 * Math.sin(a)], roof + 8, P); }).join(""), { tone: "faint" }));
  }
  return out.join("");
}

// ---------- the gate: the one opening in the fence ----------
function gateBack() {
  const out = [];
  // the press column outside the fence, behind the deck
  out.push(slab(COLUMN, 0, BEAM_Z, { tone: "mid" }, 2, 0.5));
  // the back gate pillar
  out.push(slab(GATE.back, 0, GATE.h, { tone: "mid" }, 2, 0.6));
  // deck legs, then the deck and its lane
  for (const [x, y] of byDepth([[96, DECK.y + 1.2], [128, DECK.y + 1.2], [96, DECK.y + DECK.d - 3.6], [128, DECK.y + DECK.d - 3.6]])) out.push(slab({ x, y, w: 2.4, d: 2.4, r: 0.3 }, 0, DECK_Z - 3, { tone: "mid" }, 2, 0));
  out.push(S(k.slabOf(DECK, DECK_Z - 3, 3, P, 2, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline({ x: DECK.x + 2, y: M.LANE_Y - 5, w: DECK.w - 4, d: 10, r: 1 }, DECK_Z, P, 2), { tone: "lo" }));
  return out.join("");
}
function turnstileAt(angle) {
  return [0, 1, 2]
    .map((i) => {
      const a = angle + (i * 2 * Math.PI) / 3;
      return k.lineOnTop([TURN[0], TURN[1]], [TURN[0] + ARM_R * Math.cos(a), TURN[1] + ARM_R * Math.sin(a)], ARM_Z, P);
    })
    .join("");
}
function meterNeedleAt(count) {
  const a = (count / 10) * 2 * Math.PI;
  return k.segment(METER, [METER[0] + (DIAL_R - 1.4) * Math.sin(a), METER[1], METER[2] + (DIAL_R - 1.4) * Math.cos(a)], P);
}
function plunger() {
  // built at rest; the whole thing slides down with translateAlong, its rod top always inside the beam
  return [
    cyl(M.STAMP_X, M.LANE_Y, 1.5, PAD_REST + 1.6, ROD, { tone: "mid" }, 14),
    cyl(M.STAMP_X, M.LANE_Y, 3.8, PAD_REST, 1.6, { tone: "hi", crease: "lo" }, 24),
  ].join("");
}
function gateFront() {
  const out = [];
  // the press beam over the lane
  out.push(slab(BEAM, BEAM_Z, BEAM_H, { tone: "mid" }, 2, 0.5));
  out.push(D([at([M.STAMP_X, 8.5, BEAM_Z + BEAM_H]), at([M.STAMP_X, 15, BEAM_Z + BEAM_H])], { size: 0.45 }));
  out.push(L(k.ring(M.STAMP_X, M.LANE_Y, 2.4, BEAM_Z + BEAM_H, P, 16), { tone: "lo" }));
  // the front pillar, the lintel and the meter on it
  out.push(slab(GATE.front, 0, GATE.h, { tone: "mid" }, 2, 0.6));
  out.push(S(k.slabOf(LINTEL, LINTEL_Z, LINTEL_H, P, 3, 0.6), { tone: "mid" }));
  out.push(textY(LINTEL.x + LINTEL.w / 2, LINTEL.y + LINTEL.d, LINTEL_Z + 2.6, "GATE", { size: TEXT, tone: "hi", anchor: "middle" }));
  // the meter bolted to the front pillar: one click of the needle per pass through the turnstile
  out.push(slab(METER_BOX, 31, 21, { tone: "mid" }, 2, 0.4));
  const ring = (r, steps = 48) => Array.from({ length: steps }, (_, i) => { const a = (i / steps) * 2 * Math.PI; return [METER[0] + r * Math.sin(a), METER[1], METER[2] + r * Math.cos(a)]; });
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-face)" d="${pathAt(ring(DIAL_R))}"/>`, L(pathAt(ring(DIAL_R)), { tone: "mid" }));
  const ticks = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * 2 * Math.PI; ticks.push(k.segment([METER[0] + DIAL_R * Math.sin(a), METER[1], METER[2] + DIAL_R * Math.cos(a)], [METER[0] + (DIAL_R - 1.3) * Math.sin(a), METER[1], METER[2] + (DIAL_R - 1.3) * Math.cos(a)], P)); }
  out.push(L(ticks.join(""), { tone: "lo" }));
  out.push(D([at([METER_BOX.x + 1.6, METER[1], 32.6]), at([METER_BOX.x + METER_BOX.w - 1.6, METER[1], 32.6]), at([METER_BOX.x + 1.6, METER[1], 50.4]), at([METER_BOX.x + METER_BOX.w - 1.6, METER[1], 50.4])], { size: 0.45 }));
  return out.join("");
}
function cabinet() {
  // the filter cabinet in front of the press: what the gate does, printed on its door
  const out = [halo(CABINET, 0, 4)];
  out.push(S(k.slabOf(CABINET, 0, CABINET_H, P, 3, 0.8), { tone: "mid" }));
  const fy = CABINET.y + CABINET.d, cx = CABINET.x + CABINET.w / 2;
  out.push(L(rectY(fy, CABINET.x + 2.5, CABINET.x + CABINET.w - 2.5, 1.6, CABINET_H - 1.6), { tone: "lo" }));
  out.push(textY(cx, fy, 20, "SENSITIVE", { size: TEXT, tone: "hi", anchor: "middle" }));
  out.push(textY(cx, fy, 12.4, "CONTEXT", { size: TEXT, tone: "hi", anchor: "middle" }));
  out.push(textY(cx, fy, 4.8, "STRIPPED", { size: TEXT, tone: "hi", anchor: "middle" }));
  out.push(L(k.planOutline({ x: CABINET.x + 6, y: CABINET.y + 3, w: 16, d: 4, r: 1.5 }, CABINET_H, P, 2), { tone: "lo" }));
  out.push(D(k.corners(k.insetPlan(CABINET, 2), 0).map(([x, y]) => at([x, y, CABINET_H])), { size: 0.45 }));
  return out.join("");
}

// ---------- the rungs ----------
const LABELS = [
  { text: "DEVICE · 2026–27", size: TEXT, z: 2.6 },
  { text: "WORKGROUP", size: 7.6, z: 7 },
  { text: "CORE", size: 9, z: 11 },
];
function rungBase(r, focus) {
  const plan = rungPlan(r);
  const z = M.RUNG_Z[r];
  const out = [];
  out.push(S(k.slabOf(plan, 0, z, P, 2, 0.8), { tone: "mid" }));
  const screws = [[plan.x + 4, plan.y + 4], [plan.x + plan.w - 4, plan.y + 4], [plan.x + 4, plan.y + plan.d - 4], [plan.x + plan.w - 4, plan.y + plan.d - 4]];
  out.push(D(screws.map(([x, y]) => at([x, y, z])), { size: 0.45 }));
  out.push(`<g data-rung-label="${r}">${textY(plan.x + 5, RUNG_Y1, LABELS[r].z, LABELS[r].text, { size: LABELS[r].size, tone: focus ? "hi" : "lo" })}</g>`);
  // the lane and the docking sockets
  out.push(L(k.planOutline({ x: plan.x + 3, y: M.LANE_Y - 5, w: plan.w - 6, d: 10, r: 1 }, z, P, 2), { tone: "lo" }));
  out.push(`<g data-sockets="${r}">${L(M.SLOTS[r].map((x) => k.planOutline({ x: x - 4.4, y: M.SLOT_Y - 4.4, w: 8.8, d: 8.8, r: 1 }, z, P, 2)).join(""), { tone: focus ? "mid" : "faint" })}</g>`);
  return out.join("");
}
function lift(r) {
  // two guides up the riser of the next rung: the token rises between them
  const x = M.RUNG_X[r + 1] - 1.2, z0 = M.RUNG_Z[r], z1 = M.RUNG_Z[r + 1];
  return [M.LANE_Y - 5.4, M.LANE_Y + 5.4]
    .map((y) => slab({ x, y: y - 0.6, w: 1.2, d: 1.2, r: 0.2 }, z0, z1 - z0 + 1.4, { tone: "mid" }, 2, 0))
    .join("");
}

const HW_Y = -62; // the back of the hardware row on every rung
function desk(x0, item) {
  const y0 = HW_Y, w = 28, d = 24, top = M.RUNG_Z[0] + 14;
  const out = [halo({ x: x0 + 2, y: y0 + 2, w: w - 4, d: d - 4, r: 2 }, M.RUNG_Z[0], 3)];
  for (const [x, y] of byDepth(k.corners({ x: x0, y: y0, w, d }, 2))) out.push(slab({ x: x - 0.8, y: y - 0.8, w: 1.6, d: 1.6, r: 0.2 }, M.RUNG_Z[0], 12.4, { tone: "mid" }, 2, 0));
  out.push(slab({ x: x0, y: y0, w, d, r: 1 }, top - 1.6, 1.6, { tone: "mid" }, 2, 0.3));
  if (item === "laptop") {
    const bx = x0 + 7;
    out.push(slab({ x: bx, y: y0 + 9, w: 14, d: 10, r: 0.8 }, top, 0.8, { tone: "hi", crease: "lo" }, 2, 0.2));
    out.push(D(k.dotGrid(bx + 2, y0 + 12, 6, 3, 2, top + 0.8, P), { size: 0.32, tone: "lo" }));
    out.push(slab({ x: bx, y: y0 + 8, w: 14, d: 1, r: 0.3 }, top, 9.5, { tone: "hi", crease: "lo" }, 2, 0));
    const sy = y0 + 9;
    out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-1)" d="${rectY(sy, bx + 1.2, bx + 12.8, top + 1.6, top + 8.4)}"/>`);
    out.push(L(rectY(sy, bx + 1.2, bx + 12.8, top + 1.6, top + 8.4), { tone: "lo" }));
  } else {
    // a desktop: an NPU box, a monitor on a stand and a keyboard
    out.push(slab({ x: x0 + 1.5, y: y0 + 3, w: 5, d: 9, r: 0.6 }, top, 7, { tone: "mid" }, 2, 0.3));
    out.push(D([at([x0 + 4, y0 + 12, top + 5.4])], { size: 0.45, tone: "hi" }));
    const mx = x0 + 9;
    out.push(slab({ x: mx + 3, y: y0 + 4, w: 8, d: 5, r: 0.8 }, top, 0.8, { tone: "mid" }, 2, 0.2));
    out.push(slab({ x: mx + 6, y: y0 + 5.6, w: 2, d: 1.6, r: 0.3 }, top + 0.8, 4, { tone: "mid" }, 2, 0));
    out.push(slab({ x: mx - 1, y: y0 + 7.2, w: 16, d: 1.2, r: 0.3 }, top + 3.6, 10, { tone: "hi", crease: "lo" }, 2, 0));
    const sy = y0 + 8.4;
    out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-1)" d="${rectY(sy, mx, mx + 14, top + 4.6, top + 12.6)}"/>`);
    out.push(L(rectY(sy, mx, mx + 14, top + 4.6, top + 12.6), { tone: "lo" }));
    out.push(slab({ x: mx, y: y0 + 13, w: 14, d: 4, r: 0.6 }, top, 0.8, { tone: "hi", crease: "lo" }, 2, 0.2));
    out.push(D(k.dotGrid(mx + 1.5, y0 + 14.2, 7, 2, 1.8, top + 0.8, P), { size: 0.3, tone: "lo" }));
  }
  return out.join("");
}
function rung1() {
  return [desk(-176, "desktop"), desk(-209, "laptop"), desk(-242, "laptop")].join("");
}

function rung2() {
  const z = M.RUNG_Z[1];
  const out = [];
  // the workgroup bench: a desktop inference box shared by the team, with its screen and keyboard
  const bench = { x: -108, y: HW_Y + 2, w: 56, d: 24, r: 1 };
  const btop = z + 12;
  out.push(halo(k.insetPlan(bench, 2), z, 3));
  for (const [x, y] of byDepth(k.corners(bench, 2))) out.push(slab({ x: x - 0.9, y: y - 0.9, w: 1.8, d: 1.8, r: 0.2 }, z, 10.4, { tone: "mid" }, 2, 0));
  out.push(slab(bench, btop - 1.6, 1.6, { tone: "mid" }, 2, 0.3));
  const sx = -74;
  out.push(slab({ x: sx + 4, y: bench.y + 3, w: 8, d: 5, r: 0.8 }, btop, 0.8, { tone: "mid" }, 2, 0.2));
  out.push(slab({ x: sx + 7, y: bench.y + 4.6, w: 2, d: 1.6, r: 0.3 }, btop + 0.8, 4, { tone: "mid" }, 2, 0));
  out.push(slab({ x: sx - 1, y: bench.y + 6.2, w: 18, d: 1.2, r: 0.3 }, btop + 3.6, 11, { tone: "hi", crease: "lo" }, 2, 0));
  const sy = bench.y + 7.4;
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-1)" d="${rectY(sy, sx, sx + 16, btop + 4.6, btop + 13.6)}"/>`);
  out.push(L(rectY(sy, sx, sx + 16, btop + 4.6, btop + 13.6), { tone: "lo" }));
  const box = { x: -103, y: bench.y + 2, w: 22, d: 20, r: 1.4 };
  out.push(S(k.slabOf(box, btop, 22, P, 3, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(box, btop + 3, P, 3), { tone: "faint" }) }));
  const fy = box.y + box.d;
  const grille = [];
  for (let gz = btop + 6; gz <= btop + 19; gz += 1.6) for (let gx = box.x + 3; gx <= box.x + box.w - 3; gx += 1.6) grille.push(at([gx, fy, gz]));
  out.push(D(grille, { size: 0.32, tone: "lo" }));
  out.push(D([at([box.x + 3, fy, btop + 3.2]), at([box.x + 5, fy, btop + 3.2])], { size: 0.5, tone: "hi" }));
  out.push(L(k.planOutline(k.insetPlan(box, 3), btop + 22, P, 3), { tone: "faint" }));
  out.push(slab({ x: sx, y: bench.y + 13, w: 16, d: 4.4, r: 0.6 }, btop, 0.8, { tone: "hi", crease: "lo" }, 2, 0.2));
  out.push(D(k.dotGrid(sx + 1.6, bench.y + 14.2, 8, 2, 1.8, btop + 0.8, P), { size: 0.3, tone: "lo" }));
  // the half rack: open frame, five servers
  const rack = { x: -140, y: HW_Y - 2, w: 26, d: 28, r: 0.8 };
  out.push(halo(rack, z, 3));
  out.push(slab(rack, z, 2, { tone: "mid" }, 2, 0.3));
  const post = (x, y) => slab({ x, y, w: 2, d: 2, r: 0.3 }, z + 2, 32, { tone: "mid" }, 2, 0);
  out.push(post(rack.x + rack.w - 2, rack.y), post(rack.x, rack.y));
  for (let i = 0; i < 5; i++) {
    const sz = z + 3.4 + i * 6;
    const srv = { x: rack.x + 2, y: rack.y + 1.6, w: rack.w - 4, d: rack.d - 3.2, r: 0.4 };
    out.push(slab(srv, sz, 4.6, { tone: "hi", crease: "lo" }, 2, 0.3));
    const fy2 = srv.y + srv.d;
    out.push(L(rectY(fy2, srv.x + 2, srv.x + 9, sz + 1.2, sz + 3.4) + rectY(fy2, srv.x + 11, srv.x + 18, sz + 1.2, sz + 3.4), { tone: "lo" }));
    out.push(D([at([srv.x + srv.w - 1.6, fy2, sz + 2.3])], { size: 0.45, tone: "hi" }));
  }
  out.push(post(rack.x + rack.w - 2, rack.y + rack.d - 2), post(rack.x, rack.y + rack.d - 2));
  out.push(slab(rack, z + 34, 2, { tone: "mid" }, 2, 0.3));
  return out.join("");
}

function rung3() {
  const z = M.RUNG_Z[2];
  const cage = { x: -40, y: HW_Y - 4, w: 84, d: 72 };
  const top = z + 40;
  const out = [halo({ ...cage, r: 2 }, z, 5)];
  const side = (from, to) => {
    const alongX = from[1] === to[1];
    const len = alongX ? to[0] - from[0] : to[1] - from[1];
    const mesh = [];
    for (let s = 3; s < len - 1; s += 4.5) {
      const p = alongX ? [from[0] + s, from[1]] : [from[0], from[1] + s];
      mesh.push(k.segment([p[0], p[1], z + 1], [p[0], p[1], top - 1], P));
    }
    const parts = [L(mesh.join(""), { tone: "faint" })];
    for (const rz of [z, top - 2.4]) {
      const plan = alongX ? { x: from[0], y: from[1] - 0.8, w: len, d: 1.6, r: 0.3 } : { x: from[0] - 0.8, y: from[1], w: 1.6, d: len, r: 0.3 };
      parts.push(slab(plan, rz, 2.4, { tone: "mid" }, 2, 0));
    }
    return parts.join("");
  };
  const post = (x, y) => slab({ x: x - 1.4, y: y - 1.4, w: 2.8, d: 2.8, r: 0.4 }, z, top - z + 2, { tone: "mid" }, 2, 0.3);
  const X0 = cage.x, X1 = cage.x + cage.w, Y0 = cage.y, Y1 = cage.y + cage.d;
  out.push(side([X0, Y0], [X1, Y0]), side([X1, Y0], [X1, Y1]), post(X1, Y0), post(X0, Y0));
  for (const x of [24, 6, -12, -30]) {
    const plan = { x, y: HW_Y + 4, w: 16, d: 30, r: 0.6 };
    out.push(S(k.slabOf(plan, z, 34, P, 2, 0.5), { tone: "hi", crease: "lo" }));
    const fy = plan.y + plan.d;
    const units = [];
    for (let uz = z + 5; uz < z + 31; uz += 3.2) units.push(k.segment([x + 2, fy, uz], [x + 14, fy, uz], P));
    out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-2)" d="${rectY(fy, x + 2, x + 14, z + 2, z + 32)}"/>`);
    out.push(L(units.join(""), { tone: "lo" }), L(rectY(fy, x + 2, x + 14, z + 2, z + 32), { tone: "mid" }));
    const leds = [];
    for (let uz = z + 6.6; uz < z + 31; uz += 3.2) leds.push(at([x + 12.4, fy, uz]));
    out.push(D(leds, { size: 0.4, tone: "hi" }));
    out.push(D(k.dotGrid(x + 3, plan.y + 4, 6, 6, 2, z + 34, P), { size: 0.3, tone: "lo" }));
  }
  out.push(side([X0, Y1], [X1, Y1]), side([X0, Y0], [X0, Y1]));
  out.push(L(rectY(Y1 + 0.8, 18, 36, z + 2.4, top - 2.4), { tone: "mid" }));
  out.push(slab({ x: 19, y: Y1 + 0.8, w: 2, d: 1.2, r: 0.3 }, z + 18, 4, { tone: "hi", crease: "lo" }, 2, 0));
  out.push(post(X1, Y1), post(X0, Y1));
  return out.join("");
}

function router() {
  const out = [halo(ROUTER, 0, 4)];
  out.push(S(k.slabOf(ROUTER, 0, ROUTER_H, P, 3, 0.8), { tone: "mid" }));
  const fy = ROUTER.y + ROUTER.d;
  out.push(textY(ROUTER.x + ROUTER.w / 2, fy, 13.4, "ROUTER", { size: TEXT, tone: "hi", anchor: "middle" }));
  const ports = [];
  for (let i = 0; i < 4; i++) ports.push(rectY(fy, ROUTER.x + 5 + i * 7.5, ROUTER.x + 10.5 + i * 7.5, 4, 7.4));
  out.push(L(ports.join(""), { tone: "lo" }));
  out.push(D([0, 1, 2, 3].map((i) => at([ROUTER.x + 7.75 + i * 7.5, fy, 9])), { size: 0.4, tone: "hi" }));
  const vents = [];
  for (let i = 0; i < 5; i++) vents.push(k.planOutline({ x: ROUTER.x + 6, y: ROUTER.y + 6 + i * 5.4, w: 20, d: 2, r: 1 }, ROUTER_H, P, 2));
  out.push(L(vents.join(""), { tone: "faint" }));
  for (const [x, y] of byDepth([[ROUTER.x + 32, ROUTER.y + 5], [ROUTER.x + 32, ROUTER.y + 33]])) {
    out.push(cyl(x, y, 2, ROUTER_H, 1.6, { tone: "mid" }, 16));
    out.push(cyl(x, y, 0.8, ROUTER_H + 1.6, 13, { tone: "mid" }, 10));
    out.push(cyl(x, y, 1.2, ROUTER_H + 14.6, 1.2, { tone: "hi", crease: "lo" }, 12));
  }
  return out.join("");
}

// ---------- the tokens ----------
const TOKEN_SVG = (() => {
  const h = M.TOKEN.half;
  const body = S(k.slabOf({ x: -h, y: -h, w: h * 2, d: h * 2, r: 0.8 }, 0, M.TOKEN.h, P, 2, 0.4), { tone: "hi", crease: "lo" });
  const tag = S(k.slabOf({ x: -2.8, y: -0.7, w: 5.6, d: 1.4, r: 0.2 }, M.TOKEN.h, M.TOKEN.tag, P, 1, 0), { tone: "mid" });
  return { body, tag };
})();
const groupOf = (p) => (p[0] < M.RUNG_X[1] ? 1 : p[0] < M.RUNG_X[2] ? 2 : p[0] < M.RUNG_X[3] ? 3 : 4);
function tokensFor(state) {
  const t = M.SNAP_T[state];
  const groups = { 1: [], 2: [], 3: [], 4: [] };
  for (const token of M.TOKENS) {
    const a = M.tokenAt(token, t);
    const w = M.SHOW[state][token.dest - 1] * a.alpha;
    groups[groupOf(a.p)].push({ token, a, w });
  }
  const html = {};
  for (const g of [1, 2, 3, 4]) {
    html[g] = groups[g]
      .sort((u, v) => depth(...u.a.p) - depth(...v.a.p))
      .map(({ token, a, w }) => {
        const tagOn = a.tag > 0.02;
        return `<g data-token="${token.i}" transform="${k.translateAlong(P, a.p)}"${w < 0.999 ? ` opacity="${w.toFixed(2)}"` : ""}${w < 0.02 ? ` visibility="hidden"` : ""}>${TOKEN_SVG.body}<g data-tag=""${tagOn ? "" : ` visibility="hidden"`}>${TOKEN_SVG.tag}</g></g>`;
      })
      .join("");
  }
  return html;
}

// ---------- assemble ----------
function figure(state) {
  const tok = tokensFor(state);
  const gate = M.gateAt(M.SNAP_T[state]);
  const focus = M.FOCUS[state];
  const on = (r) => focus === r || focus === -1;
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "A fenced yard on a ground plate. Inside the fence three stepped platforms rise left to right: device (desks with laptops), workgroup (a desktop inference box and a half rack) and core (a short rack row in a cage). A router at the foot sends small request tokens up the rungs one at a time; most dock on a rung. One gate in the fence, with a turnstile, a meter and a press that strips the sensitive-context tag, leads over a deck to a much taller tower outside: the frontier, metered. The plinth reads US open 38, $0.58 per million tokens, 100 tokens a second, uncapped, against frontier 61, $3.85 per million, 47 tokens a second, metered.",
    body: [
      ground(),
      tower(),
      fenceRun([FENCE.x0, FENCE.y0], [FENCE.x1, FENCE.y0]),
      fenceRun([FENCE.x1, FENCE.y0], [FENCE.x1, GATE.back.y], { skipStart: true, skipEnd: true }),
      gateBack(),
      `<g data-group="4">${tok[4]}</g>`,
      cyl(TURN[0], TURN[1], 1.5, DECK_Z, ARM_Z - DECK_Z - 0.8, { tone: "mid" }, 16),
      `<path data-part="turnstile" class="iso-line" data-tone="red" data-free="end" style="stroke-width:3" d="${turnstileAt(gate.turn)}"/>`,
      cyl(TURN[0], TURN[1], 2.6, ARM_Z - 0.8, 1.6, { tone: "hi", crease: "lo" }, 18),
      `<g data-part="plunger" transform="${k.translateAlong(P, [0, 0, -PAD_TRAVEL * gate.press])}">${plunger()}</g>`,
      gateFront(),
      `<path data-part="needle" class="iso-line" data-tone="red" data-free="end" style="stroke-width:2.4" d="${meterNeedleAt(gate.count)}"/>`,
      D([at(METER)], { size: 0.9, tone: "hi" }),
      cabinet(),
      fenceRun([FENCE.x1, GATE.front.y + GATE.front.d], [FENCE.x1, FENCE.y1], { skipStart: true }),
      rungBase(2, on(2)),
      rung3(),
      `<g data-group="3">${tok[3]}</g>`,
      rungBase(1, on(1)),
      lift(1),
      rung2(),
      `<g data-group="2">${tok[2]}</g>`,
      rungBase(0, on(0)),
      lift(0),
      rung1(),
      `<g data-group="1">${tok[1]}</g>`,
      router(),
      fenceRun([FENCE.x0, FENCE.y0], [FENCE.x0, FENCE.y1], { skipStart: true }),
      fenceRun([FENCE.x0, FENCE.y1], [FENCE.x1, FENCE.y1], { skipStart: true }),
    ],
  });
}

const svg = figure(M.KEY_STATE);

const MODEL_SRC = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const live = `
${MODEL_SRC}
const P = ${JSON.stringify(P)};
const TURN = ${JSON.stringify(TURN)}, ARM_Z = ${ARM_Z}, ARM_R = ${ARM_R}, METER = ${JSON.stringify(METER)}, DIAL_R = ${DIAL_R}, PAD_TRAVEL = ${PAD_TRAVEL};
const turnstileAt = ${turnstileAt.toString().replaceAll("k.", "").replaceAll("M.", "")};
const meterNeedleAt = ${meterNeedleAt.toString().replaceAll("k.", "")};
const groupOf = ${groupOf.toString().replaceAll("M.", "")};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const groups = { 1: svg.querySelector('[data-group="1"]'), 2: svg.querySelector('[data-group="2"]'), 3: svg.querySelector('[data-group="3"]'), 4: svg.querySelector('[data-group="4"]') };
const tokenEls = new Map([...svg.querySelectorAll("[data-token]")].map((el) => [Number(el.dataset.token), el]));
const turnstile = svg.querySelector('[data-part="turnstile"]');
const needle = svg.querySelector('[data-part="needle"]');
const plungerEl = svg.querySelector('[data-part="plunger"]');
const labels = [0, 1, 2].map((r) => svg.querySelector('[data-rung-label="' + r + '"] text'));
const sockets = [0, 1, 2].map((r) => svg.querySelector('[data-sockets="' + r + '"] path'));
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const LAST = STATES.length - 1;
const board = {
  rung: document.querySelector('[data-board="rung"]'),
  inside: document.querySelector('[data-board-row="inside"]'),
  outside: document.querySelector('[data-board-row="outside"]'),
};
const BOARD_RUNG = ["DEVICE", "WORKGROUP", "CORE", "3 RUNGS", "3 RUNGS"];
let state = KEY_STATE, target = KEY_STATE, held = false, touring = true, clock = 0, idle = 0, frame = 0, last = 0, visible = false;
let t = SNAP_T[KEY_STATE];
const weights = SHOW[KEY_STATE].slice();
const TOUR = [4, 4, 0, 1, 2, 3, 3, 4, 4];
const tourAt = (c) => TOUR[Math.floor(c / 2.8) % TOUR.length];
const placed = new Map();
let blink = 1, pending = null;
function lockGate() {
  // the gate beat should show a pass through the press: if none is due in the next few seconds,
  // blink the tokens and pick the flow up 2.4 s before the next escalating pair reaches the stamp
  const wait = Math.min(...[0, 8.4].map((off) => (((SNAP_T[3] + off - t) % PERIOD) + PERIOD) % PERIOD));
  if (wait > 1.2 && wait < 4.5) return;
  const base = SNAP_T[3] - 2.4;
  pending = base + Math.ceil((t - base) / PERIOD) * PERIOD;
}
function setState(i) {
  if (i === state) return;
  state = i;
  if (i === 3 && !still.matches) lockGate();
  const focus = FOCUS[i];
  labels.forEach((el, r) => el && el.setAttribute("data-tone", focus === r || focus === -1 ? "hi" : "lo"));
  sockets.forEach((el, r) => el && el.setAttribute("data-tone", focus === r || focus === -1 ? "mid" : "faint"));
  const text = STATE_TEXT[i];
  if (readout.textContent !== text) readout.textContent = text;
  board.rung.textContent = BOARD_RUNG[i];
  board.inside.dataset.on = i === 3 ? "0" : "1";
  board.outside.dataset.on = i >= 3 ? "1" : "0";
  stage.setAttribute("aria-valuenow", String(i));
  stage.setAttribute("aria-valuetext", text);
}
function draw() {
  const order = { 1: [], 2: [], 3: [], 4: [] };
  for (const token of TOKENS) {
    const el = tokenEls.get(token.i);
    if (!el) continue;
    const a = tokenAt(token, t);
    const w = weights[token.dest - 1] * a.alpha * blink;
    el.setAttribute("transform", translateAlong(P, a.p));
    el.setAttribute("opacity", w.toFixed(3));
    el.setAttribute("visibility", w < 0.01 ? "hidden" : "visible");
    el.firstElementChild.nextElementSibling.setAttribute("visibility", a.tag > 0.02 ? "visible" : "hidden");
    order[groupOf(a.p)].push([depthOf(a.p, P), el]);
  }
  for (const g of [1, 2, 3, 4]) {
    const list = order[g].sort((u, v) => u[0] - v[0]).map((u) => u[1]);
    const prev = placed.get(g) || [];
    if (list.length !== prev.length || list.some((el, i) => el !== prev[i])) {
      for (const el of list) groups[g].appendChild(el);
      placed.set(g, list);
    }
  }
  const gate = gateAt(t);
  turnstile.setAttribute("d", turnstileAt(gate.turn));
  needle.setAttribute("d", meterNeedleAt(gate.count));
  plungerEl.setAttribute("transform", translateAlong(P, [0, 0, -PAD_TRAVEL * gate.press]));
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  setState(target);
  if (calm) t = SNAP_T[state];
  else {
    t += dt;
    if (pending !== null) { blink += (0 - blink) * (1 - Math.exp(-dt / 0.06)); if (blink < 0.03) { t = pending; pending = null; } }
    else blink += (1 - blink) * (1 - Math.exp(-dt / 0.12));
  }
  for (let d = 0; d < 4; d++) {
    const goal = SHOW[state][d];
    weights[d] = calm ? goal : weights[d] + (goal - weights[d]) * (1 - Math.exp(-dt / 0.35));
  }
  draw();
  frame = visible && !calm ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false;
  target = clamp(Math.round(next), 0, LAST);
  clearTimeout(idle);
  idle = setTimeout(() => { touring = !still.matches && !held; clock = 0; run(); }, 4200);
  if (still.matches) { setState(target); t = SNAP_T[target]; for (let d = 0; d < 4; d++) weights[d] = SHOW[target][d]; draw(); }
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(clamp(((event.clientX - box.left) / box.width - 0.08) / 0.84, 0, 1) * LAST);
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(LAST, target + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, target - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = LAST;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
window.figureApi = {
  states: STATES.slice(),
  set(i) {
    held = true; touring = false; clearTimeout(idle);
    target = clamp(Math.round(i), 0, LAST);
    if (still.matches) { setState(target); t = SNAP_T[target]; for (let d = 0; d < 4; d++) weights[d] = SHOW[target][d]; draw(); }
    run();
  },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const body = k.plateHtml({
  fig: "Fig 8",
  title: "The sovereign ladder",
  hint: "Move across to climb the ladder",
  readout: M.STATE_TEXT[M.KEY_STATE],
  keys: [
    { mark: "raised", label: "Rungs you own: device, workgroup, core — volume uncapped" },
    { mark: "red", label: "The one gate: turnstile and meter, context stripped, every pass metered" },
    { mark: "flat", label: "Request tokens; the card on each is its sensitive context" },
  ],
  caption:
    "The ladder grows one rung per refresh: devices with NPUs fill with this 2026–27 refresh, then a workgroup box, then the core. Volume on the rungs you own is uncapped; escalation to the frontier is earned, gated and metered, and sensitive context is stripped at the gate. The comparison is Artificial Analysis's current page, Opus 5 against Nemotron 3 Ultra: frontier 61 on the intelligence index at $3.85 per million tokens and 47 tokens a second; US open 38 at $0.58 per million and 100 tokens a second. Smarter by a third, nearly seven times the price, half the speed. The token mix and motion are illustrative.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Sovereign ladder: arrow keys step from the device rung to the workgroup, the core, the gate and the whole ladder" aria-valuemin="0" aria-valuemax="${M.STATES.length - 1}" aria-valuenow="${M.KEY_STATE}" aria-valuetext="${M.STATE_TEXT[M.KEY_STATE]}">${svg}</div>`,
});

const BOARD = `<div class="board ladder-board" aria-live="polite">
  <span class="lab">Rung</span><span class="lab">Model index</span><span class="lab">$ / M tokens</span><span class="lab">Tok / s</span><span class="lab">Metered?</span>
  <div class="row" data-board-row="inside" data-on="1"><span class="num" data-board="rung">3 RUNGS</span><span class="num">${M.OPEN.index}</span><span class="num">$${M.OPEN.price.toFixed(2)}</span><span class="num">${M.OPEN.tps}</span><span class="num">NO</span></div>
  <div class="row" data-board-row="outside" data-on="1"><span class="num">FRONTIER</span><span class="num">${M.FRONTIER.index}</span><span class="num">$${M.FRONTIER.price.toFixed(2)}</span><span class="num">${M.FRONTIER.tps}</span><span class="num bill">YES</span></div>
  <div class="note"><span>Smarter by a third. Nearly seven times the price. Half the speed.</span></div>
</div>`;
const LADDER_CSS = `
.board.ladder-board{grid-template-columns:minmax(0,1.7fr) repeat(4,minmax(0,1fr));gap:8px 18px;align-items:baseline}
.ladder-board .row{display:contents}
.ladder-board .row .num{font-size:clamp(20px,3.4vw,40px);transition:color .35s}
.ladder-board .row[data-on="0"] .num{color:var(--anatomy-faint)}
.ladder-board .row .num.bill{color:var(--anatomy-red)}
.ladder-board .row[data-on="0"] .num.bill{color:var(--anatomy-faint)}
.ladder-board .lab{white-space:normal}
.ladder-board .note{font-size:16px;color:var(--anatomy-text)}
.iso-swatch[data-mark="red"] path{stroke:var(--anatomy-red);stroke-width:2}
@media (max-width:700px){.board.ladder-board{grid-template-columns:minmax(0,1.6fr) repeat(4,minmax(0,1fr));gap:6px 8px;padding:12px}.ladder-board .row .num{font-size:15px}.ladder-board .lab{font-size:10px;letter-spacing:.04em}}
`;
const fig = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (fig === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "The sovereign ladder", theme: "light", body: fig, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${LADDER_CSS}</style>`);
writeSnapshot(HERE, SLOT, svg);
M.STATES.forEach((_, i) => writeSnapshot(HERE, `${SLOT}-${i + 1}`, figure(i)));
writeFileSync(join(HERE, `${SLOT}.html`), page);
console.log(`wrote ${SLOT}.html`, (page.length / 1024).toFixed(0) + " KB", "· scale", P.scale.toFixed(3));
// the smallest face text, in px on a 1200 px page (the plate is 1064 px wide there); the token meter's 3.6-unit floor is 11.2 px
console.log("smallest face text", (TEXT * P.scale * Math.sqrt(1.6) * (1064 / WIDTH)).toFixed(1) + " px at 1200 (floor 11.2 px)");
