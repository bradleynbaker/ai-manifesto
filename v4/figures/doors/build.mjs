// F5 · Two doors — an Anatomy figure for the v4 talk.
// An office in section on a plinth, walls cut low so we see the desks. Work leaves as small packets by one of two exits:
// the front door, a metered turnstile under the enterprise contract (not trained on), or the side door, an ordinary
// door wedged open onto personal accounts (training on, five-year retention). Cap the turnstile and the bar drops; the
// work does not stop, it reroutes out the side door — the corner office first.
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
const HEIGHT = 440;
const { FLOOR } = M;

// ---------- world plan ----------
const PLINTH = { x: -134, y: -104, w: 284, d: 220, r: 9 };
const PLINTH_H = 10, FOOT_H = 5;
const BLD = { x: -120, y: -90, w: 220, d: 150, r: 1.5 };
const WALL_TOP = FLOOR + 12;
const DOOR_TOP = FLOOR + 30;
const HEAD_TOP = DOOR_TOP + 4;
const SIGN_TOP = HEAD_TOP + 16;

const FRONT_PATH = { x: -92, y: 60, w: 24, d: 56, r: 0 };
const SIDE_PATH = { x: 100, y: -12, w: 50, d: 24, r: 0 };

const FRONT_SIGN = { x: -114, y: 56.5, w: 68, d: 2.5, r: 0.6 };
const SIDE_SIGN = { x: 96.5, y: -44, w: 2.5, d: 88, r: 0.6 };

const BAR = { x: -93.4, y: 97.4, w: 26.8, d: 2.6, r: 0.4 };
const GATE_H = 26;
const BAR_UP = 20, BAR_H = 3.4, BAR_DOWN = FLOOR + 0.6;
const DROP = BAR_UP - BAR_DOWN;

const CAB = { x: -112, y: 72, w: 18, d: 24, r: 1.2 };
const CAB_H = 17;
const COUNTER = { x: -111.2, y: 73, w: 16.4, d: 9, r: 0.8 };
const COUNTER_TOP = CAB_H + 9.5;
const WIN = { x0: -110, x1: -96, z0: CAB_H + 1.8, z1: CAB_H + 7.6, y: COUNTER.y + COUNTER.d };
const HUB = [-86, 86, 15.2];
const ARM = 13;

const HINGE = [101, -14];
const LEAF_W = 28, LEAF_T = 2, OPEN = (96 * Math.PI) / 180;

// one view: azimuth 45 puts the turnstile on the left face and the side door on the right; elevation 36 looks into the room
const P = k.fitProjection(
  [...k.boxCorners(PLINTH, -PLINTH_H - FOOT_H, 0), ...k.boxCorners({ x: FRONT_SIGN.x, y: FRONT_SIGN.y, w: FRONT_SIGN.w, d: 3 }, 0, SIGN_TOP), ...k.boxCorners({ x: SIDE_SIGN.x, y: SIDE_SIGN.y, w: 3, d: SIDE_SIGN.d }, 0, SIGN_TOP)],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 45, elevation: 36 },
);
// type on the object is at least as large on screen as the token meter's smallest printed numeral (3.6 units at scale 1.48)
const MIN_TEXT = (3.6 * 1.4802) / P.scale;

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts, closed = true) => k.pathOf(k.pointsAt(pts, P), closed);
const depth = ([x, y, z = 0]) => k.depthOf([x, y, z], P);
const box = (plan, z, h, o = {}) => S(k.slabOf({ r: 0, ...plan }, z, h, P, o.steps ?? 3, o.bevel ?? 0), { tone: o.tone ?? "mid", crease: o.crease ?? "faint", inner: o.inner ?? "", className: o.className, lit: o.lit });
const cyl = (x, y, r, z, h, o = {}) => S(k.cylinder(x, y, r, z, h, P, o.steps ?? 28, o.bevel ?? 0), { tone: o.tone ?? "mid", crease: o.crease ?? "faint", inner: o.inner ?? "", className: o.className });
const seamOf = (plan, z, steps = 3) => L(k.sideSeam({ r: 0, ...plan }, z, P, steps), { tone: "faint" });
const text = (matrix, words, size, tone = "hi", anchor = "middle") => {
  if (size < MIN_TEXT - 1e-9) throw new Error(`text "${words}" at ${size} is under the stage minimum ${MIN_TEXT.toFixed(2)}`);
  return k.faceTextSvg(matrix, words, { size, tone, anchor });
};
const textWidth = (words, size) => words.length * size * 0.64; // mono glyph advance with the kit's .04em tracking
const fits = (words, size, room) => { if (textWidth(words, size) > room) throw new Error(`text "${words}" overflows ${room}`); return size; };

