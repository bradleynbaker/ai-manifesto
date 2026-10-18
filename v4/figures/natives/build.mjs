// Fig 10 · One in a thousand — an Anatomy figure for the v4 talk.
// An open-plan office floor plate (slab, columns, a lift-and-stair core, a cut curtain wall) holding 1,000 desks, 40 × 25.
// Two desks are natives: a machine on the desk and a red token stack rising from it, taller than anything else on the floor.
// Three months later the red has spread by adjacency, demo by demo, to the desks around them, each with a shorter stack.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../_anatomy/kit/iso-kit.mjs";
import { kitScript } from "../_anatomy/inline-kit.mjs";
import { PAPER_CSS } from "../_anatomy/paper.mjs";
import { STAGE_CSS } from "../_anatomy/stage.mjs";
import { EMBED_CSS, EMBED_JS, writeSnapshot } from "../_anatomy/embed.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 400;

// ---------- world plan (1 unit ≈ 20 cm; x, y on the floor, z up) ----------
const PX = 8, PY = 7, AISLE = 10;              // desk pitch across and deep, aisle between team blocks
const DESK = { w: 6, d: 4.2, h: 1.8 };
const X0 = -170, Y0 = -106;
const deskAt = ([c, r]) => [X0 + c * PX + Math.floor(c / M.BLOCK_W) * AISLE, Y0 + r * PY + Math.floor(r / M.BLOCK_D) * AISLE];
const GRID_R = X0 + (M.COLS - 1) * PX + 7 * AISLE + DESK.w;     // right edge of the desk field
const GRID_F = Y0 + (M.ROWS - 1) * PY + 4 * AISLE + DESK.d;     // front edge of the desk field

const SLAB = { x: -258, y: -124, w: GRID_R + 18 + 258, d: 248, r: 3 };
const SLAB_H = 15;
const CORE = { x: -244, y: -64, w: 40, d: 128, r: 1.5 };
const CORE_H = 26;
const BOX = { x: 2.8, y: 0.7, w: 3, d: 3, h: 2.8 };             // a native's machine, in desk coordinates
const STACK_AT = [BOX.x + BOX.w / 2, BOX.y + BOX.d / 2];
const NATIVE_R = 1.5, SPREAD_R = 1.15, COIN = 3;
const PLAQUE = { x: -86, w: 116, z: -14, h: 12.6 };
const LABEL = { x: GRID_R - 34, y: SLAB.y + SLAB.d - 13, w: 44, d: 9, r: 1.2 };

// building columns at aisle crossings: between team blocks 1|2, 3|4, 5|6 across and row blocks 1|2, 3|4 deep
const CHAIR_EDGE = DESK.d + 2.2; // the chairs stand proud of the desk front
const aisleX = (b) => (deskAt([5 * b + 4, 0])[0] + DESK.w + deskAt([5 * b + 5, 0])[0]) / 2;
const aisleY = (b) => (deskAt([0, 5 * b + 4])[1] + CHAIR_EDGE + deskAt([0, 5 * b + 5])[1]) / 2;
const COLUMNS = [];
for (const bx of [1, 3, 5]) for (const by of [0, 2]) COLUMNS.push([aisleX(bx), aisleY(by)]);

const NATIVE_DESKS = M.NATIVES.map(deskAt);
const P = k.fitProjection(
  [...k.boxCorners(SLAB, -SLAB_H, 0), ...NATIVE_DESKS.map(([x, y]) => [x + STACK_AT[0], y + STACK_AT[1], DESK.h + BOX.h + M.NATIVE_H + 2])],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 58 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);

// ---------- one token stack: a column of coins, rebuilt live as it grows ----------
function stackSvg(cx, cy, z0, h, r, kind) {
  if (h < 0.4) return "";
  const body = k.cylinder(cx, cy, r, z0, h, P, 20);
  let seams = "";
  for (let z = z0 + 3; z < z0 + h - 1.2; z += 3) seams += k.sideArc(cx, cy, r, z, P, 12);
  const cap = h > 2 ? k.solidSvg(k.cylinder(cx, cy, r + 0.35, z0 + h - 1.2, 1.2, P, 20), { tone: "red", crease: "none", className: "nt-" + kind + " nt-cap" }) : "";
  return k.solidSvg(body, { tone: "red", crease: "none", className: "nt-" + kind, inner: seams ? k.lineSvg(seams, { tone: "red", className: "nt-seam" }) : "" }) + cap;
}

