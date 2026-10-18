// F9 · The Tuesday RFP — an Anatomy figure for the v4 talk.
// A mail-sorting machine on a fenced plate. The RFP drops into the hopper; the router cuts it into six cards that
// run down six chutes. Four stop in bins beside the agents' workstations, inside the fence. Two run to the gate,
// where two stamping heads come down, shear off the red RFP # / DEADLINE / BID tabs (and keep them inside), and
// stamp CAPABILITY SEARCH on what leaves. A return tray brings OPTIONS back to the one human desk.
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
const SLOT = "rfp";
const WIDTH = 640;
const HEIGHT = 392;

// ---------- world plan (x along the machine, y toward the viewer, z up) ----------
const PLATE = { x: -180, y: -80, w: 320, d: 160, r: 8 };
const PLATE_H = 12, FOOT_H = 5;
const WORLD = { x: 146, y: 2, w: 106, d: 76, r: 6 };          // outside the fence: the world's table
const ROUTER = { x: -170, y: -70, w: 44, d: 128, r: 3 };
const ROUTER_H = 44;
const RX = ROUTER.x + ROUTER.w;                               // the router's outlet face, x = −126
const HOPPER = { x: -166, y: 12, w: 38, d: 16 };
const HOPPER_H = 8;
const SHEAF = { x: -163, y: 17, w: 32, z: ROUTER_H + 2, h: 40 };
const MOTOR = [-150, -36];

const LANES_IN = [-60, -44, -28, -12];                         // pricing, technical, capabilities, logistics
const LANE_A = 18, LANE_B = 40, LANE_R = 62;                  // partnering, risk, the return tray
const BIN_X = [-26, -56, -86, -116];                           // each bin one step further back and right
const BIN_W = 44, BIN_D = 14, BIN_H = 10;
const IC = { w: 38, h: 26, z: 1 };                             // inside card
const GC = { w: 58, h: 30, z: 1 };                             // gate card
const TAB_H = 9;
const HEAD_Z = GC.z + GC.h + TAB_H;                            // underside of a head when it is down
const HEAD_UP = 8;
const GATE_X = 133, GATE_W = 6, GATE_H = 24;
const RAIL_END = WORLD.x + WORLD.w;
const PRESS = {
  A: { lane: LANE_A, cx: 79, card: 50, post: { x: 76, y: 5, w: 6, d: 6 }, arm: { x: 75, y: 5, w: 8, d: 19 } },
  B: { lane: LANE_B, cx: 36, card: 7, post: { x: 33, y: 27, w: 6, d: 6 }, arm: { x: 32, y: 27, w: 8, d: 19 } },
};
const ARM_Z = 56, ARM_H = 5, ACT_H = 8;
const DESK = { x: -64, y: 52, w: 46, d: 22 };
const DESK_Z = 16;
const TRAY = { w: 32, d: 16, in: -16, out: 214 };
const LOG = { x: 108, y: -24, w: 22, d: 14 };
const LABEL = { x: -166, y: 64, w: 40, d: 10, r: 1.5 };

