# v4 — the talk edition · brief

> Indexed 17 October 2026. v3 (Broadsheet, V3.1.0) is frozen and published; v4 forks from it.

## What changes

| | v3 | v4 |
|---|---|---|
| Form | a scroll-driven essay you read alone | a talk you deliver to a room, with a leave-behind |
| Audience | people who run organizations, build for them, govern | **AI people** — the natives, the AI leads, the people who already get it |
| Job to be done | convince the reader to own the boundary | arm the listener to **sell up the chain**: explain the state of the market to their leadership and win more funding for AI |
| Artwork | hand-drawn Sketchplanations stills (+ MP4s on Vercel) | **Anatomy** figures: interactive isometric machines, one per idea, built with the Anatomy skill (`/anatomy`) — the object is the explanation, live readouts driven by the real numbers |
| Chrome | newsprint cream / Newsreader / Plex | to be decided with the Anatomy theme (paper or light likely; dark for the stage) |

## What stays

The thesis and the evidence are the same (see `docs/AI_Manifesto_intent.md`, decisions D1 and D3): intent is the new oil; capping tokens is the leak; the eight-step loop; the ladder; the fork at 2029; every number from Appendix A. v4 re-sequences them for a room and changes who the "you" is.

## The v4 argument, in one line

*Your leadership thinks AI is a line item. Show them it's a meter, a leak, and a map — then ask for the capacity, not the subscription.*

## Working outline (to be built in part 2)

1. **The room's problem** — you're an AI lead with a capped budget and uncapped demand; the people who sign don't see what you see.
2. **The state of the market in five machines** — the meter (token demand vs. price), the coin shelf (what the best spend per head), could-vs-does (what's possible vs. what's allowed), the spike field (where the frontier labs ship), the sandwich (the same model, three prices).
3. **The leak** — the loop, told as what happens *to your org* when the budget runs out in Q1.
4. **Selling up the chain** — the three sentences for a CFO, a CIO, a CEO; the token-burn map as the instrument; the utilization number that turns a chart into a purchase order; the budget-detonation framing that makes a cap look more expensive than capacity.
5. **The ask** — the ladder as the funding request: device now, workgroup next, core when the natives prove it; uncapped on what you own, metered only for judgment.
6. **The fork** — own or rent, as the close.

## Anatomy figures to commission (first pass)

| Slot | v3 sketch | v4 machine (one line for `/anatomy`) |
|---|---|---|
| F2 | petrol-pump meter | a token meter: a pump whose dial spins on a log scale as demand grows faster than price falls, interactive |
| F2B | coin shelf | a balance scale weighing salary against token spend per employee, with Jensen's $250k as the counterweight |
| F2C | spider web | a loom that could weave 94% of a job and is only threaded for 33% |
| F3 | two doors | a building section with a metered front turnstile and a wedged-open side door, flow rates live |
| F4 | skyline | a crane fleet dropping towers onto a village where the usage map is densest |
| F5 | ladder in the yard | a three-rung escalator inside a fence, with a single gate to a taller building |
| F7 | torn RFP | a sorting machine that shreds an RFP and stamps out the metadata before two pieces leave the fence |
| F9 | sandwich | one vending machine, three coin slots, three prices for the same item |
| F11 | bathtub | a bathtub with a tap and a dashed rim that overflows in week 11 |
| new | — | **the chain of command**: a pneumatic-tube system from the AI lead's desk to the CFO, CIO and CEO, showing which message lands in each office |

Sizes: Figures (40–80 parts) by default; the loop and the ladder are Heroes. No Epics.

## Decisions (17 Oct 2026)

| | Decision |
|---|---|
| Stage theme | **Paper** — Anatomy's `paper` theme; continuous with the v3 Broadsheet |
| Length | **30 minutes**, about 8 machines |
| Format | **HTML deck** — arrow keys, the Anatomy machines stay live on stage |
| 2029 fork | **Live audience vote** — QR code on screen, tally before the close |

## Build order

1. **F2 · the token meter** — pilot figure; sets scale, theme and the deck's figure frame for the rest.
2. F2B balance scale, F9 vending machine, F3 building section (the state of the market).
3. The loop and the ladder (Heroes).
4. Chain of command (the new figure for selling up).
5. Deck shell: slides, speaker notes, vote.

Figures live in `v4/figures/<slot>/` with their `build.mjs`; each writes a standalone page and a fragment the deck imports.
