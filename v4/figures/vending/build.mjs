// Fig 7 · One token, four prices — an Anatomy figure for the v4 talk.
// One vending machine sells the same item (1M tokens of the same open model) through four coin slots.
// Three price plates are fixed: cloud GPU $0.97, frontier API ~$12, wrapped federal LLM up to $45.
// The owned-capacity plate is a drum counter driven by the crank box beside the machine: turn the crank to set how
// many hours a day the box is busy, and the drums roll to 0.97 × 5.3 / hours. Past 5.3 h the owned price beats cloud.
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
const { iso, pathOf } = k;

// ---------- world plan (units ≈ px of the real thing; x, y on the floor, z up) ----------
const PLATE = { x: -306, y: -64, w: 426, d: 134, r: 9 };
const PLATE_H = 12;
const FOOT_H = 5;

const CASE = { x: -150, y: -50, w: 250, d: 90, r: 4 };
const FRONT = CASE.y + CASE.d; // 40: the door
const SIDE = CASE.x + CASE.w; // 100: the right side wall
const PLINTH_H = 12;
const BODY_TOP = 200;
const CROWN = { x: -153, y: -53, w: 256, d: 96, r: 5 };
const CROWN_FRONT = CROWN.y + CROWN.d; // 43
const TOP = 226;

const COLS = [-112.5, -57.5, -2.5, 52.5]; // the four columns: owned, cloud GPU, frontier API, wrapped federal
const WIN = { x0: -140, x1: 80, z0: 124, z1: 194, r: 3, depth: 44 };
const SHELF_Z = 158, SHELF_H = 3;
const PACK = { w: 36, d: 26, h: 24, back: FRONT - 36 };
const BIN = { x0: -138, x1: 78, z0: 22, z1: 42, r: 3, depth: 10 };
const MOD = { z0: 48, z1: 118, half: 25 };
const PRICE = { z0: 78, z1: 97, half: 21, depth: 2.4 };
const PITCH = PRICE.z1 - PRICE.z0;
const DIGIT = 12;
const BASE = (PRICE.z0 + PRICE.z1) / 2 - DIGIT * 0.36; // digit baseline, cap height centred in the window
const DRUMS = [-6, 5.5, 14.5]; // drum centres (x from the column centre): units, tenths, hundredths
const DRUM_W = 8.4;
const LOCK = [89, 150];
const MARQUEE = { x0: -140, x1: 86, z0: 205, z1: 221, r: 2, depth: 1.5 };

const BOX = { x: -292, y: -14, w: 118, d: 54, r: 4 };
const BF = BOX.y + BOX.d; // 40: the crank box face, flush with the door
const BOX_X1 = BOX.x + BOX.w; // -174
const BOX_TOP = 150, BOX_CAP = 8;
const DC = [-252, 86]; // dial centre (x, z) on the box face
const R_BEZEL = 33, R_FACE = 30, R_NUM = 20.6, R_WEDGE = 15.5, R_KNOB = 9, KNOB_R = 3.2;
const DF = BF + 2; // dial face plane
const SHAFT = { x: BOX_X1, y: 27, w: CASE.x - BOX_X1, d: 6, z: DC[1] - 3, h: 6 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(CROWN, 0, TOP), ...k.boxCorners(k.insetPlan(BOX, -2), 0, BOX_TOP + BOX_CAP)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 62 },
);

const at = (point) => iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const planeOf = (y) => k.sideMatrix([0, y], 0, P, "left"); // local (x, −z) on the vertical plane at y
const inPlane = (y, inner, extra = "") => `<g transform="${planeOf(y)}"${extra}>${inner}</g>`;
const flat = (x0, z0, x1, z1, r, steps = 6) => pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);
const disc = (cx, cz, r) => `M${cx - r} ${-cz}A${r} ${r} 0 1 0 ${cx + r} ${-cz}A${r} ${r} 0 1 0 ${cx - r} ${-cz}Z`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const T = (x, z, text, { size = 5.6, tone = "mid", anchor = "middle", weight, style } = {}) =>
  `<text class="iso-face-text" data-tone="${tone}" x="${x}" y="${-z}" font-size="${size}" text-anchor="${anchor}"${weight ? ` font-weight="${weight}"` : ""}${style ? ` style="${style}"` : ""}>${esc(text)}</text>`;
const fill = (d, color, extra = "") => `<path style="fill:var(--anatomy-${color});stroke:none"${extra} d="${d}"/>`;
const polarFace = ([cx, cz], angle, r) => [cx + Math.sin(angle) * r, cz + Math.cos(angle) * r];