// motion constants shared by the build and the page
const L = {
  startIn: RX - IC.w - 2,
  startGate: RX - GC.w - 2,
  bin: BIN_X.map((x) => x + 3),
  gate: { A: { press: PRESS.A.card, out: 191 }, B: { press: PRESS.B.card, out: 148 } },
  sheafDrop: 5,
  headUp: HEAD_UP,
  tray: TRAY,
};

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...k.boxCorners(WORLD, -PLATE_H - FOOT_H, 0),
    [SHEAF.x, SHEAF.y, SHEAF.z + SHEAF.h + 3],
    [SHEAF.x + SHEAF.w, SHEAF.y, SHEAF.z + SHEAF.h + 3],
    [PRESS.A.cx, LANE_A, ARM_Z + ARM_H + ACT_H + 2],
    [PRESS.B.cx, LANE_B, ARM_Z + ARM_H + ACT_H + 2],
  ],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 55 },
);
// Projected words must read like the token meter's at the back of the room: ≥ 3.6 units at its scale (1.48).
const TEXT_MIN = (3.6 * 1.4802) / P.scale;
const TXT = Math.max(4.4, Math.ceil(TEXT_MIN * 10) / 10);
const charW = (size) => size * 0.64;
const fits = (text, size, width, what) => {
  if (charW(size) * text.length > width) throw new Error(`${what}: "${text}" at ${size} needs ${(charW(size) * text.length).toFixed(1)}, has ${width}`);
};

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const box = (plan, z, h, steps = 2, bevel = 0) => k.slabOf({ r: 0.6, ...plan }, z, h, P, steps, bevel);
const path = (points, closed = false) => k.pathOf(points.map(at), closed);
// a rectangle on a face that looks toward +y (plane y = const), in (x, z)
const yRect = (y, x0, x1, z0, z1) => path([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
// a rectangle on a face that looks toward +x (plane x = const), in (y, z)
const xRect = (x, y0, y1, z0, z1) => path([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], true);
const yText = (x, y, z, text, opts) => k.faceTextSvg(k.sideMatrix([x, y], z, P, "left"), text, { anchor: "middle", ...opts });
const hull = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return k.pathOf([...lower.slice(0, -1), ...upper.slice(0, -1)], true);
};
const clipBox = (id, x0, x1, y0, y1, z0, z1) => `<clipPath id="${id}"><path d="${hull(k.boxCorners({ x: x0, y: y0, w: x1 - x0, d: y1 - y0 }, z0, z1).map(at))}"/></clipPath>`;

// ---------- the bench ----------
function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`, `<path class="iso-halo" d="${k.haloOf(WORLD, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = byDepth([...k.corners(PLATE, 20), ...k.corners(WORLD, 14)]);
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "lo", inner: Ln(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  // the world's table, just outside the gate: perforated, unfenced
  out.push(S(k.slabOf(WORLD, -PLATE_H, PLATE_H, P, 6, 1.2), { tone: "lo", inner: Ln(k.sideSeam(WORLD, -PLATE_H / 2, P, 6), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(WORLD, 4), 0, P, 6), { tone: "faint" }));
  out.push(D(k.dotGrid(WORLD.x + 9, WORLD.y + 8, 16, 11, 6, 0, P), { size: 0.45, tone: "lo" }));
  const ws = k.corners(WORLD, 4.2).filter(([x]) => x > WORLD.x + 50);
  out.push(Ln(ws.map(([x, y]) => k.ring(x, y, 1.6, 0, P, 14)).join(""), { tone: "lo" }), D(ws.map(([x, y]) => at([x, y, 0])), { size: 0.4 }));
  // label plate: three rule lines that stand for printed text
  out.push(S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "mid", crease: "none" }));
  out.push(Ln(k.planOutline(k.insetPlan(LABEL, 1.4), 0.8, P, 3), { tone: "faint" }));
  [[26, 3.4], [20, 5.6], [24, 7.8]].forEach(([len, dy]) => out.push(Ln(k.lineOnTop([LABEL.x + 4, LABEL.y + dy], [LABEL.x + 4 + len, LABEL.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + LABEL.w - 3.2, LABEL.y + 3, 0.8]), at([LABEL.x + LABEL.w - 3.2, LABEL.y + LABEL.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ---------- the fence: three sides and a gate ----------
const FENCE_H = 18;
const post = (x, y, h = FENCE_H, s = 4) => S(box({ x: x - s / 2, y: y - s / 2, w: s, d: s, r: 0.6 }, 0, h, 2, 0.3), { tone: "mid" }) + D([at([x, y, h])], { size: 0.4 });
function fenceRails(plan) {
  return [7, 13.5].map((z) => S(box(plan, z, 1.6, 2), { tone: "mid", crease: "none" })).join("");
}
function fenceBack() {
  const out = [];
  out.push(fenceRails({ x: -176, y: -76.7, w: 312, d: 1.4 }));
  for (const x of [-132, -88, -44, 0, 44, 88, 136]) out.push(post(x, -76));
  out.push(fenceRails({ x: -176.7, y: -76, w: 1.4, d: 152 }));
  for (const y of [-76, -38, 0, 38, 76]) out.push(post(-176, y));
  return out.join("");
}
function fenceRight() {
  const out = [fenceRails({ x: 135.3, y: -76, w: 1.4, d: 78 })];
  out.push(post(136, -36));
  out.push(gatePost(2));
  out.push(gateLeaf(GATE_LEAF_Y[0]));
  return out.join("");
}
// the gate: two posts a little taller than the fence, and two leaves swung open outward, flat to the lanes
const GATE_LEAF_Y = [4.5, 75.5];
const LEAF = { x0: GATE_X + GATE_W, len: 32 };
function gatePost(y) {
  const plan = { x: GATE_X, y, w: GATE_W, d: 5, r: 0.6 };
  return S(k.slabOf(plan, 0, GATE_H, P, 2, 0.4), { tone: "mid", inner: Ln(k.sideSeam(plan, GATE_H - 4, P, 2), { tone: "faint" }) }) +
    S(box({ x: GATE_X - 0.8, y: y - 0.8, w: GATE_W + 1.6, d: 6.6, r: 0.8 }, GATE_H, 1.6, 2, 0.4), { tone: "mid" }) +
    D([at([GATE_X + 3, y + 2.5, GATE_H + 1.6])], { size: 0.45 });
}
function gateLeaf(yc) {
  const out = [];
  const y = yc - 0.7, x0 = LEAF.x0, x1 = LEAF.x0 + LEAF.len;
  out.push(S(box({ x: x0, y, w: 2, d: 1.4, r: 0.3 }, 3, 15, 2), { tone: "mid", crease: "none" }));
  [4.5, 10.5, 15.5].forEach((z) => out.push(S(box({ x: x0 + 2, y, w: LEAF.len - 4, d: 1.4, r: 0.3 }, z, 1.6, 2), { tone: "mid", crease: "none" })));
  out.push(S(box({ x: x1 - 2, y, w: 2, d: 1.4, r: 0.3 }, 3, 15, 2), { tone: "mid", crease: "none" }));
  // the brace, from the low rail at the free end up to the high rail at the hinge
  out.push(Ln(path([[x1 - 2, y + 1.4, 6.1], [x0 + 2, y + 1.4, 15.5]]), { tone: "lo" }));
  // two hinge knuckles on the post
  out.push(D([at([x0, yc + 2.5, 6]), at([x0, yc + 2.5, 16])], { size: 0.7, tone: "mid" }));
  return out.join("");
}
function gateFront() {
  return gatePost(73) + gateLeaf(GATE_LEAF_Y[1]);
}

// ---------- the router: hopper on top, six outlets on its face ----------
function router() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan({ ...ROUTER, r: 3 }, 3), 0, 0.1, P)}" style="filter:blur(4px)"/>`);
  out.push(S(k.slabOf(ROUTER, 0, ROUTER_H, P, 3, 1), { tone: "mid", inner: Ln(k.sideSeam(ROUTER, 30, P, 3), { tone: "faint" }) }));
  // the six outlets, each as tall as the card it lets out
  const outlet = (y, h) => [`<path class="iso-fill" style="fill:var(--anatomy-shade-0)" d="${xRect(RX, y - 3, y + 3, 0.6, h)}"/>`, Ln(xRect(RX, y - 3, y + 3, 0.6, h), { tone: "lo" })].join("");
  LANES_IN.forEach((y) => out.push(outlet(y, IC.z + IC.h + 1.4)));
  [LANE_A, LANE_B].forEach((y) => out.push(outlet(y, HEAD_Z + 1.4)));
  // vents on the near end, closed slots
  for (let i = 0; i < 4; i++) out.push(Ln(path([[-163, ROUTER.y + ROUTER.d, 9 + 4.2 * i], [-137, ROUTER.y + ROUTER.d, 9 + 4.2 * i], [-137, ROUTER.y + ROUTER.d, 10.6 + 4.2 * i], [-163, ROUTER.y + ROUTER.d, 10.6 + 4.2 * i]], true), { tone: "lo" }));
  // top cover and its screws
  const cover = k.insetPlan({ ...ROUTER, r: 3 }, 4);
  out.push(Ln(k.planOutline(cover, ROUTER_H, P, 3), { tone: "faint" }));
  const screws = k.corners(ROUTER, 7.5);
  out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 1.8, ROUTER_H, P, 14)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => at([x, y, ROUTER_H])), { size: 0.45 }));
  // the hopper's back and side walls
  const H0 = ROUTER_H;
  out.push(S(box({ x: HOPPER.x, y: HOPPER.y, w: HOPPER.w, d: 2 }, H0, HOPPER_H, 2, 0.3), { tone: "mid" }));
  out.push(S(box({ x: HOPPER.x, y: HOPPER.y + 2, w: 2, d: HOPPER.d - 4 }, H0, HOPPER_H, 2), { tone: "mid" }));
  out.push(S(box({ x: HOPPER.x + HOPPER.w - 2, y: HOPPER.y + 2, w: 2, d: HOPPER.d - 4 }, H0, HOPPER_H, 2), { tone: "mid" }));
  return out.join("");
}

