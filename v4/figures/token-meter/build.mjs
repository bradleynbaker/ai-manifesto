// F2 · The token meter — an Anatomy figure for the v4 talk.
// A utility meter on a calibration bench. The needle reads tokens a month on a log dial (one major tick per ×10);
// the tariff carriage on the right reads the frontier price on a log ruler with the same length per ×10.
// Turn the calendar knob: the needle sweeps six decades while the tariff moves barely one.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../_anatomy/kit/iso-kit.mjs";
import { kitScript } from "../_anatomy/inline-kit.mjs";
import { PAPER_CSS } from "../_anatomy/paper.mjs";
import { STAGE_CSS } from "../_anatomy/stage.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 400;

// ---------- world plan (units ≈ px of the real thing; x, y on the floor, z up) ----------
const PLATE = { x: -164, y: -78, w: 332, d: 150, r: 9 };
const PLATE_H = 12;
const FOOT_H = 5;

const C = [-82, -4];                       // meter centre
const HOUSING = { x: -146, y: -66, w: 128, d: 124, r: 14 };
const HOUSING_H = 18;
const BEZEL_R = 52, BEZEL_Z = HOUSING_H, BEZEL_H = 7;
const FACE_R = 46, FACE_Z = BEZEL_Z + BEZEL_H, FACE_H = 1.6;
const FT = FACE_Z + FACE_H;                // dial face top
const ARC_R = 36;                          // scale arc: ticks run inward, numerals sit outside it
const NEEDLE_R = ARC_R - 5; // the tip rides the inner scale arc, clear of the numerals
const A0 = (-135 * Math.PI) / 180, SPAN = (270 * Math.PI) / 180, DECADES = 7, LOG0 = 5;
const angleOf = (tokens) => A0 + (SPAN * (Math.log10(tokens) - LOG0)) / DECADES;
const PER_DECADE = (SPAN * ARC_R) / DECADES; // ≈ 24.2 units of arc per ×10

const WINDOW = { x: C[0] - 13, y: C[1] + 29, w: 26, d: 7, r: 3.5 };
const LUG_FRONT = { x: C[0] - 14, y: HOUSING.y + HOUSING.d, w: 28, d: 13, r: 4 };
const LUG_BACK = { x: C[0] - 14, y: PLATE.y + 2, w: 28, d: HOUSING.y - PLATE.y - 2, r: 3 };
const TAB = { x: C[0] - 3, y: C[1] + BEZEL_R - 1, w: 6, d: 5, r: 1 };

const RAIL_FROM = 14, RAIL_TO = 156;
const RAILS = [-30, -6];
const STRIP = { x: RAIL_FROM, y: 8, w: RAIL_TO - RAIL_FROM, d: 14, r: 1 };
const PX0 = 36;                            // x of $1,000 / M on the tariff ruler
const priceX = (price) => PX0 + (3 - Math.log10(price)) * PER_DECADE;
const CARRIAGE = { x: -13, y: -36, w: 26, d: 42, r: 3 };
const CARRIAGE_Z = 3, CARRIAGE_H = 5, CARRIAGE_TOP = CARRIAGE_Z + CARRIAGE_H;
const TAG = { x: -9, y: -27, w: 18, d: 20, r: 2 };
const TAG_H = 4;

const KNOB = [124, 46];
// the sweep runs round the back (left → right) so the printed years sit in the open plate, not under the fin
const KNOB_A0 = (-90 * Math.PI) / 180, KNOB_SPAN = (180 * Math.PI) / 180;
const knobAngle = (u) => KNOB_A0 + (KNOB_SPAN * u) / M.LAST;
const BASE_R = 24, BASE_H = 1.2, KNOB_R = 8.5, KNOB_H = 6, CAP_R = 6.2, CAP_H = 1.2;
const KNOB_TOP = BASE_H + KNOB_H + CAP_H;

