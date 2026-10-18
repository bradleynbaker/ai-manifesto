// Fig 4 · Could vs. does — an Anatomy figure for the v4 talk.
// A rigid-heddle table loom on a bench. One warp position per percentage point of a computer & math job's tasks:
// 94 of the 100 positions are strung (what models could do), but the red cloth is woven across only 33 of them
// (what is actually done). The other 61 strung threads run bare under a clamp bar held by a coin-slot lock box
// and a padlock: the limit is permission, plumbing and the meter, not the threads.
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

// ---------- world plan (units ≈ px of the real thing; x across the loom, y toward the weaver, z up) ----------
const PITCH = 2; // one warp position
const X0 = -100; // position 0
const xAt = (v) => X0 + v * PITCH; // a point on the printed scale
const threadX = (i) => X0 + (i + 0.5) * PITCH; // the centre of warp position i

const PLATE = { x: -142, y: -86, w: 274, d: 190, r: 9 };
const PLATE_H = 12;
const FOOT_H = 5;

const H = 36; // the warp plane: tops of the back beam and the breast beam
const BEAM = 8;
const SIDES = [-112, 104]; // x of each side frame (8 wide)
const BACK_Y = -66, FRONT_Y = 52; // beams and posts (8 deep)
const FRONT = FRONT_Y + BEAM; // the breast beam's front edge: where the cloth turns down
const YH = -12; // the rigid heddle
const YF = 20; // the fell: where the woven cloth ends
const DRAPE_Z = 20; // the cloth falls over the breast beam onto the cloth roll
const CLOTH_W = M.DOES * PITCH;

const LOCKBOX = { x: SIDES[1], y: YF - 13, w: 8, d: 13, r: 1.2 };
const LOCK_Z0 = H - 8, LOCK_Z1 = H + 9;
const BAR = { x: xAt(M.DOES) + 2, y: YF - 11.5, w: LOCKBOX.x - (xAt(M.DOES) + 2), d: 6, r: 1 };
const BAR_Z = H + 0.3, BAR_H = 3;

const STRIP = { x: -106, y: 68, w: 212, d: 14.5, r: 1 };
const LABEL = { x: -136, y: 72, w: 24, d: 16, r: 1.5 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [SIDES[0] + 2, YH, H + 20], [SIDES[1] + 6, YH, H + 20], [-116, BACK_Y, H]],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 58 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const seg = (a, b) => k.pathOf([at(a), at(b)]);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screwsOn = (plan, z, inset, r = 1.8) => {
  const pts = k.corners(plan, inset);
  return L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.45 });
};

// ---------- the parts that move or change: one source for the build and the page ----------
function dyn(K, C) {
  const { iso, pathOf } = K;
  const { P, X0, PITCH, H, YF, FRONT, DRAPE_Z, CLOTH_W, DOES } = C;
  const at = (p) => iso(p, P);
  const poly = (pts) => pathOf(pts.map(at), true);
  const seg = (a, b) => pathOf([at(a), at(b)]);
  const fellAt = (c) => FRONT - c * (FRONT - YF);
  const SX_MIN = X0 + 10, SX_MAX = X0 + CLOTH_W - 11.5;
  function clothSvg(c) {
    if (c < 0.01) return "";
    const fell = fellAt(c), z = H + 0.35, x1 = X0 + CLOTH_W, dy = FRONT + 0.35;
    const sheet = poly([[X0, fell, z], [x1, fell, z], [x1, FRONT, z], [X0, FRONT, z]]);
    const drape = poly([[X0, dy, z], [x1, dy, z], [x1, dy, DRAPE_Z], [X0, dy, DRAPE_Z]]);
    let picks = "", warps = "";
    for (let y = FRONT - 1.1; y > fell + 0.5; y -= 1.1) picks += seg([X0, y, z], [x1, y, z]);
    for (let zz = z - 1.1; zz > DRAPE_Z + 0.5; zz -= 1.1) picks += seg([X0, dy, zz], [x1, dy, zz]);
    for (let i = 0; i < DOES; i++) {
      const x = X0 + (i + 0.5) * PITCH;
      warps += seg([x, fell, z], [x, FRONT, z]) + seg([x, dy, z], [x, dy, DRAPE_Z]);
    }
    return (
      `<path class="iso-fill" d="${sheet}${drape}"/>` +
      `<path d="${sheet}${drape}" style="fill:var(--anatomy-red);fill-opacity:.2;stroke:none"/>` +
      `<path class="iso-line" data-tone="red" style="stroke-opacity:.45" d="${picks}"/>` +
      `<path class="iso-line" data-tone="red" style="stroke-opacity:.25" d="${warps}"/>` +
      `<path class="iso-line" data-tone="red" style="stroke-width:1.4" d="${sheet}${drape}"/>`
    );
  }
  // the pick being laid: from the cloth's corner at the fell to the shuttle's pirn
  function weftD(c, xs, dir) {
    const fell = fellAt(c);
    return seg([dir > 0 ? X0 : X0 + CLOTH_W, fell, H + 0.35], [xs, fell - 4, H + 1.6]);
  }
  const shuttleAt = (s) => SX_MIN + (SX_MAX - SX_MIN) * s;
  return { fellAt, clothSvg, weftD, shuttleAt, SX_MIN, SX_MAX };
}
const C = { P, X0, PITCH, H, YF, FRONT, DRAPE_Z, CLOTH_W, DOES: M.DOES };
const DY = dyn(k, C);
const SHUTTLE_REST = [DY.SX_MIN, YF - 4];