function sheafSvg() {
  // three sheets of the RFP, the front one carries the cover
  const out = [];
  [[1.2, -0.6, 0], [-0.8, 0.8, 2], [0, 0, 4]].forEach(([dx, dz, dy], i) => {
    const plan = { x: SHEAF.x + dx, y: SHEAF.y + dy, w: SHEAF.w, d: 1.1, r: 0.2 };
    const rule = i === 2 ? Ln(k.sideSeam(plan, SHEAF.z + SHEAF.h - 6, P, 2), { tone: "lo" }) : "";
    out.push(S(k.slabOf(plan, SHEAF.z + dz, SHEAF.h, P, 2), { tone: i === 2 ? "hi" : "mid", crease: "lo", inner: rule }));
  });
  const yf = SHEAF.y + 4 + 1.1, cx = SHEAF.x + SHEAF.w / 2, top = SHEAF.z + SHEAF.h;
  fits("RFP", 9, SHEAF.w - 4, "sheaf");
  fits("DUE FRI", TXT + 0.8, SHEAF.w - 3, "sheaf");
  out.push(yText(cx, yf, top - 15, "RFP", { size: 9, tone: "hi" }));
  out.push(yText(cx, yf, top - 24, "DUE FRI", { size: TXT + 0.8, tone: "hi" }));
  // the binder clip
  out.push(S(box({ x: cx - 5, y: SHEAF.y - 0.8, w: 10, d: 7.8 }, top - 2, 3.4, 2, 0.3), { tone: "hi", crease: "lo" }));
  return out.join("");
}

function hopperFront() {
  const out = [];
  out.push(S(box({ x: HOPPER.x, y: HOPPER.y + HOPPER.d - 2, w: HOPPER.w, d: 2 }, ROUTER_H, HOPPER_H, 2, 0.3), { tone: "mid" }));
  out.push(D([[HOPPER.x + 3, HOPPER.y + HOPPER.d - 1], [HOPPER.x + HOPPER.w - 3, HOPPER.y + HOPPER.d - 1]].map(([x, y]) => at([x, y, ROUTER_H + HOPPER_H])), { size: 0.4 }));
  // the motor that drives the cutter, with its crank
  const [mx, my] = MOTOR;
  out.push(S(k.cylinder(mx, my, 9, ROUTER_H, 1.2, P, 36), { tone: "lo" }));
  out.push(S(k.cylinder(mx, my, 7, ROUTER_H + 1.2, 9, P, 36), { tone: "mid", inner: Ln(k.sideArc(mx, my, 7, ROUTER_H + 5, P, 24), { tone: "faint" }) }));
  out.push(Ln(k.knurl(mx, my, 7, ROUTER_H + 6, ROUTER_H + 10, 30, P), { tone: "lo" }));
  out.push(S(k.cylinder(mx, my, 5.4, ROUTER_H + 10.2, 1.2, P, 32), { tone: "hi", crease: "lo" }));
  return out.join("");
}

function crankSvg(angle) {
  const [mx, my] = [-150, -36];
  const ex = mx + Math.cos(angle) * 4, ey = my + Math.sin(angle) * 4;
  return k.lineSvg(k.lineOnTop([mx, my], [ex, ey], 55.4, P), { tone: "hi" }) + k.solidSvg(k.cylinder(ex, ey, 1.2, 55.4, 3, P, 14), { tone: "hi", crease: "lo" });
}

// ---------- chutes, bins and the agents ----------
const rails = (x0, x1, y, h = 3) =>
  [y - 6, y + 4].map((ry) => S(box({ x: x0, y: ry, w: x1 - x0, d: 2, r: 0.4 }, 0, h, 2, 0.3), { tone: "mid", crease: "none" }));

