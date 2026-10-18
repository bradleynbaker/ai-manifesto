// Fig 4 · Could vs. does — the one model the loom, the readout and the scoreboard all read.
// Source: Anthropic, "Labor market impacts of AI," Massenkoff & McCrory, 5 March 2026.
//   computer & math occupations: LLMs could theoretically perform 94% of tasks; observed coverage is 33%
//   (both values are stated in the paper's text)
//   office & admin: could 90%
//   30% of workers have zero observed coverage
// One warp position stands for one percentage point of the occupation's tasks: 100 positions across the loom.
export const SOURCE = 'Anthropic, "Labor market impacts of AI," Massenkoff & McCrory, 5 March 2026';
export const POSITIONS = 100;
export const COULD = 94; // strung warp threads: theoretical exposure, %
export const DOES = 33; // woven width: observed coverage, %
export const GAP = COULD - DOES; // bare strung threads: 61 points
export const OFFICE_COULD = 90;
export const ZERO_COVERAGE = 30;

export const STATES = ["could", "does", "gap"];
export const LAST = STATES.length - 1;
export const KEY_STATE = 2; // "gap" proves the slide title

const clamp01 = (v) => Math.min(1, Math.max(0, v));
// u runs 0 → 2 through the states; each part reads its own share of it
export function at(u) {
  const s = Math.min(LAST, Math.max(0, u));
  return {
    u: s,
    cloth: clamp01(s), // woven length, 0 (nothing woven) → 1 (cloth up to the fell)
    ghost: 1 - clamp01(s * 1.6), // the dotted outline of what could be woven
    gap: clamp01(s - 1), // the 61 bare threads and their bracket
    w: [0, 1, 2].map((i) => clamp01(1 - Math.abs(s - i))), // how much of each state's printed bracket shows
  };
}

export const READOUTS = [
  `Computer & math · could ${COULD}%`,
  `Computer & math · does ${DOES}%`,
  `Computer & math · could ${COULD}% · does ${DOES}%`,
];
