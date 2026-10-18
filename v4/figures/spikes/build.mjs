// F6 · The spike press — an Anatomy figure for the v4 talk.
// A usage-map table: 33 cells, one per category of work, each with a short column as tall as the usage is dense
// (illustrative). Two glass planes stand over the map at the real index scores: US open 38 and frontier 61.
// A gantry press travels cell to cell and pulls a tall spike (a shipped frontier-lab product) up out of the densest
// cells in launch order: image gen, software, security, finance / CFO, legal. The last dense cell is dashed: yours?
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
const HEIGHT = 450;

// ---------- world plan (x along the table, y toward the front, z up) ----------
const ZP = M.Z_PER_POINT;
const PLATE = { x: -166, y: -62, w: 334, d: 112, r: 8 };
const PLATE_H = 14;
const FOOT_H = 5;
const FRONT = PLATE.y + PLATE.d; // the apron face that carries the nameplates
const PITCH_X = 20, PITCH_Y = 22, X0 = -80, Y0 = -22;
const cellAt = (c, r) => [X0 + c * PITCH_X, Y0 + r * PITCH_Y];
const TILE = 8.5, COL = 6;

const Z38 = M.INDEX.open * ZP, Z61 = M.INDEX.frontier * ZP, GLASS = 0.8;
const SHEET = { x: -150, y: -40, w: 304, d: 80, r: 3 };
const RODS = [[-146, -36], [150, -36], [-146, 36], [150, 36]];
const ROD_R = 1.4;

const POSTS = [-160, 158];        // gantry posts (x of their left face), at the back
const POST = { y: -56, w: 8, d: 8 };
const RAIL = { x: -166, y: -56, w: 334, d: 8, r: 1 };
const RAIL_Z = 114, RAIL_H = 7;
const CARRIAGE = { x: -10, y: -58, w: 20, d: 14, r: 2 };
const CARRIAGE_Z = RAIL_Z + RAIL_H, CARRIAGE_H = 6;
const ARM = { x: -4, y: -44, w: 8, d: 86, r: 1 };
const ARM_Z = CARRIAGE_Z, ARM_H = 5;
const TROLLEY = { x: -6, y: -6.5, w: 12, d: 13, r: 1.5 };
const TROLLEY_Z = 113, ROPE_TOP = 111.6;
const HEAD_H = 13;
const COLLAR = 1.2, CAP = 2.6;

const SPIKES = M.SPIKES.map((s) => ({ ...s, at: cellAt(s.col, s.row), base: M.DENSITY[s.row][s.col] * ZP, top: s.peak * ZP }));
const YOURS_AT = cellAt(M.YOURS.col, M.YOURS.row);
const D = {
  last: M.LAST,
  spikes: SPIKES.length,
  home: [-118, 8],
  cells: [...SPIKES.map((s) => s.at), YOURS_AT],
  bases: SPIKES.map((s) => s.base),
  peaks: SPIKES.map((s) => s.top),
  collar: COLLAR,
  cap: CAP,
  travel: Math.max(...SPIKES.map((s) => s.top)) + CAP + 4,
  hover: Z61 + GLASS + 9,
};
const G = { Z38, Z61, COLLAR, CAP, HEAD_H, ROPE_TOP, spikes: SPIKES.map(({ at, base }) => ({ at, base })) };

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...k.boxCorners(RAIL, RAIL_Z, CARRIAGE_Z + CARRIAGE_H),
    [D.home[0], ARM.y + ARM.d, ARM_Z + ARM_H],
    [YOURS_AT[0], ARM.y + ARM.d, ARM_Z + ARM_H],
  ],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 58 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const depth = ([x, y]) => k.depthOf([x, y, 0], P);
const square = ([x, y], h, r = 0.8) => ({ x: x - h, y: y - h, w: 2 * h, d: 2 * h, r });