function insideCard(i) {
  const y = LANES_IN[i], name = M.INSIDE[i];
  fits(name, TXT, IC.w - 2, "inside card");
  const plan = { x: 0, y: y - 1, w: IC.w, d: 2, r: 0.3 };
  const out = [S(k.slabOf(plan, IC.z, IC.h, P, 2), { tone: "hi", crease: "lo", inner: Ln(k.sideSeam(plan, IC.z + IC.h - 4.5, P, 2), { tone: "lo" }) })];
  out.push(yText(IC.w / 2, y + 1, IC.z + 13.4, name, { size: TXT, tone: "hi" }));
  return out.join("");
}

function binBack(i) {
  const y = LANES_IN[i], bx = BIN_X[i];
  return [
    S(k.slabOf({ x: bx, y: y - BIN_D / 2, w: BIN_W, d: BIN_D, r: 0.6 }, 0, 0.8, P, 2), { tone: "lo", crease: "none" }),
    S(box({ x: bx, y: y - BIN_D / 2, w: BIN_W, d: 2 }, 0, BIN_H, 2, 0.3), { tone: "mid" }),
  ].join("");
}
function binFront(i, lamp, p) {
  const y = LANES_IN[i], bx = BIN_X[i];
  const out = [];
  out.push(S(box({ x: bx, y: y + BIN_D / 2 - 2, w: BIN_W - 2, d: 2 }, 0, BIN_H, 2, 0.3), { tone: "mid" }));
  out.push(S(box({ x: bx + BIN_W - 2, y: y - BIN_D / 2, w: 2, d: BIN_D }, 0, BIN_H + 2, 2, 0.3), { tone: "mid" }));
  out.push(D([at([bx + 2.4, y + BIN_D / 2 - 1, BIN_H]), at([bx + BIN_W - 5, y + BIN_D / 2 - 1, BIN_H])], { size: 0.4 }));
  // the agent's workstation: a base, a screen facing the room, a keyboard and a status lamp
  const wx = bx + BIN_W + 4;
  out.push(S(box({ x: wx, y: y - 6, w: 22, d: 12, r: 1 }, 0, 3, 3, 0.4), { tone: "lo" }));
  out.push(S(box({ x: wx + 7, y: y - 3.4, w: 3, d: 2 }, 3, 2.4, 2), { tone: "mid", crease: "none" }));
  const mon = { x: wx + 1.5, y: y - 5.6, w: 15, d: 2.2, r: 0.4 };
  out.push(S(k.slabOf(mon, 5.4, 10, P, 2, 0.3), { tone: "mid" }));
  const yf = mon.y + mon.d;
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-1)" d="${yRect(yf, mon.x + 1.4, mon.x + mon.w - 1.4, 6.8, 14)}"/>`);
  out.push(Ln(yRect(yf, mon.x + 1.4, mon.x + mon.w - 1.4, 6.8, 14), { tone: "lo" }));
  out.push(`<g data-part="answer-${i}" opacity="${lamp}">${[[9, 12.2], [6.5, 10.4], [8, 8.6]].map(([len, z]) => Ln(path([[mon.x + 3, yf, z], [mon.x + 3 + len, yf, z]]), { tone: "mid", free: true })).join("")}</g>`);
  out.push(S(box({ x: wx + 3, y: y + 0.6, w: 12, d: 4.2, r: 0.5 }, 3, 1, 2), { tone: "mid", crease: "none" }));
  out.push(Ln(path([[wx + 3, y + 4.8, 3.5], [wx + 15, y + 4.8, 3.5]]), { tone: "faint" }));
  out.push(S(k.cylinder(wx + 18.5, y + 1.5, 1.8, 3, 3.6, P, 16), { tone: "mid" }));
  out.push(`<g data-part="lamp-${i}" opacity="${lamp}">${S(k.cylinder(wx + 18.5, y + 1.5, 1.3, 6.6, 0.8, P, 16), { tone: "hi", crease: "lo" })}</g>`);
  return out.join("");
}

// ---------- the gate cards and their tabs ----------
const TAB_S = TXT;
const TABS = (() => {
  const widths = M.STRIPPED.map((s) => charW(TAB_S) * s.length + 2.2);
  const gap = (GC.w - 2 - widths.reduce((a, b) => a + b, 0)) / 2;
  if (gap < 0.8) throw new Error(`tabs do not fit a ${GC.w} card at ${TAB_S}`);
  let x = 1;
  return widths.map((w, i) => { const t = { x, w, text: M.STRIPPED[i] }; x += w + gap; return t; });
})();

function tabsSvg(x0, y, struck) {
  const z = GC.z + GC.h;
  return TABS.map((t) => {
    const plan = { x: x0 + t.x, y: y - 0.6, w: t.w, d: 1.2, r: 0.2 };
    const yf = y + 0.6;
    const parts = [S(k.slabOf(plan, z, TAB_H, P, 2), { tone: "hi", className: "rfp-tag" })];
    parts.push(yText(x0 + t.x + t.w / 2, yf, z + 1.9, t.text, { size: TAB_S, tone: "red" }));
    if (struck !== undefined) parts.push(`<g data-part="${struck}" opacity="0"><path class="iso-line" data-tone="red" style="stroke-width:1.1" d="${k.sideSeam(plan, z + 3.5, P, 2)}"/></g>`);
    return parts.join("");
  }).join("");
}