// ---------- the desk: a top, a monitor, a chair — one shape, used 1,000 times ----------
function deskShape() {
  const out = [];
  out.push(S(k.slabOf({ x: 0, y: 0, w: DESK.w, d: DESK.d, r: 0.4 }, 0, DESK.h, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: 0.5, y: 0.45, w: 2.2, d: 0.5, r: 0.1 }, DESK.h, 2.1, P, 1), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(DESK.w / 2, DESK.d + 1.25, 0.95, 0, 1.1, P, 12), { tone: "lo", crease: "none" }));
  return out.join("");
}
// the same desk in red, laid over a red-pilled desk
function redDesk(native) {
  const out = [S(k.slabOf({ x: 0, y: 0, w: DESK.w, d: DESK.d, r: 0.4 }, 0, DESK.h, P, 2), { tone: "red", crease: "none", className: "nt-desk" })];
  out.push(S(k.slabOf({ x: 0.5, y: 0.45, w: 2.2, d: 0.5, r: 0.1 }, DESK.h, 2.1, P, 1), { tone: "mid", crease: "none" }));
  if (native) {
    // the native's own machine: a small box with a vent face and a power dot
    out.push(S(k.slabOf({ x: BOX.x, y: BOX.y, w: BOX.w, d: BOX.d, r: 0.3 }, DESK.h, BOX.h, P, 2, 0.25), { tone: "hi", crease: "lo" }));
    out.push(D([at([BOX.x + BOX.w - 0.6, BOX.y + BOX.d, DESK.h + BOX.h - 0.7])], { size: 0.35, tone: "hi" }));
  }
  out.push(S(k.cylinder(DESK.w / 2, DESK.d + 1.25, 0.95, 0, 1.1, P, 12), { tone: "lo", crease: "none" }));
  return out.join("");
}

// ---------- the floor plate ----------
function slab() {
  const out = [`<path class="iso-halo" d="${k.haloOf(SLAB, -SLAB_H, SLAB_H, P)}"/>`];
  out.push(S(k.slabOf(SLAB, -SLAB_H, SLAB_H, P, 4, 1), { tone: "lo", inner: L(k.sideSeam(SLAB, -3.5, P, 4), { tone: "faint" }) }));
  // the carpet field: a groove round the desks, inset from the cut curtain wall
  out.push(L(k.planOutline({ x: X0 - 8, y: Y0 - 8, w: GRID_R - X0 + 16, d: GRID_F - Y0 + 16, r: 2 }, 0, P, 3), { tone: "faint" }));
  return out.join("");
}

// the cut curtain wall: a sill on each edge with mullion stubs, back edges before the floor, front edges after
const MULL = 1.6, SILL_W = 2, SILL_H = 1.2, MULL_H = 9;
const sills = {
  back: { x: SLAB.x + 1, y: SLAB.y + 1, w: SLAB.w - 2, d: SILL_W, r: 0.3 },
  left: { x: SLAB.x + 1, y: SLAB.y + 1 + SILL_W, w: SILL_W, d: SLAB.d - 2 - 2 * SILL_W, r: 0.3 },
  right: { x: SLAB.x + SLAB.w - 1 - SILL_W, y: SLAB.y + 1 + SILL_W, w: SILL_W, d: SLAB.d - 2 - 2 * SILL_W, r: 0.3 },
  front: { x: SLAB.x + 1, y: SLAB.y + SLAB.d - 1 - SILL_W, w: SLAB.w - 2, d: SILL_W, r: 0.3 },
};
function wall(side) {
  const s = sills[side];
  const along = s.w > s.d ? "x" : "y";
  const len = along === "x" ? s.w : s.d;
  const count = Math.round(len / 24);
  const out = [S(k.slabOf(s, 0, SILL_H, P, 2), { tone: "mid", crease: "none" })];
  const posts = [];
  for (let i = 0; i <= count; i++) {
    const t = (len - MULL) * (i / count);
    const px = along === "x" ? s.x + t : s.x + (SILL_W - MULL) / 2;
    const py = along === "x" ? s.y + (SILL_W - MULL) / 2 : s.y + t;
    if (along === "y" && (i === 0 || i === count)) continue;
    posts.push([px, py]);
  }
  posts.sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
  for (const [px, py] of posts) {
    out.push(S(k.slabOf({ x: px, y: py, w: MULL, d: MULL, r: 0.2 }, SILL_H, MULL_H, P, 1), { tone: "mid", crease: "none" }));
    out.push(L(k.planOutline({ x: px + 0.35, y: py + 0.35, w: MULL - 0.7, d: MULL - 0.7, r: 0 }, SILL_H + MULL_H, P, 1), { tone: "faint" }));
  }
  return out.join("");
}

