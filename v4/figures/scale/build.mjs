// F3 · The spend steelyard — an Anatomy figure for the v4 talk.
// A steelyard on a heavy bench base: a log-graduated beam ($100 → $1M a year of AI spend per employee, one major tick
// per ×10) pivots in a yoke on a column. The black poise slides along the beam to the spend; on the short arm hangs a
// fixed counterweight stamped $250K, Jensen Huang's bar (half a $500K salary). Below the bar the beam tips toward the
// counterweight into its trig loop and the tongue leans off LEVEL; at the bar it levels.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../_anatomy/kit/iso-kit.mjs";
import { kitScript } from "../_anatomy/inline-kit.mjs";
import { PAPER_CSS } from "../_anatomy/paper.mjs";
import { STAGE_CSS } from "../_anatomy/stage.mjs";
import { EMBED_CSS, EMBED_JS, writeSnapshot } from "../_anatomy/embed.mjs";
import * as M from "./model.mjs";
import { SY, syX, syRot, syPrism, syRound, sySolid, syBeamSvg, syPoiseSvg, syHookOffset, syTongueSvg } from "./geom.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 380;
const ZP = SY.ZP;
const RAD = Math.PI / 180;

// ---------- world plan ----------
const PLATE = { x: -96, y: -34, w: 358, d: 68, r: 8 };
const PLATE_H = 12, FOOT_H = 5;
const LABEL = { x: 118, y: 15, w: 58, d: 13, r: 1.5 };
const VIAL = { x: -44, y: 18, w: 28, d: 10, r: 2 };
const TRIG = 245;                                    // x of the trig loop that limits the beam's swing
const W = { x: -73, y: -7.5, w: 34, d: 24, z0: 30, z1: 62 }; // the counterweight block (hangs plumb under the pin)
const HX = SY.HOOK[0], HZ = ZP + SY.HOOK[1];
const LINK_Y = [4.05, 5.05];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [-15, 9, ZP + 62], [15, 6, ZP + 62], [TRIG + 7, -10, 129], [TRIG + 7, 10, 129], [W.x, W.y + W.d, W.z0 - 6]],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 102 },
);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const still = (p) => p;
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];

// ---------- the bench base ----------
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = [...k.corners(PLATE, 20), [83, PLATE.y + 20], [83, PLATE.y + PLATE.d - 20]];
  for (const [x, y] of byDepth(feet)) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "lo", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // maker's plate: three rule lines that stand for printed text
  out.push(S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "mid", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P, 3), { tone: "faint" }));
  [[36, 4], [26, 6.6], [31, 9.2]].forEach(([len, dy]) => out.push(L(k.lineOnTop([LABEL.x + 4.5, LABEL.y + dy], [LABEL.x + 4.5 + len, LABEL.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + LABEL.w - 3.6, LABEL.y + 3.6, 0.8]), at([LABEL.x + LABEL.w - 3.6, LABEL.y + LABEL.d - 3.6, 0.8])], { size: 0.45 }));
  // spirit level set into the base: the bubble sits between its two marks
  out.push(S(k.slabOf(VIAL, 0, 2.4, P, 3, 0.4), { tone: "mid" }));
  const glass = k.insetPlan(VIAL, 2.2);
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-2)" d="${k.planOutline({ ...glass, r: glass.d / 2 }, 2.4, P, 6)}"/>`);
  out.push(L(k.planOutline({ ...glass, r: glass.d / 2 }, 2.4, P, 6), { tone: "lo" }));
  const cx = VIAL.x + VIAL.w / 2, cy = VIAL.y + VIAL.d / 2;
  out.push(L(k.lineOnTop([cx - 4.2, glass.y], [cx - 4.2, glass.y + glass.d], 2.4, P) + k.lineOnTop([cx + 4.2, glass.y], [cx + 4.2, glass.y + glass.d], 2.4, P), { tone: "mid" }));
  out.push(`<path class="iso-line" data-tone="mid" style="fill:var(--anatomy-face)" d="${k.planOutline({ x: cx - 3, y: cy - 2.2, w: 6, d: 4.4, r: 2.2 }, 2.4, P, 6)}"/>`);
  out.push(D([at([VIAL.x + 1.4, cy, 2.4]), at([VIAL.x + VIAL.w - 1.4, cy, 2.4])], { size: 0.4 }));
  return out.join("");
}