// convex hull (monotone chain) for round parts whose axis points at the viewer (+y)
function hullOf(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  for (const p of pts.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
// a cylinder along +y (a knob, a button, a lock barrel): body hull, shaded, with its front cap
function yCylinder(x, z, r, y0, y1, tone = "mid", steps = 28) {
  const ringAt = (y) => Array.from({ length: steps }, (_, i) => { const t = (i / steps) * Math.PI * 2; return iso([x + r * Math.cos(t), y, z + r * Math.sin(t)], P); });
  const body = pathOf(hullOf([...ringAt(y0), ...ringAt(y1)]), true);
  const cap = pathOf(ringAt(y1), true);
  return `<g class="iso-solid"><path class="iso-fill" d="${body}"/><path class="iso-shade" data-shade="1" d="${body}"/><path class="iso-top" d="${cap}"/><path class="iso-line" data-tone="faint" d="${cap}"/><path class="iso-line iso-edge" data-tone="${tone}" d="${body}"/></g>`;
}

// a recess in a vertical face at y: inner walls shaded by facing, a back plane, content clipped to the opening
let clipCount = 0;
function recess({ x0, x1, z0, z1, r, depth }, y, { back = "", backColor = "shade-1", inside = "", over = "", floor = null } = {}) {
  const id = `vm-clip-${clipCount++}`;
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 6);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const { sinA } = k.cameraOf(P);
  const tops = [], sides = [[], [], [], []];
  ring.forEach(([ax, az], index) => {
    const [bx, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, bz - az) || 1;
    let [nx, nz] = [(bz - az) / length, -(bx - ax) / length];
    if (nx * (cx - (ax + bx) / 2) + nz * (cz - (az + bz) / 2) < 0) [nx, nz] = [-nx, -nz];
    if (nx <= 0 && nz <= 0) return;
    const quad = pathOf([at([ax, y, az]), at([bx, y, bz]), at([bx, y - depth, bz]), at([ax, y - depth, az])], true);
    if (nz >= nx) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((nx * -sinA + 1) / 2) * 4)))].push(quad);
  });
  const shape = flat(x0, z0, x1, z1, r);
  return [
    `<clipPath id="${id}"><path transform="${planeOf(y)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    floor ? fill(tops.join(""), floor) : `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    inPlane(y - depth, `${fill(shape, backColor)}${back}<path class="iso-line" data-tone="faint" d="${shape}"/>`),
    inside,
    `</g>`,
    over,
    inPlane(y, `<path class="iso-line" data-tone="lo" d="${shape}"/>`),
  ].join("");
}

// ---------- the live parts (also inlined into the page) ----------
function wedgeD(hours) {
  const [cx, cz] = DC;
  const a = (Math.min(24, Math.max(0, hours)) / 24) * Math.PI * 2;
  if (a >= Math.PI * 2 - 1e-3) return `M${cx - R_WEDGE} ${-cz}A${R_WEDGE} ${R_WEDGE} 0 1 1 ${cx + R_WEDGE} ${-cz}A${R_WEDGE} ${R_WEDGE} 0 1 1 ${cx - R_WEDGE} ${-cz}Z`;
  const ex = cx + Math.sin(a) * R_WEDGE, ez = cz + Math.cos(a) * R_WEDGE;
  return `M${cx} ${-cz}L${cx} ${-(cz + R_WEDGE)}A${R_WEDGE} ${R_WEDGE} 0 ${a > Math.PI ? 1 : 0} 1 ${ex.toFixed(2)} ${(-ez).toFixed(2)}Z`;
}
const armTurn = (hours) => `rotate(${((Math.min(24, Math.max(0, hours)) / 24) * 360).toFixed(2)} ${DC[0]} ${-DC[1]})`;
function knobSvg(hours) {
  const a = (Math.min(24, Math.max(0, hours)) / 24) * Math.PI * 2;
  return yCylinder(DC[0] + Math.sin(a) * R_KNOB, DC[1] + Math.cos(a) * R_KNOB, KNOB_R, DF + 2.6, DF + 9, "hi", 24);
}
function drumPositions(price) {
  const x = price * 100;
  const n = Math.floor(x + 1e-7), f = Math.max(0, x - n);
  const t = Math.min(1, Math.max(0, (f - 0.3) / 0.4));
  const total = n + t * t * (3 - 2 * t); // rolls between cents, rests on the rounded cent
  return [100, 10, 1].map((place) => {
    if (place === 1) return total % 10;
    const digit = Math.floor(total / place + 1e-9) % 10;
    const rest = total - Math.floor(total / place + 1e-9) * place;
    return digit + Math.max(0, rest - (place - 1));
  });
}
const drumShift = (pos) => `translate(0 ${(-pos * PITCH).toFixed(2)})`;

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
  return out.join("");
}