function gateCard(key) {
  const y = PRESS[key].lane, name = M.OUTSIDE[key === "A" ? 0 : 1];
  fits(name, TXT + 0.6, GC.w - 3, "gate card");
  fits("CAPABILITY", TXT, GC.w - 3, "gate card");
  const plan = { x: 0, y: y - 1, w: GC.w, d: 2, r: 0.3 };
  const out = [S(k.slabOf(plan, GC.z, GC.h, P, 2), { tone: "hi", crease: "lo", inner: Ln(k.sideSeam(plan, GC.z + GC.h - 4.5, P, 2), { tone: "lo" }) })];
  out.push(`<g data-part="name-${key}">${yText(GC.w / 2, y + 1, GC.z + 13.6, name, { size: TXT + 0.6, tone: "hi" })}</g>`);
  out.push(`<g data-part="search-${key}" opacity="0">${yText(GC.w / 2, y + 1, GC.z + 18, "CAPABILITY", { size: TXT, tone: "hi" })}${yText(GC.w / 2, y + 1, GC.z + 11, "SEARCH", { size: TXT, tone: "hi" })}</g>`);
  out.push(`<g data-part="tabs-${key}">${tabsSvg(0, y)}</g>`);
  return out.join("");
}

// ---------- the stamping presses ----------
function pressPost(key) {
  const p = PRESS[key];
  const out = [];
  out.push(S(box({ x: p.post.x - 2.5, y: p.post.y - 1, w: p.post.w + 5, d: p.post.d + 2, r: 0.8 }, 0, 1.6, 2, 0.3), { tone: "lo" }));
  out.push(S(box(p.post, 1.6, ARM_Z + ARM_H - 1.6, 2, 0.4), { tone: "mid", inner: Ln(k.sideSeam({ r: 0.6, ...p.post }, 30, P, 2), { tone: "faint" }) }));
  out.push(D([[p.post.x - 1.2, p.post.y + 3], [p.post.x + p.post.w + 1.2, p.post.y + 3]].map(([x, y]) => at([x, y, 1.6])), { size: 0.4 }));
  return out.join("");
}
function headSvg(key) {
  const p = PRESS[key], y = p.lane;
  const out = [];
  // the stripped tabs this head holds once it has struck: drawn where they were, carried up with the head
  out.push(`<g data-part="held-${key}" opacity="0">${tabsSvg(p.card, y, `strike-${key}`)}</g>`);
  const platen = { x: p.card, y: y - 2.2, w: GC.w, d: 4.4, r: 0.8 };
  out.push(S(k.slabOf(platen, HEAD_Z, 4, P, 3, 0.4), { tone: "mid", inner: Ln(k.sideSeam(platen, HEAD_Z + 1.4, P, 3), { tone: "faint" }) }));
  out.push(S(box({ x: p.cx - 6, y: y - 2.2, w: 12, d: 4.4, r: 0.8 }, HEAD_Z + 4, 5, 2, 0.4), { tone: "mid" }));
  out.push(D([at([p.card + 3, y, HEAD_Z + 4]), at([p.card + GC.w - 3, y, HEAD_Z + 4])], { size: 0.45 }));
  out.push(S(k.cylinder(p.cx, y, 1.4, HEAD_Z + 9, 12, P, 14), { tone: "hi", crease: "none" }));
  return out.join("");
}
function pressTop(key) {
  const p = PRESS[key], y = p.lane;
  const out = [];
  out.push(S(box(p.arm, ARM_Z, ARM_H, 2, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ r: 0.6, ...p.arm }, ARM_Z + 3, P, 2), { tone: "faint" }) }));
  out.push(S(k.cylinder(p.cx, y, 4.5, ARM_Z + ARM_H, ACT_H, P, 28, 0.4), { tone: "mid", inner: Ln(k.sideArc(p.cx, y, 4.5, ARM_Z + ARM_H + 3, P, 20) + k.sideArc(p.cx, y, 4.5, ARM_Z + ARM_H + ACT_H - 3, P, 20), { tone: "faint" }) }));
  out.push(S(k.cylinder(p.cx, y, 3.2, ARM_Z + ARM_H + ACT_H, 1.2, P, 20), { tone: "hi", crease: "lo" }));
  out.push(D([at([p.arm.x + p.arm.w / 2, p.arm.y + 2.4, ARM_Z + ARM_H])], { size: 0.45 }));
  return out.join("");
}

// ---------- the log: what the gate stripped, printed inside ----------
function logPrinter() {
  const out = [];
  out.push(S(k.slabOf({ ...LOG, r: 1.6 }, 0, 10, P, 3, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ ...LOG, r: 1.6 }, 4, P, 3), { tone: "faint" }) }));
  out.push(Ln(k.planOutline({ x: LOG.x + 4, y: LOG.y + 5, w: 14, d: 2.4, r: 0.6 }, 10, P, 2), { tone: "lo" }));
  const tape = { x: LOG.x + 5, y: LOG.y + 6, w: 12, d: 0.6, r: 0.1 };
  out.push(S(k.slabOf(tape, 10, 12, P, 1), { tone: "hi", crease: "lo" }));
  [[8, 19], [6, 16.5], [7.5, 14]].forEach(([len, z]) => out.push(Ln(path([[tape.x + 2, tape.y + tape.d, z], [tape.x + 2 + len, tape.y + tape.d, z]]), { tone: "lo", free: true })));
  out.push(S(k.cylinder(LOG.x + 18, LOG.y + LOG.d - 3, 1.6, 10, 2, P, 14), { tone: "mid" }));
  // the cable from the gate press to the log, along the floor
  const from = at([PRESS.A.cx, PRESS.A.post.y, 1.6]);
  const corner = at([PRESS.A.cx, -3, 0.4]);
  const to = at([LOG.x + 6, LOG.y + LOG.d, 2]);
  out.push(k.wireSvg(from, to, { via: [corner, at([LOG.x + 6, -3, 0.4])], tone: "lo", size: 0.8 }));
  return out.join("");
}