// ---------- the trig loop: the stop frame the long arm swings in ----------
const LOOP_TOP = 125;
function trigBack() {
  const out = [];
  out.push(S(k.cylinder(TRIG, 0, 9, 0, 2, P, 40, 0.4), { tone: "mid" }));
  out.push(D(k.corners({ x: TRIG - 9, y: -9, w: 18, d: 18 }, 3.2).map(([x, y]) => at([x, y, 2])), { size: 0.45 }));
  out.push(S(k.cylinder(TRIG, 0, 4.4, 2, 60, P, 28), { tone: "mid", inner: L(k.sideArc(TRIG, 0, 4.4, 30, P, 20), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: TRIG - 7, y: -10, w: 14, d: 20, r: 1.5 }, 62, 4, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(TRIG, 0, 3, 66, 2, P, 20), { tone: "lo" }));
  out.push(S(k.slabOf({ x: TRIG - 5, y: -10, w: 10, d: 3, r: 0.8 }, 66, LOOP_TOP - 66, P, 3, 0.4), { tone: "mid" }));
  return out.join("");
}
function trigFront() {
  const out = [];
  out.push(S(k.slabOf({ x: TRIG - 5, y: 7, w: 10, d: 3, r: 0.8 }, 66, LOOP_TOP - 66, P, 3, 0.4), { tone: "mid" }));
  // the level line: where the beam's centre line sits when it balances, edge to edge across the upright
  const lz = ZP + (SY.BEAM.top + SY.BEAM.bottom) / 2;
  out.push(`<path class="iso-line" data-tone="hi" style="stroke-width:1.6" d="${k.pathOf([at([TRIG - 5, 10, lz]), at([TRIG + 5, 10, lz])])}"/>`);
  out.push(S(k.slabOf({ x: TRIG - 7, y: -10, w: 14, d: 20, r: 1.5 }, LOOP_TOP, 4, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([TRIG, -6.5, LOOP_TOP + 4]), at([TRIG, 6.5, LOOP_TOP + 4])], { size: 0.45 }));
  return out.join("");
}

// ---------- the column and the yoke ----------
function column() {
  const out = [];
  out.push(S(k.cylinder(-56, 4.5, 7, 0, 10, P, 32, 0.5), { tone: "mid", inner: L(k.sideArc(-56, 4.5, 7, 4, P, 24), { tone: "faint" }) }));
  out.push(S(k.cylinder(-56, 4.5, 4.6, 10, 1.6, P, 24), { tone: "lo" }));
  out.push(S(k.cylinder(0, 0, 15, 0, 3, P, 56, 0.6), { tone: "mid" }));
  const bolts = [0, 1, 2, 3].map((i) => [Math.cos(((i + 0.5) * Math.PI) / 2) * 12, Math.sin(((i + 0.5) * Math.PI) / 2) * 12]);
  out.push(D(bolts.map(([x, y]) => at([x, y, 3])), { size: 0.5 }));
  out.push(S(k.cylinder(0, 0, 9.5, 3, 5, P, 40, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 6, 8, 64, P, 32), { tone: "mid", inner: L(k.sideArc(0, 0, 6, 14, P, 24) + k.sideArc(0, 0, 6, 66, P, 24), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: -12, y: -11, w: 24, d: 22, r: 2 }, 72, 4, P, 3, 0.6), { tone: "mid" }));
  out.push(D(k.corners({ x: -12, y: -11, w: 24, d: 22 }, 2.6).map(([x, y]) => at([x, y, 76])), { size: 0.45 }));
  // back cheek of the yoke
  out.push(S(k.slabOf({ x: -10, y: -9, w: 20, d: 3, r: 0.6 }, 76, 25, P, 2, 0.4), { tone: "mid" }));
  return out.join("");
}

function fan() {
  const out = [];
  const fy = SY.FAN_Y;
  const section = [[76, -10], [76, 10], [ZP + 62, 15], [ZP + 62, -15]];
  out.push(S(sySolid(syPrism(section, [0, 0, 0], Z, X, Y, 6, fy), still, P), { tone: "mid", crease: "faint" }));
  // two screws that hold the fan to the cheek
  for (const sx of [-6.5, 6.5]) {
    out.push(L(k.sideRing([sx, fy, 86], 1.5, "y", P, 14), { tone: "lo" }), D([at([sx, fy, 86])], { size: 0.42 }));
  }
  // the level arc: ticks every 2°, LEVEL at 0°
  const y = fy + 0.02, R0 = 42;
  const pt = (deg, r) => at([Math.sin(deg * RAD) * r, y, ZP + Math.cos(deg * RAD) * r]);
  out.push(L(k.pathOf(Array.from({ length: 33 }, (_, i) => pt(-8 + i * 0.5, R0))), { tone: "mid" }));
  const ticks = [];
  for (let deg = -8; deg <= 8; deg += 2) if (deg) ticks.push(k.pathOf([pt(deg, R0), pt(deg, R0 + (Math.abs(deg) % 4 === 0 ? 4.4 : 3))]));
  out.push(L(ticks.join(""), { tone: "mid" }));
  out.push(`<path class="iso-line" data-tone="hi" style="stroke-width:1.6" d="${k.pathOf([pt(0, R0), pt(0, R0 + 6)])}"/>`);
  out.push(`<path class="iso-line" data-tone="hi" style="fill:var(--anatomy-hi)" d="${k.pathOf([pt(0, R0 + 6), pt(-2.6, R0 + 9), pt(2.6, R0 + 9)], true)}"/>`);
  out.push(k.faceTextSvg(k.sideMatrix([0, y], ZP + 57.4, P, "left"), "LEVEL", { size: 5.8, tone: "hi", anchor: "middle" }));
  // the pivot pin's cap, through the cheek
  out.push(S(sySolid(syPrism(syRound(3.6, 18), [0, 0, ZP], Z, X, Y, fy, fy + 1.6), still, P), { tone: "mid", crease: "faint" }));
  return out.join("");
}

// ---------- the counterweight and its hanger (built level, moved as one) ----------
function weight() {
  const out = [];
  const ln = LINK_Y;
  // bail on the weight's top: two posts and a bar the link hooks into
  for (const x of [-60.5, -53.5]) out.push(S(k.slabOf({ x, y: 3.7, w: 2, d: 1.6, r: 0.4 }, W.z1, 6, P, 2), { tone: "mid" }));
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan({ x: W.x, y: W.y, w: W.w, d: W.d, r: 2 }, 3), W.z0 - 0.5, 0.1, P)}" style="filter:blur(3px);opacity:.5"/>`);
  out.push(S(k.slabOf({ x: W.x, y: W.y, w: W.w, d: W.d, r: 2.4 }, W.z0, W.z1 - W.z0, P, 4, 1), { tone: "hi", crease: "lo", inner: L(k.sideSeam({ x: W.x, y: W.y, w: W.w, d: W.d, r: 2.4 }, W.z0 + 3.4, P, 4), { tone: "faint" }) }));
  out.push(D(k.corners({ x: W.x, y: W.y, w: W.w, d: W.d }, 3.2).map(([x, y]) => at([x, y, W.z1])), { size: 0.45 }));
  // the stamped plate on its face
  const plate = [[W.z0 + 6, -71], [W.z0 + 6, -41], [W.z1 - 6, -41], [W.z1 - 6, -71]];
  const face = W.y + W.d;
  out.push(S(sySolid(syPrism(plate, [0, 0, 0], Z, X, Y, face, face + 0.8), still, P), { tone: "mid", crease: "faint" }));
  out.push(k.faceTextSvg(k.sideMatrix([-56, face + 0.82], W.z0 + 13.2, P, "left"), "$250K", { size: 8.4, tone: "hi", anchor: "middle" }));
  out.push(D([at([-69.2, face + 0.8, W.z1 - 7.6]), at([-42.8, face + 0.8, W.z1 - 7.6]), at([-69.2, face + 0.8, W.z0 + 7.6]), at([-42.8, face + 0.8, W.z0 + 7.6])], { size: 0.42 }));
  out.push(S(sySolid(syPrism([[-1.2, -61], [-1.2, -51], [1.2, -51], [1.2, -61]], [0, 4.5, W.z1 + 7.2], Z, X, Y, -0.9, 0.9), still, P), { tone: "mid", crease: "faint" }));
  // the link from the beam's pin down to the bail
  out.push(S(sySolid(syPrism([[W.z1 + 8.4, HX - 2.4], [W.z1 + 8.4, HX + 2.4], [HZ + 3.4, HX + 2.4], [HZ + 3.4, HX - 2.4]], [0, 0, 0], Z, X, Y, ln[0], ln[1]), still, P), { tone: "mid", crease: "faint" }));
  out.push(D([at([HX, ln[1], W.z1 + 10.4])], { size: 0.45 }));
  // pin head on the link
  out.push(S(sySolid(syPrism(syRound(2.4, 8, Math.PI / 8), [HX, 0, HZ], Z, X, Y, ln[1], ln[1] + 1.4), still, P), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// ---------- assemble ----------
const pieces = (u) => {
  const spend = M.spendAt(u), theta = M.tiltOf(spend) * RAD;
  return { spend, theta, beam: syBeamSvg(theta, P), poise: syPoiseSvg(theta, spend, P), hang: k.translateAlong(P, syHookOffset(theta)), tongue: syTongueSvg(theta, P) };
};
const LABEL_TEXT =
  "A steelyard on a heavy base. Its beam is graduated on a log scale of annual AI spend per employee, from $100 to $1M, one major tick for every ten times more. A black poise slides along the beam to the spend; on the short arm hangs a fixed counterweight stamped $250K, Jensen Huang's bar of half a $500,000 salary. Below the bar the beam tips toward the counterweight and the tongue at the pivot leans off LEVEL; at $250K it levels.";
const svgAt = (u) => {
  const m = pieces(u);
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: LABEL_TEXT,
    body: [
      base(),
      trigBack(),
      column(),
      `<g data-part="beam">${m.beam}</g>`,
      `<g data-part="poise" class="sy-poise">${m.poise}</g>`,
      trigFront(),
      `<g data-part="hang" transform="${m.hang}">${weight()}</g>`,
      fan(),
      `<g data-part="tongue">${m.tongue}</g>`,
    ],
  });
};
const svg = svgAt(M.KEY);