// the lift-and-stair core, cut at the ceiling line
function core() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CORE, 3), 0, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.slabOf(CORE, 0, CORE_H, P, 2, 0.6), { tone: "mid", inner: L(k.sideSeam(CORE, 2, P, 2), { tone: "faint" }) }));
  // the section through the walls: three lift shafts and a stair, seen from above as voids
  const voids = [
    { x: CORE.x + 4, y: CORE.y + 6, w: 32, d: 18, r: 0 },
    { x: CORE.x + 4, y: CORE.y + 28, w: 32, d: 18, r: 0 },
    { x: CORE.x + 4, y: CORE.y + 50, w: 32, d: 18, r: 0 },
    { x: CORE.x + 4, y: CORE.y + 76, w: 32, d: 46, r: 0 },
  ];
  for (const v of voids) {
    out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-0)" d="${k.planOutline(v, CORE_H, P, 1)}"/>`);
    out.push(L(k.planOutline(v, CORE_H, P, 1), { tone: "lo" }));
  }
  // lift cars' guide rails: a line across each shaft, wall to wall
  for (const v of voids.slice(0, 3)) out.push(L(k.lineOnTop([v.x, v.y + v.d / 2], [v.x + v.w, v.y + v.d / 2], CORE_H, P), { tone: "faint" }));
  // stair treads across the stair void, wall to wall, with the half-landing wall down the middle
  const st = voids[3];
  const treads = [];
  for (let y = st.y + 10; y < st.y + st.d - 4; y += 3) treads.push(k.lineOnTop([st.x, y], [st.x + st.w, y], CORE_H, P));
  out.push(L(treads.join(""), { tone: "faint" }));
  out.push(L(k.lineOnTop([st.x + st.w / 2, st.y + 10], [st.x + st.w / 2, st.y + st.d], CORE_H, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([st.x, st.y + 10], [st.x + st.w, st.y + 10], CORE_H, P), { tone: "lo" }));
  // lift doors on the floor-side face (+x), each a pair of leaves; a stair door further along
  const fx = CORE.x + CORE.w;
  const door = (y0, w, h, split) => {
    const ring = [[fx, y0, 0], [fx, y0, h], [fx, y0 + w, h], [fx, y0 + w, 0]].map(at);
    let d = k.pathOf(ring);
    if (split) d += k.segment([fx, y0 + w / 2, 0], [fx, y0 + w / 2, h], P);
    return L(d, { tone: "lo" });
  };
  for (const v of voids.slice(0, 3)) {
    out.push(door(v.y + 4, 10, 15, true));
    out.push(D([at([fx, v.y + 16, 9])], { size: 0.45 })); // call button
  }
  out.push(door(st.y + 30, 9, 15, false));
  out.push(D([at([fx, st.y + 37.2, 7.5])], { size: 0.45 })); // door handle
  return out.join("");
}

