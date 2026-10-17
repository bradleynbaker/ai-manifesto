# F2 · The token meter

A utility meter on a calibration bench. The needle reads tokens a month on a log dial (one major tick per ×10); the tariff carriage reads the frontier price per million tokens on a log ruler with the same length per ×10; the calendar knob runs 2019 → 2026 → one team's month.

- **Truth:** `model.mjs` — top customer 100K → 100B tokens/month (2019 → 2026, Altman, June 2026); frontier list price $60/M (Davinci at the 2020 API launch, $0.06/1K until 1 Sept 2022) → $3.85/M (Opus-class blended, Artificial Analysis, 2026); one 3-person team, 603B tokens and $1.3M in a month. Log-interpolated between published points; 2019 uses the 2020 launch price.
- **Result:** volume ×1,000,000, price ÷16, bill ×64,000. The meter, not the rate card.
- **Build:** `node build.mjs` → `token-meter.html` (standalone, paper theme) and `token-meter.fragment.html` (for the deck).
- **Checks:** line-end check 0 floating ends (Anatomy `scripts/lines.mjs`); desktop, phone (390 px), reduced-motion and 4× dial close-up captured.
- **Stage type:** `_anatomy/stage.mjs` (shared by every v4 figure): 1120 px plate, 20–22 px corners, printed dial / ruler / calendar numerals, and a scoreboard under the plate — YEAR · TOKENS/MONTH × FRONTIER $/M = BILL/MONTH at up to 46 px.
- **Type your own tokens:** the tokens box takes 250B, 40M, 1.2T, 3e9 or 250,000,000. The needle jumps to your number; move across the meter to price it at any year's rate; "Back to the timeline" resumes the tour.
- Size: Figure, ~55 parts, no shader.