// ---------- the plinth and the floor ----------
function plinth() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLINTH, -PLINTH_H - FOOT_H, PLINTH_H, P)}"/>`];
  const byD = (pts) => [...pts].sort((a, b) => depth(a) - depth(b));
  for (const [x, y] of byD(k.corners(PLINTH, 24))) {
    out.push(cyl(x, y, 7, -PLINTH_H - FOOT_H, 1.6, { tone: "lo" }));
    out.push(cyl(x, y, 5.4, -PLINTH_H - FOOT_H + 1.6, FOOT_H - 1.6));
  }
  out.push(S(k.slabOf(PLINTH, -PLINTH_H, PLINTH_H, P, 8, 1.6), { tone: "lo", inner: L(k.sideSeam(PLINTH, -PLINTH_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLINTH, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLINTH, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // label plate: three rule lines that stand for printed text
  const LABEL = { x: 108, y: 90, w: 30, d: 13, r: 1.5 };
  out.push(S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "mid", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P, 3), { tone: "faint" }));
  [[18, 3.8], [13, 6.4], [16, 9]].forEach(([len, dy]) => out.push(L(k.lineOnTop([LABEL.x + 4, LABEL.y + dy], [LABEL.x + 4 + len, LABEL.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + LABEL.w - 3.4, LABEL.y + 3.4, 0.8]), at([LABEL.x + LABEL.w - 3.4, LABEL.y + LABEL.d - 3.4, 0.8])], { size: 0.45 }));
  // paving: the front walk through the turnstile pen and the side walk from the wedged door, flush with the floor
  for (const path of [FRONT_PATH, SIDE_PATH]) out.push(S(k.slabOf(path, 0, FLOOR, P, 1), { tone: "lo", crease: "faint" }));
  const joints = [];
  for (let y = FRONT_PATH.y + 10; y < FRONT_PATH.y + FRONT_PATH.d - 2; y += 10) joints.push(k.lineOnTop([FRONT_PATH.x, y], [FRONT_PATH.x + FRONT_PATH.w, y], FLOOR, P));
  for (let x = SIDE_PATH.x + 10; x < SIDE_PATH.x + SIDE_PATH.w - 2; x += 10) joints.push(k.lineOnTop([x, SIDE_PATH.y], [x, SIDE_PATH.y + SIDE_PATH.d], FLOOR, P));
  out.push(L(joints.join(""), { tone: "faint" }));
  // the floor slab of the building and its carpet-tile grid (skipping the two door lines, so every line ends under a wall)
  out.push(S(k.slabOf(BLD, 0, FLOOR, P, 3), { tone: "lo" }));
  const grid = [];
  for (const x of [-100, -60, -40, -20, 0, 20, 40, 60, 80]) grid.push(k.lineOnTop([x, -86], [x, 56], FLOOR, P));
  for (const y of [-70, -50, -30, 20, 40]) grid.push(k.lineOnTop([-116, y], [96, y], FLOOR, P));
  out.push(L(grid.join(""), { tone: "faint" }));
  return out.join("");
}

// walls are cut low: their tops are the section cut, drawn darker
const wall = (plan) => box(plan, FLOOR, WALL_TOP - FLOOR, { className: "cut", tone: "mid" });

function backWalls() {
  return wall({ x: -120, y: -90, w: 4, d: 150 }) + wall({ x: -116, y: -90, w: 216, d: 4 });
}

// ---------- furniture ----------
function chair(cx, cy, back, tall = 7) {
  const out = [];
  out.push(cyl(cx, cy, 4.2, FLOOR, 0.8, { tone: "lo" }));
  out.push(cyl(cx, cy, 0.8, FLOOR + 0.8, 4.7, { crease: "none" }));
  out.push(cyl(cx, cy, 4.6, FLOOR + 5.5, 1.8, { tone: "mid", bevel: 0.3 }));
  const B = { px: { x: cx + 3.4, y: cy - 4.5, w: 1.8, d: 9 }, mx: { x: cx - 5.2, y: cy - 4.5, w: 1.8, d: 9 }, py: { x: cx - 4.5, y: cy + 3.4, w: 9, d: 1.8 }, my: { x: cx - 4.5, y: cy - 5.2, w: 9, d: 1.8 } }[back];
  out.push(box({ ...B, r: 0.6 }, FLOOR + 7.3, tall, { bevel: 0.3 }));
  return out.join("");
}

function screenOnY(x0, x1, y, z0, z1) {
  return L(poly([[x0 + 1, y, z0 + 1], [x1 - 1, y, z0 + 1], [x1 - 1, y, z1 - 1], [x0 + 1, y, z1 - 1]]), { tone: "lo" });
}
function screenOnX(y0, y1, x, z0, z1) {
  return L(poly([[x, y0 + 1, z0 + 1], [x, y1 - 1, z0 + 1], [x, y1 - 1, z1 - 1], [x, y0 + 1, z1 - 1]]), { tone: "lo" });
}
// a drawer pedestal whose drawer seams run edge to edge on its visible front face
function pedestal(plan, face) {
  const h = 10.2, top = FLOOR + h;
  // drawer gaps wrap the visible corner and end on the silhouette
  const seams = [FLOOR + 3.6, FLOOR + 6.9].map((z) => k.sideSeam(plan, z, P, 3)).join("");
  const pulls = [FLOOR + 2, FLOOR + 5.3, FLOOR + 8.6].map((z) => at(face === "y" ? [plan.x + plan.w / 2, plan.y + plan.d, z] : [plan.x + plan.w, plan.y + plan.d / 2, z]));
  return box(plan, FLOOR, h, { inner: L(seams, { tone: "lo" }) }) + D(pulls, { size: 0.55, tone: "hi" });
}

// row A: along the back-right wall, the worker at +y facing the wall
function deskA(x) {
  const out = [];
  out.push(box({ x: x + 1, y: -85, w: 1.6, d: 13 }, FLOOR, 10.2));
  out.push(pedestal({ x: x + 19, y: -85, w: 8, d: 13 }, "y"));
  out.push(box({ x, y: -86, w: 28, d: 15, r: 1 }, FLOOR + 10.2, 1.6, { bevel: 0.3 }));
  const T = FLOOR + 11.8;
  out.push(box({ x: x + 9, y: -84.5, w: 10, d: 4, r: 1 }, T, 0.6, { tone: "lo" }));
  out.push(box({ x: x + 13, y: -83.4, w: 2, d: 1.6 }, T + 0.6, 2.6));
  out.push(box({ x: x + 6, y: -82.8, w: 16, d: 1.4, r: 0.3 }, T + 3.2, 9, { tone: "hi", crease: "lo", inner: screenOnY(x + 6, x + 22, -81.4, T + 3.2, T + 12.2) }));
  out.push(box({ x: x + 8, y: -77, w: 11, d: 3.6, r: 0.5 }, T, 0.6, { tone: "lo" }));
  out.push(chair(x + 12, -64, "py"));
  return out.join("");
}
// row B: along the back-left wall, the worker at +x
function deskB(y) {
  const out = [];
  out.push(box({ x: -115, y: y + 1, w: 13, d: 1.6 }, FLOOR, 10.2));
  out.push(pedestal({ x: -115, y: y + 19, w: 13, d: 8 }, "x"));
  out.push(box({ x: -116, y, w: 15, d: 28, r: 1 }, FLOOR + 10.2, 1.6, { bevel: 0.3 }));
  const T = FLOOR + 11.8;
  out.push(box({ x: -115.5, y: y + 9, w: 4, d: 10, r: 1 }, T, 0.6, { tone: "lo" }));
  out.push(box({ x: -114.4, y: y + 13, w: 1.6, d: 2 }, T + 0.6, 2.6));
  out.push(box({ x: -114.8, y: y + 6, w: 1.4, d: 16, r: 0.3 }, T + 3.2, 9, { tone: "hi", crease: "lo", inner: screenOnX(y + 6, y + 22, -113.4, T + 3.2, T + 12.2) }));
  out.push(box({ x: -109, y: y + 8.5, w: 3.6, d: 11, r: 0.5 }, T, 0.6, { tone: "lo" }));
  out.push(chair(-95, y + 12, "px"));
  return out.join("");
}

function plant(x, y, r = 4) {
  return [
    cyl(x, y, r, FLOOR, 7, { tone: "mid", bevel: 0.4, inner: L(k.sideArc(x, y, r, FLOOR + 5.6, P, 20), { tone: "faint" }) }),
    cyl(x, y, r * 1.5, FLOOR + 7, 3, { tone: "lo", crease: "none" }),
    cyl(x, y, r * 1.1, FLOOR + 10, 3, { tone: "lo", crease: "none" }),
    cyl(x, y, r * 0.6, FLOOR + 13, 2.4, { tone: "lo", crease: "none" }),
  ].join("");
}

function filing() {
  const plan = { x: -114, y: -84, w: 12, d: 18, r: 0.6 };
  const seams = [FLOOR + 6, FLOOR + 12].map((z) => k.sideSeam(plan, z, P, 3)).join("");
  const pulls = [FLOOR + 3, FLOOR + 9, FLOOR + 15].map((z) => at([plan.x + plan.w, plan.y + plan.d / 2, z]));
  return box(plan, FLOOR, 18, { bevel: 0.4, inner: L(seams, { tone: "lo" }) }) + D(pulls, { size: 0.6, tone: "hi" });
}

function backFurniture() {
  const items = [
    { at: [-108, -75], svg: filing() },
    ...[-62, -30].map((y) => ({ at: [-108, y + 14], svg: deskB(y) })),
    ...[-60, -20, 20, 60].map((x) => ({ at: [x + 14, -78], svg: deskA(x) })),
    { at: [-108, 46], svg: plant(-108, 46) },
  ];
  return items.sort((a, b) => depth(a.at) - depth(b.at)).map((i) => i.svg).join("");
}

// ---------- the front door: jambs, drop bar, header and the contract sign ----------
function frontLeft() {
  const out = [];
  out.push(wall({ x: -120, y: 56, w: 22, d: 4 }));
  out.push(box({ x: -94, y: 55, w: 28, d: 6 }, FLOOR, 0.6, { tone: "lo", crease: "none" })); // sill
  out.push(box({ x: -98, y: 55, w: 4, d: 6 }, FLOOR, DOOR_TOP - FLOOR));
  return out.join("");
}

// the gate at the pen's exit, just past the rotor: two slotted posts and the bar that drops between them
function gatePost(x) {
  const plan = { x, y: 96.8, w: 3, d: 3.8, r: 0.4 };
  const slot = k.segment([x + 1.5, plan.y + plan.d, 0], [x + 1.5, plan.y + plan.d, GATE_H], P);
  return box(plan, 0, GATE_H, { bevel: 0.3, inner: L(slot, { tone: "lo" }) }) + box({ x: x - 0.5, y: 96.3, w: 4, d: 4.8, r: 0.6 }, GATE_H, 1.2, { tone: "hi", crease: "lo", bevel: 0.2 });
}
function dropBar() {
  const out = [];
  const face = BAR.y + BAR.d;
  const stripes = [];
  for (let x = BAR.x + 2; x + BAR_H <= BAR.x + BAR.w - 1; x += 4) stripes.push(k.segment([x, face, BAR_UP + BAR_H], [x + BAR_H, face, BAR_UP], P));
  out.push(box(BAR, BAR_UP, BAR_H, { tone: "hi", crease: "lo", inner: L(stripes.join(""), { tone: "mid" }) }));
  return out.join("");
}

function frontRight() {
  const out = [];
  out.push(wall({ x: -62, y: 56, w: 158, d: 4 }));
  out.push(box({ x: -66, y: 55, w: 4, d: 6 }, FLOOR, DOOR_TOP - FLOOR));
  out.push(box({ x: -100, y: 55, w: 40, d: 6, r: 0.4 }, DOOR_TOP, HEAD_TOP - DOOR_TOP, { bevel: 0.3, inner: seamOf({ x: -100, y: 55, w: 40, d: 6 }, DOOR_TOP + 2) }));
  for (const x of [FRONT_SIGN.x + 3, FRONT_SIGN.x + FRONT_SIGN.w - 5]) out.push(box({ x, y: 57, w: 2, d: 2.4 }, WALL_TOP, HEAD_TOP - WALL_TOP));
  out.push(sign(FRONT_SIGN, "y", ["ENTERPRISE CONTRACT", "NOT TRAINED ON"], "hi", ""));
  return out.join("");
}

// a sign board: border inset, two lines of type, four screws
function sign(plan, face, [line1, line2], tone, className) {
  const z0 = HEAD_TOP, z1 = SIGN_TOP;
  const room = (face === "y" ? plan.w : plan.d) - 6;
  const fit = (w) => Math.min(5.6, room / (w.length * 0.64));
  const s1 = fit(line1), s2 = Math.min(fit(line2), s1);
  const out = [];
  let border, t1, t2, screws;
  if (face === "y") {
    const y = plan.y + plan.d, cx = plan.x + plan.w / 2;
    border = poly([[plan.x + 1.6, y, z0 + 1.6], [plan.x + plan.w - 1.6, y, z0 + 1.6], [plan.x + plan.w - 1.6, y, z1 - 1.6], [plan.x + 1.6, y, z1 - 1.6]]);
    t1 = text(k.sideMatrix([cx, y], z1 - 6.4, P, "left"), line1, s1, tone);
    t2 = text(k.sideMatrix([cx, y], z0 + 3.6, P, "left"), line2, s2, tone);
    screws = [[plan.x + 3.2, y, z1 - 3.2], [plan.x + plan.w - 3.2, y, z1 - 3.2], [plan.x + 3.2, y, z0 + 3.2], [plan.x + plan.w - 3.2, y, z0 + 3.2]];
  } else {
    const x = plan.x + plan.w, cy = plan.y + plan.d / 2;
    border = poly([[x, plan.y + 1.6, z0 + 1.6], [x, plan.y + plan.d - 1.6, z0 + 1.6], [x, plan.y + plan.d - 1.6, z1 - 1.6], [x, plan.y + 1.6, z1 - 1.6]]);
    t1 = text(k.sideMatrix([x, cy], z1 - 6.4, P, "right"), line1, s1, tone);
    t2 = text(k.sideMatrix([x, cy], z0 + 3.6, P, "right"), line2, s2, tone);
    screws = [[x, plan.y + 3.2, z1 - 3.2], [x, plan.y + plan.d - 3.2, z1 - 3.2], [x, plan.y + 3.2, z0 + 3.2], [x, plan.y + plan.d - 3.2, z0 + 3.2]];
  }
  out.push(box(plan, z0, z1 - z0, { tone: tone === "red" ? "red" : "hi", crease: "lo", bevel: 0.3, className, inner: L(border, { tone: tone === "red" ? "red" : "lo" }) }));
  out.push(D(screws.map(at), { size: 0.5, tone: "mid" }), t1, t2);
  return out.join("");
}

// ---------- the side door: far jamb, the wedged leaf, near jamb, header and the personal-accounts sign ----------
const LEAF_DIR = [Math.sin(OPEN), Math.cos(OPEN)];
const LEAF_BACK = [Math.cos(OPEN), -Math.sin(OPEN)]; // the leaf's thickness lies on its far side
const leafPt = (along, off = 0) => [HINGE[0] + LEAF_DIR[0] * along + LEAF_BACK[0] * off, HINGE[1] + LEAF_DIR[1] * along + LEAF_BACK[1] * off];
const LEAF_Z0 = FLOOR + 0.6, LEAF_Z1 = DOOR_TOP - 0.4;

function sideFar() {
  const out = [];
  out.push(wall({ x: 96, y: -86, w: 4, d: 68 }));
  out.push(box({ x: 95, y: -14, w: 6, d: 28 }, FLOOR, 0.6, { tone: "lo", crease: "none" })); // sill
  out.push(box({ x: 95, y: -18, w: 6, d: 4 }, FLOOR, DOOR_TOP - FLOOR));
  return out.join("");
}

function leaf() {
  const out = [];
  const ring = [leafPt(0, 0), leafPt(LEAF_W, 0), leafPt(LEAF_W, LEAF_T), leafPt(0, LEAF_T)];
  // the near face (toward the walk): a panel inset and a kick plate, all closed or edge to edge
  const f = (a, z) => [...leafPt(a, 0), z];
  const panel = poly([f(3, LEAF_Z0 + 9), f(LEAF_W - 3, LEAF_Z0 + 9), f(LEAF_W - 3, LEAF_Z1 - 3), f(3, LEAF_Z1 - 3)]);
  const kick = poly([f(2, LEAF_Z0 + 1.2), f(LEAF_W - 2, LEAF_Z0 + 1.2), f(LEAF_W - 2, LEAF_Z0 + 5.6), f(2, LEAF_Z0 + 5.6)]);
  out.push(S(k.extrude(ring, LEAF_Z0, LEAF_Z1 - LEAF_Z0, P), { tone: "red", crease: "red", className: "accent", inner: L(panel, { tone: "red" }) + L(kick, { tone: "red" }) }));
  // hinges on the hinge edge, the lever handle near the free edge
  for (const z of [LEAF_Z0 + 5, LEAF_Z1 - 7]) out.push(cyl(HINGE[0] - 0.4, HINGE[1] + 0.4, 0.9, z, 3.2, { tone: "hi", steps: 12 }));
  out.push(S(k.extrude([leafPt(LEAF_W - 4.4, -0.1), leafPt(LEAF_W - 2.6, -0.1), leafPt(LEAF_W - 2.6, -2.1), leafPt(LEAF_W - 4.4, -2.1)], LEAF_Z0 + 13.4, 1.6, P), { tone: "hi", crease: "lo" }));
  out.push(S(k.extrude([leafPt(LEAF_W - 9.5, -2.1), leafPt(LEAF_W - 2.6, -2.1), leafPt(LEAF_W - 2.6, -3.1), leafPt(LEAF_W - 9.5, -3.1)], LEAF_Z0 + 13.6, 1.2, P), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// the doorstop: a wedge kicked under the leaf's near face, thin edge under the door, heel toward the walk
function wedge() {
  const m = [-LEAF_BACK[0], -LEAF_BACK[1]]; // from the leaf toward the walk
  const a0 = leafPt(18.5, 0.8), a1 = leafPt(25, 0.8);
  const b0 = [a0[0] + m[0] * 8, a0[1] + m[1] * 8], b1 = [a1[0] + m[0] * 8, a1[1] + m[1] * 8];
  const Z = FLOOR, H = 4;
  const A0 = [...a0, Z], A1 = [...a1, Z], B0 = [...b0, Z], B1 = [...b1, Z], B0t = [...b0, Z + H], B1t = [...b1, Z + H];
  const faces = [
    [`iso-shade" data-shade="1`, [A1, B1, B1t]],
    [`iso-shade" data-shade="2`, [B0, B1, B1t, B0t]],
    [`iso-top`, [A0, A1, B1t, B0t]],
  ];
  const hull = hullOf(k.pointsAt([A0, A1, B0, B1, B0t, B1t], P));
  return `<g class="iso-solid"><path class="iso-fill" d="${k.pathOf(hull, true)}"/>${faces.map(([c, pts]) => `<path class="${c}" d="${poly(pts)}"/>`).join("")}${L(poly([A1, B1t], false) + poly([B1, B1t], false) + poly([B0t, B1t], false), { tone: "faint" })}<path class="iso-line iso-edge" data-tone="hi" d="${k.pathOf(hull, true)}"/></g>`;
}
function hullOf(points) {
  const s = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of s) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of [...s].reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}

function sideNear() {
  const out = [];
  out.push(box({ x: 95, y: 14, w: 6, d: 4 }, FLOOR, DOOR_TOP - FLOOR));
  out.push(wall({ x: 96, y: 18, w: 4, d: 42 }));
  out.push(box({ x: 95, y: -20, w: 6, d: 40, r: 0.4 }, DOOR_TOP, HEAD_TOP - DOOR_TOP, { bevel: 0.3, inner: seamOf({ x: 95, y: -20, w: 6, d: 40 }, DOOR_TOP + 2) }));
  for (const y of [SIDE_SIGN.y + 3, SIDE_SIGN.y + SIDE_SIGN.d - 5]) out.push(box({ x: 97, y, w: 2.4, d: 2 }, WALL_TOP, HEAD_TOP - WALL_TOP));
  out.push(sign(SIDE_SIGN, "x", ["PERSONAL ACCOUNTS", "TRAINING ON · 5-YR RETENTION"], "red", "accent"));
  return out.join("");
}

// ---------- the room's near half: meeting table, printer, the corner office ----------
function island() {
  const c = [-20, 30];
  const items = [
    { at: [c[0] - 19, c[1]], svg: chair(c[0] - 19, c[1], "mx") },
    { at: [c[0], c[1] - 19], svg: chair(c[0], c[1] - 19, "my") },
    { at: c, svg: cyl(c[0], c[1], 6, FLOOR, 1, { tone: "lo" }) + cyl(c[0], c[1], 1.6, FLOOR + 1, 9.6, { crease: "none" }) + cyl(c[0], c[1], 13, FLOOR + 10.6, 1.6, { tone: "mid", bevel: 0.4, steps: 48 }) },
    { at: [c[0] + 19, c[1]], svg: chair(c[0] + 19, c[1], "px") },
    { at: [c[0], c[1] + 19], svg: chair(c[0], c[1] + 19, "py") },
  ];
  return items.sort((a, b) => depth(a.at) - depth(b.at)).map((i) => i.svg).join("");
}

function printer() {
  const plan = { x: 20, y: 44, w: 20, d: 12, r: 0.8 };
  const out = [box(plan, FLOOR, 12, { bevel: 0.4, inner: seamOf(plan, FLOOR + 4) })];
  out.push(box({ x: 21, y: 45, w: 18, d: 10, r: 0.6 }, FLOOR + 12, 1.4, { tone: "hi", crease: "lo", bevel: 0.3 }));
  out.push(box({ x: 23, y: 41.6, w: 14, d: 2.4, r: 0.3 }, FLOOR + 7, 0.6, { tone: "lo" })); // output tray
  out.push(box({ x: 33, y: 46, w: 5, d: 3, r: 0.4 }, FLOOR + 13.4, 0.5, { tone: "lo" }));
  return out.join("");
}

function execBack() {
  const out = [];
  const plan1 = { x: 54, y: 18, w: 6, d: 3 }, plan2 = { x: 72, y: 18, w: 24, d: 3 }, plan3 = { x: 54, y: 21, w: 3, d: 35 };
  out.push(box(plan1, FLOOR, 12, { inner: seamOf(plan1, FLOOR + 8) }));
  out.push(box(plan2, FLOOR, 12, { inner: seamOf(plan2, FLOOR + 8) }));
  out.push(box(plan3, FLOOR, 12, { inner: seamOf(plan3, FLOOR + 8) }));
  out.push(box({ x: 60, y: 31, w: 34, d: 23, r: 1 }, FLOOR, 0.3, { tone: "lo", crease: "none" })); // rug
  out.push(L(k.planOutline({ x: 61.6, y: 32.6, w: 30.8, d: 19.8, r: 0.6 }, FLOOR + 0.3, P), { tone: "faint" }));
  return out.join("");
}

function execFront() {
  const out = [];
  out.push(chair(79, 27, "my", 12));
  const T = FLOOR + 10.2;
  out.push(box({ x: 64.6, y: 34.6, w: 1.4, d: 10.6 }, FLOOR, 10.2));
  out.push(box({ x: 90, y: 34.6, w: 1.4, d: 10.6 }, FLOOR, 10.2));
  out.push(box({ x: 64.6, y: 44.6, w: 26.8, d: 1.4 }, FLOOR, 10.2)); // modesty panel
  out.push(box({ x: 64, y: 34, w: 28, d: 12.4, r: 1 }, T, 1.8, { bevel: 0.3 }));
  const D2 = T + 1.8;
  out.push(box({ x: 70, y: 37, w: 10, d: 4, r: 1 }, D2, 0.6, { tone: "lo" }));
  out.push(box({ x: 74, y: 37.4, w: 2, d: 1.6 }, D2 + 0.6, 2.6));
  out.push(box({ x: 67, y: 35.2, w: 16, d: 1.4, r: 0.3 }, D2 + 3.2, 9, { tone: "hi", crease: "lo" }));
  out.push(cyl(87, 40, 1.8, D2, 0.6, { tone: "lo" }) + cyl(87, 40, 0.5, D2 + 0.6, 6, { crease: "none" }) + cyl(87, 40, 2.6, D2 + 6.6, 2, { tone: "hi", crease: "lo" })); // desk lamp
  // the name plate stands on the desk's front edge, high enough to clear the cut wall in front
  const NP = { x: 67, y: 44.4, w: 20, d: 1.6, r: 0.3 };
  const size = fits("EXEC", 6, NP.w - 2);
  out.push(box(NP, D2, 7.6, { tone: "hi", crease: "lo", bevel: 0.2 }));
  out.push(text(k.sideMatrix([NP.x + NP.w / 2, NP.y + NP.d], D2 + 1.6, P, "left"), "EXEC", size, "hi"));
  out.push(plant(91, 51, 3.4));
  return out.join("");
}

// ---------- outside: planters along the front wall, and the fenced turnstile pen ----------
function planters() {
  const out = [];
  for (const x of [-32, 2, 36, 70]) {
    const plan = { x, y: 63, w: 24, d: 7, r: 0.8 };
    out.push(box(plan, 0, 6, { bevel: 0.4, inner: seamOf(plan, 4.4) }));
    out.push(box(k.insetPlan(plan, 1.2), 6, 0.2, { tone: "lo", crease: "none" }));
    for (const dx of [5, 12, 19]) out.push(cyl(x + dx, 66.5, 3.2, 6.2, 3.6 + (dx % 7) * 0.3, { tone: "lo", crease: "none", steps: 20 }));
  }
  return out.join("");
}

// the side walk's street furniture: three bollards along its near edge and a bench facing the walk
function sideStreet() {
  const out = [];
  for (const x of [110, 124, 138]) {
    out.push(cyl(x, 17, 2, 0, 1, { tone: "lo" }));
    out.push(cyl(x, 17, 1.5, 1, 8, { inner: L(k.sideArc(x, 17, 1.5, 6.6, P, 16), { tone: "faint" }) }));
    out.push(cyl(x, 17, 1.7, 9, 1, { tone: "hi", crease: "lo" }));
  }
  const legs = [[110, 44], [134, 44]];
  for (const [x, y] of legs) out.push(box({ x: x - 1, y: y - 3.5, w: 2, d: 7, r: 0.3 }, 0, 6));
  out.push(box({ x: 106, y: 40, w: 32, d: 7, r: 0.6 }, 6, 1.4, { bevel: 0.3, inner: seamOf({ x: 106, y: 40, w: 32, d: 7 }, 6.6) }));
  out.push(box({ x: 106, y: 46.4, w: 32, d: 1.6, r: 0.4 }, 7.4, 6, { bevel: 0.2 }));
  return out.join("");
}

function fence(x) {
  const posts = [63, 81, 99];
  const out = [];
  posts.forEach((y, i) => {
    out.push(box({ x: x - 1.2, y: y - 1.2, w: 2.4, d: 2.4, r: 0.3 }, 0, 15));
    out.push(box({ x: x - 1.6, y: y - 1.6, w: 3.2, d: 3.2, r: 0.4 }, 15, 0.8, { tone: "hi", crease: "lo" }));
    if (i < posts.length - 1) for (const z of [6, 11.4]) out.push(box({ x: x - 0.6, y: y + 1.2, w: 1.2, d: posts[i + 1] - y - 2.4, r: 0.2 }, z, 1.2));
  });
  return out.join("");
}

function cabinet() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAB, 2), 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  const plate = poly([[CAB.x + CAB.w, CAB.y + 4, 4], [CAB.x + CAB.w, CAB.y + CAB.d - 4, 4], [CAB.x + CAB.w, CAB.y + CAB.d - 4, 10], [CAB.x + CAB.w, CAB.y + 4, 10]]);
  out.push(box(CAB, 0, CAB_H, { bevel: 0.6, inner: seamOf(CAB, CAB_H - 4) + L(plate, { tone: "faint" }) }));
  out.push(D([[CAB.x + CAB.w, CAB.y + 5.6, 5.6], [CAB.x + CAB.w, CAB.y + CAB.d - 5.6, 5.6], [CAB.x + CAB.w, CAB.y + 5.6, 8.4], [CAB.x + CAB.w, CAB.y + CAB.d - 5.6, 8.4]].map(at), { size: 0.45 }));
  // the counter: digit wheels behind a window on its front face
  out.push(box(COUNTER, CAB_H, COUNTER_TOP - CAB_H, { tone: "mid", bevel: 0.4 }));
  const y = WIN.y;
  const win = poly([[WIN.x0, y, WIN.z0], [WIN.x1, y, WIN.z0], [WIN.x1, y, WIN.z1], [WIN.x0, y, WIN.z1]]);
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-1)" d="${win}"/>`);
  const wheels = [1, 2, 3].map((i) => k.segment([WIN.x0 + ((WIN.x1 - WIN.x0) * i) / 4, y, WIN.z0], [WIN.x0 + ((WIN.x1 - WIN.x0) * i) / 4, y, WIN.z1], P)).join("");
  out.push(`<g data-part="wheels">${L(wheels, { tone: "faint" })}</g>`);
  out.push(`<g data-part="count">${counterText("0847")}</g>`);
  out.push(L(win, { tone: "hi" }));
  // the boss that carries the rotor
  out.push(box({ x: CAB.x + CAB.w, y: 84, w: 7, d: 4, r: 0.6 }, 13.2, 4, { bevel: 0.3 }));
  return out.join("");
}
const COUNT_SIZE = 4.6;
function counterText(words) {
  const cx = (WIN.x0 + WIN.x1) / 2;
  fits("0000", COUNT_SIZE, WIN.x1 - WIN.x0 - 0.6);
  return text(k.sideMatrix([cx, WIN.y], WIN.z0 + 1.3, P, "left"), words, COUNT_SIZE, "hi");
}

// the tripod rotor: three arms about an axis tilted down and back along the lane; one arm always bars the lane
function armsSvg(K, P, theta, hub, len) {
  const e1 = [1, 0, 0], e2 = [0, Math.SQRT1_2, -Math.SQRT1_2];
  const arms = [0, 1, 2].map((i) => {
    const a = theta + (i * 2 * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a);
    const tip = [hub[0] + len * (c * e1[0] + s * e2[0]), hub[1] + len * (c * e1[1] + s * e2[1]), hub[2] + len * (c * e1[2] + s * e2[2])];
    return { tip, d: K.depthOf(tip, P) };
  });
  const h = K.iso(hub, P), hd = K.depthOf(hub, P);
  const arm = (a) => `<g class="arm">${K.wireSvg(h, K.iso(a.tip, P), { tone: "hi", size: 1.1 })}</g>`;
  return arms.filter((a) => a.d < hd).map(arm).join("") + `<circle class="hub" cx="${h[0].toFixed(2)}" cy="${h[1].toFixed(2)}" r="2.6"/>` + arms.filter((a) => a.d >= hd).map(arm).join("");
}

// ---------- packets ----------
function packetsSvg(K, P, list, floor) {
  return [...list]
    .sort((a, b) => a.x + a.y - (b.x + b.y))
    .map((p) => {
      const g = K.solidSvg(K.slabOf({ x: p.x - 3, y: p.y - 3, w: 6, d: 6, r: 0.6 }, floor, 4, P, 2, 0.3), { tone: "hi", crease: "lo", className: "pkt" });
      return p.alpha < 0.98 ? `<g opacity="${p.alpha.toFixed(2)}">${g}</g>` : g;
    })
    .join("");
}
const slot = (name, list) => `<g data-slot="${name}">${packetsSvg(k, P, list.filter((p) => p.slot === name), FLOOR)}</g>`;

// ---------- assemble ----------
const FIG_CSS = `.iso .cut>.iso-top{fill:var(--anatomy-shade-0)}
.iso .accent>.iso-top{fill:color-mix(in srgb,var(--anatomy-red) 16%,var(--anatomy-top))}
.iso .accent>.iso-fill{fill:color-mix(in srgb,var(--anatomy-red) 10%,var(--anatomy-face))}
.iso .accent>.iso-shade{fill:color-mix(in srgb,var(--anatomy-red) 22%,var(--anatomy-shade-2))}
.iso .accent>.iso-shade[data-shade="0"],.iso .accent>.iso-shade[data-shade="1"]{fill:color-mix(in srgb,var(--anatomy-red) 28%,var(--anatomy-shade-1))}
.iso .iso-face-text[data-tone="red"]{fill:var(--anatomy-red);font-weight:700}
.iso .iso-face-text{font-weight:700}
.iso .pkt>.iso-top{fill:var(--anatomy-mid)}
.iso .pkt>.iso-shade{fill:var(--anatomy-lo)}
.iso .arm .iso-line{stroke-width:3px}
.iso .hub{fill:var(--anatomy-face);stroke:var(--anatomy-hi);stroke-width:.85px;vector-effect:non-scaling-stroke}`;

const STILL = { t: 41.3, theta: 0.42 };
function figure(state) {
  const tg = M.TARGETS[state];
  const list = M.packetsAt(STILL.t, tg);
  const counter = tg.block > 0.5 ? "CAP" : "0847";
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "An office in section on a plinth, its walls cut low so the desks show. Small packets of work leave the desks by one of two exits. The front door is a fenced, metered turnstile under a sign reading Enterprise contract, not trained on. The side door is an ordinary door wedged open with a doorstop under a red sign reading Personal accounts, training on, five-year retention. " +
      ["Under the contract every packet goes out through the turnstile and its counter turns.", "Capped: the turnstile's bar is down, its counter reads CAP, packets back up behind it, and the corner office's packets already leave by the side door.", "Side door: with the turnstile capped, every desk's packets pour out of the wedged side door."][state],
    body: [
      `<style>${FIG_CSS}</style>`,
      plinth(),
      backWalls(),
      backFurniture(),
      frontLeft(),
      slot("A", list),
      sideFar(),
      leaf(),
      wedge(),
      slot("C", list),
      sideStreet(),
      island(),
      printer(),
      execBack(),
      slot("E", list),
      execFront(),
      frontRight(),
      sideNear(),
      planters(),
      fence(-118),
      cabinet().replace(`<g data-part="count">${counterText("0847")}</g>`, `<g data-part="count">${counterText(counter)}</g>`),
      slot("B", list),
      `<g data-part="arms">${armsSvg(k, P, STILL.theta, HUB, ARM)}</g>`,
      fence(-43),
      gatePost(-96.4),
      `<g data-part="bar" transform="${k.translateAlong(P, [0, 0, -DROP * tg.block])}">${dropBar()}</g>`,
      gatePost(-66.6),
    ],
  });
}