// ---------- the bench ----------
function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "lo", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // label plate: three rule lines that stand for printed text
  out.push(S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "mid", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P, 3), { tone: "faint" }));
  [[15, 4], [11, 7.5], [13, 11]].forEach(([len, dy]) => out.push(L(k.lineOnTop([LABEL.x + 4, LABEL.y + dy], [LABEL.x + 4 + len, LABEL.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + LABEL.w - 3, LABEL.y + 3, 0.8]), at([LABEL.x + LABEL.w - 3, LABEL.y + LABEL.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// the printed scale under the warp: one tick per position, 0 · 33 · 94 · 100
function ruler() {
  const out = [];
  const z = 0.6;
  out.push(S(k.slabOf(STRIP, 0, z, P, 3), { tone: "lo", crease: "none" }));
  const minor = [], mid = [], major = [], key = [];
  for (let v = 0; v <= M.POSITIONS; v++) {
    const x = xAt(v);
    const special = v === M.DOES || v === M.COULD;
    const len = special ? 5.2 : v % 10 === 0 ? 4.2 : v % 5 === 0 ? 3 : 1.8;
    const d = k.lineOnTop([x, STRIP.y], [x, STRIP.y + len], z, P);
    (special ? key : v % 10 === 0 ? major : v % 5 === 0 ? mid : minor).push(d);
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(mid.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }), L(key.join(""), { tone: "hi" }));
  // a small printed wedge closes each key tick: 33 (does) and 94 (could)
  const wedges = [M.DOES, M.COULD].map((v) => k.onTop([[xAt(v), STRIP.y + 5.2], [xAt(v) - 1.3, STRIP.y + 7.4], [xAt(v) + 1.3, STRIP.y + 7.4]], z, P, true)).join("");
  out.push(`<path class="iso-line" data-tone="hi" style="fill:var(--anatomy-hi)" d="${wedges}"/>`);
  [[0, "0", "mid"], [M.DOES, "33", "hi"], [M.COULD, "94", "hi"], [M.POSITIONS, "100", "mid"]].forEach(([v, name, tone]) =>
    out.push(k.faceTextSvg(k.topMatrix([xAt(v) + (v === M.POSITIONS ? 1.2 : v === M.COULD ? -1.2 : 0), STRIP.y + 13.2], z, P, "x"), name, { size: 5.4, tone, anchor: v === M.POSITIONS ? "start" : v === M.COULD ? "end" : "middle" })));
  out.push(D([at([STRIP.x + 2.4, STRIP.y + STRIP.d - 2.4, z]), at([STRIP.x + STRIP.w - 2.4, STRIP.y + STRIP.d - 2.4, z])], { size: 0.45 }));
  return out.join("");
}

// the brackets printed on the bench under the scale, one per state (could 0–94, does 0–33, the gap 33–94)
const BRACKETS = [
  [0, M.COULD, `${M.COULD} — COULD`],
  [0, M.DOES, `${M.DOES} — DOES`],
  [M.DOES, M.COULD, `${M.GAP} — PERMISSION · PLUMBING · METER`],
];
function bracket([va, vb, text]) {
  const y0 = STRIP.y + STRIP.d, y1 = y0 + 4.5, a = xAt(va), b = xAt(vb), mid = (a + b) / 2;
  const d = k.onTop([[a, y0], [a, y1], [mid - 2, y1], [mid, y1 + 1.6], [mid + 2, y1], [b, y1], [b, y0]], 0, P);
  return L(d, { tone: "hi" }) + k.faceTextSvg(k.topMatrix([mid, y1 + 9], 0, P, "x"), text, { size: 4.8, tone: "hi", anchor: "middle" });
}

// ---------- the loom frame ----------
const postPlan = (sx, y) => ({ x: sx, y, w: 8, d: BEAM, r: 1 });
const RAIL_LOW = (sx) => ({ x: sx, y: -72, w: 8, d: 138, r: 1.5 });
const RAIL_TOP = (sx) => ({ x: sx, y: BACK_Y + BEAM, w: 8, d: FRONT_Y - BACK_Y - BEAM, r: 0.6 });
const RAIL_TOP_Z = H - 15, RAIL_TOP_H = 7;

function lowRail(sx) {
  const plan = RAIL_LOW(sx);
  return S(k.slabOf(plan, 0, 6, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(plan, 3, P, 3), { tone: "faint" }) }) + D([at([sx + 4, -66, 6]), at([sx + 4, 60, 6])], { size: 0.45 });
}
function post(sx, y) {
  return S(k.slabOf(postPlan(sx, y), 6, H - BEAM - 6, P, 3, 0.4), { tone: "mid" });
}
function topRail(sx) {
  const plan = RAIL_TOP(sx);
  return S(k.slabOf(plan, RAIL_TOP_Z, RAIL_TOP_H, P, 2, 0.4), { tone: "mid" }) + D([at([sx + 4, plan.y + 3, H - 8]), at([sx + 4, plan.y + plan.d - 3, H - 8])], { size: 0.45 });
}
function beam(y, name) {
  const plan = { x: -118, y, w: 236, d: BEAM, r: 1.2 };
  const out = [S(k.slabOf(plan, H - BEAM, BEAM, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(plan, H - BEAM / 2, P, 3), { tone: "faint" }) })];
  // pegs through the beam into each post
  out.push(D(SIDES.map((sx) => at([sx + 4, y + BEAM / 2, H])), { size: 0.6 }));
  out.push(L(SIDES.map((sx) => k.ring(sx + 4, y + BEAM / 2, 1.6, H, P, 14)).join(""), { tone: "lo" }));
  return out.join("");
}
// the lower rollers between the posts: the warp roll at the back, the cloth roll at the front
function roller(y) {
  const plan = { x: SIDES[0] + 8, y: y + 1, w: SIDES[1] - SIDES[0] - 8, d: 6, r: 2 };
  return S(k.slabOf(plan, 12, 6, P, 4, 0.4), { tone: "mid" });
}
function warpRoll() {
  const plan = { x: X0, y: BACK_Y - 0.5, w: M.COULD * PITCH, d: 9, r: 3.5 };
  const out = [S(k.slabOf(plan, 10.5, 9, P, 5, 0.4), { tone: "lo" })];
  return out.join("");
}
function clothRoll() {
  const plan = { x: X0, y: FRONT_Y - 0.5, w: CLOTH_W, d: FRONT - FRONT_Y + 0.5, r: 3.5 };
  const paths = k.slabOf(plan, 10.5, DRAPE_Z - 10.5, P, 5, 0.4);
  return S(paths, { tone: "red", crease: "none", inner: `<path d="${paths.fill}" style="fill:var(--anatomy-red);fill-opacity:.22;stroke:none"/>` });
}

// ---------- the warp ----------
const STRUNG = Array.from({ length: M.COULD }, (_, i) => i);
const woven = STRUNG.filter((i) => i < M.DOES), bare = STRUNG.filter((i) => i >= M.DOES);
const backD = (list) => list.map((i) => seg([threadX(i), BACK_Y, H + 0.15], [threadX(i), YH, H + 0.15])).join("");
const frontD = (list) => list.map((i) => seg([threadX(i), YH, H + 0.15], [threadX(i), FRONT, H + 0.15])).join("");

// ---------- the rigid heddle ----------
const HP = (sx) => ({ x: sx + 1.5, y: YH - 2, w: 5, d: 4, r: 0.8 }); // heddle side post, standing on the top rail
const HB = (sx, side) => ({ x: sx + 1, y: side < 0 ? YH - 6.5 : YH + 2, w: 6, d: 4.5, r: 0.8 }); // the blocks that hold it
const HEDDLE_X = [SIDES[0] + 6.5, SIDES[1] + 1.5]; // inner faces of the heddle posts
const BOTTOM_Z = H - 8, BOTTOM_H = 4, TOP_Z = H + 12, TOP_H = 5;
const heddleBlock = (sx, side) => S(k.slabOf(HB(sx, side), H - 8, 6, P, 2, 0.3), { tone: "mid" }) + D([at([sx + 4, HB(sx, side).y + 2.25, H - 2])], { size: 0.4 });
function heddlePost(sx) {
  const plan = HP(sx);
  return S(k.slabOf(plan, H - 8, 28, P, 2, 0.3), { tone: "mid" }) + D([at([sx + 4, YH, H + 20])], { size: 0.45 });
}
function heddleBars() {
  const out = [];
  const bottom = { x: HEDDLE_X[0], y: YH - 1.5, w: HEDDLE_X[1] - HEDDLE_X[0], d: 3, r: 0.4 };
  out.push(S(k.slabOf(bottom, BOTTOM_Z, BOTTOM_H, P, 2, 0.3), { tone: "mid" }));
  // slats: one per pair of positions; each holds a thread in its eye, the next thread runs in the slot beside it
  const face = YH + 1.5;
  const slats = [], eyes = [], empty = [];
  for (let j = 0; j < M.POSITIONS / 2; j++) {
    const i = 2 * j + 1, x = threadX(i);
    slats.push(seg([x, face, BOTTOM_Z + BOTTOM_H], [x, face, TOP_Z]));
    (i < M.COULD ? eyes : empty).push(at([x, face, H + 0.15]));
  }
  out.push(L(slats.join(""), { tone: "lo" }));
  out.push(D(eyes, { size: 0.55, tone: "mid" }), D(empty, { size: 0.55, tone: "lo" }));
  const top = { ...bottom };
  out.push(S(k.slabOf(top, TOP_Z, TOP_H, P, 2, 0.3), { tone: "mid" }));
  out.push(k.faceTextSvg(k.sideMatrix([-60, face], TOP_Z + 1.2, P, "left"), "COMPUTER & MATH · 100 TASKS", { size: 3.9, tone: "mid", anchor: "middle" }));
  return out.join("");
}

// ---------- the lock: a clamp bar across the bare threads, a coin-slot lock box, a padlock ----------
function lockBox() {
  const out = [];
  out.push(S(k.slabOf(LOCKBOX, LOCK_Z0, LOCK_Z1 - LOCK_Z0, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(LOCKBOX, LOCK_Z1 - 3, P, 3), { tone: "faint" }) }));
  // the coin slot on its lid, and a coin waiting beside it
  const cx = LOCKBOX.x + LOCKBOX.w / 2;
  out.push(S(k.slabOf({ x: cx - 1.1, y: LOCKBOX.y + 2, w: 2.2, d: 6.5, r: 1 }, LOCK_Z1, 0.01, P, 3), { tone: "hi", crease: "none", flat: true }));
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-hi)" d="${k.planOutline({ x: cx - 0.8, y: LOCKBOX.y + 2.4, w: 1.6, d: 5.7, r: 0.8 }, LOCK_Z1, P, 3)}"/>`);
  out.push(S(k.cylinder(cx, LOCKBOX.y + 10.6, 1.9, LOCK_Z1, 0.6, P, 18), { tone: "mid" }));
  out.push(D([at([LOCKBOX.x + 1.6, LOCKBOX.y + 1.6, LOCK_Z1]), at([LOCKBOX.x + LOCKBOX.w - 1.6, LOCKBOX.y + 1.6, LOCK_Z1])], { size: 0.4 }));
  return out.join("");
}
function clampBar() {
  const out = [];
  out.push(S(k.slabOf(BAR, BAR_Z, BAR_H, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(BAR, BAR_Z + 1, P, 3), { tone: "faint" }) }));
  // two knurled thumb screws press the bar down onto the threads
  for (const x of [BAR.x + 14, BAR.x + BAR.w - 26]) {
    out.push(S(k.cylinder(x, BAR.y + BAR.d / 2, 2.4, BAR_Z + BAR_H, 2.6, P, 20), { tone: "mid" }));
    out.push(L(k.knurl(x, BAR.y + BAR.d / 2, 2.4, BAR_Z + BAR_H + 0.4, BAR_Z + BAR_H + 2.2, 16, P), { tone: "lo" }));
  }
  return out.join("");
}
const PAD = { x: SIDES[1] + 8.4, y: LOCKBOX.y + 1, w: 4.6, d: 11, r: 1.6 };
const PAD_Z0 = H - 25, PAD_Z1 = H - 12;
function padlock() {
  const out = [];
  const sx = SIDES[1] + 8, cy = PAD.y + PAD.d / 2, shx = PAD.x + PAD.w / 2;
  // the staple on the lock box's outer face
  out.push(S(k.slabOf({ x: sx, y: cy - 1.2, w: 3.4, d: 2.4, r: 0.6 }, H - 2, 2, P, 2), { tone: "mid" }));
  // the shackle: an inverted U in the y–z plane, through the staple, its legs into the body
  const r = 3.6, top = H - 1, legs = [];
  for (let s = 0; s <= 16; s++) {
    const a = Math.PI * (s / 16);
    legs.push([shx, cy - r * Math.cos(a), top - r + r * Math.sin(a)]);
  }
  const shackle = [[shx, cy - r, PAD_Z1 + 0.8], ...legs, [shx, cy + r, PAD_Z1 + 0.8]];
  out.push(`<path class="iso-line" data-tone="hi" style="stroke-width:2.2" d="${k.pathOf(shackle.map(at))}"/>`);
  out.push(S(k.slabOf(PAD, PAD_Z0, PAD_Z1 - PAD_Z0, P, 3, 0.5), { tone: "hi", crease: "lo" }));
  // keyhole on the outer face
  const kx = PAD.x + PAD.w;
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-hi)" d="${k.sideRing([kx, cy, PAD_Z0 + 5.6], 1, "x", P, 14)}${k.pathOf([[kx, cy - 0.45, PAD_Z0 + 5.2], [kx, cy - 0.7, PAD_Z0 + 2.6], [kx, cy + 0.7, PAD_Z0 + 2.6], [kx, cy + 0.45, PAD_Z0 + 5.2]].map(at), true)}"/>`);
  return out.join("");
}