function benchFront() {
  const out = [];
  // the label plate: three rule lines that stand for printed text
  const LABEL = { x: 40, y: 50, w: 58, d: 12, r: 1.5 };
  out.push(S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "mid", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P, 3), { tone: "faint" }));
  [[34, 3.6], [26, 6], [30, 8.4]].forEach(([len, dy]) => out.push(L(k.lineOnTop([LABEL.x + 4, LABEL.y + dy], [LABEL.x + 4 + len, LABEL.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + LABEL.w - 3.4, LABEL.y + 3.4, 0.8]), at([LABEL.x + LABEL.w - 3.4, LABEL.y + LABEL.d - 3.4, 0.8])], { size: 0.45 }));
  // a short stack of tokens on the bench, in front of the crank
  const COIN = [-196, 56];
  for (let i = 0; i < 3; i++) {
    const [x, y] = [COIN[0] + i * 0.8, COIN[1] - i * 0.5];
    out.push(S(k.cylinder(x, y, 6.5, i * 1.8, 1.8, P, 36, 0.3), { tone: "mid" }));
  }
  out.push(L(k.ring(COIN[0] + 1.6, COIN[1] - 1, 4.6, 5.4, P, 32), { tone: "faint" }));
  out.push(D([at([COIN[0] + 1.6, COIN[1] - 1, 5.4])], { size: 0.5, tone: "mid" }));
  return out.join("");
}