const live = `
const P = ${JSON.stringify(P)};
const ROUTES = ${JSON.stringify(M.ROUTES)};
const TARGETS = ${JSON.stringify(M.TARGETS)}, STATES = ${JSON.stringify(M.STATES)}, SURVEY = ${JSON.stringify(M.SURVEY)};
const SPEED = ${M.SPEED}, RATE = ${M.RATE}, FLOOR = ${FLOOR}, DROP = ${DROP};
const HUB = ${JSON.stringify(HUB)}, ARM = ${ARM}, WIN = ${JSON.stringify(WIN)}, COUNT_SIZE = ${COUNT_SIZE};
const clamp01 = ${M.clamp01.toString()};
const smooth = ${M.smooth.toString()};
const lerp = ${M.lerp.toString()};
${M.pointOn.toString()}
${M.packetsAt.toString()}
const pad4 = ${M.pad4.toString()};
const KIT = { iso, depthOf, wireSvg, solidSvg, slabOf };
${armsSvg.toString()}
${packetsSvg.toString()}
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const slots = Object.fromEntries([...svg.querySelectorAll("[data-slot]")].map((g) => [g.dataset.slot, g]));
const bar = svg.querySelector('[data-part="bar"]');
const arms = svg.querySelector('[data-part="arms"]');
const countText = svg.querySelector('[data-part="count"] text');
const readout = document.querySelector("[data-readout]");
const cells = { used: document.querySelector('[data-board="used"]'), shared: document.querySelector('[data-board="shared"]'), rules: document.querySelector('[data-board="rules"]') };
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clampI = (v) => Math.max(0, Math.min(STATES.length - 1, v));
const mix = { ...TARGETS[0] };
let target = 0, t = ${STILL.t}, theta = ${STILL.theta}, count = 847, frame = 0, last = 0, clock = 0, touring = !still.matches, held = false, visible = false, idle = 0, said = "";
const DWELL = [3.4, 3.4, 4.6];
const tourAt = (c) => { const all = DWELL.reduce((a, b) => a + b, 0); let x = c % all; for (let i = 0; i < DWELL.length; i++) { if (x < DWELL[i]) return i; x -= DWELL[i]; } return 0; };
const WORDS = ["contract · metered", "capped · bar down", "side door · wedged open"];
function draw() {
  const list = packetsAt(t, mix);
  for (const name of ["A", "B", "C", "E"]) slots[name].innerHTML = packetsSvg(KIT, P, list.filter((p) => p.slot === name), FLOOR);
  bar.setAttribute("transform", translateAlong(P, [0, 0, -DROP * mix.block]));
  arms.innerHTML = armsSvg(KIT, P, theta, HUB, ARM);
  const shown = mix.block > 0.5 ? "CAP" : pad4(count);
  if (countText.textContent !== shown) countText.textContent = shown;
  const phase = mix.all > 0.5 ? 2 : mix.block > 0.5 ? 1 : 0;
  if (readout.textContent !== WORDS[phase]) readout.textContent = WORDS[phase];
  for (const key of ["used", "shared", "rules"]) {
    const v = mix.board < 0.02 ? "—" : Math.round(SURVEY[key] * mix.board) + "%";
    if (cells[key].textContent !== v) cells[key].textContent = v;
    cells[key].toggleAttribute("data-dim", mix.board < 0.98);
  }
  if (said !== WORDS[phase]) { said = WORDS[phase]; stage.setAttribute("aria-valuenow", String(phase)); stage.setAttribute("aria-valuetext", WORDS[phase]); }
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  const goal = TARGETS[target];
  for (const key of Object.keys(mix)) {
    const tau = key === "block" ? 0.35 : key === "board" ? 0.9 : 0.6;
    mix[key] = calm ? goal[key] : mix[key] + (goal[key] - mix[key]) * (1 - Math.exp(-dt / tau));
    if (Math.abs(goal[key] - mix[key]) < 0.002) mix[key] = goal[key];
  }
  if (!calm) {
    t += dt;
    const open = (1 - mix.block) * (1 - mix.all);
    theta += dt * RATE * (2 * Math.PI / 3) * open;
    count += dt * RATE * open;
  }
  draw();
  const settled = !touring && calm;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false; target = clampI(next); clearTimeout(idle);
  if (!held) idle = setTimeout(() => { touring = !still.matches && !held; clock = DWELL.slice(0, target).reduce((a, b) => a + b, 0); run(); }, 4200);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(Math.floor(Math.max(0, Math.min(0.999, (event.clientX - box.left) / box.width)) * STATES.length));
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = target + 1;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = target - 1;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = STATES.length - 1;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
draw();
window.figureApi = {
  states: STATES,
  set(i) { held = true; touring = false; clearTimeout(idle); target = clampI(i); run(); },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const svg0 = figure(0);
const body = k.plateHtml({
  fig: "Fig 5",
  title: "Two doors",
  hint: "Move across to cap the turnstile",
  readout: "contract · metered",
  keys: [
    { mark: "raised", label: "Front door: a metered turnstile, enterprise contract, not trained on" },
    { mark: "red", label: "Side door: wedged open onto personal accounts, training on, 5-year retention" },
    { mark: "flat", label: "Packets: work leaving the desks (illustrative flow)" },
  ],
  caption:
    "Two ways out of the same office. Under the enterprise contract the work leaves through a metered turnstile and is not trained on. Cap the turnstile and the bar drops, but the work does not stop: it backs up, then goes out the side door into personal accounts, where consumer terms carry the training setting and keep data five years if it is on. In PagerDuty's survey of 1,250 office professionals at companies with $500M or more in revenue (June 11 2026), 66% had used AI tools they believed weren't allowed, 88% had shared work information through them, and 81% believe leadership plays by different rules. Consumer terms: Anthropic, August 2025 (consumer plans carry the training setting, with 5-year retention if it is on; commercial, enterprise, API and government traffic is excluded from training). The packet flow, the corner office leaving first and the turnstile's count are illustrative.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Two doors: arrow keys step from contract to capped to side door" aria-valuemin="0" aria-valuemax="${M.STATES.length - 1}" aria-valuenow="0" aria-valuetext="contract · metered">${svg0}</div>`,
});