const geomSource = readFileSync(join(HERE, "geom.mjs"), "utf8").replace(/^import .*$/m, "").replace(/^export /gm, "");
const live = `
const K = { iso, pathOf, cameraOf, solidSvg, lineSvg, faceTextSvg };
${geomSource}
const P = ${JSON.stringify(P)};
const STATES = ${JSON.stringify(M.STATES)}, LAST = ${M.LAST};
const RAD = Math.PI / 180;
const spendAt = ${M.spendAt.toString().replace(/^function spendAt/, "function")};
const tiltOf = ${M.tiltOf.toString().replace(/^function tiltOf/, "function")};
const compact = ${M.compact.toString()};
const full = ${M.full.toString()};
const shareOf = ${M.shareOf.toString()};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const beam = part("beam"), poise = part("poise"), hang = part("hang"), tongue = part("tongue");
const readout = document.querySelector("[data-readout]");
const board = { pct: document.querySelector('[data-board="pct"]'), spend: document.querySelector('[data-board="spend"]'), share: document.querySelector('[data-board="share"]') };
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let u = ${M.KEY}, target = u, drawn = -1, frame = 0, last = 0, clock = 0, touring = true, visible = false, idle = 0, held = false;
const TOUR = [0, 1, 2, 3];
const tourAt = (t) => TOUR[Math.floor(t / 2.8) % TOUR.length];
function draw() {
  if (Math.abs(u - drawn) < 1e-4) return;
  drawn = u;
  const spend = spendAt(u), theta = tiltOf(spend) * RAD;
  beam.innerHTML = syBeamSvg(theta, P);
  poise.innerHTML = syPoiseSvg(theta, spend, P);
  hang.setAttribute("transform", translateAlong(P, syHookOffset(theta)));
  tongue.innerHTML = syTongueSvg(theta, P);
  const near = STATES[Math.round(u)];
  const exact = Math.abs(u - Math.round(u)) < 0.02;
  const value = exact ? near.spend : spend;
  const text = near.label + " · " + compact(value) + "/yr";
  if (readout.textContent !== text) readout.textContent = text;
  board.pct.textContent = near.name;
  board.spend.textContent = full(value);
  board.share.textContent = exact ? near.share : shareOf(value);
  stage.setAttribute("aria-valuenow", String(Math.round(u)));
  stage.setAttribute("aria-valuetext", near.label + ": " + full(value) + " a year per employee, " + shareOf(value) + " of a $500,000 salary");
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = reduce.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  u = calm ? target : u + (target - u) * (1 - Math.exp(-dt / 0.5));
  if (Math.abs(target - u) < 0.0005) u = target;
  draw();
  frame = visible && (touring || u !== target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false; target = clamp(next, 0, LAST); clearTimeout(idle);
  if (!held) idle = setTimeout(() => { touring = !reduce.matches && !held; clock = 0; run(); }, 4200);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (reduce.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(clamp(((event.clientX - box.left) / box.width - 0.15) / 0.7, 0, 1) * LAST);
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
drawn = u; // the static markup already shows the key state
window.figureApi = {
  states: STATES.map((s) => s.label),
  set(i) { held = true; touring = false; clearTimeout(idle); target = clamp(i, 0, LAST); run(); },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const key = M.STATES[M.KEY];
const body = k.plateHtml({
  fig: "Fig 3",
  title: "The spend steelyard",
  hint: "Move across to slide the poise",
  readout: `${key.label} · ${M.compact(key.spend)}/yr`,
  keys: [
    { mark: "lit", label: "Poise: AI spend per employee a year, on a log beam, one major tick per ×10" },
    { mark: "raised", label: "Counterweight: Huang's bar, $250K a year, half a $500K salary" },
    { mark: "edge", label: "Tongue: reads LEVEL only when the spend meets the bar" },
  ],
  caption:
    "Ramp's AI Index for June 2026, across more than 70,000 US businesses, puts the median business at $11.38 a month per employee on AI: $137 a year. The 90th percentile spends $611 a month ($7,332 a year) and the top 1% $7,449 a month ($89,388 a year), growing about 14% month over month. Jensen Huang's bar is half a salary: “if that $500,000 engineer did not consume at least $250,000 worth of tokens, I'm going to be deeply alarmed.” On the log beam the median sits more than three powers of ten short of it. Monthly figures annualized; the beam's tilt is illustrative of the gap, not a physical balance. Sources: Ramp June 2026 AI Index (as reported); Huang on the record (Tom's Hardware).",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Spend steelyard: arrow keys move the poise from the median business to Jensen Huang's bar" aria-valuemin="0" aria-valuemax="${M.LAST}" aria-valuenow="${M.KEY}">${svg}</div>`,
});