// ---------- shared with the live script (they take k, G and P, so they run in both places) ----------
function spikeLayer(k, G, P, i, top, layer) {
  const s = G.spikes[i];
  if (top === null || top === undefined || top < s.base + G.COLLAR + 0.3) return "";
  const [cx, cy] = s.at;
  const sq = (h, r) => ({ x: cx - h, y: cy - h, w: 2 * h, d: 2 * h, r });
  const lay = (z) => (z < G.Z38 ? 0 : z < G.Z61 ? 1 : 2);
  const lo = [-1e9, G.Z38, G.Z61][layer], hi = [G.Z38, G.Z61, 1e9][layer];
  const out = [];
  if (lay(s.base) === layer) {
    out.push(k.solidSvg(k.slabOf(sq(5, 1), s.base, G.COLLAR, P, 3, 0.4), { tone: "mid" }));
    out.push(k.dotsSvg([[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]].map(([dx, dy]) => k.iso([cx + dx, cy + dy, s.base + G.COLLAR], P)), { size: 0.4 }));
  }
  const a = Math.max(s.base + G.COLLAR, lo), b = Math.min(top, hi);
  if (b - a > 0.05) out.push(k.solidSvg(k.slabOf(sq(3, 0.6), a, b - a, P, 3), { tone: "hi", crease: "lo" }));
  if (lay(top) === layer) {
    out.push(k.solidSvg(k.slabOf(sq(4.5, 1), top, G.CAP, P, 3, 0.5), { tone: "hi", crease: "lo" }));
  }
  return out.join("");
}

function ropeAt(k, G, P, x, y, z) {
  return k.segment([x, y, z + G.HEAD_H], [x, y, G.ROPE_TOP], P);
}

const slotOf = (G, z) => (z < G.Z38 ? 0 : z < G.Z61 ? 1 : 2);