// ---------- the crank box ----------
function crankBox(hours) {
  const out = [`<path class="iso-halo" d="${k.haloOf(BOX, 0, 6, P)}"/>`];
  out.push(S(k.slabOf(k.insetPlan(BOX, 3), 0, 8, P, 6), { tone: "lo" }));
  out.push(S(k.slabOf(BOX, 8, BOX_TOP - 8, P, 6, 1.2), { tone: "mid", inner: L(k.sideSeam(BOX, 24, P, 6), { tone: "faint" }) }));
  const cap = k.insetPlan(BOX, -2);
  out.push(S(k.slabOf(cap, BOX_TOP, BOX_CAP, P, 6, 1), { tone: "mid" }));
  const capScrews = k.corners(cap, 8);
  out.push(L(capScrews.map(([x, y]) => k.ring(x, y, 1.8, BOX_TOP + BOX_CAP, P, 14)).join(""), { tone: "lo" }), D(capScrews.map(([x, y]) => at([x, y, BOX_TOP + BOX_CAP])), { size: 0.45 }));
  out.push(L(k.planOutline(k.insetPlan(cap, 14), BOX_TOP + BOX_CAP, P, 4), { tone: "faint" }));

  // the face panel: groove, screws, title, louvres
  const face = [];
  face.push(`<path class="iso-line" data-tone="lo" d="${flat(BOX.x + 4, 12, BOX_X1 - 4, BOX_TOP - 4, 3)}"/>`);
  const screws = [[BOX.x + 8.5, 16.5], [BOX_X1 - 8.5, 16.5], [BOX.x + 8.5, BOX_TOP - 8.5], [BOX_X1 - 8.5, BOX_TOP - 8.5]];
  face.push(`<path class="iso-line" data-tone="lo" d="${screws.map(([x, z]) => disc(x, z, 1.8)).join("")}"/>`);
  const mid = (BOX.x + BOX_X1) / 2;
  face.push(T(mid, 136, "HOURS / DAY", { size: 5.8, tone: "hi", weight: 700 }));
  face.push(T(mid, 128.4, "THE BOX IS BUSY", { size: 5.6, tone: "mid" }));
  face.push(`<path class="iso-line" data-tone="faint" d="${Array.from({ length: 4 }, (_, i) => flat(BOX.x + 22, 22 + i * 5.2, BOX_X1 - 22, 24.6 + i * 5.2, 1.3, 3)).join("")}"/>`);
  // the break-even mark's label, outside the dial and clear of the crank's sweep
  const be = (M.BREAK_EVEN_H / 24) * Math.PI * 2;
  const [, bz] = polarFace(DC, be, R_BEZEL);
  face.push(T(DC[0] + R_BEZEL + 3.6, bz + 1.4, "5.3 h", { size: 5.8, tone: "hi", anchor: "start", weight: 700 }));
  face.push(T(DC[0] + R_BEZEL + 3.6, bz - 6, "BREAK-EVEN", { size: 5.4, tone: "mid", anchor: "start" }));
  out.push(inPlane(BF, face.join("")));
  out.push(D(screws.map(([x, z]) => at([x, BF, z])), { size: 0.45 }));

  // the dial: bezel, face ring, the busy wedge, hour ticks, numerals, the break-even index
  out.push(yCylinder(DC[0], DC[1], R_BEZEL, BF, DF, "mid", 72));
  const dial = [];
  dial.push(`<path class="iso-line" data-tone="lo" d="${disc(DC[0], DC[1], R_FACE)}"/>`);
  dial.push(`<path data-part="wedge" class="iso-line" data-tone="mid" style="fill:var(--anatomy-shade-0)" d="${wedgeD(hours)}"/>`);
  dial.push(`<path class="iso-line" data-tone="faint" d="${disc(DC[0], DC[1], R_WEDGE)}"/>`);
  const minor = [], major = [];
  for (let hr = 0; hr < 24; hr++) {
    const a = (hr / 24) * Math.PI * 2;
    const isMajor = hr % 6 === 0;
    const [x0, z0] = polarFace(DC, a, R_FACE);
    const [x1, z1] = polarFace(DC, a, R_FACE - (isMajor ? 4.2 : 2.4));
    (isMajor ? major : minor).push(`M${x0.toFixed(2)} ${(-z0).toFixed(2)}L${x1.toFixed(2)} ${(-z1).toFixed(2)}`);
  }
  dial.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  [["24", 0], ["6", 6], ["12", 12], ["18", 18]].forEach(([name, hr]) => {
    const [x, z] = polarFace(DC, (hr / 24) * Math.PI * 2, R_NUM);
    dial.push(T(x, z - 2.1, name, { size: 5.8, tone: hr === 0 ? "hi" : "mid" }));
  });
  // break-even index: a filled notch on the bezel ring at 5.3 h
  const tip = polarFace(DC, be, R_FACE + 0.2), l = polarFace(DC, be - 0.07, R_BEZEL - 0.6), r = polarFace(DC, be + 0.07, R_BEZEL - 0.6);
  dial.push(`<path class="iso-line" data-tone="hi" style="fill:var(--anatomy-hi)" d="M${tip[0].toFixed(2)} ${(-tip[1]).toFixed(2)}L${l[0].toFixed(2)} ${(-l[1]).toFixed(2)}L${r[0].toFixed(2)} ${(-r[1]).toFixed(2)}Z"/>`);
  out.push(inPlane(DF, dial.join("")));

  // the crank: a flat arm (two planes for its thickness), the hub, the handle
  const arm = flat(DC[0] - 2.2, DC[1] - 4.4, DC[0] + 2.2, DC[1] + R_KNOB + 3.2, 2.2, 4);
  out.push(inPlane(DF + 1.2, `<g data-part="arm-back" transform="${armTurn(hours)}">${fill(arm, "shade-0")}<path class="iso-line" data-tone="mid" d="${arm}"/></g>`));
  out.push(inPlane(DF + 2.6, `<g data-part="arm" transform="${armTurn(hours)}">${fill(arm, "top")}<path class="iso-line" data-tone="hi" d="${arm}"/></g>`));
  out.push(yCylinder(DC[0], DC[1], 2.2, DF + 2.6, DF + 3.6, "mid", 20));
  out.push(D([at([DC[0], DF + 3.6, DC[1]])], { size: 0.5, tone: "hi" }));
  out.push(`<g data-part="knob">${knobSvg(hours)}</g>`);

  // the drive: a collar on the box's side wall and a square shaft into the machine
  out.push(S(k.slabOf({ x: BOX_X1, y: SHAFT.y - 4, w: 2.4, d: SHAFT.d + 8, r: 1 }, SHAFT.z - 4, SHAFT.h + 8, P, 3, 0.3), { tone: "mid" }));
  out.push(D([at([BOX_X1 + 2.4, SHAFT.y - 2, SHAFT.z + SHAFT.h + 2]), at([BOX_X1 + 2.4, SHAFT.y + SHAFT.d + 2, SHAFT.z - 2])], { size: 0.4 }));
  out.push(S(k.slabOf({ x: BOX_X1 + 2.4, y: SHAFT.y, w: SHAFT.w - 2.4, d: SHAFT.d, r: 0.4 }, SHAFT.z, SHAFT.h, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}

// ---------- the vending machine ----------
function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CASE, 0, 8, P)}"/>`];
  out.push(S(k.slabOf(k.insetPlan(CASE, 3), 0, PLINTH_H, P, 6), { tone: "lo" }));
  out.push(inPlane(FRONT - 3, `<path class="iso-line" data-tone="faint" d="${Array.from({ length: 14 }, (_, i) => flat(-128 + i * 15, 3.5, -120 + i * 15, 8.5, 1.2, 3)).join("")}"/>`));
  out.push(S(k.slabOf(CASE, PLINTH_H, BODY_TOP - PLINTH_H, P, 6, 1.2), { tone: "mid" }));
  out.push(S(k.slabOf(CROWN, BODY_TOP, TOP - BODY_TOP, P, 6, 1.2), { tone: "mid", inner: L(k.sideSeam(CROWN, BODY_TOP + 3, P, 6), { tone: "faint" }) }));
  // crown top: a lid groove, four screws, a vent row
  out.push(L(k.planOutline(k.insetPlan(CROWN, 6), TOP, P, 6), { tone: "faint" }));
  const lid = k.corners(CROWN, 11);
  out.push(L(lid.map(([x, y]) => k.ring(x, y, 2, TOP, P, 14)).join(""), { tone: "lo" }), D(lid.map(([x, y]) => at([x, y, TOP])), { size: 0.45 }));
  out.push(L(Array.from({ length: 9 }, (_, i) => k.planOutline({ x: -96 + i * 18, y: -20, w: 10, d: 2.6, r: 1.3 }, TOP, P, 3)).join(""), { tone: "lo" }));
  // the marquee on the crown: the one item every slot sells
  out.push(recess(MARQUEE, CROWN_FRONT, { backColor: "face", back: T((MARQUEE.x0 + MARQUEE.x1) / 2, MARQUEE.z0 + 5.1, "1M TOKENS · SAME OPEN MODEL", { size: 8.4, tone: "hi", weight: 700 }) }));
  out.push(D([[MARQUEE.x0 - 5, 213], [MARQUEE.x1 + 5, 213]].map(([x, z]) => at([x, CROWN_FRONT, z])), { size: 0.5 }));

  // the door: groove, hinges, lock
  out.push(inPlane(FRONT, `<path class="iso-line" data-tone="lo" d="${flat(CASE.x + 4, PLINTH_H + 4, SIDE - 4, BODY_TOP - 3, 3)}"/>`));
  out.push(sideFace());
  out.push(window_());
  out.push(bin());
  return out.join("");
}