const LABEL = { x: -154, y: 54, w: 52, d: 12, r: 1.5 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [C[0], C[1] - BEZEL_R, FT], [C[0] - BEZEL_R, C[1], FT], [KNOB[0], KNOB[1], KNOB_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 38 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const polar = ([x, y], angle, r) => [x + Math.sin(angle) * r, y - Math.cos(angle) * r];
const tick = (centre, angle, r0, r1, z) => k.lineOnTop(polar(centre, angle, r0), polar(centre, angle, r1), z, P);
const arcPoints = (centre, r, a0, a1, steps) => Array.from({ length: steps + 1 }, (_, i) => polar(centre, a0 + ((a1 - a0) * i) / steps, r));

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
  [[34, 3.6], [26, 6], [30, 8.4]].forEach(([len, dy]) => out.push(L(k.lineOnTop([LABEL.x + 4, LABEL.y + dy], [LABEL.x + 4 + len, LABEL.y + dy], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([LABEL.x + LABEL.w - 3.4, LABEL.y + 3.4, 0.8]), at([LABEL.x + LABEL.w - 3.4, LABEL.y + LABEL.d - 3.4, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ---------- the meter ----------
function meterBack() {
  const out = [];
  out.push(S(k.slabOf(LUG_BACK, 0, 5, P, 3, 0.5), { tone: "mid" }));
  const s = [C[0], LUG_BACK.y + LUG_BACK.d / 2];
  out.push(L(k.ring(s[0], s[1], 2.4, 5, P, 16), { tone: "lo" }), D([at([s[0], s[1], 5])], { size: 0.5 }));
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(HOUSING, 4), 0, 0.1, P)}" style="filter:blur(4px)"/>`);
  const seam = k.sideSeam(HOUSING, 6, P, 8);
  out.push(S(k.slabOf(HOUSING, 0, HOUSING_H, P, 8, 1.2), { tone: "mid", inner: L(seam, { tone: "faint" }) }));
  // four cover screws on the housing top, outside the bezel
  const screws = k.corners(HOUSING, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, HOUSING_H, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, HOUSING_H])), { size: 0.45 }));
  return out.join("");
}

function meterFace() {
  const out = [];
  // bezel ring and the raised dial plate
  out.push(S(k.cylinder(C[0], C[1], BEZEL_R, BEZEL_Z, BEZEL_H, P, 72, 0.8), { tone: "mid", inner: L(k.sideArc(C[0], C[1], BEZEL_R, BEZEL_Z + 3.5, P, 48), { tone: "faint" }) }));
  out.push(L(k.ring(C[0], C[1], BEZEL_R - 2.6, FACE_Z, P, 72), { tone: "lo" }));
  out.push(S(k.cylinder(C[0], C[1], FACE_R, FACE_Z, FACE_H, P, 72, 0.6), { tone: "hi", crease: "lo" }));
  // the log scale: an arc, one major tick per ×10, minor ticks at 2–9
  out.push(L(k.onTop(arcPoints(C, ARC_R, A0, A0 + SPAN, 90), FT, P), { tone: "lo" }));
  out.push(L(k.onTop(arcPoints(C, ARC_R - 5, A0, A0 + SPAN, 90), FT, P), { tone: "faint" }));
  const minor = [], major = [];
  for (let d = LOG0; d <= LOG0 + DECADES; d++) {
    major.push(tick(C, angleOf(10 ** d), ARC_R, ARC_R - 5, FT));
    if (d < LOG0 + DECADES) for (let m = 2; m <= 9; m++) minor.push(tick(C, angleOf(m * 10 ** d), ARC_R, ARC_R - 2.6, FT));
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(major.slice(1).join(""), { tone: "mid" }), L(major[0], { tone: "hi" }));
  // printed decade numerals: the meter's own scale, sized to read from the back of a room
  const DECADE_NAMES = ["100K", "1M", "10M", "100M", "1B", "10B", "100B", "1T"];
  DECADE_NAMES.forEach((name, i) => {
    const [x, y] = polar(C, angleOf(10 ** (LOG0 + i)), ARC_R + 5);
    out.push(k.faceTextSvg(k.topMatrix([x, y + 1.6], FT, P, "x"), name, { size: 4.6, tone: i === 0 ? "hi" : "mid", anchor: "middle" }));
  });
  // the team's month: a small wedge outside the arc
  const team = angleOf(M.TEAM.tokens);
  out.push(`<path class="iso-line" data-tone="hi" style="fill:var(--anatomy-hi)" d="${k.onTop([polar(C, team, ARC_R), polar(C, team - 0.035, ARC_R + 3.4), polar(C, team + 0.035, ARC_R + 3.4)], FT, P, true)}"/>`);
  // the two screws that hold the dial plate, in the gap below the scale
  const plateScrews = [Math.PI * 0.86, Math.PI * 1.14].map((a) => polar(C, a, 30));
  out.push(L(plateScrews.map(([x, y]) => k.ring(x, y, 1.6, FT, P, 14)).join(""), { tone: "lo" }), D(plateScrews.map(([x, y]) => at([x, y, FT])), { size: 0.4 }));
  // the engraved name plate of the register
  out.push(k.faceTextSvg(k.topMatrix([C[0], C[1] + 13], FT, P, "x"), "TOKENS / MONTH", { size: 3.2, tone: "lo", anchor: "middle" }));
  // the rotor window: the disc's rim marks pass under it
  out.push(`<clipPath id="tm-window"><path d="${k.planOutline(WINDOW, FT, P, 4)}"/></clipPath>`);
  out.push(`<path class="iso-fill" style="fill:var(--anatomy-shade-1)" d="${k.planOutline(WINDOW, FT, P, 4)}"/>`);
  out.push(`<g clip-path="url(#tm-window)"><path data-part="rotor" class="iso-line" data-tone="mid" d="${rotorAt(0)}"/></g>`);
  out.push(L(k.planOutline(WINDOW, FT, P, 4), { tone: "mid" }));
  return out.join("");
}

function rotorAt(phase) {
  const marks = [];
  const pitch = 4.2;
  const shift = ((phase % pitch) + pitch) % pitch;
  for (let x = WINDOW.x - pitch + shift; x <= WINDOW.x + WINDOW.w + pitch; x += pitch) marks.push(k.lineOnTop([x, WINDOW.y - 1], [x, WINDOW.y + WINDOW.d + 1], FT, P));
  return marks.join("");
}

function meterSeal() {
  const out = [];
  out.push(S(k.slabOf(LUG_FRONT, 0, 5, P, 3, 0.5), { tone: "mid" }));
  const s = [C[0], LUG_FRONT.y + 8];
  out.push(L(k.ring(s[0], s[1], 2.4, 5, P, 16), { tone: "lo" }), D([at([s[0], s[1], 5])], { size: 0.5 }));
  out.push(S(k.slabOf(TAB, BEZEL_Z, 5, P, 2, 0.3), { tone: "mid" }));
  const from = at([C[0], TAB.y + TAB.d, BEZEL_Z + 3]);
  const bend = at([C[0], HOUSING.y + HOUSING.d + 2, HOUSING_H + 1.4]);
  const to = at([s[0], s[1], 5]);
  out.push(k.wireSvg(from, to, { via: [bend], tone: "lo", size: 0.7 }));
  out.push(D([bend], { size: 1.5, tone: "mid" }));
  return out.join("");
}

const needleAt = (tokens) => {
  const a = angleOf(tokens);
  return k.lineOnTop(polar(C, a + Math.PI, 6), polar(C, a, NEEDLE_R), FT + 0.3, P);
};

function hub() {
  return S(k.cylinder(C[0], C[1], 2.4, FT, 1.4, P, 20), { tone: "hi" }) + D([at([C[0], C[1], FT + 1.4])], { size: 0.45, tone: "mid" });
}

// ---------- the tariff ----------
function tariffBack() {
  const out = [];
  const stop = (x) => {
    out.push(S(k.slabOf({ x, y: -35, w: 6, d: 34, r: 1.2 }, 0, 8, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 3, -30, 8]), at([x + 3, -6, 8])], { size: 0.45 }));
  };
  stop(RAIL_FROM - 6);
  // the ruler: same length per ×10 as the dial's arc
  out.push(S(k.slabOf(STRIP, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const minor = [], major = [];
  for (let d = 3; d >= -1; d--) {
    const p = 10 ** d;
    major.push(k.lineOnTop([priceX(p), STRIP.y], [priceX(p), STRIP.y + 4], 0.6, P));
    if (d > -1) for (let m = 2; m <= 9; m++) minor.push(k.lineOnTop([priceX((m * p) / 10), STRIP.y], [priceX((m * p) / 10), STRIP.y + 2.4], 0.6, P));
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  [["$1000", 3], ["$100", 2], ["$10", 1], ["$1", 0], ["$0.10", -1]].forEach(([name, d]) =>
    out.push(k.faceTextSvg(k.topMatrix([priceX(10 ** d), STRIP.y + 9.6], 0.6, P, "x"), name, { size: 4.2, tone: "mid", anchor: "middle" })));
  out.push(D([at([STRIP.x + 2.4, STRIP.y + STRIP.d - 2.4, 0.6]), at([STRIP.x + STRIP.w - 2.4, STRIP.y + STRIP.d - 2.4, 0.6])], { size: 0.45 }));
  for (const y of RAILS) {
    out.push(S(k.slabOf({ x: RAIL_FROM, y, w: RAIL_TO - RAIL_FROM, d: 5, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([RAIL_FROM + 6, RAIL_TO - 6].map((x) => at([x, y + 2.5, 3])), { size: 0.4 }));
  }
  return out.join("");
}

function carriage() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CARRIAGE, 3), CARRIAGE_Z, 0.1, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(CARRIAGE, CARRIAGE_Z, CARRIAGE_H, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(CARRIAGE, CARRIAGE_Z + 2, P, 4), { tone: "faint" }) }));
  // bushings over each rail
  for (const y of RAILS) for (const x of [-12, 6]) {
    out.push(S(k.slabOf({ x, y: y - 1.5, w: 6, d: 8, r: 1 }, CARRIAGE_TOP, 2, P, 2, 0.3), { tone: "mid" }));
    out.push(D([at([x + 3, y + 2.5, CARRIAGE_TOP + 2])], { size: 0.4 }));
  }
  // the rate card in its holder
  out.push(S(k.slabOf(TAG, CARRIAGE_TOP, TAG_H, P, 3, 0.5), { tone: "hi", crease: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(TAG, 1.6), CARRIAGE_TOP + TAG_H, P, 3), { tone: "faint" }));
  [[12, 5], [9, 8.5], [11, 12], [7, 15.5]].forEach(([len, dy]) => out.push(L(k.lineOnTop([TAG.x + 3.4, TAG.y + dy], [TAG.x + 3.4 + len, TAG.y + dy], CARRIAGE_TOP + TAG_H, P), { tone: "lo", free: true })));
  // index pointer reaching over the ruler
  const front = CARRIAGE.y + CARRIAGE.d;
  out.push(S(k.slabOf({ x: -2.4, y: front, w: 4.8, d: 1.6, r: 0.4 }, 1.4, CARRIAGE_TOP - 1.4, P, 2, 0.3), { tone: "mid" }));
  out.push(D([at([0, front + 1.6, CARRIAGE_TOP - 1.6])], { size: 0.4 }));
  out.push(S(k.extrude([[-1.4, front + 1.6], [1.4, front + 1.6], [1.4, STRIP.y + 2.6], [0, STRIP.y + 5], [-1.4, STRIP.y + 2.6]], 1.4, 0.8, P), { tone: "hi", crease: "lo" }));
  // a knurled lock screw on the front face
  out.push(S(k.slabOf({ x: CARRIAGE.x + CARRIAGE.w - 1, y: -20, w: 3, d: 4, r: 0.8 }, CARRIAGE_Z + 1, 3, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(CARRIAGE.x + CARRIAGE.w + 4, -18, 2.6, CARRIAGE_Z, 5, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(CARRIAGE.x + CARRIAGE.w + 4, -18, 2.6, CARRIAGE_Z, CARRIAGE_Z + 5, 18, P), { tone: "lo" }));
  return out.join("");
}

function tariffFront() {
  const out = [];
  out.push(S(k.slabOf({ x: RAIL_TO, y: -35, w: 6, d: 34, r: 1.2 }, 0, 8, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([RAIL_TO + 3, -30, 8]), at([RAIL_TO + 3, -6, 8])], { size: 0.45 }));
  return out.join("");
}

// ---------- the calendar knob ----------
function knobBase() {
  const out = [];
  out.push(S(k.cylinder(KNOB[0], KNOB[1], BASE_R, 0, BASE_H, P, 56, 0.4), { tone: "mid" }));
  out.push(L(k.onTop(arcPoints(KNOB, BASE_R - 2, knobAngle(0), knobAngle(M.LAST), 48), BASE_H, P), { tone: "lo" }));
  out.push(L(k.onTop(arcPoints(KNOB, BASE_R - 6.2, knobAngle(0), knobAngle(7), 40), BASE_H, P), { tone: "faint" }));
  const ticks = M.STOPS.map((_, i) => tick(KNOB, knobAngle(i), BASE_R - 2, BASE_R - (i === 0 || i === 7 ? 6.2 : 4.4), BASE_H));
  out.push(L(ticks.filter((_, i) => i !== 0 && i !== 7 && i !== M.LAST).join(""), { tone: "lo" }), L(ticks[0] + ticks[7], { tone: "mid" }), L(ticks[M.LAST], { tone: "hi" }));
  [[0, "2019"], [7, "2026"], [M.LAST, "TEAM"]].forEach(([i, name]) => {
    const a = knobAngle(i), [x, y] = polar(KNOB, a, BASE_R + 3);
    const anchor = Math.sin(a) > 0.3 ? "start" : Math.sin(a) < -0.3 ? "end" : "middle";
    out.push(k.faceTextSvg(k.topMatrix([x, y + 1.6], 0, P, "x"), name, { size: 4.2, tone: i === M.LAST ? "hi" : "mid", anchor }));
  });
  out.push(S(k.cylinder(KNOB[0], KNOB[1], KNOB_R, BASE_H, KNOB_H, P, 40), { tone: "mid" }));
  out.push(L(k.knurl(KNOB[0], KNOB[1], KNOB_R, BASE_H + 0.6, BASE_H + KNOB_H - 0.6, 40, P), { tone: "lo" }));
  out.push(L(k.sideArc(KNOB[0], KNOB[1], KNOB_R, BASE_H + 0.6, P, 24) + k.sideArc(KNOB[0], KNOB[1], KNOB_R, BASE_H + KNOB_H - 0.6, P, 24), { tone: "faint" }));
  out.push(S(k.cylinder(KNOB[0], KNOB[1], CAP_R, BASE_H + KNOB_H, CAP_H, P, 32, 0.4), { tone: "hi", crease: "lo" }));
  return out.join("");
}

function finRing(angle) {
  const half = 1.1, r0 = 1.4, r1 = BASE_R - 4.6;
  const s = Math.sin(angle), c = Math.cos(angle);
  const pt = (r, side) => [KNOB[0] + s * r + c * side, KNOB[1] - c * r + s * side];
  return [pt(r0, -half), pt(r1, -half), pt(r1 + half, 0), pt(r1, half), pt(r0, half)];
}
const finAt = (u) => S(k.extrude(finRing(knobAngle(u)), BASE_H + KNOB_H + CAP_H, 1.2, P), { tone: "hi", crease: "lo" });

// ---------- assemble ----------
const START = M.at(M.LAST - 1); // 2026
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A utility meter and a tariff carriage on a calibration bench, with a calendar knob. The meter's needle reads tokens a month on a log dial, one major tick for every ten times more; the carriage's pointer reads the frontier price per million tokens on a log ruler with the same length for every ten times. Turning the knob from 2019 to 2026 swings the needle through six decades while the tariff moves by barely one.",
  body: [
    bench(),
    meterBack(),
    meterFace(),
    meterSeal(),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" style="stroke-width:2" d="${needleAt(START.tokens)}"/>`,
    hub(),
    tariffBack(),
    `<g data-part="carriage" transform="${k.translateAlong(P, [priceX(START.price), 0, 0])}">${carriage()}</g>`,
    tariffFront(),
    knobBase(),
    `<g data-part="fin">${finAt(M.LAST - 1)}</g>`,
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)}, KNOB = ${JSON.stringify(KNOB)};
const STOPS = ${JSON.stringify(M.STOPS)}, LAST = ${M.LAST};
const A0 = ${A0}, SPAN = ${SPAN}, DECADES = ${DECADES}, LOG0 = ${LOG0}, NEEDLE_R = ${NEEDLE_R}, FT = ${FT};
const PX0 = ${PX0}, PER_DECADE = ${PER_DECADE}, BASE_R = ${BASE_R}, BASE_H = ${BASE_H}, KNOB_H = ${KNOB_H}, CAP_H = ${CAP_H};
const KNOB_A0 = ${KNOB_A0}, KNOB_SPAN = ${KNOB_SPAN};
const WINDOW = ${JSON.stringify(WINDOW)};
const TEAM = ${JSON.stringify(M.TEAM)};
const lerp = (a, b, t) => a + (b - a) * t;
const logLerp = (a, b, t) => Math.pow(10, lerp(Math.log10(a), Math.log10(b), t));
const model = ${M.at.toString().replace(/^function at/, "function")};
const money = ${M.money.toString()};
const count = ${M.count.toString()};
const angleOf = (tokens) => A0 + (SPAN * (Math.log10(tokens) - LOG0)) / DECADES;
const priceX = (price) => PX0 + (3 - Math.log10(price)) * PER_DECADE;
const knobAngle = (u) => KNOB_A0 + (KNOB_SPAN * u) / LAST;
const polar = ([x, y], angle, r) => [x + Math.sin(angle) * r, y - Math.cos(angle) * r];
const needleAt = (tokens) => { const a = angleOf(tokens); return lineOnTop(polar(C, a + Math.PI, 6), polar(C, a, NEEDLE_R), FT + 0.3, P); };
const finRing = ${finRing.toString()};
const rotorAt = ${rotorAt.toString().replaceAll("k.", "")};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const needle = svg.querySelector('[data-part="needle"]');
const carriage = svg.querySelector('[data-part="carriage"]');
const fin = svg.querySelector('[data-part="fin"]');
const rotor = svg.querySelector('[data-part="rotor"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let custom = null;
let u = LAST - 1, target = u, phase = 0, frame = 0, last = 0, clock = 0, touring = true, visible = false, idle = 0;
const TOUR = [0, 1, 2, 3, 4, 5, 6, 7, 7, 8, 8];
const tourAt = (t) => TOUR[Math.floor(t / 2.2) % TOUR.length];
const board = {
  year: document.querySelector('[data-board="year"]'),
  tokens: document.querySelector('[data-board="tokens"]'),
  price: document.querySelector('[data-board="price"]'),
  bill: document.querySelector('[data-board="bill"]'),
  reset: document.querySelector('[data-board="reset"]'),
  note: document.querySelector('[data-board="note"]'),
};
const parseTokens = (text) => {
  const t = String(text).trim().replace(/[,_\\s]/g, "").toUpperCase().replace(/TOKENS?$/, "");
  const m = t.match(/^(\\d+(?:\\.\\d+)?(?:E[+]?\\d+)?)([KMBT])?$/);
  if (!m) return null;
  const v = parseFloat(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[m[2]] || 1);
  return v >= 1 && v < 1e16 ? v : null;
};
const dialTokens = (v) => Math.min(1e12, Math.max(1e5, v));
function draw() {
  const m = model(u);
  const tokens = custom ?? m.tokens;
  const bill = (tokens / 1e6) * m.price;
  needle.setAttribute("d", needleAt(dialTokens(tokens)));
  carriage.setAttribute("transform", translateAlong(P, [priceX(m.price), 0, 0]));
  fin.innerHTML = solidSvg(extrude(finRing(knobAngle(u)), BASE_H + KNOB_H + CAP_H, 1.2, P), { tone: "hi", crease: "lo" });
  rotor.setAttribute("d", rotorAt(phase));
  const year = u > LAST - 0.5 ? "one team" : String(2019 + Math.round(Math.min(u, LAST - 1)));
  const priceYear = u > LAST - 0.5 ? "team rate" : year;
  const text = (custom ? "you · " : "") + year;
  if (readout.textContent !== text) readout.textContent = text;
  board.year.textContent = year.toUpperCase();
  if (document.activeElement !== board.tokens) board.tokens.value = count(tokens);
  board.price.textContent = "$" + m.price.toFixed(2);
  board.bill.textContent = money(bill);
  board.note.textContent = custom
    ? "Your " + count(tokens) + " tokens a month, priced at the " + priceYear + " frontier rate" + (tokens > 1e12 ? " (the dial stops at 1T)" : "") + ". Move across the meter to reprice it by year."
    : "Type your own tokens a month into the box — e.g. 250B, 40M or 3e9.";
  stage.setAttribute("aria-valuenow", String(Math.round(u)));
  stage.setAttribute("aria-valuetext", text + " · " + count(tokens) + " tokens × $" + m.price.toFixed(2) + "/M = " + money(bill) + "/mo");
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  u = calm ? target : u + (target - u) * (1 - Math.exp(-dt / 0.45));
  if (Math.abs(target - u) < 0.0005) u = target;
  // the rotor turns in proportion to the decade the meter is in: a log meter's disc speed
  const m = model(u);
  if (!calm) phase += dt * (Math.log10(m.tokens) - 4) * 2.4;
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = clamp(next, 0, LAST); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches && custom === null; clock = 0; run(); }, 4200); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
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
const apply = () => {
  const v = parseTokens(board.tokens.value);
  board.tokens.setAttribute("aria-invalid", v === null && board.tokens.value.trim() !== "" ? "true" : "false");
  if (v === null) return;
  custom = v; touring = false; clearTimeout(idle); board.reset.hidden = false; run(); draw();
};
board.tokens.addEventListener("input", apply);
board.tokens.addEventListener("change", apply);
board.tokens.addEventListener("keydown", (e) => { if (e.key === "Enter") { apply(); board.tokens.blur(); } });
board.tokens.addEventListener("focus", () => board.tokens.select());
board.tokens.addEventListener("blur", () => draw());
board.reset.addEventListener("click", () => { custom = null; board.reset.hidden = true; touring = !still.matches; clock = 0; run(); draw(); });
draw();
`;

const body = k.plateHtml({
  fig: "Fig 2",
  title: "The token meter",
  hint: "Move across to turn the calendar",
  readout: "2026",
  keys: [
    { mark: "lit", label: "Needle: tokens a month, one major tick per ×10" },
    { mark: "raised", label: "Tariff carriage: the frontier price per million tokens, same length per ×10" },
    { mark: "edge", label: "Wedge: one three-person team's month, 603B tokens" },
  ],
  caption:
    "From 2019 to 2026 the top customer's monthly tokens rose a millionfold, from 100K to 100B, while the frontier list price fell sixteenfold, from $60 to $3.85 per million. The bill rose about 64,000 times. The meter, not the rate card, is the problem. Volume from Altman on stage, June 2026; prices from the 2020 API launch and Artificial Analysis; log-interpolated between those points.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Token meter: arrow keys move the calendar from 2019 to 2026 and one team's month" aria-valuemin="0" aria-valuemax="${M.LAST}" aria-valuenow="${M.LAST - 1}">${svg}</div>`,
});

const BOARD = `<div class="board" aria-live="polite">
  <div class="cell"><span class="lab">Year</span><span class="num" data-board="year">2026</span></div>
  <label class="cell"><span class="lab">Your tokens / month</span><input class="num" data-board="tokens" inputmode="text" autocomplete="off" spellcheck="false" value="${M.count(START.tokens)}" aria-label="Tokens a month: type a number such as 250B, 40M or 3e9"></label>
  <span class="op" aria-hidden="true">×</span>
  <div class="cell"><span class="lab">Frontier $ / M tokens</span><span class="num" data-board="price">$${START.price.toFixed(2)}</span></div>
  <span class="op" aria-hidden="true">=</span>
  <div class="cell bill"><span class="lab">Bill / month</span><span class="num" data-board="bill">${M.money(START.bill)}</span></div>
  <div class="note"><span data-board="note">Type your own tokens a month into the box — e.g. 250B, 40M or 3e9.</span><button type="button" data-board="reset" hidden>Back to the timeline</button></div>
</div>`;
const figure = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figure === body) throw new Error("board not placed");
const page = k.pageHtml({ title: "The token meter", theme: "light", body: figure, script: kitScript() + live, width: 1120 }).replace("</style>", `${PAPER_CSS}${STAGE_CSS}</style>`);
writeFileSync(join(HERE, "token-meter.html"), page);
writeFileSync(join(HERE, "token-meter.fragment.html"), figure);
console.log("wrote token-meter.html", (page.length / 1024).toFixed(0) + " KB");