// ---------- the table ----------
function table() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of [...k.corners(PLATE, 22)].sort((a, b) => depth(a) - depth(b))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "lo", inner: L(k.sideSeam(PLATE, -1.8, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(Dots(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // the nameplates on the front apron, one under each dense cell
  [...SPIKES, { ...M.YOURS, at: YOURS_AT }].forEach((s, i) => {
    const plan = { x: s.at[0] - 19.4, y: FRONT, w: 38.8, d: 0.8, r: 0.4 };
    out.push(`<g data-plate="${i}" data-on="${i === SPIKES.length ? "" : "0"}">`);
    out.push(S(k.slabOf(plan, -13, 12, P, 2), { tone: "mid", crease: "none" }));
    const face = (z) => k.sideMatrix([s.at[0], FRONT + 0.8], z, P, "left");
    if (s.years) {
      out.push(k.faceTextSvg(face(-5.5), s.name, { size: 4.3, tone: "hi", anchor: "middle" }));
      out.push(k.faceTextSvg(face(-11), s.years, { size: 4.3, tone: "mid", anchor: "middle" }));
    } else {
      out.push(k.faceTextSvg(face(-8.8), s.name, { size: 5, tone: "hi", anchor: "middle" }));
    }
    out.push("</g>");
  });
  return out.join("");
}

// ---------- the gantry at the back: posts, the index ruler, the rail ----------
function gantryBack() {
  const out = [];
  for (const x of POSTS) {
    out.push(S(k.slabOf({ x: x - 2, y: POST.y - 2, w: POST.w + 4, d: POST.d + 4, r: 1.5 }, 0, 2.4, P, 3, 0.4), { tone: "lo" }));
    out.push(Dots([[x - 0.6, POST.y + POST.d + 0.6], [x + POST.w + 0.6, POST.y + POST.d + 0.6]].map(([px, py]) => at([px, py, 2.4])), { size: 0.4 }));
    out.push(S(k.slabOf({ x, y: POST.y, w: POST.w, d: POST.d, r: 1 }, 2.4, RAIL_Z - 2.4, P, 3, 0.4), { tone: "mid", inner: L(k.sideSeam({ x, y: POST.y, w: POST.w, d: POST.d, r: 1 }, RAIL_Z - 8, P, 3), { tone: "faint" }) }));
  }
  // the index ruler on the left post's front face: a tick every 5 points, a long one every 10, 38 and 61 marked
  const rx = POSTS[0] + 1.2, ry = POST.y + POST.d;
  out.push(S(k.slabOf({ x: rx, y: ry, w: 5.6, d: 0.6, r: 0.2 }, 6, 100 * ZP - 6 + 3, P, 1), { tone: "lo", crease: "none" }));
  const tick = (pts, len) => k.segment([rx, ry + 0.6, pts * ZP], [rx + len, ry + 0.6, pts * ZP], P);
  const minor = [], major = [];
  for (let p = 10; p <= 100; p += 5) (p % 10 ? minor : major).push(tick(p, p % 10 ? 1.8 : 3));
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  out.push(L(tick(M.INDEX.open, 5.6) + tick(M.INDEX.frontier, 5.6), { tone: "hi" }));
  // the rail
  out.push(S(k.slabOf(RAIL, RAIL_Z, RAIL_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(RAIL, RAIL_Z + 2, P, 3), { tone: "faint" }) }));
  out.push(L(k.lineOnTop([RAIL.x + 1.2, RAIL.y + 4], [RAIL.x + RAIL.w - 1.2, RAIL.y + 4], RAIL_Z + RAIL_H, P), { tone: "faint" }));
  out.push(Dots(POSTS.map((x) => at([x + POST.w / 2, RAIL.y + 1.8, RAIL_Z + RAIL_H])), { size: 0.45 }));
  for (const x of [RAIL.x, RAIL.x + RAIL.w - 4]) out.push(S(k.slabOf({ x, y: RAIL.y - 1, w: 4, d: RAIL.d + 2, r: 0.8 }, RAIL_Z + RAIL_H, 4, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}

// ---------- the map ----------
function tiles() {
  const out = [];
  out.push(L(k.planOutline({ x: X0 - 12, y: Y0 - 12, w: (M.COLS - 1) * PITCH_X + 24, d: (M.ROWS - 1) * PITCH_Y + 24, r: 3 }, 0, P, 3), { tone: "faint" }));
  for (let r = 0; r < M.ROWS; r++) for (let c = 0; c < M.COLS; c++) {
    out.push(S(k.slabOf(square(cellAt(c, r), TILE, 1), 0, 0.5, P, 2), { tone: "lo", crease: "none", flat: true }));
  }
  // the one accent: the sixth dense cell, nobody's spike yet
  out.push(`<path class="iso-line" data-tone="red" style="stroke-width:1.7;stroke-dasharray:4 3" d="${k.planOutline(square(YOURS_AT, TILE + 1.6, 2.4), 0.5, P, 3)}"/>`);
  return out.join("");
}

function column(c, r) {
  const [x, y] = cellAt(c, r);
  const h = M.DENSITY[r][c] * ZP;
  const solid = S(k.slabOf(square([x, y], COL, 0.8), 0.5, h - 0.5, P, 2, 0.4), { tone: "mid" });
  if (c !== M.YOURS.col || r !== M.YOURS.row) return solid;
  return solid + `<path class="iso-line" data-tone="red" style="stroke-width:1.7;stroke-dasharray:4 3" d="${k.planOutline(square([x, y], COL - 1.6, 0.6), h, P, 2)}"/>`;
}

// a sheet-support rod, cut where the glass planes cross it
function rodLayer([x, y], layer) {
  const out = [];
  const span = [[0, Z38], [Z38 + GLASS, Z61], [Z61 + GLASS, Z61 + GLASS + 2.2]][layer];
  if (layer === 0) out.push(S(k.cylinder(x, y, 3.2, 0, 1.2, P, 20, 0.3), { tone: "lo" }));
  const z0 = layer === 0 ? 1.2 : span[0];
  if (layer < 2) {
    out.push(S(k.cylinder(x, y, ROD_R, z0, span[1] - 1.6 - z0, P, 16), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 2.6, span[1] - 1.6, 1.6, P, 20, 0.3), { tone: "mid" }));
  }
  if (layer > 0) out.push(S(k.cylinder(x, y, 2.2, span[0], 1.4, P, 6, 0.2), { tone: "mid" }));
  return out.join("");
}

function sheet(z) {
  const s = k.slabOf(SHEET, z, GLASS, P, 4);
  return `<g class="sheet"><path d="${s.fill}" style="fill:var(--anatomy-top);fill-opacity:.22;stroke:none"/><path d="${s.shades.join("")}" style="fill:var(--anatomy-shade-1);fill-opacity:.6;stroke:none"/>${L(s.crease, { tone: "faint" })}${L(s.outline, { tone: "mid" })}</g>`;
}

// a tab hangs below its plane, or (above = true) stands on it, so two close planes never stack their tabs
function tab(z, line1, line2, above = false) {
  const plan = { x: above ? -136 : -148, y: SHEET.y + SHEET.d, w: 44, d: 0.8, r: 0.3 };
  const cx = plan.x + plan.w / 2;
  const face = (h) => k.sideMatrix([cx, plan.y + plan.d], h, P, "left");
  const top = above ? z + GLASS + 14.4 : z;
  return [
    S(k.slabOf(plan, top - 14.4, 14.4 + GLASS, P, 2), { tone: "mid", crease: "none" }),
    k.faceTextSvg(face(top - 5.4), line1, { size: 4.6, tone: "hi", anchor: "middle" }),
    k.faceTextSvg(face(top - 11.6), line2, { size: 4.2, tone: "mid", anchor: "middle" }),
  ].join("");
}

// ---------- the moving parts, built at rest ----------
function head() {
  const out = [];
  out.push(S(k.cylinder(0, 0, 4.2, 0, 2, P, 28, 0.3), { tone: "hi", crease: "lo" }));
  const body = { x: -6.5, y: -6.5, w: 13, d: 13, r: 1.6 };
  out.push(S(k.slabOf(body, 2, 8, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(body, 5, P, 4), { tone: "faint" }) }));
  out.push(Dots(k.corners(body, 2.2).map(([x, y]) => at([x, y, 10])), { size: 0.45 }));
  out.push(S(k.cylinder(0, 0, 3, 10, 1.5, P, 20, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 1.5, 11.5, HEAD_H - 11.5, P, 14), { tone: "hi", crease: "lo" }));
  return out.join("");
}

function carriage() {
  const out = [];
  out.push(S(k.slabOf(CARRIAGE, CARRIAGE_Z, CARRIAGE_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(CARRIAGE, CARRIAGE_Z + 2.4, P, 3), { tone: "faint" }) }));
  out.push(Dots(k.corners(CARRIAGE, 2.4).map(([x, y]) => at([x, y, CARRIAGE_Z + CARRIAGE_H])), { size: 0.45 }));
  out.push(S(k.slabOf(ARM, ARM_Z, ARM_H, P, 2, 0.4), { tone: "mid" }));
  out.push(L(k.lineOnTop([0, ARM.y + 1], [0, ARM.y + ARM.d - 1], ARM_Z + ARM_H, P), { tone: "faint" }));
  out.push(S(k.slabOf({ x: -5, y: ARM.y + ARM.d - 3, w: 10, d: 3, r: 0.6 }, ARM_Z - 3, ARM_H + 4, P, 2, 0.3), { tone: "mid" }));
  out.push(Dots([at([0, ARM.y + ARM.d - 1.5, ARM_Z + ARM_H + 1])], { size: 0.45 }));
  return out.join("");
}

function trolley() {
  const out = [];
  out.push(S(k.cylinder(0, 0, 2, ROPE_TOP, TROLLEY_Z - ROPE_TOP, P, 16), { tone: "mid" }));
  out.push(S(k.slabOf(TROLLEY, TROLLEY_Z, ARM_Z - TROLLEY_Z, P, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(TROLLEY, TROLLEY_Z + 3, P, 3), { tone: "faint" }) }));
  out.push(Dots([[-4, 6.5], [4, 6.5]].map(([x, y]) => at([x, y, TROLLEY_Z + 4.6])), { size: 0.5, tone: "hi" }));
  return out.join("");
}

// ---------- assemble one pose ----------
function scene(u) {
  const pose = M.poseAt(u, D);
  const n = Math.round(u);
  const cells = [];
  for (let r = 0; r < M.ROWS; r++) for (let c = 0; c < M.COLS; c++) cells.push({ key: depth(cellAt(c, r)), c, r });
  const spikeIndex = (c, r) => SPIKES.findIndex((s) => s.col === c && s.row === r);
  const layer = (l) => {
    const items = [];
    for (const { key, c, r } of cells) {
      const i = spikeIndex(c, r);
      const parts = (l === 0 ? column(c, r) : "") + (i >= 0 ? `<g data-spike="${i}-${l}">${spikeLayer(k, G, P, i, pose.tops[i], l)}</g>` : "");
      if (parts) items.push({ key, svg: parts });
    }
    for (const rod of RODS) items.push({ key: depth(rod), svg: rodLayer(rod, l) });
    return items.sort((a, b) => a.key - b.key).map((it) => it.svg).join("");
  };
  const slot = slotOf(G, pose.z);
  const headSvg = `<g data-part="head" transform="${k.translateAlong(P, [pose.x, pose.y, pose.z])}">${head()}</g>`;
  const svg = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "A usage-map table of 33 cells, one per category of work, each with a short column as tall as that work is dense (illustrative). Two glass planes stand over the map at index 38, the leading US open-weight model, and index 61, the metered frontier. Every routine column sits under the 38 plane. A gantry press pulls tall spikes, shipped frontier-lab products, up through both planes out of the densest cells in launch order: image gen 2022, software 2024–25, security 2025, finance and CFO 2025–26, legal 2026. A sixth dense cell is dashed in red: yours?",
    body: [
      table(),
      gantryBack(),
      tiles(),
      layer(0),
      `<g data-slot="0">${slot === 0 ? headSvg : ""}</g>`,
      sheet(Z38),
      tab(Z38, `US OPEN · ${M.INDEX.open}`, "UNCAPPED"),
      layer(1),
      `<g data-slot="1">${slot === 1 ? headSvg : ""}</g>`,
      sheet(Z61),
      tab(Z61, `FRONTIER · ${M.INDEX.frontier}`, "METERED", true),
      layer(2),
      `<g data-slot="2">${slot === 2 ? headSvg : ""}</g>`,
      L(ropeAt(k, G, P, pose.x, pose.y, pose.z), { tone: "hi" }).replace("<path", '<path data-part="rope" style="stroke-width:1.1"'),
      `<g data-part="trolley" transform="${k.translateAlong(P, [pose.x, pose.y, 0])}">${trolley()}</g>`,
      `<g data-part="carriage" transform="${k.translateAlong(P, [pose.x, 0, 0])}">${carriage()}</g>`,
    ],
  });
  // nameplates light up once their spike is out
  return svg.replace(/data-plate="(\d)" data-on="0"/g, (m, i) => `data-plate="${i}" data-on="${Number(i) < n ? "1" : "0"}"`);
}