function sideFace() {
  const out = [];
  const slot = (y, z0, z1, half = 1) => pathOf(k.roundedPlan({ x: y - half, y: z0, w: half * 2, d: z1 - z0, r: half }, 4).map(([u, z]) => at([SIDE, u, z])), true);
  out.push(L(Array.from({ length: 12 }, (_, i) => slot(-40 + i * 6, 160, 188)).join(""), { tone: "faint" }));
  // the serial plate on the side wall
  const plate = (y0, y1, z0, z1) => pathOf([[y0, z0], [y1, z0], [y1, z1], [y0, z1]].map(([y, z]) => at([SIDE, y, z])), true);
  out.push(`<path style="fill:var(--anatomy-shade-2)" class="iso-line" data-tone="lo" d="${plate(-34, 6, 40, 58)}"/>`);
  [[30, 53], [22, 48.5], [26, 44]].forEach(([len, z]) => out.push(L(pathOf([at([SIDE, -30, z]), at([SIDE, -30 + len, z])]), { tone: "lo", free: true })));
  out.push(D([at([SIDE, -31.5, 55.5]), at([SIDE, 3.5, 55.5])], { size: 0.4 }));
  return out.join("");
}

function window_() {
  const inside = [];
  const packs = (z) => COLS.map((cx) => {
    const plan = { x: cx - PACK.w / 2, y: PACK.back, w: PACK.w, d: PACK.d, r: 1 };
    const front = PACK.back + PACK.d;
    return [
      S(k.slabOf(plan, z, PACK.h, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(plan, z + PACK.h - 4.5, P, 2), { tone: "lo" }) }),
      inPlane(front, T(cx, z + 9.6, "1M", { size: 8.6, tone: "hi", weight: 700 }) + T(cx, z + 3.2, "TOKENS", { size: 5.4, tone: "mid" })),
    ].join("");
  }).join("");
  inside.push(packs(WIN.z0));
  inside.push(S(k.slabOf({ x: WIN.x0 - 2, y: FRONT - WIN.depth, w: WIN.x1 - WIN.x0 + 4, d: WIN.depth - 4, r: 0 }, SHELF_Z, SHELF_H, P, 1), { tone: "lo" }));
  inside.push(packs(SHELF_Z + SHELF_H));
  // the glass: a faint pane with two glare bands
  const glare = [[-128, 124, -112, 124, -60, 194, -76, 194], [-102, 124, -96, 124, -44, 194, -50, 194]]
    .map((q) => `M${q[0]} ${-q[1]}L${q[2]} ${-q[3]}L${q[4]} ${-q[5]}L${q[6]} ${-q[7]}Z`).join("");
  inside.push(inPlane(FRONT - 1.2, `<path style="fill:#ffffff;opacity:.16" d="${flat(WIN.x0, WIN.z0, WIN.x1, WIN.z1, WIN.r)}"/><path style="fill:#ffffff;opacity:.22" d="${glare}"/>`));
  return recess(WIN, FRONT, { backColor: "shade-0", floor: "shade-2", inside: inside.join("") });
}

function bin() {
  const flap = flat(BIN.x0 + 3, BIN.z0 + 2, BIN.x1 - 3, BIN.z1, 2);
  const pull = flat(-44, 35.5, 4, 38.5, 1.5, 3);
  const inside = inPlane(FRONT - 4, `${fill(flap, "shade-2")}<path class="iso-line" data-tone="lo" d="${flap}"/><path class="iso-line" data-tone="mid" d="${pull}"/>`);
  return recess(BIN, FRONT, { backColor: "shade-0", inside });
}