// ---------- the human desk and the return tray ----------
function desk(decide) {
  const out = [];
  // the chair, on the near side of the press
  out.push(S(k.cylinder(DESK.x - 10, 63, 5, 0, 1, P, 24), { tone: "lo" }));
  out.push(S(k.cylinder(DESK.x - 10, 63, 1.2, 1, 8, P, 12), { tone: "mid", crease: "none" }));
  out.push(S(box({ x: DESK.x - 16, y: 57, w: 12, d: 12, r: 1.6 }, 9, 2, 3, 0.4), { tone: "mid" }));
  out.push(S(box({ x: DESK.x - 17, y: 58, w: 2, d: 10, r: 0.6 }, 11, 11, 2, 0.3), { tone: "mid" }));
  // legs, top, apron with the name
  for (const [x, y] of byDepth([[DESK.x + 2.5, DESK.y + 2.5], [DESK.x + DESK.w - 2.5, DESK.y + 2.5], [DESK.x + 2.5, DESK.y + DESK.d - 4], [DESK.x + DESK.w - 2.5, DESK.y + DESK.d - 4]])) out.push(S(k.cylinder(x, y, 1.3, 0, DESK_Z, P, 12), { tone: "mid", crease: "none" }));
  const top = { ...DESK, r: 1.4 };
  out.push(S(k.slabOf(top, DESK_Z, 2, P, 3, 0.5), { tone: "mid" }));
  out.push(S(box({ x: DESK.x + 1, y: DESK.y + DESK.d - 2, w: DESK.w - 2, d: 1.6, r: 0.3 }, 7.6, DESK_Z - 7.6, 2), { tone: "mid", crease: "none" }));
  fits("HUMAN DECIDES", TXT, DESK.w - 3, "desk");
  out.push(yText(DESK.x + DESK.w / 2, DESK.y + DESK.d - 0.4, 9.8, "HUMAN DECIDES", { size: TXT, tone: "hi" }));
  // a blotter, a pen and the desk lamp that marks the decision
  out.push(S(k.slabOf({ x: DESK.x + 6, y: DESK.y + 5, w: 18, d: 12, r: 0.6 }, DESK_Z + 2, 0.4, P, 2), { tone: "lo", crease: "none" }));
  out.push(S(box({ x: DESK.x + 27, y: DESK.y + 9, w: 9, d: 1.4, r: 0.6 }, DESK_Z + 2, 1, 2), { tone: "hi", crease: "none" }));
  out.push(S(k.cylinder(DESK.x + DESK.w - 5, DESK.y + 5, 2.6, DESK_Z + 2, 1, P, 18), { tone: "mid" }));
  out.push(S(k.cylinder(DESK.x + DESK.w - 5, DESK.y + 5, 0.8, DESK_Z + 3, 7, P, 10), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(DESK.x + DESK.w - 5, DESK.y + 5, 3, DESK_Z + 10, 2.4, P, 20), { tone: "mid" }));
  out.push(`<g data-part="decide" opacity="${decide}">${S(k.cylinder(DESK.x + DESK.w - 5, DESK.y + 5, 2, DESK_Z + 12.4, 0.6, P, 16), { tone: "hi", crease: "lo" })}</g>`);
  return out.join("");
}

function traySvg(options) {
  const y = LANE_R, out = [];
  const plan = { x: 0, y: y - TRAY.d / 2, w: TRAY.w, d: TRAY.d, r: 1 };
  out.push(S(k.slabOf(plan, 3, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(plan, 1.6), 6, P, 3), { tone: "lo" }));
  fits("OPTIONS", TXT + 0.4, 26, "options");
  out.push(`<g data-part="options" opacity="${options}">${S(k.slabOf({ x: 3, y: y - 1, w: 26, d: 2, r: 0.3 }, 6, 16, P, 2), { tone: "hi", crease: "lo" })}${yText(16, y + 1, 12.4, "OPTIONS", { size: TXT + 0.4, tone: "hi" })}</g>`);
  return out.join("");
}

// ---------- motion: the one map from a pose to every moving part ----------
function motion(p, L) {
  const lerp = (a, b, u) => a + (b - a) * u;
  const m = { sheaf: { move: [0, 0, -L.sheafDrop * p.sheaf] } };
  p.inside.forEach((u, i) => { m["card-" + i] = { move: [lerp(L.startIn, L.bin[i], u), 0, 0] }; });
  p.lamps.forEach((u, i) => { m["lamp-" + i] = { opacity: u }; m["answer-" + i] = { opacity: u }; });
  for (const key of ["A", "B"]) {
    const g = L.gate[key];
    const x = lerp(L.startGate, g.press, p.gateIn) + (g.out - g.press) * p.out;
    m["card-" + key] = { move: [x, 0, 0] };
    m["head-" + key] = { move: [0, 0, L.headUp * p.head] };
    m["tabs-" + key] = { opacity: 1 - p.held };
    m["held-" + key] = { opacity: p.held };
    m["strike-" + key] = { opacity: p.strike };
    m["name-" + key] = { opacity: 1 - p.swap };
    m["search-" + key] = { opacity: p.swap };
  }
  m.options = { opacity: p.options };
  m.tray = { move: [lerp(L.tray.out, L.tray.in, p.tray), 0, 0] };
  m.decide = { opacity: p.decide };
  return m;
}

