// F3 · the moving parts of the spend steelyard, shared by the build (static snapshots) and the live page.
// The page inlines this file with its import line and `export`s stripped, after building `K` from the inlined kit.
// Every name here is prefixed or distinct so it never collides with the kit's own top-level names.
import * as K from "../_anatomy/kit/iso-kit.mjs";

// ---------- world plan (x along the beam, y across it, z up; the pivot is the origin of the beam) ----------
export const SY = {
  ZP: 92,                 // pivot height above the base top
  BEAM: { x0: -66, x1: 245, y: 4, top: 5, bottom: -15, chamfer: 1 },
  FACE_TOP: 4,            // top edge of the beam's front face (below the chamfer)
  X100: 28,               // x of $100 on the beam
  PER_DECADE: 50,         // one major tick per ×10
  HOOK: [-56, -5],        // x and local z of the counterweight's pin on the beam
  NUM_BASE: -12.4,        // baseline of the beam numerals (local z)
  NUM_SIZE: 6.2,
  TONGUE: 40,             // tongue length above the pivot
  FAN_Y: 9,               // front face of the front cheek / dial fan
};
export const syX = (spend) => SY.X100 + (Math.log10(spend) - 2) * SY.PER_DECADE;

// rotation of the beam about the pivot axis (world y through [0, 0, ZP]); positive theta lifts the long right arm
export function syRot(theta) {
  const c = Math.cos(theta), s = Math.sin(theta);
  return ([x, y, z]) => [x * c - z * s, y, SY.ZP + x * s + z * c];
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

function syHull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// a convex prism: `section` is a loop of [u, v] points, extruded from s0 to s1 along a
export function syPrism(section, o, u, v, a, s0, s1) {
  const n = section.length;
  const V = [];
  for (const s of [s0, s1]) for (const [pu, pv] of section) V.push(add(add(add(o, mul(u, pu)), mul(v, pv)), mul(a, s)));
  const F = [section.map((_, i) => i), section.map((_, i) => n + i)];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; F.push([i, j, n + j, n + i]); }
  return { V, F };
}
export const syRound = (r, steps = 16, phase = 0) => Array.from({ length: steps }, (_, i) => { const t = phase + (i / steps) * Math.PI * 2; return [r * Math.cos(t), r * Math.sin(t)]; });

// kit-compatible SolidPaths for any convex polyhedron after a world transform: visible faces shaded in the kit's four
// tones, the up-facing face as the top, hard edges between visible faces as creases, silhouette edges as the outline
export function sySolid({ V, F }, tf, P) {
  const W = V.map(tf);
  const S = W.map((p) => K.iso(p, P));
  const cam = K.cameraOf(P);
  const view = [cam.cosA * cam.cosE, cam.sinA * cam.cosE, cam.sinE];
  const centre = W.reduce((acc, p) => add(acc, mul(p, 1 / W.length)), [0, 0, 0]);
  const normals = F.map((face) => {
    let n = [0, 0, 0];
    face.forEach((i, k) => { const p = W[i], q = W[face[(k + 1) % face.length]]; n = add(n, [(p[1] - q[1]) * (p[2] + q[2]), (p[2] - q[2]) * (p[0] + q[0]), (p[0] - q[0]) * (p[1] + q[1])]); });
    const len = Math.hypot(...n) || 1;
    n = mul(n, 1 / len);
    const mid = face.reduce((acc, i) => add(acc, mul(W[i], 1 / face.length)), [0, 0, 0]);
    const out = (mid[0] - centre[0]) * n[0] + (mid[1] - centre[1]) * n[1] + (mid[2] - centre[2]) * n[2];
    return out < 0 ? mul(n, -1) : n;
  });
  const seen = normals.map((n) => n[0] * view[0] + n[1] * view[1] + n[2] * view[2] > 1e-6);
  const ring = (face) => K.pathOf(face.map((i) => S[i]), true);
  const tops = [], shades = [[], [], [], []];
  F.forEach((face, f) => {
    if (!seen[f]) return;
    const n = normals[f];
    if (n[2] > 0.8) { tops.push(ring(face)); return; }
    const h = Math.hypot(n[0], n[1]) || 1;
    let lit = ((n[0] / h) * -cam.sinA + (n[1] / h) * cam.cosA + 1) / 2;
    let shade = Math.min(3, Math.max(0, Math.floor(lit * 4)));
    if (n[2] > 0.3) shade = Math.min(3, shade + 1);
    shades[shade].push(ring(face));
  });
  const edges = new Map();
  F.forEach((face, f) => face.forEach((i, k) => {
    const j = face[(k + 1) % face.length];
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (!edges.has(key)) edges.set(key, { i, j, faces: [] });
    edges.get(key).faces.push(f);
  }));
  const outline = [], crease = [];
  for (const { i, j, faces } of edges.values()) {
    const [a, b] = faces;
    if (b === undefined) continue;
    const seg = K.pathOf([S[i], S[j]]);
    if (seen[a] !== seen[b]) outline.push(seg);
    else if (seen[a]) {
      const na = normals[a], nb = normals[b];
      if (na[0] * nb[0] + na[1] * nb[1] + na[2] * nb[2] < 0.94) crease.push(seg);
    }
  }
  return { fill: K.pathOf(syHull(S), true), outline: outline.join(""), crease: crease.join(""), top: tops.join(""), shades: shades.map((list) => list.join("")) };
}