// ---------- live ----------
const live = `
const P = ${JSON.stringify(P)};
const G = ${JSON.stringify(G)};
const D = ${JSON.stringify(D)};
const READ = ${JSON.stringify(M.STATES.map((_, n) => M.readoutOf(n)))};
const STATES = ${JSON.stringify(M.STATES)};
const SPIKES = ${JSON.stringify(M.SPIKES.map(({ name, years }) => ({ name, years })))};
const LAST = ${M.LAST}, KEY = ${M.KEY};
const k = { slabOf, cylinder, solidSvg, lineSvg, dotsSvg, segment, translateAlong, iso };
const poseAt = ${M.poseAt.toString()};
const spikeLayer = ${spikeLayer.toString()};
const ropeAt = ${ropeAt.toString()};
const slotOf = ${slotOf.toString()};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const headEl = part("head"), rope = part("rope"), trolleyEl = part("trolley"), carriageEl = part("carriage");
const slots = [0, 1, 2].map((l) => svg.querySelector('[data-slot="' + l + '"]'));
const spikeEls = D.peaks.map((_, i) => [0, 1, 2].map((l) => svg.querySelector('[data-spike="' + i + '-' + l + '"]')));
const plates = [...svg.querySelectorAll("[data-plate]")];
const readout = document.querySelector("[data-readout]");
const board = { name: document.querySelector('[data-board="name"]'), year: document.querySelector('[data-board="year"]') };
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let booting = true; setTimeout(() => { booting = false; }, 0);
let u = KEY, target = KEY, frame = 0, last = 0, touring = true, visible = false, idle = 0, dwell = 0, held = false;
let drawnTops = D.peaks.map(() => -1), drawnSlot = -1, said = -1;
function draw() {
  const p = poseAt(u, D);
  headEl.setAttribute("transform", translateAlong(P, [p.x, p.y, p.z]));
  const s = slotOf(G, p.z);
  if (s !== drawnSlot) { slots[s].appendChild(headEl); drawnSlot = s; }
  rope.setAttribute("d", ropeAt(k, G, P, p.x, p.y, p.z));
  trolleyEl.setAttribute("transform", translateAlong(P, [p.x, p.y, 0]));
  carriageEl.setAttribute("transform", translateAlong(P, [p.x, 0, 0]));
  p.tops.forEach((t, i) => {
    const key = t === null ? -1 : Math.round(t * 20) / 20;
    if (key === drawnTops[i]) return;
    drawnTops[i] = key;
    spikeEls[i].forEach((el, l) => { el.innerHTML = spikeLayer(k, G, P, i, t, l); });
  });
  const n = Math.round(u);
  const done = (i) => p.tops[i] !== null && p.tops[i] >= D.peaks[i] - 0.01;
  plates.forEach((el, i) => { if (i < D.spikes) el.setAttribute("data-on", done(i) ? "1" : "0"); });
  if (n !== said) {
    said = n;
    readout.textContent = READ[n];
    if (board.name) {
      board.name.textContent = n === 0 ? "—" : n <= D.spikes ? SPIKES[n - 1].name : "YOURS?";
      board.year.textContent = n === 0 ? "—" : n <= D.spikes ? SPIKES[n - 1].years : "next";
    }
    stage.setAttribute("aria-valuenow", String(n));
    stage.setAttribute("aria-valuetext", READ[n]);
  }
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring && Math.abs(target - u) < 1e-4) {
    dwell += dt;
    if (dwell > (target === LAST ? 3.6 : 2.6)) { target = target === LAST ? 0 : target + 1; dwell = 0; }
  }
  const gap = target - u;
  const rate = 0.42 + 0.9 * Math.max(0, Math.abs(gap) - 1);
  u = calm ? target : u + Math.sign(gap) * Math.min(Math.abs(gap), rate * dt);
  draw();
  const settled = !touring && u === target;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false; target = clamp(next, 0, LAST); clearTimeout(idle);
  if (!held) idle = setTimeout(() => { touring = !still.matches && !held; dwell = 0; run(); }, 4200);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(Math.round(clamp(((event.clientX - box.left) / box.width - 0.12) / 0.76, 0, 1) * LAST));
});
stage.addEventListener("keydown", (event) => {
  const here = Math.round(target);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(LAST, here + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, here - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = LAST;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
draw();
window.figureApi = {
  states: STATES,
  set(i) {
    held = true; touring = false; clearTimeout(idle);
    target = clamp(Math.round(i), 0, LAST);
    if (booting || still.matches) { u = target; draw(); }
    run();
  },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const CSS = `