const attrOf = (spec) => (spec.move ? `transform="${k.translateAlong(P, spec.move)}"` : `opacity="${Math.round(spec.opacity * 1000) / 1000}"`);
function applyStatic(svg, m) {
  let out = svg;
  for (const [name, spec] of Object.entries(m)) {
    const re = new RegExp(`data-part="${name}"( (?:transform|opacity)="[^"]*")?`, "g");
    let hits = 0;
    out = out.replace(re, () => { hits++; return `data-part="${name}" ${attrOf(spec)}`; });
    if (!hits) throw new Error(`no part ${name}`);
  }
  return out;
}

const STYLE = `<style>
.iso{--rfp-tag-top:#fae3e1;--rfp-tag-face:#f6d2cf;--rfp-tag-side:#efc1bd}
.rfp-tag>.iso-fill{fill:var(--rfp-tag-face)}.rfp-tag>.iso-top{fill:var(--rfp-tag-top)}.rfp-tag>.iso-shade{fill:var(--rfp-tag-face)}.rfp-tag>.iso-shade[data-shade="0"],.rfp-tag>.iso-shade[data-shade="1"]{fill:var(--rfp-tag-side)}
.rfp-tag>.iso-edge,.rfp-tag>.iso-crease{stroke:var(--anatomy-red)}.rfp-tag>.iso-crease{opacity:.55}
.iso-face-text[data-tone="red"]{fill:var(--anatomy-red);font-weight:600}
.iso-face-text[data-tone="hi"]{font-weight:600}
.rfp-fade{opacity:var(--rfp-fade,1)}
</style>`;

function svgAt(t) {
  const p = M.pose(t);
  const clips = [
    ...LANES_IN.map((y, i) => clipBox(`rfp-lane-${i}`, RX, 400, y - 2, y + 2, -4, 60)),
    clipBox("rfp-lane-A", RX, 400, LANE_A - 2, LANE_A + 2, -4, 60),
    clipBox("rfp-lane-B", RX, 400, LANE_B - 2, LANE_B + 2, -4, 60),
    clipBox("rfp-sheaf", -180, -110, SHEAF.y - 1, SHEAF.y + 7, ROUTER_H + 0.6, 140),
  ];
  const moving = (name, inner, clip) =>
    `<g class="rfp-fade"${clip ? ` clip-path="url(#${clip})"` : ""}><g data-part="${name}">${inner}</g></g>`;
  const body = [
    STYLE,
    `<defs>${clips.join("")}</defs>`,
    bench(),
    fenceBack(),
    router(),
    moving("sheaf", sheafSvg(), "rfp-sheaf"),
    hopperFront(),
    `<g data-part="crank">${crankSvg(p.crank)}</g>`,
  ];
  LANES_IN.forEach((y, i) => {
    const [back, front] = rails(RX, BIN_X[i], y);
    body.push(back, binBack(i), moving(`card-${i}`, insideCard(i), `rfp-lane-${i}`), front, binFront(i, 0, p));
  });
  body.push(logPrinter(), fenceRight());
  for (const key of ["A", "B"]) {
    const y = PRESS[key].lane;
    const [back, front] = rails(RX, RAIL_END, y);
    body.push(pressPost(key), back, moving(`card-${key}`, gateCard(key), `rfp-lane-${key}`), front);
    body.push(`<g data-part="head-${key}">${headSvg(key)}</g>`, pressTop(key));
  }
  body.push(desk(0));
  const [rb, rf] = rails(DESK.x + DESK.w, RAIL_END, LANE_R);
  body.push(rb, moving("tray", traySvg(0)), rf, gateFront());
  const svg = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "A mail-sorting machine on a plate fenced on three sides with one gate. An RFP due Friday sits in the hopper; the router cuts it into six cards. Pricing, technical, capabilities and logistics run down short chutes into bins beside four agent workstations inside the fence. Partnering and risk run to the gate, where two stamping heads shear off their red RFP number, deadline and bid tabs, keep them inside, and stamp capability search on what leaves. A return tray brings options back to a single desk marked human decides.",
    body,
  });
  return applyStatic(svg, motion(p, L));
}

// ---------- the page ----------
const KEY_T = M.T_OF[M.KEY];
const svg = svgAt(KEY_T);