// a text transform laying local (u, v-down) onto a plane through `o` spanned by world directions u and vDown
export function syFaceMatrix(o, u, vDown, P) {
  const O = K.iso(o, P), U = K.iso(add(o, u), P), Vv = K.iso(add(o, vDown), P);
  const t = (n) => Math.round(n * 1000) / 1000;
  return `matrix(${t(U[0] - O[0])} ${t(U[1] - O[1])} ${t(Vv[0] - O[0])} ${t(Vv[1] - O[1])} ${t(O[0])} ${t(O[1])})`;
}

const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
const ORIGIN = [0, 0, 0];

// ---------- the beam: bar, end ferrules, the log scale on its front face ----------
export function syBeamSvg(theta, P) {
  const B = SY.BEAM, tf = syRot(theta), out = [];
  const c = B.chamfer;
  const section = [[-B.y, B.bottom], [B.y, B.bottom], [B.y, B.top - c], [B.y - c, B.top], [-B.y + c, B.top], [-B.y, B.top - c]];
  out.push(K.solidSvg(sySolid(syPrism(section, ORIGIN, Y, Z, X, B.x0, B.x1), tf, P), { tone: "hi", crease: "lo" }));
  // ferrules: brass end caps that wrap each end
  const cap = [[-B.y - 0.7, B.bottom - 0.7], [B.y + 0.7, B.bottom - 0.7], [B.y + 0.7, B.top - c + 0.7], [B.y - c + 0.7, B.top + 0.7], [-B.y + c - 0.7, B.top + 0.7], [-B.y - 0.7, B.top - c + 0.7]];
  out.push(K.solidSvg(sySolid(syPrism(cap, ORIGIN, Y, Z, X, B.x0 - 0.6, B.x0 + 4), tf, P), { tone: "hi", crease: "lo" }));
  out.push(K.solidSvg(sySolid(syPrism(cap, ORIGIN, Y, Z, X, B.x1 - 4, B.x1 + 0.6), tf, P), { tone: "hi", crease: "lo" }));
  // the log scale: ticks hang from the front face's top edge
  const y = B.y + 0.02, top = SY.FACE_TOP;
  const tickAt = (x, len) => K.pathOf([K.iso(tf([x, y, top]), P), K.iso(tf([x, y, top - len]), P)]);
  const minor = [], major = [];
  for (let d = 2; d <= 6; d++) {
    major.push(tickAt(syX(10 ** d), 6.5));
    if (d < 6) for (let m = 2; m <= 9; m++) minor.push(tickAt(syX(m * 10 ** d), m === 5 ? 4.6 : 3.2));
  }
  // the scale's rule: an engraved line the full length of the face, ferrule to ferrule; major ticks run down to it
  const rule = top - 6.5;
  out.push(K.lineSvg(K.pathOf([K.iso(tf([B.x0 + 4, y, rule]), P), K.iso(tf([B.x1 - 4, y, rule]), P)]), { tone: "mid" }));
  out.push(K.lineSvg(minor.join(""), { tone: "lo" }), K.lineSvg(major.join(""), { tone: "hi" }));
  // Huang's bar: a long tick with a filled wedge at its foot, the same $250K the counterweight carries
  const bx = syX(250000);
  out.push(`<path class="iso-line" data-tone="hi" style="stroke-width:1.6" d="${tickAt(bx, 9.4)}"/>`);
  const wedge = [[bx, top - 9.4], [bx - 1.6, top - 11.6], [bx + 1.6, top - 11.6]].map(([x, z]) => K.iso(tf([x, y, z]), P));
  out.push(`<path class="iso-line" data-tone="hi" style="fill:var(--anatomy-hi)" d="${K.pathOf(wedge, true)}"/>`);
  // printed decade numerals, below the ticks and clear of the poise's reach
  const along = [Math.cos(theta), 0, Math.sin(theta)], down = [Math.sin(theta), 0, -Math.cos(theta)];
  ["$100", "$1K", "$10K", "$100K", "$1M"].forEach((name, i) => {
    out.push(K.faceTextSvg(syFaceMatrix(tf([syX(10 ** (i + 2)), y, SY.NUM_BASE]), along, down, P), name, { size: SY.NUM_SIZE, tone: "hi", anchor: "middle" }));
  });
  return out.join("");
}