.iso-svg [data-plate][data-on="0"] .iso-face-text{fill:var(--anatomy-lo)}
.board.spikes-board{grid-template-columns:1.6fr 1.1fr 1fr 1fr}
@media (max-width:700px){.board.spikes-board{grid-template-columns:1fr 1fr}}
`;

const KEY_SVG = scene(M.KEY);
const body = k.plateHtml({
  fig: "Fig 6",
  title: "The spike press",
  hint: "Move across to run the press",
  readout: M.readoutOf(M.KEY),
  keys: [
    { mark: "raised", label: "Columns: 33 categories of work, as tall as the usage is dense (illustrative)" },
    { mark: "lit", label: "Spikes: shipped frontier-lab products, in launch order" },
    { mark: "flat", label: "Glass planes: index 38 (US open, uncapped) and 61 (frontier, metered)" },
    { mark: "red", label: "Dashed cell: dense, no spike yet: yours?" },
  ],
  caption:
    "The named spikes are shipped frontier-lab products, in order of public launch: image generation 2022, software 2024–25, security 2025, finance / CFO 2025–26, legal 2026. The two planes are real index scores from Artificial Analysis's current model comparison: Nemotron 3 Ultra, the leading US open-weight model, at 38, which runs on your own rungs uncapped; the Opus-class frontier at 61, metered. Column and spike heights are illustrative. The causal reading, that the labs built where the usage traces were dense, is Brad's read on top of the labs' own published method of classifying usage into 30+ categories of work.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Spike press: arrow keys step the press from the bare usage map through five shipped spikes to the dashed cell" aria-valuemin="0" aria-valuemax="${M.LAST}" aria-valuenow="${M.KEY}" aria-valuetext="${M.readoutOf(M.KEY)}">${KEY_SVG}</div>`,
});

