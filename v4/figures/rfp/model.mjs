// F9 · The Tuesday RFP — the one timeline every moving part, the readout and the scoreboard read.
// Source: the manifesto's "Tuesday RFP" (an illustrative workflow, not a measured one). An RFP that is due Friday
// arrives on a Tuesday. It splits into six pieces: pricing, technical, capabilities and logistics are answered inside
// the boundary by the team's own agents; partnering and risk need the outside world. Before those two leave, the
// RFP number, the deadline and the bid are stripped, logged and policy-checked, so the world sees only a capability
// search. Options come back in, and a human makes the call. The only numbers are counts: 6 pieces, 4 inside,
// 2 out, 3 labels stripped from each piece that leaves.

export const STATES = ["split", "gate", "return"];
export const READOUT = ["The split", "The gate", "The return"];
export const NOTES = [
  "Pricing, technical, capabilities, logistics — answered inside the boundary.",
  "Partnering and risk need the world. RFP number, deadline and bid are stripped, logged, policy-checked.",
  "The world sees a capability search. Only the boundary knew there was a bid. A human makes the call.",
];
export const KEY = 2; // "return": all three beats on the plate at once
export const T_OF = [1, 2, 3]; // timeline position of each state; 0 is the RFP sitting in the hopper
export const INSIDE = ["PRICING", "TECHNICAL", "CAPABILITIES", "LOGISTICS"];
export const OUTSIDE = ["PARTNERING", "RISK"];
export const STRIPPED = ["RFP #", "DEADLINE", "BID"];

// Every motion is a smoothstep over its own slice of the timeline, so the parts ease even when t moves linearly.
export function pose(t) {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (a, b) => {
    const u = clamp((t - a) / (b - a));
    return u * u * (3 - 2 * u);
  };
  return {
    t,
    sheaf: seg(0.04, 0.3), // the RFP settles into the hopper
    crank: t * Math.PI * 1.5,
    inside: [0, 1, 2, 3].map((i) => seg(0.16 + 0.09 * i, 0.6 + 0.09 * i)), // card i along its chute to its bin
    lamps: [0, 1, 2, 3].map((i) => seg(0.6 + 0.09 * i, 0.72 + 0.09 * i)), // the agent at bin i has answered
    gateIn: seg(0.28, 0.96), // the two outside pieces down their chutes, to wait under the stamping heads
    head: 1 - seg(1.06, 1.18) + seg(1.32, 1.46), // 1 = raised, 0 = down on the tabs
    held: t >= 1.19 ? 1 : 0,
    swap: seg(1.19, 1.23), // the stamp: PARTNERING / RISK become CAPABILITY SEARCH
    strike: seg(1.2, 1.32), // the stripped labels are struck through
    out: seg(1.5, 1.96), // through the gate
    options: seg(2.04, 2.22),
    tray: seg(2.26, 2.92), // the return tray rides in to the human desk
    decide: seg(2.88, 3.0),
  };
}

// Counts the scoreboard shows, read from the same pose as the parts.
export function counts(p) {
  const inside = p.lamps.filter((v) => v > 0.5).length;
  const out = p.out > 0.5 ? 2 : 0;
  return { inside, out, decides: p.decide > 0.5 ? "Human" : "—" };
}