function modules(hours) {
  const out = [];
  const price = M.owned(hours);
  const plates = ["", "$0.97", "~$12", "≤$45"];
  const titles = [["OWNED", "CAPACITY"], ["CLOUD", "GPU"], ["FRONTIER", "API"], ["WRAPPED", "FEDERAL LLM"]];
  COLS.forEach((cx, i) => {
    const face = [];
    face.push(`<path class="iso-line" data-tone="lo" d="${flat(cx - MOD.half, MOD.z0, cx + MOD.half, MOD.z1, 3)}"/>`);
    face.push(`<path class="iso-line" data-tone="faint" d="${flat(cx - MOD.half + 1.6, MOD.z0 + 1.6, cx + MOD.half - 1.6, MOD.z1 - 1.6, 2)}"/>`);
    face.push(T(cx, 109.6, titles[i][0], { size: 5.8, tone: "hi", weight: 700 }));
    face.push(T(cx, 102.4, titles[i][1], { size: 5.6, tone: "mid" }));
    // coin plate with its slot outline
    face.push(`<path class="iso-line" data-tone="lo" d="${flat(cx - 20, 54, cx - 4, 73, 2)}"/>`);
    out.push(inPlane(FRONT, face.join("")));
    out.push(D([[cx - 21.6, 51.6], [cx + 21.6, 51.6], [cx - 21.6, 114.4], [cx + 21.6, 114.4]].map(([x, z]) => at([x, FRONT, z])), { size: 0.45 }));
    out.push(recess({ x0: cx - 13, x1: cx - 11, z0: 57.5, z1: 69.5, r: 1, depth: 4 }, FRONT, { backColor: "shade-0" }));
    // coin-return button
    out.push(inPlane(FRONT, `<path class="iso-line" data-tone="lo" d="${disc(cx + 10, 63.5, 6.4)}"/>`));
    out.push(yCylinder(cx + 10, 63.5, 4.4, FRONT, FRONT + 1.8, "mid", 24));
    // the price plate
    const win = { x0: cx - PRICE.half, x1: cx + PRICE.half, z0: PRICE.z0, z1: PRICE.z1, r: 2, depth: PRICE.depth };
    if (i > 0) {
      out.push(recess(win, FRONT, { backColor: "face", back: T(cx, BASE, plates[i], { size: DIGIT, tone: "hi", weight: 700 }) }));
    } else {
      out.push(recess(win, FRONT, { backColor: "shade-0", back: drumCounter(cx, price) }));
    }
  });
  // lock on the service strip
  out.push(inPlane(FRONT, `<path class="iso-line" data-tone="lo" d="${flat(83, 120, 95, 180, 2)}"/>`));
  out.push(yCylinder(LOCK[0], LOCK[1], 4, FRONT, FRONT + 2.4, "mid", 24));
  out.push(inPlane(FRONT + 2.4, `<path class="iso-line" data-tone="mid" d="${flat(LOCK[0] - 0.7, LOCK[1] - 2.6, LOCK[0] + 0.7, LOCK[1] + 2.6, 0.7, 3)}"/>`));
  out.push(D([at([89, FRONT, 124.5]), at([89, FRONT, 175.5])], { size: 0.45 }));
  // hinge barrels on the door's left edge
  for (const z of [30, 168]) out.push(S(k.cylinder(CASE.x + 1.6, FRONT + 1.6, 2.2, z, 18, P, 20), { tone: "mid" }), L(k.sideArc(CASE.x + 1.6, FRONT + 1.6, 2.2, z + 9, P, 12), { tone: "faint" }));
  return out.join("");
}

// the owned slot's price plate: a drum counter. "$" and "." are printed on the plate; three drums roll.
function drumCounter(cx, price) {
  const pos = drumPositions(price);
  const out = [];
  const gid = `vm-drum-shade-${clipCount}`;
  out.push(`<defs><linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" y1="${-PRICE.z1}" x2="0" y2="${-PRICE.z0}"><stop offset="0" style="stop-color:var(--anatomy-mid)" stop-opacity=".55"/><stop offset=".3" style="stop-color:var(--anatomy-mid)" stop-opacity="0"/><stop offset=".7" style="stop-color:var(--anatomy-mid)" stop-opacity="0"/><stop offset="1" style="stop-color:var(--anatomy-mid)" stop-opacity=".55"/></linearGradient></defs>`);
  out.push(fill(flat(cx - 19.5, PRICE.z0 - 1, cx - 11, PRICE.z1 + 1, 0), "face"));
  out.push(T(cx - 15.2, BASE, "$", { size: DIGIT, tone: "hi", weight: 700, style: "fill:var(--anatomy-red)" }));
  out.push(fill(flat(cx - 2.2, PRICE.z0 - 1, cx + 1.4, PRICE.z1 + 1, 0), "face"));
  out.push(`<circle cx="${cx - 0.4}" cy="${-(BASE + 0.9)}" r="1.15" style="fill:var(--anatomy-red)"/>`);
  DRUMS.forEach((dx, i) => {
    const x = cx + dx;
    out.push(fill(flat(x - DRUM_W / 2, PRICE.z0 - 1, x + DRUM_W / 2, PRICE.z1 + 1, 0), "face"));
    const digits = Array.from({ length: 11 }, (_, n) => `<text x="${x}" y="${(-BASE + n * PITCH).toFixed(2)}">${n % 10}</text>`).join("");
    out.push(`<g data-drum="${i}" transform="${drumShift(pos[i])}" class="iso-face-text" font-size="${DIGIT}" font-weight="700" text-anchor="middle" style="fill:var(--anatomy-red)">${digits}</g>`);
    out.push(`<path style="fill:url(#${gid});stroke:none" d="${flat(x - DRUM_W / 2, PRICE.z0 - 1, x + DRUM_W / 2, PRICE.z1 + 1, 0)}"/>`);
  });
  return out.join("");
}

