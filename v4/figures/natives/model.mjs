// Fig 10 · One in a thousand — the one model the desks, the token stacks, the plaque, the board and the readout all read.
// Truth (from the spec; the manifesto's appendix):
//   • 1,000 people on a floor, 40 × 25 desks. Two of them are natives: people building their own agents on a harness.
//     The 1-in-1,000 rate is Brad's field observation (people, not organizations deploying vendor agents).
//   • The two natives burn more tokens than the other 998 combined.
//   • Three months later, red-pilling has spread by adjacency — demo by demo, team by team — to a cluster of
//     neighbouring desks (the spec asks for ~12–20). The spread here is illustrative and generated from a fixed seed.
// Stack heights are illustrative: the natives' stacks are drawn tall enough that the two of them alone tower over the floor.
export const COLS = 40;
export const ROWS = 25;
export const PEOPLE = COLS * ROWS; // 1,000
export const STATES = ["1,000 people", "today · 2 natives", "3 months · the spread"];
export const KEY = 2;
export const SEED = 0x5eed10;

// the two natives: far apart on the floor, each in its own team block
export const NATIVES = [
  [11, 7],
  [28, 17],
];
export const SPREAD = 14; // red-pilled neighbours after three months
export const NATIVE_H = 150; // world units: the natives' token stacks
export const BLOCK_W = 5; // desks per team block across (8 blocks)
export const BLOCK_D = 5; // desks per team block deep (5 blocks)

const blockOf = ([c, r]) => `${Math.floor(c / BLOCK_W)}:${Math.floor(r / BLOCK_D)}`;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Spread by adjacency: each round is one demo, given by a lit desk to an unlit desk next to it (8-neighbour).
// Demos go to the presenter's own team block three times as often as across an aisle, and the two clusters take turns.
export function spread(seed = SEED, count = SPREAD) {
  const rand = mulberry32(seed);
  const key = ([c, r]) => r * COLS + c;
  const lit = new Map(NATIVES.map((d, i) => [key(d), { desk: d, root: i, gen: 0 }]));
  const order = [];
  for (let round = 0; order.length < count; round++) {
    const root = round % NATIVES.length;
    const options = [];
    for (const { desk, root: from, gen } of lit.values()) {
      if (from !== root) continue;
      for (let dc = -1; dc <= 1; dc++)
        for (let dr = -1; dr <= 1; dr++) {
          const next = [desk[0] + dc, desk[1] + dr];
          if ((!dc && !dr) || next[0] < 0 || next[1] < 0 || next[0] >= COLS || next[1] >= ROWS || lit.has(key(next))) continue;
          options.push({ desk: next, gen: gen + 1, weight: blockOf(next) === blockOf(desk) ? 3 : 1 });
        }
    }
    let pick = rand() * options.reduce((s, o) => s + o.weight, 0);
    const chosen = options.find((o) => (pick -= o.weight) <= 0) ?? options[options.length - 1];
    const entry = { desk: chosen.desk, root, gen: chosen.gen, h: 0 };
    lit.set(key(chosen.desk), entry);
    order.push(entry);
  }
  // each red-pilled desk's stack: shorter the later it caught on, with a little seeded scatter (illustrative)
  order.forEach((e, j) => (e.h = Math.round(44 - j * 1.6 - (e.gen - 1) * 3 + rand() * 6)));
  return order;
}

export const SPREAD_DESKS = spread();

// u runs 0 → 2 through the three states; returns how far each stack has grown (0..1)
export function at(u) {
  const s = Math.max(0, Math.min(2, u));
  const native = Math.max(0, Math.min(1, s));
  const t = Math.max(0, s - 1);
  const n = SPREAD;
  const grow = Array.from({ length: n }, (_, j) => Math.max(0, Math.min(1, (t * (n + 3) - j) / 3)));
  const lit = (native > 0.5 ? NATIVES.length : 0) + grow.filter((g) => g > 0.5).length;
  return { u: s, native, grow, lit };
}

export const fmt = (v) => v.toLocaleString("en-US");
