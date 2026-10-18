# Figure brief — v4 talk edition of "An AI Manifesto"

You are building ONE Anatomy figure for a 30-minute talk Brad Baker gives to AI people (AI leads, builders,
the people who already get it). The talk arms them to **sell up the chain**: explain the market to their
leadership and win funding for owned, uncapped AI capacity. Thesis: *Intent is the new oil. Capping tokens is the leak.*

The figure goes on a projected slide (1920×1080, paper theme) as a live iframe, and as a static SVG in a
Bento deck. Someone at the back of the room must get the point in five seconds with the title covered.

## Tools and references (read these first)

- The Anatomy skill: `/home/claude/.claude/skills/anatomy/SKILL.md` and its `references/` (kit.md, craft.md …) and
  `examples/`. Follow it: the object is the explanation; many small precise solid parts; four-tone shading;
  painter's order; calm eased motion; real numbers drive the readout.
- **Reference implementation — copy its structure:** `/home/claude/ai-manifesto/v4/figures/token-meter/`
  (`build.mjs`, `model.mjs`, `README.md`). It shows the kit import, the paper + stage CSS, the plate, the
  scoreboard (`.board`), the live script, `window.figureApi`, `EMBED_JS`, and `writeSnapshot`.
- Shared modules in `/home/claude/ai-manifesto/v4/figures/_anatomy/` — **read-only, do not edit**:
  `kit/iso-kit.mjs` (import as `../_anatomy/kit/iso-kit.mjs`), `inline-kit.mjs` (`kitScript()`),
  `paper.mjs` (`PAPER_CSS`), `stage.mjs` (`STAGE_CSS`, incl. `.board`), `embed.mjs` (`EMBED_CSS`, `EMBED_JS`,
  `writeSnapshot`). If you truly need a shared change, put it in your own folder and say so in your report.
- Checks (run with `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`):
  `node /home/claude/.claude/skills/anatomy/scripts/capture.mjs <page.html>`,
  `node /home/claude/.claude/skills/anatomy/scripts/lines.mjs <page.html>` (must report **0** floating ends,
  three runs in a row), and `drive.mjs` for states/screenshots (`node drive.mjs` with no args prints help; use a
  `file://` URL when you add a query string, e.g. `file:///…/x.html?embed=1&state=2&still=1`).
  Write screenshots to `/tmp/claude-0/-home-claude/6f82e8e1-32b0-5bf4-922d-cb54f503a17f/scratchpad/shots/<slot>/`
  and LOOK at them (Read the PNG). Iterate until it is clean: no overlapping labels, nothing floating, nothing clipped.

## Output contract (your folder only: `/home/claude/ai-manifesto/v4/figures/<slot>/`)

1. `build.mjs` (+ `model.mjs` for the numbers) → `node build.mjs` writes:
   - `<slot>.html` — standalone page, `pageHtml({ theme: "light", width: 1120 })` with
     `PAPER_CSS + STAGE_CSS + EMBED_CSS` appended to the style and `kitScript() + live + EMBED_JS` as the script.
   - `<slot>.svg` — `writeSnapshot(HERE, "<slot>", svg)` of the figure in its **key state** (the state that
     proves the slide's title; say which in the README).
   - Additional per-state snapshots if the slide steps through states: `<slot>-<n>.svg` (build the static SVG
     for each state at build time — the static SVG must show that state without JS).
2. `window.figureApi = { states: [...short labels], set(i) { …ease to state i, stop any tour, no idle resume… }, hold() {…} }`
   defined in the live script BEFORE `EMBED_JS`. States are the beats the presenter clicks through.
3. `README.md` (like the token meter's): what it is, the truth/sources, states, key state, checks run.
4. A `<slot>.png` preview (desktop 1200 px wide, key state).
5. Do NOT git commit, do NOT touch other folders, do NOT edit `_anatomy/`. Do not fetch anything from the web.

## Stage rules (non-negotiable)

- Paper theme, ink-only (tones hi/mid/lo/faint/lit). **Gray first, color one thing:** at most one accent
  element, drawn in `lit` (black) or the kit's red (`--anatomy-red`) — the single thing the title is about.
- Every word printed on the object must be big enough to read when the figure is ~1200 px wide on a projector:
  face text ≥ 3.6 units at the token-meter's scale, and fewer, larger words beat many small ones. Use the
  corner readout and (when it helps) a `.board` scoreboard for the numbers the speaker will say out loud.
- No label may sit under a moving part's path (the token meter moved its dial numerals outside the needle's
  sweep for exactly this reason).
- Plate corners: `fig` = "Fig N", `title` = short noun name, `hint` = one short instruction, `readout` = live state.
- Caption: plain words, one paragraph, with the sources named.
- Motion: calm idle tour through the states (pauses ~2–3 s each), pointer/keyboard steering, reduced motion respected.
- Size: a **Figure** (40–80 parts) unless your spec says **Hero** (up to ~140 parts). No shaders.
- Numbers: use ONLY the numbers in your spec (they come from the manifesto's verified appendix). Label anything
  illustrative as illustrative in the caption.
- Phone (390 px): no horizontal scroll.

## Report back (final message, ≤ 15 lines)

Slot, files written, states list, key state, line-check result, anything you could not do, and the absolute
path of the key-state PNG.
