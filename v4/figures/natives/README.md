# Fig 10 · One in a thousand (`natives`)

The figure is an isometric open-plan office floor plate. It has a slab with a halo, a lift-and-stair core cut at the ceiling line (three lift shafts, a stair, lift doors with call buttons), six structural columns on base plates, a cut curtain wall (sills and mullion stubs), a carpet-field groove, a label plate, and a plaque on the slab edge that reads the live count. On the floor are **1,000 desks, 40 × 25**, in team blocks of 5 × 5. Each desk is a top, a monitor and a chair, drawn once and placed 1,000 times with `<use>` so the page stays cheap.

The single accent is red (`--anatomy-red`). Two desks are **natives**. Each has its own machine (a small box) and a tall red coin-stack of tokens rising from it, towering over the floor. Three months later the red has spread by adjacency to 14 neighbouring desks. Each of those gets a paler red top and a shorter stack.

- **Truth:** `model.mjs`.
  - 1,000 people, 2 natives.
  - The natives burn more tokens than the other 998 combined.
  - The 1-in-1,000 rate is Brad's field observation of people building their own agents on a harness, not organizations deploying vendor agents. For contrast, McKinsey's State of AI 2026 says 40% of large enterprises are "scaling agents".
  - Stack heights and the shape of the spread are **illustrative**, and the caption says so.
- **Spread:** this is deterministic, from seed `0x5eed10` (`mulberry32`). Each round is one "demo" from a lit desk to an unlit 8-neighbour. A desk in the presenter's own team block is weighted 3 and a desk across an aisle is weighted 1. The two clusters take turns. The result is 14 desks, so 16 are red-pilled in all.
- **States** (`window.figureApi.states`):
  - `0` "1,000 people": all neutral, plaque 0 OF 1,000.
  - `1` "today · 2 natives": machines appear and the two stacks grow.
  - `2` "3 months · the spread": desks light one by one in spread order and their stacks grow.
- **Key state:** `2` (3 months · the spread). It is written to `natives.svg`. The per-state snapshots are `natives-1.svg`, `natives-2.svg` and `natives-3.svg` (states 0, 1 and 2), each built statically at that state.
- **Readout:** "n / 1,000 lit".
- **Board:** PEOPLE 1,000 · NATIVES 2 (? in state 0) · RED-PILLED n (in red) · TOKENS · NATIVES VS THE REST "2 > 998", plus a one-line note for each state.
- **Motion:**
  - An idle tour runs 0 → 1 → 2 at 2.6 s per beat.
  - Moving the pointer across the figure picks the state, and arrow, Home and End keys step through them.
  - Reduced motion jumps straight to the target.
  - `set(i)` and `hold()` stop the tour and never resume it.
- **Build:** `node build.mjs` writes `natives.html`, `natives.svg` and `natives-1..3.svg`. `natives.png` is the key-state preview: the plate, 1200 px viewport.
- **Checks:**
  - `lines.mjs` reports 0 floating ends: in the key state three runs in a row (540 ends), in state 1 (246 ends) and in state 0 (50 ends).
  - The console is clean.
  - Phone (390 px) has no horizontal scroll.
  - Reduced motion, embed (`?embed=1&state=1&still=1`) and the standalone SVG were each rendered and checked.
- **Size:** Figure. There are about 45 distinct solids (core, columns, sills, mullions, plaque, label, desk, machine, stacks), plus the desk instanced 1,000 times. No shader.
- **Local CSS:** the red tints for the stacks and red desks are in a `<style>` inside the SVG, so the snapshots carry them. The board's 4-column override is in the page. Nothing in `_anatomy/` was changed.