// ---------- assemble ----------
function figure(hours) {
  clipCount = 0;
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "A vending machine selling one item, 1M tokens of the same open model, through four coin slots. Three price plates are fixed: cloud GPU $0.97, frontier API about $12, wrapped federal LLM up to $45. The owned-capacity plate is a drum counter driven by a crank box beside the machine whose 24-hour dial sets how many hours a day the box is busy; the drums roll to 0.97 × 5.3 ÷ hours. At 5.3 hours a day the owned price equals the cloud GPU price; at 12 hours it is $0.43.",
    body: [bench(), crankBox(hours), cabinet(), modules(hours), benchFront()],
  });
}

const KEY_H = M.STATES[M.KEY].hours;
const svg = figure(KEY_H);

const live = `
const P = ${JSON.stringify(P)};
const DC = ${JSON.stringify(DC)}, R_WEDGE = ${R_WEDGE}, R_KNOB = ${R_KNOB}, KNOB_R = ${KNOB_R}, DF = ${DF}, PITCH = ${PITCH};
const STATES = ${JSON.stringify(M.STATES)};
const CLOUD = ${M.CLOUD}, BREAK_EVEN_H = ${M.BREAK_EVEN_H}, FRONTIER = ${M.FRONTIER}, H_MIN = ${M.H_MIN}, H_MAX = ${M.H_MAX};
const owned = ${M.owned.toString()};
const verdict = ${M.verdict.toString()};
const money = ${M.money.toString()};
const hoursText = ${M.hoursText.toString()};
${hullOf.toString()}
${yCylinder.toString()}
${wedgeD.toString()}
const armTurn = ${armTurn.toString()};
${knobSvg.toString()}
${drumPositions.toString()}
const drumShift = ${drumShift.toString()};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const wedge = svg.querySelector('[data-part="wedge"]');
const arms = [...svg.querySelectorAll('[data-part="arm"], [data-part="arm-back"]')];
const knob = svg.querySelector('[data-part="knob"]');
const drums = [...svg.querySelectorAll("[data-drum]")];
const readout = document.querySelector("[data-readout]");
const board = { hours: document.querySelector('[data-board="hours"]'), owned: document.querySelector('[data-board="owned"]'), note: document.querySelector('[data-board="note"]') };
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const TOUR = [0, 1, 2, 3, 3];
const tourAt = (t) => STATES[TOUR[Math.floor(t / 2.6) % TOUR.length]].hours;
let h = ${KEY_H}, target = h, drawn = null, frame = 0, last = 0, clock = 2.6 * 3, touring = true, visible = false, idle = 0, held = false;
function draw() {
  if (drawn !== null && Math.abs(drawn - h) < 1e-4) return;
  drawn = h;
  const price = owned(h);
  wedge.setAttribute("d", wedgeD(h));
  const turn = armTurn(h);
  arms.forEach((arm) => arm.setAttribute("transform", turn));
  knob.innerHTML = knobSvg(h);
  drumPositions(price).forEach((pos, i) => drums[i].setAttribute("transform", drumShift(pos)));
  const text = hoursText(h) + " / day · " + money(price) + " / M";
  if (readout.textContent !== text) readout.textContent = text;
  board.hours.textContent = hoursText(h);
  board.owned.textContent = money(price);
  board.note.textContent = verdict(price);
  stage.setAttribute("aria-valuenow", h.toFixed(1));
  stage.setAttribute("aria-valuetext", hoursText(h) + " a day busy: owned capacity " + money(price) + " per million tokens, against cloud GPU $0.97, frontier API about $12, wrapped federal up to $45");
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  // ease in log(hours): the price is 1 / hours, so equal steps of log feel even on the drums
  h = calm ? target : Math.exp(Math.log(h) + (Math.log(target) - Math.log(h)) * (1 - Math.exp(-dt / 0.35)));
  if (Math.abs(Math.log(target / h)) < 0.003) h = target;
  draw();
  frame = visible && (touring || h !== target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false; target = clamp(next, H_MIN, H_MAX); clearTimeout(idle);
  if (!held) idle = setTimeout(() => { touring = !still.matches && !held; clock = 0; run(); }, 4200);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(H_MIN + clamp(((event.clientX - box.left) / box.width - 0.12) / 0.76, 0, 1) * (H_MAX - H_MIN));
});
stage.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 0.1 : 1;
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.round((target + step) / step) * step;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.round((target - step) / step) * step;
  if (event.key === "Home") to = H_MIN;
  if (event.key === "End") to = H_MAX;
  if (event.key === "PageUp" || event.key === "PageDown") {
    const i = STATES.findIndex((s) => s.hours >= target - 1e-6);
    const here = i < 0 ? STATES.length - 1 : i;
    to = STATES[clamp(here + (event.key === "PageUp" ? (STATES[here].hours > target + 1e-6 ? 0 : 1) : -1), 0, STATES.length - 1)].hours;
  }
  if (/^[1-4]$/.test(event.key)) to = STATES[Number(event.key) - 1].hours;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
draw();
window.figureApi = {
  states: STATES.map((s) => s.label),
  set(i) { held = true; touring = false; clearTimeout(idle); target = STATES[clamp(Math.round(i), 0, STATES.length - 1)].hours; if (still.matches) h = target; run(); draw(); },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const keyPrice = M.owned(KEY_H);
const body = k.plateHtml({
  fig: "Fig 7",
  title: "One token, four prices",
  hint: "Move across to turn the crank",
  readout: `${M.hoursText(KEY_H)} / day · ${M.money(keyPrice)} / M`,
  keys: [
    { mark: "red", label: "Drum counter: owned capacity's price per million tokens, $0.97 × 5.3 ÷ hours busy" },
    { mark: "raised", label: "Crank dial: hours a day the box is busy; the notch is break-even at 5.3 h" },
    { mark: "edge", label: "Fixed plates: cloud GPU, frontier API and wrapped federal LLM, per million tokens" },
  ],
  caption:
    "One item, four prices. Owned capacity is priced from the manifesto's Figure 9 (Lenovo 2026 TCO, a vendor study: 5-year lifecycle, zero residual value, 12% maintenance, $0.12/kWh): the same open model costs $0.97 per million tokens on owned hardware at 5.3 hours a day of real work, the same as an on-demand cloud GPU, and the price falls as the box stays busy longer — $1.71 at 3 hours, $0.43 at 12, $0.21 at 24 — with about a 5.2-month break-even for an 8-GPU system against on-demand cloud. These are open-model rates. The frontier API's ~$12 per million (a blended coding rate) and the wrapped federal LLM's up to $45 are Brad's reads from list pricing. The gap is utilization, not magic.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Utilization crank: arrow keys set hours a day the box is busy, from 1 to 24; keys 1 to 4 jump to the talk's states" aria-valuemin="${M.H_MIN}" aria-valuemax="${M.H_MAX}" aria-valuenow="${KEY_H}">${svg}</div>`,
});