// ---------- the poise: the one accent, riding the beam's top and reading through its index ----------
export function syPoiseSvg(theta, spend, P) {
  const tf = syRot(theta), x = syX(spend), out = [];
  const body = [[-6.4, 1], [6.4, 1], [6.4, 11.6], [5, 13], [-5, 13], [-6.4, 11.6]];
  out.push(K.solidSvg(sySolid(syPrism(body, [x, 0, 0], Y, Z, X, -8, 8), tf, P), { tone: "hi", lit: true }));
  // the index: a pointed plate on the poise's front face that reads the scale
  const index = [[-2.2, 4.2], [2.2, 4.2], [2.2, 0.6], [0, -1.6], [-2.2, 0.6]];
  out.push(K.solidSvg(sySolid(syPrism(index, [x, 0, 0], X, Z, Y, 6.4, 7.3), tf, P), { tone: "hi", lit: true }));
  // the knurled lock screw on top
  out.push(K.solidSvg(sySolid(syPrism(syRound(3.1, 12, Math.PI / 12), [x, 0, 0], X, Y, Z, 13, 17.4), tf, P), { tone: "hi", lit: true }));
  out.push(K.solidSvg(sySolid(syPrism(syRound(2, 10), [x, 0, 0], X, Y, Z, 17.4, 18.4), tf, P), { tone: "hi", lit: true }));
  return out.join("");
}

// where the counterweight's pin sits: the whole hanger translates by this (it hangs plumb, it does not turn)
export function syHookOffset(theta) {
  const [hx, hz] = SY.HOOK;
  const p = syRot(theta)([hx, 0, hz]);
  return [p[0] - hx, 0, p[2] - (SY.ZP + hz)];
}

// ---------- the tongue: fixed to the pivot pin, it reads LEVEL on the dial fan ----------
export function syTongueSvg(theta, P) {
  const tf = syRot(theta), y = SY.FAN_Y + 1.6, out = [];
  const pts = [[-1.8, -7], [1.8, -7], [0.45, SY.TONGUE], [-0.45, SY.TONGUE]].map(([x, z]) => K.iso(tf([x, y, z]), P));
  out.push(`<path class="iso-line" data-tone="hi" style="fill:var(--anatomy-hi);stroke-linejoin:round" d="${K.pathOf(pts, true)}"/>`);
  // the hub nut on the pin
  out.push(K.solidSvg(sySolid(syPrism(syRound(2.6, 8, Math.PI / 8), ORIGIN, Z, X, Y, y, y + 1.4), tf, P), { tone: "hi", crease: "lo" }));
  return out.join("");
}
