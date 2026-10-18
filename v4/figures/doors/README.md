# F5 · Two doors

An office in section on a plinth, its walls cut low so the desks show (cut tops drawn dark). Work leaves the desks as small packets by one of two exits:

- **Front door** (front-left face): the doorway under a sign reading `ENTERPRISE CONTRACT / NOT TRAINED ON`, opening into a fenced pen with a tripod turnstile. The turnstile cabinet carries a counter drum (digit wheels behind a window), and a slotted gate at the pen's exit holds a hatched drop bar. When capped, the bar drops, the rotor stops and the counter reads `CAP`.
- **Side door** (front-right face): an ordinary door wedged open with a doorstop, under a sign reading `PERSONAL ACCOUNTS / TRAINING ON · 5-YR RETENTION`. Leaf and sign are the figure's single accent (kit red).
- The corner office (`EXEC` name plate) sits right beside the side door and leaks first.

The queue backs up in the pen, in front of everything, so the back-up is visible; the gate sits just past the rotor for that reason.

- **Truth:** `model.mjs` — PagerDuty survey, June 11 2026, n = 1,250 office professionals at companies with ≥ $500M revenue: 66% used AI tools they believed weren't allowed, 88% shared work information through them, 81% believe leadership plays by different rules. Consumer terms (Anthropic, Aug 2025): consumer plans carry the training setting with 5-year retention if on; commercial / enterprise / API / government traffic is excluded from training. Packet flow, speed, the corner office's higher send rate and the turnstile count (starts at 0847) are illustrative and labelled so in the caption.
- **States** (`window.figureApi.states`): `contract` (all packets through the turnstile, rotor turns, counter counts) → `capped` (bar down, counter `CAP`, packets jam in the 56 units before the bar and the front one is refused; the corner office's packets already go out the side door) → `side door` (every desk's packets pour out the wedged door; the board counts up to 66% / 88% / 81%). Before `side door` the board shows dashes.
- **Key state:** `side door` → `doors.svg`. Per-state static snapshots: `doors-1.svg` (contract), `doors-2.svg` (capped), `doors-3.svg` (side door), each with the packets drawn as boxes along their routes at one fixed instant.
- **Build:** `node build.mjs` → `doors.html` (standalone, paper theme, 1120 px), `doors.fragment.html`, `doors.svg`, `doors-1..3.svg`. It fails if any printed word is under the stage minimum (3.6 units at the token meter's scale, 3.95 units here) or overflows its sign or window.
- **Motion:** idle tour 3.4 s / 3.4 s / 4.6 s; pointer across the stage picks the state by thirds; arrow keys, Home and End step; `figureApi.set(i)` eases to state i and holds (no idle resume); reduced motion jumps to targets and freezes the packets.
- **Painter's order:** packets are drawn per frame into four reserved slots (interior, side walk, inside the corner office, front pen) so they pass correctly behind the near walls, jambs, leaf, partitions and turnstile parts.
- **Checks:** `scripts/lines.mjs` 0 floating ends, three runs in a row, plus 0 in each of the three resting states via `drive.mjs`; desktop (1200), phone (390, no horizontal scroll), embed (`?embed=1&state=1&still=1`), reduced motion and close-ups of both doors captured and read. Console clean.
- Size: Figure, upper end (~85 parts: plinth, floor, walls, 6 workstations, meeting table, printer, corner office, two door assemblies, pen, turnstile, gate, planters, bollards, bench), no shader.