// a structural column, cut at the ceiling line, on a base plate
function column([cx, cy]) {
  const out = [];
  out.push(S(k.slabOf({ x: cx - 4.2, y: cy - 4.2, w: 8.4, d: 8.4, r: 0.4 }, 0, 0.8, P, 1), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf({ x: cx - 3, y: cy - 3, w: 6, d: 6, r: 0.4 }, 0.8, 23, P, 1, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline({ x: cx - 2.2, y: cy - 2.2, w: 4.4, d: 4.4, r: 0 }, 23.8, P, 1), { tone: "faint" }));
  out.push(D([[cx - 3.4, cy + 3.4], [cx + 3.4, cy + 3.4], [cx + 3.4, cy - 3.4]].map(([x, y]) => at([x, y, 0.8])), { size: 0.35 }));
  return out.join("");
}

// the bronze plaque on the slab edge: the live count
const PLAQUE_Y = SLAB.y + SLAB.d;
function plaque() {
  const out = [S(k.slabOf({ x: PLAQUE.x, y: PLAQUE_Y, w: PLAQUE.w, d: 0.8, r: 0.2 }, PLAQUE.z, PLAQUE.h, P, 1), { tone: "hi", crease: "lo" })];
  const pf = PLAQUE_Y + 0.8;
  const rim = [[PLAQUE.x + 1.2, pf, PLAQUE.z + 1.2], [PLAQUE.x + 1.2, pf, PLAQUE.z + PLAQUE.h - 1.2], [PLAQUE.x + PLAQUE.w - 1.2, pf, PLAQUE.z + PLAQUE.h - 1.2], [PLAQUE.x + PLAQUE.w - 1.2, pf, PLAQUE.z + 1.2]].map(at);
  out.push(L(k.pathOf(rim, true), { tone: "faint" }));
  out.push(D([[PLAQUE.x + 3, PLAQUE.z + PLAQUE.h / 2], [PLAQUE.x + PLAQUE.w - 3, PLAQUE.z + PLAQUE.h / 2]].map(([x, z]) => at([x, pf, z])), { size: 0.45, tone: "hi" }));
  out.push(k.faceTextSvg(k.sideMatrix([PLAQUE.x + PLAQUE.w / 2, pf], PLAQUE.z + 2.6, P, "left"), "0 OF 1,000", { size: 9.4, tone: "hi", anchor: "middle" }).replace("<text ", '<text data-part="plaque" '));
  return out.join("");
}

// the floor's label plate, front right: three rule lines that stand for printed text
function label() {
  const out = [S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "mid", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(LABEL, 1.4), 0.8, P, 3), { tone: "faint" }));
  [[28, 3], [20, 5], [24, 7]].forEach(([len, dy]) => out.push(L(k.lineOnTop([LABEL.x + 4, LABEL.y + dy], [LABEL.x + 4 + len, LABEL.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + LABEL.w - 3, LABEL.y + 3, 0.8]), at([LABEL.x + LABEL.w - 3, LABEL.y + LABEL.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ---------- the floor: every desk, column, red desk and stack in one depth order ----------
const LIVE = [
  ...M.NATIVES.map((desk, i) => ({ desk, native: true, h: M.NATIVE_H, id: i })),
  ...M.SPREAD_DESKS.map((e, j) => ({ desk: e.desk, native: false, h: e.h, id: M.NATIVES.length + j })),
];
const liveKey = new Map(LIVE.map((l) => [l.desk[1] * M.COLS + l.desk[0], l]));
const stackBase = (l) => {
  const [x, y] = deskAt(l.desk);
  return { cx: x + STACK_AT[0], cy: y + STACK_AT[1], z0: DESK.h + (l.native ? BOX.h : 0), r: l.native ? NATIVE_R : SPREAD_R, kind: l.native ? "native" : "spread" };
};
function growthOf(u) {
  const m = M.at(u);
  return LIVE.map((l) => (l.native ? m.native : m.grow[l.id - M.NATIVES.length]));
}
const ease = (t) => t * t * (3 - 2 * t);

function floor(u) {
  const g = growthOf(u);
  const items = [];
  for (let r = 0; r < M.ROWS; r++)
    for (let c = 0; c < M.COLS; c++) {
      const [x, y] = deskAt([c, r]);
      const l = liveKey.get(r * M.COLS + c);
      let svg = `<use href="#nt-desk" transform="${k.translateAlong(P, [x, y, 0])}"/>`;
      if (l) svg += `<g data-red="${l.id}" opacity="${Math.min(1, g[l.id] * 1.6).toFixed(3)}" transform="${k.translateAlong(P, [x, y, 0])}"><use href="#nt-red-${l.native ? "native" : "spread"}"/></g>`;
      items.push({ key: depth(x + DESK.w / 2, y + DESK.d / 2), svg });
      if (l) {
        const b = stackBase(l);
        items.push({ key: depth(x + DESK.w / 2, y + DESK.d / 2) + 0.001, svg: `<g data-stack="${l.id}">${stackSvg(b.cx, b.cy, b.z0, l.h * ease(g[l.id]), b.r, b.kind)}</g>` });
      }
    }
  for (const cxy of COLUMNS) items.push({ key: depth(cxy[0], cxy[1]), svg: column(cxy) });
  items.sort((a, b) => a.key - b.key);
  return items.map((i) => i.svg).join("");
}

const STYLE = `<style>
.nt-desk>.iso-top{fill:#f0a6a8}.nt-desk>.iso-shade{fill:#e88588}.nt-desk>.iso-fill{fill:#e88588}.nt-desk>.iso-edge{stroke:#b9363a}
.nt-native>.iso-fill,.nt-native>.iso-shade[data-shade="0"]{fill:#d94a4f}.nt-native>.iso-shade[data-shade="1"]{fill:#e15a5f}.nt-native>.iso-shade[data-shade="2"]{fill:#e8706f}.nt-native>.iso-shade[data-shade="3"]{fill:#ee8a8a}.nt-native>.iso-top{fill:#f6b4b4}.nt-native>.iso-edge{stroke:#9e2328}
.nt-spread>.iso-fill,.nt-spread>.iso-shade[data-shade="0"]{fill:#e8888b}.nt-spread>.iso-shade[data-shade="1"]{fill:#ed999b}.nt-spread>.iso-shade[data-shade="2"]{fill:#f1aaab}.nt-spread>.iso-shade[data-shade="3"]{fill:#f4bbbb}.nt-spread>.iso-top{fill:#f8d2d2}.nt-spread>.iso-edge{stroke:#b9363a}
.nt-seam{stroke:#b9363a;opacity:.55}.nt-native .nt-seam{stroke:#8f1f24}
</style>`;
const DEFS = `<defs><g id="nt-desk">${deskShape()}</g><g id="nt-red-native">${redDesk(true)}</g><g id="nt-red-spread">${redDesk(false)}</g></defs>`;

const LABEL_TEXT =
  "An open-plan office floor plate, cut at the ceiling line, with a lift-and-stair core, six structural columns and 1,000 desks in a 40 by 25 grid. Two desks are natives: each has its own machine and a tall red token stack rising from it, towering over the floor, because those two burn more tokens than the other 998 people combined. Three months later the red has spread to fourteen neighbouring desks around the two, each with a shorter stack.";

function svgAt(u) {
  const m = M.at(u);
  return k
    .figureSvg({
      width: WIDTH,
      height: HEIGHT,
      label: LABEL_TEXT,
      body: [STYLE, DEFS, slab(), wall("back"), wall("left"), core(), floor(u), label(), wall("right"), wall("front"), plaque()],
    })
    .replace("0 OF 1,000", `${m.lit} OF 1,000`);
}

// ---------- live ----------
const live = `
const P = ${JSON.stringify(P)};
const STATES = ${JSON.stringify(M.STATES)};
const NATIVES = ${JSON.stringify(M.NATIVES)}, SPREAD = ${M.SPREAD};
const LIVE = ${JSON.stringify(LIVE.map((l) => ({ ...stackBase(l), h: l.h, id: l.id, native: l.native })))};
const COIN = ${COIN};
const model = ${M.at.toString().replace(/^function at/, "function")};
const stackSvg = ${stackSvg.toString().replaceAll("k.", "")};
const ease = (t) => t * t * (3 - 2 * t);
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const plaqueText = svg.querySelector('[data-part="plaque"]');
const reds = LIVE.map((l) => svg.querySelector('[data-red="' + l.id + '"]'));
const stacks = LIVE.map((l) => svg.querySelector('[data-stack="' + l.id + '"]'));
const shown = LIVE.map(() => -1);
const board = {
  natives: document.querySelector('[data-board="natives"]'),
  red: document.querySelector('[data-board="red"]'),
  tokens: document.querySelector('[data-board="tokens"]'),
  note: document.querySelector('[data-board="note"]'),
};
const NOTES = [
  "One floor, a thousand people, every desk the same. Where are the natives?",
  "Two people building their own agents on a harness. Their two stacks: more tokens than the other 998 combined.",
  "Three months on: red-pilled by adjacency, demo by demo, team by team. Catch it while it is two dots, not fifty.",
];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let u = ${M.KEY}, target = u, frame = 0, last = 0, clock = 0, touring = true, visible = false, idle = 0, held = false, drawnU = -1;
const TOUR = [0, 1, 1, 2, 2, 2];
const tourAt = (t) => TOUR[Math.floor(t / 2.6) % TOUR.length];
function draw() {
  if (u === drawnU) return;
  drawnU = u;
  const m = model(u);
  LIVE.forEach((l, i) => {
    const g = l.native ? m.native : m.grow[i - NATIVES.length];
    const op = Math.min(1, g * 1.6).toFixed(3);
    if (reds[i].getAttribute("opacity") !== op) reds[i].setAttribute("opacity", op);
    const h = Math.round(l.h * ease(g) * 20) / 20;
    if (h !== shown[i]) { shown[i] = h; stacks[i].innerHTML = stackSvg(l.cx, l.cy, l.z0, h, l.r, l.kind); }
  });
  const state = Math.round(u);
  const text = m.lit + " / 1,000 lit";
  if (readout.textContent !== text) readout.textContent = text;
  const plaque = m.lit + " OF 1,000";
  if (plaqueText.textContent !== plaque) plaqueText.textContent = plaque;
  board.natives.textContent = m.native > 0.5 ? "2" : "?";
  board.red.textContent = String(m.lit);
  board.tokens.textContent = m.native > 0.5 ? "2 > 998" : "—";
  board.note.textContent = NOTES[state];
  stage.setAttribute("aria-valuenow", String(state));
  stage.setAttribute("aria-valuetext", STATES[state] + " · " + m.lit + " of 1,000 desks red-pilled");
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  const tau = target > u ? 0.9 : 0.45;
  u = calm ? target : u + (target - u) * (1 - Math.exp(-dt / tau));
  if (Math.abs(target - u) < 0.0005) u = target;
  draw();
  frame = visible && (touring || u !== target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = clamp(next, 0, 2); clearTimeout(idle); if (!held) idle = setTimeout(() => { touring = !still.matches && !held; clock = 0; run(); }, 4200); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  if (held) return;
  const box = svg.getBoundingClientRect();
  steer(Math.round(clamp(((event.clientX - box.left) / box.width - 0.12) / 0.76, 0, 1) * 2));
});
stage.addEventListener("keydown", (event) => {
  const here = Math.round(target);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(2, here + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, here - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = 2;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
draw();
window.figureApi = {
  states: STATES,
  set(i) { held = true; touring = false; clearTimeout(idle); target = clamp(i, 0, 2); run(); },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const keyState = M.at(M.KEY);
const svg = svgAt(M.KEY);
const body = k.plateHtml({
  fig: "Fig 10",
  title: "One in a thousand",
  hint: "Move across: today, then three months",
  readout: `${keyState.lit} / 1,000 lit`,
  keys: [
    { mark: "red", label: "Red: the two natives (own machine, tall token stack) and, paler, the desks they red-pilled" },
    { mark: "dim", label: "Grey: the other desks, 40 × 25" },
  ],
  caption:
    "Illustrative frames. The one-in-a-thousand count is Brad's field observation of people building their own agents on a harness, not of organizations deploying vendor agents; by contrast, surveys say 40% of large enterprises are “scaling agents” (McKinsey, State of AI 2026). The two natives burn more tokens than the other 998 combined; stack heights and the shape of the three-month spread are illustrative, generated by adjacency from the two seats with a fixed seed. Catch it early, while it's two dots and not fifty.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Office floor: arrow keys step from 1,000 people, to today's two natives, to the spread three months later" aria-valuemin="0" aria-valuemax="2" aria-valuenow="${M.KEY}">${svg}</div>`,
});

const BOARD = `<div class="board nt-board" aria-live="polite">
  <div class="cell"><span class="lab">People</span><span class="num">1,000</span></div>
  <div class="cell"><span class="lab">Natives</span><span class="num" data-board="natives">2</span></div>
  <div class="cell red"><span class="lab">Red-pilled</span><span class="num" data-board="red">${keyState.lit}</span></div>
  <div class="cell bill"><span class="lab">Tokens · natives vs the rest</span><span class="num" data-board="tokens">2 &gt; 998</span></div>
  <div class="note"><span data-board="note">Three months on: red-pilled by adjacency, demo by demo, team by team. Catch it while it is two dots, not fifty.</span></div>
</div>`;
const BOARD_CSS = `.board.nt-board{grid-template-columns:repeat(4,minmax(0,1fr))}.board.nt-board .red .num{color:var(--anatomy-red)}@media (max-width:700px){.board.nt-board{grid-template-columns:1fr 1fr}}`;
const figure = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figure === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "One in a thousand", theme: "light", body: figure, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${BOARD_CSS}</style>`);
writeSnapshot(HERE, "natives", svg);
[0, 1, 2].forEach((s) => writeSnapshot(HERE, `natives-${s + 1}`, svgAt(s)));
writeFileSync(join(HERE, "natives.html"), page);
console.log("wrote natives.html", (page.length / 1024).toFixed(0) + " KB", "· columns", COLUMNS.map((c) => c.map(Math.round).join(",")).join(" "));
