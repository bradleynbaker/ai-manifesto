# F6 · The spike press

A usage-map table with 33 cells. The labs sort usage into 30+ categories of work, and each cell here is one category. Each cell carries a short column whose height shows how dense the usage is (illustrative). Two thin glass planes stand over the map at real index scores: **US OPEN · 38** (uncapped) and **FRONTIER · 61** (metered). A gantry press at the back runs its arm and hoist from cell to cell. In launch order it pulls a tall spike (a shipped frontier-lab product) up through both planes, out of each of the densest cells. Nameplates on the front apron light up as each spike comes out. The sixth dense cell is dashed in red and marked **YOURS?**, and in the last state the press hovers over it. That dashed cell is the only accent.

Slide title it proves: *"The labs ship where the usage map is dense: images, code, security, finance, legal — then yours."*

- **Truth:** `model.mjs`
  - **Spikes:** IMAGE GEN 2022 · SOFTWARE 2024–25 · SECURITY 2025 · FINANCE / CFO 2025–26 · LEGAL 2026. These are public launches, in order.
  - **Planes:** Artificial Analysis's current model comparison. Nemotron 3 Ultra, the leading US open-weight model, scores 38. The Opus-class frontier scores 61. Both planes sit at their index score × 0.9 world units.
  - **Illustrative:** column heights (every routine cell is under 38, and the six dense cells are the tallest) and spike heights (88–96, all above 61). The caption says so.
  - The causal reading ("built where the traces were dense") is Brad's read, on top of the labs' own published method for classifying usage.
- **States** (`window.figureApi.states`): `map` · `image 2022` · `software 2024–25` · `security 2025` · `finance 2025–26` · `legal 2026` · `yours?`.
  - **Readout:** the spike's name and year, or "the usage map" / "YOURS?".
  - **Board:** SPIKE · SHIPPED · US OPEN INDEX 38 · FRONTIER INDEX 61.
- **Key state:** `legal 2026` (index 5): all five spikes are through the frontier plane, and the press still holds LEGAL's cap.
- **Build:** `node build.mjs` writes:
  - `spikes.html`: standalone paper page with `figureApi` and `EMBED_JS`.
  - `spikes.svg`: the key state.
  - `spikes-1.svg` … `spikes-7.svg`: one per state, in order. Each is a static pose, with the unlit nameplates dimmed inline.
  - The preview `spikes.png` is the key state, captured at a 1200 px desktop width.
- **Motion:** the whole pose is a pure function of `u` (`poseAt` in `model.mjs`). Each step lifts the press off the last cap, travels, drops onto the dense column, then pulls the spike up with the chuck. Going backward replays the same steps in reverse.
  - **Idle tour:** holds 2.6 s on each state (3.6 s on `yours?`), then loops.
  - **Steering:** pointer and arrow keys snap to states; Home and End jump to the ends.
  - **Reduced motion:** jumps straight to the chosen state. `?state=N` at load jumps with no animation.
  - **Painter's order:** the press head moves between three depth slots (below 38, between the planes, above 61), so it is drawn correctly while it is down in the map.
- **Checks:**
  - `lines.mjs`: 0 floating ends, three runs in a row, plus states 0, 2, 5 and 6.
  - Captured: desktop, phone (390 px, no sideways scroll), reduced motion, a contact sheet of a pull and of a retract, and 3× close-ups of the plane tabs and the YOURS cell.
  - Console clean.
- **Text sizes:** every printed word is ≥ 4.2 world units. At this figure's scale (1.272 vs the token meter's 1.48) that matches ≥ 3.6 at the token-meter's scale.
- **Size:** a Figure at the upper end. The repeated map cells are 33 tiles and 33 columns; the rest is about 45 parts. No shader. Shared `_anatomy/` is untouched; the board's 4-column layout is a small CSS override in this folder.