const BOARD = `<div class="board vm-board" aria-live="polite">
  <div class="cell"><span class="lab">Hours / day</span><span class="num" data-board="hours">${M.hoursText(KEY_H)}</span></div>
  <div class="cell bill"><span class="lab">Owned $ / M</span><span class="num" data-board="owned">${M.money(keyPrice)}</span></div>
  <div class="cell"><span class="lab">Cloud GPU</span><span class="num">$0.97</span></div>
  <div class="cell"><span class="lab">Frontier</span><span class="num">~$12</span></div>
  <div class="cell"><span class="lab">Wrapped</span><span class="num">≤$45</span></div>
  <div class="note"><span data-board="note">${M.verdict(keyPrice)}</span></div>
</div>`;
const VM_CSS = `@media (max-width:700px){.iso-plate-corner[data-corner="title"]{font-size:12px}.iso-plate-corner[data-corner="fig"]{font-size:12px}}@media (min-width:701px){.vm-board{grid-template-columns:repeat(5,minmax(0,1fr))}}.vm-board .bill .num{color:var(--anatomy-red)}.vm-board .note{font-size:16px;color:var(--anatomy-text)}`;
const figureHtml = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figureHtml === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "One token, four prices", theme: "light", body: figureHtml, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${VM_CSS}</style>`);
writeSnapshot(HERE, "vending", svg);
M.STATES.forEach((s, i) => writeSnapshot(HERE, `vending-${i + 1}`, figure(s.hours)));
writeFileSync(join(HERE, "vending.html"), page);
writeFileSync(join(HERE, "vending.fragment.html"), figureHtml);
console.log("wrote vending.html", (page.length / 1024).toFixed(0) + " KB", "scale k", (P.scale * Math.sqrt(1.6)).toFixed(3), "min face text", (6.74 / (P.scale * Math.sqrt(1.6))).toFixed(2));
