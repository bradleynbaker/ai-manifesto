# V5 · An AI Manifesto — the talk

A 30-minute HTML deck for AI people: the state of the market in Anatomy machines, then how to sell up the chain for owned, uncapped capacity. Paper stage, live figures, live audience vote at the 2029 fork.

- **Present:** open `index.html`. → / Space / PgDn next step, ← back, **N** speaker notes, **O** ghost deck (titles only), **P** presenter view (or open `index.html#presenter` in a second window — it follows along), **F** full screen, **1 / 2** add a hand on the vote slide.
- **Slides:** `slides.mjs` is the source of truth (action titles, notes, timings that sum to 30:00). `node build.mjs` writes `index.html`, `artifact.html` (claude.ai Artifact body), `deck.json` (slide model for the Bento port) and copies the figures from `../v4/figures`.
- **Figures:** each slide's machine is a live iframe of `figures/<slot>/<slot>.html?embed=1&still=1&state=N`, stepped by the deck; the static SVG for that state sits underneath as the fallback and for Bento (which carries no script).
- **Vote:** on claude.ai the vote is live (`#vote` page, `db` capability: each signed-in viewer writes `votes/<their id>`). Anywhere else, count hands with 1 / 2.
- **Principles:** action titles (ghost-deck test passes in order), one message per slide, answer first (slide 3), concrete before abstract, gray first with one red thing per slide, dense detail in the notes.
