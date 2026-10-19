// V5.1 · figure variants. A few machines print real model numbers or office names on the object, and those
// differ between the government (G) and commercial (C) talks. Each variant is the shared figure source with a
// handful of exact string swaps, built in a sibling folder (v4/figures/<slot>__<v>/) so the shared kit
// resolves, then line-checked. Every swap must match exactly once or the build stops.
//
// Numbers: Artificial Analysis Intelligence Index v4.3.2, model pages read 18 Oct 2026 (blended $/M at 7:2:1
// cache-hit:input:output; output speed on the first-party API):
//   Claude Opus 5.5 (max)        58 · $2.94 · 97.5 tok/s   released 22 Sep 2026; GovCloud 22 Sep 2026
//   MiMo-V2.6-Pro (Xiaomi, MIT)  46 · $0.18 · 48.0 tok/s   best open weights
//   Claude Opus 4.8 (max)        42 · $3.85 · 64.9 tok/s   released 28 May 2026; GovCloud 30 Jun 2026
//   Muse Spark Open (Meta)       39 · $0.78 · 130.7 tok/s  best US open weights (Muse Model License)
//   Nemotron 3.5 Super VL        26 · $0.14 · 388 tok/s    NVIDIA, OpenMDW-1.1, released 15 Oct 2026
//   Muse Wonder Full (closed)    56 · subscription only     Meta, 12 Oct 2026; the open Muse is its small sibling
import { cpSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export const MODELS = {
  frontier: { name: "Claude Opus 5.5", short: "Opus 5.5", index: 58, price: 2.94, tps: 97.5, tag: "frontier · metered" },
  open: { name: "MiMo-V2.6-Pro (Xiaomi)", short: "MiMo-V2.6-Pro", index: 46, price: 0.18, tps: 48, tag: "best open weights · MIT" },
  opus48: { name: "Claude Opus 4.8", short: "Opus 4.8", index: 42, price: 3.85, tps: 64.9, tag: "last spring's frontier" },
  usopen: { name: "Muse Spark Open (Meta)", short: "Muse Spark Open", index: 39, price: 0.78, tps: 130.7, tag: "best US open weights" },
  nemotron: { name: "Nemotron 3.5 Super VL (NVIDIA)", short: "Nemotron 3.5 Super", index: 26, price: 0.14, tps: 388, tag: "NVIDIA · OpenMDW licence" },
  // closed, no API price: Muse Wonder Full 56 (subscription only), Muse Wonder 52 ($4 / $20 per M), released 12 Oct 2026
  wonderFull: { name: "Muse Wonder Full (Meta, closed)", short: "Muse Wonder Full", index: 56 },
};

const F = MODELS.frontier;
const INSIDE = { G: { label: "US OPEN", ...MODELS.usopen }, C: { label: "OPEN", ...MODELS.open } };

const ladder = (v) => {
  const o = INSIDE[v], fr = F;
  const note = v === "G"
    ? "Behind the frontier on hard reasoning, but a quarter of the price, faster, and yours to run without a cap."
    : "Twelve points behind the frontier, at a sixteenth of the price, and yours to run without a cap.";
  const words = v === "G" ? "the best US open-weight model, Meta's Muse Spark Open" : "the best open-weight model, Xiaomi's MiMo-V2.6-Pro";
  return {
    "model.mjs": [
      ['export const OPEN = { name: "US OPEN", index: 38, price: 0.58, tps: 100 };', `export const OPEN = { name: "${o.label}", index: ${o.index}, price: ${o.price}, tps: ${Math.round(o.tps)} };`],
      ['export const FRONTIER = { name: "FRONTIER", index: 61, price: 3.85, tps: 47 };', `export const FRONTIER = { name: "FRONTIER", index: ${fr.index}, price: ${fr.price}, tps: ${Math.round(fr.tps)} };`],
    ],
    "build.mjs": [
      ['"US OPEN 38 · $0.58/M · 100 TOK/S · UNCAPPED"', `"${o.label} ${o.index} · $${o.price.toFixed(2)}/M · ${Math.round(o.tps)} TOK/S · UNCAPPED"`],
      ['"61 · $3.85/M"', `"${fr.index} · $${fr.price.toFixed(2)}/M"`],
      ['"47 TOK/S"', `"${Math.round(fr.tps)} TOK/S"`],
      ["The plinth reads US open 38, $0.58 per million tokens, 100 tokens a second, uncapped, against frontier 61, $3.85 per million, 47 tokens a second, metered.",
        `The plinth reads ${o.label.toLowerCase()} ${o.index}, $${o.price.toFixed(2)} per million tokens, ${Math.round(o.tps)} tokens a second, uncapped, against frontier ${fr.index}, $${fr.price.toFixed(2)} per million, ${Math.round(fr.tps)} tokens a second, metered.`],
      ["The comparison is Artificial Analysis's current page, Opus 5 against Nemotron 3 Ultra: frontier 61 on the intelligence index at $3.85 per million tokens and 47 tokens a second; US open 38 at $0.58 per million and 100 tokens a second. Smarter by a third, nearly seven times the price, half the speed.",
        `Numbers are Artificial Analysis Intelligence Index v4.3.2, October 2026: the frontier, Claude Opus 5.5, ${fr.index} at $${fr.price.toFixed(2)} per million tokens and ${Math.round(fr.tps)} tokens a second; inside the fence, ${words}, ${o.index} at $${o.price.toFixed(2)} per million and ${Math.round(o.tps)} tokens a second. ${note}`],
      ["<span>Smarter by a third. Nearly seven times the price. Half the speed.</span>", `<span>${note}</span>`],
    ],
  };
};

const spikes = (v) => {
  const o = INSIDE[v];
  const who = v === "G" ? "Muse Spark Open, the leading US open-weight model" : "MiMo-V2.6-Pro, the leading open-weight model";
  return {
    "model.mjs": [["export const INDEX = { open: 38, frontier: 61 };", `export const INDEX = { open: ${o.index}, frontier: ${F.index} };`]],
    "build.mjs": [
      ["tab(Z38, `US OPEN · ${M.INDEX.open}`, \"UNCAPPED\")", `tab(Z38, \`${o.label} · \${M.INDEX.open}\`, "UNCAPPED")`],
      ["Two glass planes stand over the map at index 38, the leading US open-weight model, and index 61, the metered frontier. Every routine column sits under the 38 plane.",
        `Two glass planes stand over the map at index ${o.index}, ${who}, and index ${F.index}, the metered frontier. Every routine column sits under the ${o.index} plane.`],
      ['{ mark: "flat", label: "Glass planes: index 38 (US open, uncapped) and 61 (frontier, metered)" }', `{ mark: "flat", label: "Glass planes: index ${o.index} (${o.label.toLowerCase()}, uncapped) and ${F.index} (frontier, metered)" }`],
      ["The two planes are real index scores from Artificial Analysis's current model comparison: Nemotron 3 Ultra, the leading US open-weight model, at 38, which runs on your own rungs uncapped; the Opus-class frontier at 61, metered.",
        `The two planes are real Artificial Analysis Intelligence Index v4.3.2 scores (October 2026): ${who}, at ${o.index}, which runs on your own rungs uncapped; the frontier, Claude Opus 5.5, at ${F.index}, metered.`],
      ["Heights illustrative; 38 and 61 are Artificial Analysis index scores.", `Heights illustrative; ${o.index} and ${F.index} are Artificial Analysis index scores.`],
    ],
  };
};

const tubes = (v) => (v !== "G" ? null : {
  "model.mjs": [
    ['card: ["A CAP COSTS MORE", "THAN CAPACITY"],', 'card: ["CAPACITY IS A", "FIXED OBLIGATION"],'],
    ['sentence: "A cap costs more than capacity.",', 'sentence: "Capacity is a fixed obligation. A meter is not.",'],
    ['note: "The budget detonation: a CFO can live with a big number, not one that detonates. Owned capacity is the predictable number.",',
      'note: "A meter needs a ceiling: no agency may obligate more than it has. Owned capacity is a fixed, plannable obligation; a per-token bill is not.",'],
    ['id: "CEO",', 'id: "AGENCY",'],
    ["operations to the CEO.", "operations to the agency head."],
  ],
  "build.mjs": [
    ["three offices, CFO, CIO and CEO, each one step higher.", "three offices, CFO, CIO and agency head, each one step higher."],
    ["CFO card: A cap costs more than capacity.", "CFO card: Capacity is a fixed obligation."],
    ["CEO card: Our asset or their training data.", "Agency head's card: Our asset or their training data."],
    ["pricing for the CFO (a cap costs more than capacity)", "pricing for the CFO (capacity is a fixed obligation; a meter needs a ceiling)"],
    ["operations for the CEO (the decision graph", "operations for the agency head (the decision graph"],
  ],
});


// The RFP, from the side of the people writing it (5.2): the audience drafts solicitations, so the four pieces that
// stay inside are the ones built from their own documents, the two that go out need market information, and the
// tabs sheared off at the gate are the solicitation number, the budget and the evaluation plan.
const rfp = (v) => ({
  "model.mjs": [
    ['export const INSIDE = ["PRICING", "TECHNICAL", "CAPABILITIES", "LOGISTICS"];', 'export const INSIDE = ["REQUIREMENTS", "EVALUATION", "SECURITY", "SCHEDULE"];'],
    ['export const OUTSIDE = ["PARTNERING", "RISK"];', 'export const OUTSIDE = ["MARKET", "PRICING"];'],
    ['export const STRIPPED = ["RFP #", "DEADLINE", "BID"];', `export const STRIPPED = ["${v === "G" ? "SOL #" : "RFP #"}", "BUDGET", "EVAL"];`],
    ['"Pricing, technical, capabilities, logistics — answered inside the boundary.",', '"Requirements, evaluation criteria, security and schedule are drafted inside, from your own documents.",'],
    ['"Partnering and risk need the world. RFP number, deadline and bid are stripped, logged, policy-checked.",', `"Market research and pricing need outside information. The ${v === "G" ? "solicitation" : "RFP"} number, budget and evaluation plan are removed, and the request is logged.",`],
    ['"The world sees a capability search. Only the boundary knew there was a bid. A human makes the call.",', '"The outside model sees a general capability question. The answers come back in, and a person makes the decisions.",'],
  ],
  "build.mjs": [
    ['fits("DUE FRI", TXT + 0.8, SHEAF.w - 3, "sheaf");', 'fits("DRAFT", TXT + 0.8, SHEAF.w - 3, "sheaf");'],
    ['top - 24, "DUE FRI", {', 'top - 24, "DRAFT", {'],
    ["An RFP due Friday sits in the hopper; the router cuts it into six cards. Pricing, technical, capabilities and logistics run down short chutes into bins beside four agent workstations inside the fence. Partnering and risk run to the gate, where two stamping heads shear off their red RFP number, deadline and bid tabs,",
      `An RFP being drafted sits in the hopper; the router cuts it into six cards. Requirements, evaluation, security and schedule run down short chutes into bins beside four agent workstations inside the fence. Market research and pricing run to the gate, where two stamping heads shear off their red ${v === "G" ? "solicitation number" : "RFP number"}, budget and evaluation-plan tabs,`],
    ['{ mark: "red", label: "Red tabs: RFP #, deadline, bid — sheared off at the gate and kept inside" }', `{ mark: "red", label: "Red tabs: ${v === "G" ? "solicitation number" : "RFP number"}, budget, evaluation plan, removed at the gate and kept inside" }`],
    ["an RFP due Friday splits into six pieces. Pricing, technical, capabilities and logistics are answered inside the boundary by the team's own agents. Partnering and risk need the outside world, so before they leave the RFP number, the deadline and the bid are stripped, logged and policy-checked; the world sees a capability search.",
      `the people writing an RFP split it into six pieces. Requirements, evaluation criteria, security and schedule are drafted inside the boundary by the team's own agents from documents it already has. Market research and pricing need outside information, so before they leave the ${v === "G" ? "solicitation" : "RFP"} number, the budget and the evaluation plan are removed, and the request is logged and checked against policy; the outside model sees a general capability question.`],
  ],
});

export const VARIANT_FIGS = { ladder, spikes, tubes, rfp };

const FIGS = new URL("../v4/figures/", import.meta.url).pathname;
const LINES = "/home/claude/.claude/skills/anatomy/scripts/lines.mjs";

export function buildVariant(slot, v) {
  const spec = VARIANT_FIGS[slot] && VARIANT_FIGS[slot](v);
  if (!spec) return join(FIGS, slot);
  const dir = join(FIGS, `${slot}__${v.toLowerCase()}`);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  cpSync(join(FIGS, slot), dir, { recursive: true });
  for (const [file, swaps] of Object.entries(spec)) {
    let src = readFileSync(join(dir, file), "utf8");
    for (const [a, b] of swaps) {
      const n = src.split(a).length - 1;
      if (n !== 1) throw new Error(`${slot}/${file} (${v}): expected 1 match, found ${n}: ${a.slice(0, 70)}`);
      src = src.replace(a, () => b);
    }
    writeFileSync(join(dir, file), src);
  }
  execFileSync("node", ["build.mjs"], { cwd: dir, stdio: "pipe" });
  const out = execFileSync("node", [LINES, join(dir, `${slot}.html`)], { env: { ...process.env, CHROME_PATH: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }, encoding: "utf8" });
  const line = (out.match(/line ends: .*/) || ["line ends: ?"])[0];
  console.log(`  ${slot} (${v}): ${line}`);
  return dir;
}