const BOARD = `<div class="board spikes-board" aria-live="polite">
  <div class="cell"><span class="lab">Spike</span><span class="num" data-board="name">${SPIKES[M.KEY - 1].name}</span></div>
  <div class="cell"><span class="lab">Shipped</span><span class="num" data-board="year">${SPIKES[M.KEY - 1].years}</span></div>
  <div class="cell"><span class="lab">US open index</span><span class="num">${M.INDEX.open}</span></div>
  <div class="cell bill"><span class="lab">Frontier index</span><span class="num">${M.INDEX.frontier}</span></div>
  <div class="note"><span>Most of the map sits under the open plane. The spikes go through the frontier plane. Heights illustrative; 38 and 61 are Artificial Analysis index scores.</span></div>
</div>`;
const figure = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figure === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "The spike press", theme: "light", body: figure, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${CSS}</style>`);

// static snapshots: the key state, and one per state (the plates' lit/unlit tone is inlined for the lone SVG)
const inline = (svg) => svg.replace(/(<g data-plate="\d" data-on="0">(?:(?!<\/g>).)*?<\/g>)((?:<text[^>]*>[^<]*<\/text>)+)/g, (m, solid, texts) => solid + texts.replace(/data-tone="(hi|mid)"/g, 'data-tone="lo"'));
writeSnapshot(HERE, "spikes", inline(KEY_SVG));
M.STATES.forEach((_, n) => writeSnapshot(HERE, `spikes-${n + 1}`, inline(scene(n))));
writeFileSync(join(HERE, "spikes.html"), page);
console.log("wrote spikes.html", (page.length / 1024).toFixed(0) + " KB", "· scale", P.scale.toFixed(3));