const live = `
const P = ${JSON.stringify(P)};
const L = ${JSON.stringify(L)};
const STATES = ${JSON.stringify(M.STATES)}, READOUT = ${JSON.stringify(M.READOUT)}, NOTES = ${JSON.stringify(M.NOTES)}, T_OF = ${JSON.stringify(M.T_OF)}, KEY = ${M.KEY};
const pose = ${M.pose.toString()};
const counts = ${M.counts.toString()};
const motion = ${motion.toString()};
const crankSvg = ${crankSvg.toString().replaceAll("k.", "")};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const parts = {};
svg.querySelectorAll("[data-part]").forEach((el) => { parts[el.dataset.part] = el; });
const board = {
  inside: document.querySelector('[data-board="inside"]'),
  out: document.querySelector('[data-board="out"]'),
  decides: document.querySelector('[data-board="decides"]'),
  note: document.querySelector('[data-board="note"]'),
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const stateOf = (t) => (t < 1.5 ? 0 : t < 2.5 ? 1 : 2);
let t = still.matches ? T_OF[KEY] : 0, target = still.matches ? t : T_OF[0];
let frame = 0, last = 0, visible = false, touring = !still.matches, held = false, idle = 0, wait = 0, fade = 1, resetting = 0, said = -1;
const cache = {};
const born = performance.now();
function draw() {
  const p = pose(t);
  const m = motion(p, L);
  for (const name in m) {
    const el = parts[name];
    if (!el) continue;
    const spec = m[name];
    const value = spec.move ? translateAlong(P, spec.move) : String(Math.round(spec.opacity * 1000) / 1000);
    if (cache[name] === value) continue;
    cache[name] = value;
    el.setAttribute(spec.move ? "transform" : "opacity", value);
  }
  parts.crank.innerHTML = crankSvg(p.crank);
  svg.style.setProperty("--rfp-fade", String(fade));
  const s = stateOf(t);
  if (readout.textContent !== READOUT[s]) readout.textContent = READOUT[s];
  const c = counts(p);
  board.inside.textContent = String(c.inside);
  board.out.textContent = String(c.out);
  board.decides.textContent = c.decides;
  if (said !== s) {
    said = s;
    board.note.textContent = NOTES[s];
    stage.setAttribute("aria-valuenow", String(s));
    stage.setAttribute("aria-valuetext", READOUT[s] + ": " + NOTES[s]);
  }
}
const HOLD = [2.6, 2.6, 3.6];
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (resetting) {
    // the tour's loop: fade the pieces out, put the RFP back in the hopper, fade in
    fade = clamp(fade + (resetting < 0 ? -dt : dt) / 0.45, 0, 1);
    if (resetting < 0 && fade === 0) { t = 0; target = T_OF[0]; resetting = 1; }
    else if (resetting > 0 && fade === 1) resetting = 0;
  } else if (calm) {
    t = target;
  } else if (t !== target) {
    const step = (0.26 + 0.3 * Math.max(0, Math.abs(target - t) - 1)) * dt; // about 4 s a beat
    t = Math.abs(target - t) <= step ? target : t + Math.sign(target - t) * step;
  } else if (touring) {
    wait += dt;
    const s = T_OF.indexOf(target);
    if (s >= 0 && wait > HOLD[s]) {
      wait = 0;
      if (s === T_OF.length - 1) { resetting = -1; } else target = T_OF[s + 1];
    }
  }
  draw();
  const settled = !touring && !resetting && t === target;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next, jump) => {
  touring = false; resetting = 0; fade = 1; wait = 0;
  target = clamp(next, 0, T_OF[T_OF.length - 1]);
  if (jump) t = target;
  clearTimeout(idle);
  if (!held) idle = setTimeout(() => { if (held || still.matches) return; touring = true; wait = 0; target = T_OF[stateOf(target)]; run(); }, 4200);
  draw(); run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  if (held) return;
  const box = svg.getBoundingClientRect();
  steer(clamp(((event.clientX - box.left) / box.width - 0.12) / 0.76, 0, 1) * T_OF[T_OF.length - 1]);
});
stage.addEventListener("keydown", (event) => {
  const here = stateOf(target);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(T_OF.length - 1, here + (target < T_OF[0] ? 0 : 1));
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, here - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = T_OF.length - 1;
  if (to === null) return;
  event.preventDefault();
  steer(T_OF[to]);
});
draw();
window.figureApi = {
  states: STATES.slice(),
  set(i) { held = true; clearTimeout(idle); steer(T_OF[clamp(Math.round(i), 0, T_OF.length - 1)], performance.now() - born < 400); }, // a deck's first set jumps
  hold() { held = true; touring = false; resetting = 0; fade = 1; clearTimeout(idle); draw(); },
};
`;

const body = k.plateHtml({
  fig: "Fig 9",
  title: "The Tuesday RFP",
  hint: "Move across to run the sorter",
  readout: M.READOUT[M.KEY],
  keys: [
    { mark: "raised", label: "Inside the fence: four bins, each answered by an agent at its workstation" },
    { mark: "red", label: "Red tabs: RFP #, deadline, bid — sheared off at the gate and kept inside" },
    { mark: "flat", label: "The world's table: it only ever sees a capability search" },
  ],
  caption:
    "An illustrative workflow, after the Tuesday RFP in the manifesto: an RFP due Friday splits into six pieces. Pricing, technical, capabilities and logistics are answered inside the boundary by the team's own agents. Partnering and risk need the outside world, so before they leave the RFP number, the deadline and the bid are stripped, logged and policy-checked; the world sees a capability search. Options come back in, and a human makes the call. The counts (six pieces, four inside, two out, three labels stripped) are the example's own; no other numbers are implied.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="The Tuesday RFP: arrow keys step through the split, the gate and the return" aria-valuemin="0" aria-valuemax="2" aria-valuenow="${M.KEY}" aria-valuetext="${M.READOUT[M.KEY]}">${svg}</div>`,
});

const BOARD = `<div class="board" aria-live="polite">
  <div class="cell"><span class="lab">Answered inside</span><span class="num" data-board="inside">4</span></div>
  <span class="op" aria-hidden="true">+</span>
  <div class="cell"><span class="lab">Out, stripped</span><span class="num" data-board="out">2</span></div>
  <span class="op" aria-hidden="true">→</span>
  <div class="cell bill"><span class="lab">Who decides</span><span class="num" data-board="decides">Human</span></div>
  <div class="note"><span data-board="note">${M.NOTES[M.KEY]}</span></div>
</div>`;
const figure = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figure === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "The Tuesday RFP", theme: "light", body: figure, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}</style>`);

writeSnapshot(HERE, SLOT, svg);
M.T_OF.forEach((t, i) => writeSnapshot(HERE, `${SLOT}-${i + 1}`, svgAt(t)));
writeFileSync(join(HERE, `${SLOT}.html`), page);
writeFileSync(join(HERE, `${SLOT}.fragment.html`), figure);
const solids = (svg.match(/class="iso-solid/g) || []).length;
console.log(`wrote ${SLOT}.html ${(page.length / 1024).toFixed(0)} KB · scale ${P.scale.toFixed(3)} · face text ${TXT} (min ${TEXT_MIN.toFixed(2)}) · ${solids} solids`);