const BOARD = `<div class="board doors" aria-live="polite">
  <div class="cell"><span class="lab">Used unsanctioned AI</span><span class="num" data-board="used" data-dim>—</span></div>
  <div class="cell"><span class="lab">Shared work info</span><span class="num" data-board="shared" data-dim>—</span></div>
  <div class="cell"><span class="lab">“Leadership plays by different rules”</span><span class="num" data-board="rules" data-dim>—</span></div>
  <div class="note">PagerDuty survey, June 11 2026 · n = 1,250 office professionals at companies with ≥ $500M revenue</div>
</div>`;
const BOARD_CSS = `.board.doors{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 22px}
.board.doors .lab{white-space:normal}
.board.doors .num{color:var(--anatomy-lit)}
.board.doors .num[data-dim]{color:var(--anatomy-muted)}
@media (max-width:700px){.board.doors{grid-template-columns:1fr}}`;
const figureHtml = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figureHtml === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "Two doors", theme: "light", body: figureHtml, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${BOARD_CSS}</style>`);

writeSnapshot(HERE, "doors", figure(M.KEY));
M.STATES.forEach((_, i) => writeSnapshot(HERE, `doors-${i + 1}`, figure(i)));
writeFileSync(join(HERE, "doors.html"), page);
writeFileSync(join(HERE, "doors.fragment.html"), figureHtml);
const solids = (svg0.match(/class="iso-solid/g) || []).length;
console.log(`wrote doors.html ${(page.length / 1024).toFixed(0)} KB · scale ${P.scale.toFixed(3)} · min text ${MIN_TEXT.toFixed(2)} · ${solids} solids (incl. packets)`);
