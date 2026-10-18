# F9 · The Tuesday RFP

A mail-sorting machine on a plate fenced on three sides, with one gate. The RFP ("RFP · DUE FRI") sits in the hopper on top of the router. The router cuts it into six cards that run down six chutes:

- **Inside:** PRICING, TECHNICAL, CAPABILITIES and LOGISTICS stop in four bins, each next to a small agent workstation. When its card lands, the workstation's lamp comes on and lines appear on its screen.
- **To the gate:** PARTNERING and RISK wait under two stamping heads just inside the gate. Each card carries three red tabs: RFP #, DEADLINE, BID. The heads come down, shear the tabs off, keep them inside (struck through, hanging from the heads, with a cable to the log printer), and stamp CAPABILITY SEARCH on the cards. The cards then leave through the open gate onto the world's table.
- **Return:** a tray on the front rail brings OPTIONS back from the world's table to the one desk marked HUMAN DECIDES.

Gray first, one accent: only the stripped labels are red.

- **Truth:** an illustrative workflow from the manifesto's Tuesday RFP. The only numbers are the example's own counts: 6 pieces, 4 answered inside, 2 sent out, 3 labels stripped from each piece that leaves. The caption says it is illustrative.
- **Model:** `model.mjs` holds one timeline, `pose(t)`, for t from 0 to 3 (0 = the RFP in the hopper, 1 = split, 2 = gate, 3 = return). Each motion is a smoothstep over its own slice of t. The build and the page both use it, and so do the readout and the scoreboard (`counts(p)`).
- **States** (`window.figureApi.states`): `split`, `gate`, `return`. Readout: "The split" / "The gate" / "The return". Board: ANSWERED INSIDE + OUT, STRIPPED → WHO DECIDES, plus one note line for each state.
- **Key state:** `return` (index 2), written to `rfp.svg`. It shows all three beats at once: four cards in the inside bins, the stripped cards outside reading CAPABILITY SEARCH, the red tabs held inside, and OPTIONS at the human desk.
- **Build:** `node build.mjs` writes:
  - `rfp.html`: standalone paper-theme page
  - `rfp.fragment.html`: the figure for the deck
  - `rfp.svg`: key state
  - `rfp-1.svg`, `rfp-2.svg`, `rfp-3.svg`: split, gate and return, each static with no JS
  - The build fails if any printed word doesn't fit its face. It also fails if face text falls below the stage minimum: 3.6 units at the token meter's scale. Here that is 4.42 units. The figure uses 4.5 and up; the RFP cover is 9.
- **Motion:**
  - About 4 s for each beat, then a 2.6–3.6 s hold.
  - The idle tour runs split → gate → return, then fades and restarts.
  - Pointer position across the stage scrubs the timeline. Arrow keys step through the states; Home and End jump to the first and last.
  - `set(i)` eases to a state and stops the tour; the first `set` after load jumps.
  - With reduced motion, the page opens still on the key state.
- **Embed:** `?embed=1&state=N&still=1&board=0`, plus `postMessage({ anatomy: "set", state: N })`. Both checked.
- **Checks:**
  - Anatomy `lines.mjs` reports **0 floating ends** three runs in a row on the live page, and 0 in each held state (`?state=0|1|2&still=1`).
  - Captured: desktop key state, all three states, transition contact sheets for split, gate and return, 4× close-ups (presses and tabs, router and hopper, workstations, desk and tray, gate and world table), phone at 390 px with no horizontal scroll, reduced motion, and embed. The console is clean.
- **Size:** Figure, upper end. It has about 80 distinct parts, drawn with 174 solid primitives (the fence posts, rails and gate leaves account for many). There is no shader.