// ---------- the shuttle (built at rest, moved with a translate) ----------
function shuttle() {
  const [cx, cy] = SHUTTLE_REST;
  const ring = [[-11.5, 0], [-8, -2.8], [8, -2.8], [11.5, 0], [8, 2.8], [-8, 2.8]].map(([x, y]) => [cx + x, cy + y]);
  const z = H + 0.4, h = 2.8;
  const out = [`<path class="iso-halo" d="${k.extrude(ring, z, 0.1, P).fill}" style="filter:blur(2px)"/>`];
  out.push(S(k.extrude(ring, z, h, P, { bevel: 0.5 }), { tone: "hi", crease: "lo", inner: L(k.ringSeam(ring, z + 1, P), { tone: "faint" }) }));
  out.push(L(k.planOutline({ x: cx - 5.5, y: cy - 1.3, w: 11, d: 2.6, r: 1.3 }, z + h, P, 4), { tone: "mid" }));
  out.push(`<path class="iso-line" data-tone="red" style="stroke-width:1.6" d="${k.planOutline({ x: cx - 4, y: cy - 0.55, w: 8, d: 1.1, r: 0.55 }, z + h, P, 3)}"/>`);
  out.push(D([at([cx - 11.5, cy, z + 1.4]), at([cx + 11.5, cy, z + 1.4])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

// ---------- assemble ----------
function figure(state) {
  const m = M.at(state);
  const s = 0.62, xs = DY.shuttleAt(s), fell = DY.fellAt(m.cloth);
  const hide = (v) => (v < 0.01 ? ' style="opacity:0"' : v < 0.99 ? ` style="opacity:${v.toFixed(3)}"` : "");
  const [L0, R0] = SIDES;
  const ghostD = k.onTop([[X0, YF], [xAt(M.COULD), YF], [xAt(M.COULD), FRONT], [X0, FRONT]], H + 0.4, P, true);
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "A rigid-heddle table loom on a bench, with a printed scale of 100 warp positions, one per percentage point of the tasks in computer and math jobs. 94 of the 100 positions are strung with warp thread: the share of tasks language models could theoretically do. Red cloth is woven across only the first 33: the share actually observed being done. The other 61 strung threads run bare under a clamp bar held by a coin-slot lock box and a padlock, bracketed on the bench as permission, plumbing and meter.",
    body: [
      bench(),
      ruler(),
      ...BRACKETS.map((b, i) => `<g data-part="bracket-${i}"${hide(m.w[i])}>${bracket(b)}</g>`),
      lowRail(L0),
      post(L0, BACK_Y),
      topRail(L0),
      post(L0, FRONT_Y),
      lowRail(R0),
      roller(BACK_Y),
      warpRoll(),
      post(R0, BACK_Y),
      beam(BACK_Y),
      L(backD(woven) + backD(bare), { tone: "mid" }),
      topRail(R0),
      heddleBlock(L0, -1),
      heddlePost(L0),
      heddleBlock(R0, -1),
      heddleBars(),
      heddleBlock(L0, 1),
      heddlePost(R0),
      heddleBlock(R0, 1),
      roller(FRONT_Y),
      `<g data-part="cloth-roll"${hide(Math.min(1, m.cloth * 4))}>${clothRoll()}</g>`,
      post(R0, FRONT_Y),
      beam(FRONT_Y),
      L(frontD(woven) + frontD(bare), { tone: "mid" }),
      `<g data-part="woven-front"${hide(m.w[0])}>${L(frontD(woven), { tone: "hi" })}</g>`,
      `<g data-part="bare-front"${hide(Math.min(1, m.w[0] + m.w[2]))}>${L(frontD(bare), { tone: "hi" })}</g>`,
      `<g data-part="ghost"${hide(m.ghost)}>${L(ghostD, { tone: "hi", dotted: true })}</g>`,
      `<g data-part="cloth">${DY.clothSvg(m.cloth)}</g>`,
      `<g data-part="weave"${hide(Math.min(1, Math.max(0, m.cloth * 2 - 1)))}><path data-part="weft" class="iso-line" data-tone="red" style="stroke-width:1.2" d="${DY.weftD(m.cloth, xs, 1)}"/><g data-part="shuttle" transform="${k.translateAlong(P, [xs - SHUTTLE_REST[0], fell - YF, 0])}">${shuttle()}</g></g>`,
      clampBar(),
      lockBox(),
      padlock(),
    ],
  });
}

const svgKey = figure(M.KEY_STATE);

const live = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const STATES = ${JSON.stringify(M.STATES)}, LAST = ${M.LAST}, READOUTS = ${JSON.stringify(M.READOUTS)};
const SHUTTLE_REST = ${JSON.stringify(SHUTTLE_REST)}, YF = ${YF};
const model = ${M.at.toString().replace(/^function at/, "function")};
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const DY = (${dyn.toString()})({ iso, pathOf }, C);
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const el = { cloth: part("cloth"), roll: part("cloth-roll"), weave: part("weave"), weft: part("weft"), shuttle: part("shuttle"), ghost: part("ghost"), brackets: [0, 1, 2].map((i) => part("bracket-" + i)), wovenFront: part("woven-front"), bareFront: part("bare-front") };
const cells = [...document.querySelectorAll("[data-cell]")];
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fade = (node, v) => { const o = v < 0.01 ? "0" : v > 0.99 ? "" : v.toFixed(3); if (node.style.opacity !== o) node.style.opacity = o; };
let held = false, u = ${M.KEY_STATE}, target = u, frame = 0, last = 0, clock = 0, touring = true, visible = false, idle = 0;
let phase = Math.acos(1 - 2 * 0.62), lastCloth = -1;
const TOUR = [0, 1, 2, 2];
const tourAt = (t) => TOUR[Math.floor(t / 2.6) % TOUR.length];
function draw() {
  const m = model(u);
  const c = m.cloth * m.cloth * (3 - 2 * m.cloth);
  if (Math.abs(c - lastCloth) > 0.0005) { el.cloth.innerHTML = DY.clothSvg(c); lastCloth = c; }
  fade(el.roll, Math.min(1, c * 4));
  fade(el.weave, clamp01(c * 2 - 1));
  fade(el.ghost, m.ghost);
  el.brackets.forEach((node, i) => fade(node, m.w[i]));
  fade(el.wovenFront, m.w[0]);
  fade(el.bareFront, Math.min(1, m.w[0] + m.w[2]));
  const s = 0.5 - 0.5 * Math.cos(phase), dir = Math.sin(phase) >= 0 ? 1 : -1;
  const xs = DY.shuttleAt(s);
  el.shuttle.setAttribute("transform", translateAlong(P, [xs - SHUTTLE_REST[0], DY.fellAt(c) - YF, 0]));
  el.weft.setAttribute("d", DY.weftD(c, xs, dir));
  const i = Math.round(u);
  const text = READOUTS[i];
  if (readout.textContent !== text) readout.textContent = text;
  cells.forEach((cell) => {
    const name = cell.dataset.cell;
    const on = name === "could" ? i !== 1 : name === "does" ? i >= 1 : i === 2;
    cell.toggleAttribute("data-dim", !on);
  });
  stage.setAttribute("aria-valuenow", String(i));
  stage.setAttribute("aria-valuetext", STATES[i] + ": " + text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  u = calm ? target : u + (target - u) * (1 - Math.exp(-dt / 0.5));
  if (Math.abs(target - u) < 0.0005) u = target;
  if (!calm) phase += dt * (Math.PI * 2) / 3.4;
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = clamp(next, 0, LAST); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches && !held; clock = 0; run(); }, 4200); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  if (held) return;
  const box = svg.getBoundingClientRect();
  steer(Math.round(clamp(((event.clientX - box.left) / box.width - 0.15) / 0.7, 0, 1) * LAST));
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
  set(i) { held = true; touring = false; clearTimeout(idle); target = clamp(Math.round(i), 0, LAST); run(); },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const body = k.plateHtml({
  fig: "Fig 4",
  title: "Could vs. does",
  hint: "Move across: could · does · gap",
  readout: M.READOUTS[M.KEY_STATE],
  keys: [
    { mark: "red", label: `Red cloth: tasks actually being done (observed coverage), ${M.DOES} of 100` },
    { mark: "edge", label: `Bare strung warp: tasks models could do but don't, ${M.GAP} points` },
    { mark: "raised", label: "Clamp bar, coin-slot lock box and padlock: permission, plumbing, meter" },
  ],
  caption:
    `In computer and math occupations, language models could theoretically perform ${M.COULD}% of tasks, but observed use covers only ${M.DOES}%. The other ${M.GAP} points are not a capability problem: they are a permission, plumbing and meter problem. Across the economy the pattern repeats: office and admin work could reach ${M.OFFICE_COULD}%, and ${M.ZERO_COVERAGE}% of workers have zero observed coverage. Source: ${M.SOURCE} (the computer and math values are stated in the paper's text). One warp position stands for one percentage point of tasks; the loom, clamp and lock are illustrative.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Loom: arrow keys step through could, does and the gap" aria-valuemin="0" aria-valuemax="${M.LAST}" aria-valuenow="${M.KEY_STATE}">${svgKey}</div>`,
});

const BOARD = `<div class="board loom-board" aria-live="polite">
  <div class="cell" data-cell="could"><span class="lab">Could</span><span class="num">${M.COULD}%</span></div>
  <span class="op" aria-hidden="true">−</span>
  <div class="cell does" data-cell="does"><span class="lab">Does</span><span class="num">${M.DOES}%</span></div>
  <span class="op" aria-hidden="true">=</span>
  <div class="cell bill" data-cell="gap"><span class="lab">Left on the table</span><span class="num">${M.GAP} pts</span></div>
  <div class="note"><span>Computer &amp; math occupations. Office &amp; admin: could ${M.OFFICE_COULD}%. ${M.ZERO_COVERAGE}% of workers have zero observed coverage.</span></div>
</div>`;
const LOOM_CSS = `
.loom-board .cell{transition:opacity .45s var(--anatomy-ease)}
.loom-board .cell[data-dim]{opacity:.3}
.loom-board .does .num{color:var(--anatomy-red)}
@media (min-width:701px){.loom-board{grid-template-columns:auto auto auto auto 1fr}}
@media (max-width:480px){.iso-plate-corner[data-corner="readout"]{font-size:12px;max-width:62%;text-align:right;white-space:normal}}
`;
const figureHtml = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figureHtml === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "Could vs. does", theme: "light", body: figureHtml, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${LOOM_CSS}</style>`);
writeSnapshot(HERE, "loom", svgKey);
M.STATES.forEach((_, i) => writeSnapshot(HERE, `loom-${i + 1}`, figure(i)));
writeFileSync(join(HERE, "loom.html"), page);
writeFileSync(join(HERE, "loom.fragment.html"), figureHtml);
console.log("wrote loom.html", (page.length / 1024).toFixed(0) + " KB", "scale", P.scale.toFixed(3));