const BOARD = `<div class="board sy-board" aria-live="polite">
  <div class="cell"><span class="lab">Percentile</span><span class="num" data-board="pct">${key.name}</span></div>
  <div class="cell"><span class="lab">Spend / year</span><span class="num" data-board="spend">${M.full(key.spend)}</span></div>
  <div class="cell bill"><span class="lab">Share of $500K salary</span><span class="num" data-board="share">${key.share}</span></div>
  <div class="note"><span>Per employee, Ramp AI Index, June 2026, annualized. Huang's bar: $250,000 of tokens for a $500,000 engineer.</span></div>
</div>`;
const OWN_CSS = `
.sy-board{grid-template-columns:repeat(3,minmax(0,1fr))}
.sy-poise .iso-solid>.iso-fill{fill:#3a3a37}
.sy-poise .iso-solid>.iso-top{fill:#5a5a55}
.sy-poise .iso-solid>.iso-shade[data-shade="0"]{fill:#1c1c1a}
.sy-poise .iso-solid>.iso-shade[data-shade="1"]{fill:#262624}
.sy-poise .iso-solid>.iso-shade[data-shade="2"]{fill:#30302d}
.sy-poise .iso-solid>.iso-shade[data-shade="3"]{fill:#3a3a37}
.sy-poise .iso-solid>.iso-edge{stroke:#000}
.sy-poise .iso-solid>.iso-crease,.sy-poise .iso-solid>.iso-bevel{stroke:#8a8a84}
@media (max-width:700px){.sy-board{grid-template-columns:1fr}}
`;
const figure = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figure === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "The spend steelyard", theme: "light", body: figure, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${OWN_CSS}</style>`);
// static snapshots carry the poise's ink too (they have no page CSS around them)
const snap = (s) => s.replace(/^(<svg[^>]*>)/, `$1<style>${OWN_CSS.replace(/@media[^}]*}}/, "")}</style>`);
writeSnapshot(HERE, "scale", snap(svg));
M.STATES.forEach((_, i) => writeSnapshot(HERE, `scale-${i + 1}`, snap(svgAt(i))));
writeFileSync(join(HERE, "scale.html"), page);
writeFileSync(join(HERE, "scale.fragment.html"), figure);
console.log("wrote scale.html", (page.length / 1024).toFixed(0) + " KB", "scale", P.scale.toFixed(3), "min face text", (3.6 * 1.4802 / P.scale).toFixed(2));
