// Fig 1 · The leak loop — an Anatomy figure for the v4 talk.
// A conveyor loop on a bench with seven stations round it. The puck (the user's intent, the one lit part) rides
// the chain from station to station: usage explodes, the meter arrives, the natives get capped, they go personal,
// personal accounts train, intent becomes the labs' roadmap, the spike eats the 80%. At station 3 a points switch,
// thrown by the lever on station 3's console, shunts the puck off the loop into the fenced OWNED pen (station 8),
// so the loop never reaches 4: the stations it would have fed go faint.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../_anatomy/kit/iso-kit.mjs";
import { kitScript } from "../_anatomy/inline-kit.mjs";
import { PAPER_CSS } from "../_anatomy/paper.mjs";
import { STAGE_CSS } from "../_anatomy/stage.mjs";
import { EMBED_CSS, EMBED_JS, writeSnapshot } from "../_anatomy/embed.mjs";
import * as G from "./parts.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const LABEL =
  "A conveyor loop on a bench. A black puck, the user's intent, rides a chain past seven stations: 1 usage explodes, a pin board whose pins shoot up; 2 the meter arrives, a meter that steps from flat to pay-as-you-go; 3 cap the natives, a screw clamp that presses down on the puck; 4 go personal, a cabinet whose hatch opens on a phone; 5 personal accounts train, a recording drum and its training toggle; 6 intent becomes the roadmap, a tray of 30 compartments filling into a map; 7 the spike eats the 80%, a press driving a spike into the dense middle of a map. At station 3 a points switch can shunt the puck off the loop into a fenced pen marked 8 OWNED, so the loop never reaches 4.";

const svgOf = (pose) => k.figureSvg({ width: G.W, height: G.H, label: LABEL, body: G.groupsSvg(G.groups(pose, M.STEPS)) });

// ---------- static snapshots: the key state and every state ----------
const KEY = M.KEY_STATE;
const keySvg = svgOf(G.restPose(KEY));
writeSnapshot(HERE, "loop", keySvg);
M.STATES.forEach((_, i) => writeSnapshot(HERE, `loop-${i + 1}`, svgOf(G.restPose(i))));

// ---------- the live page ----------
const kitNames = Object.keys(k).filter((n) => typeof k[n] === "function" || n === "ISO_CSS");
const partsSrc = readFileSync(join(HERE, "parts.mjs"), "utf8");
const partNames = [...partsSrc.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
const partsBody = partsSrc.replace(/^import .*$/m, "").replace(/^export /gm, "");

const live = `
const k = { ${kitNames.join(", ")} };
const G = (() => {
${partsBody}
return { ${partNames.join(", ")} };
})();
const STEPS = ${JSON.stringify(M.STEPS)};
const STATES = ${JSON.stringify(M.STATES)};
const KEY = ${KEY}, BREAK = STATES.length - 1;
const mod = (v, m) => ((v % m) + m) % m;
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (id) => svg.querySelector('[data-part="' + id + '"]');
const el = {};
["st1", "st2", "st3", "st4", "st5", "st6", "st7", "chain", "wheel", "puck", "mid", "penBack", "penFront"].forEach((id) => (el[id] = part(id)));
const readout = document.querySelector("[data-readout]");
const board = {};
["step", "name", "key", "klab", "note"].forEach((id) => (board[id] = document.querySelector('[data-board="' + id + '"]')));
const still = matchMedia("(prefers-reduced-motion: reduce)");

let pose = G.restPose(KEY);
pose.act = [...pose.act];
let target = KEY, inSpur = false, v = 0, frame = 0, last = 0, frames = 0, visible = false, held = false, touring = true, idle = 0, since = 0;
const cache = {};
const put = (id, key, make) => { if (cache[id] === key) return; cache[id] = key; el[id].innerHTML = make(); };
const r2 = (x) => Math.round(x * 500) / 500;

function draw() {
  const a = pose.act;
  put("st1", r2(a[0]), () => G.station1(a[0], STEPS[0].lines));
  put("st2", r2(a[1]), () => G.station2(a[1], STEPS[1].lines));
  put("st3", r2(a[2]) + "/" + r2(pose.sw), () => G.station3(a[2], pose.sw, STEPS[2].lines));
  put("st4", r2(a[3]), () => G.station4(a[3], STEPS[3].lines));
  put("st5", r2(a[4]) + "/" + r2(pose.drum), () => G.station5(a[4], pose.drum, STEPS[4].lines));
  put("st6", r2(a[5]), () => G.station6(a[5], STEPS[5].lines));
  put("st7", r2(a[6]), () => G.station7(a[6], STEPS[6].lines));
  const ph = Math.round(pose.phase * 20) / 20;
  put("chain", ph, () => G.chain(ph));
  put("wheel", ph, () => G.wheel(ph));
  el.puck.setAttribute("transform", G.puckMove(pose));
  // the puck rides in its true depth slot between the pen's back fences and its front wall
  const d = G.puckDepth(pose);
  const before = d < G.penDepths[0] ? el.penBack : d < G.penDepths[1] ? el.penFront : null;
  if (el.puck.nextSibling !== before) el.mid.insertBefore(el.puck, before);
  const dead = pose.dim > 0.5;
  ["st4", "st5", "st6", "st7"].forEach((id) => el[id].toggleAttribute("data-dead", dead));
}
function label() {
  const s = STEPS[target];
  const text = "Step " + s.n + " · " + s.name;
  if (readout.textContent !== text) readout.textContent = text;
  board.step.textContent = String(s.n);
  board.name.textContent = s.name;
  board.key.textContent = s.key;
  board.klab.textContent = s.keyLab;
  board.note.textContent = s.note;
  stage.setAttribute("aria-valuenow", String(target));
  stage.setAttribute("aria-valuetext", text + ". " + s.note);
}
// distance left along the route to the target, and one step along it
function remaining() {
  if (target === BREAK) return inSpur ? G.SPUR - pose.w : mod(G.S[2] - pose.s, G.LOOP) + G.SPUR;
  const ahead = inSpur ? pose.w + mod(G.S[target] - G.S[2], G.LOOP) : mod(G.S[target] - pose.s, G.LOOP);
  return ahead > G.LOOP - 0.25 ? 0 : ahead;
}
function advance(step) {
  if (target === BREAK) {
    if (!inSpur) {
      const toS3 = mod(G.S[2] - pose.s, G.LOOP);
      if (step >= toS3 && toS3 < G.LOOP - 0.25) { inSpur = true; pose.w = Math.min(G.SPUR, step - toS3); pose.s = G.S[2]; }
      else pose.s = mod(pose.s + step, G.LOOP);
    } else pose.w = Math.min(G.SPUR, pose.w + step);
  } else if (inSpur) {
    if (step >= pose.w) { inSpur = false; pose.s = mod(G.S[2] + step - pose.w, G.LOOP); pose.w = null; }
    else pose.w -= step;
  } else pose.s = mod(pose.s + step, G.LOOP);
  pose.phase += step;
}
const atStation3 = () => !inSpur && Math.abs(mod(pose.s - G.S[2] + G.LOOP / 2, G.LOOP) - G.LOOP / 2) < 0.6;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  frames++;
  const calm = still.matches;
  if (touring) {
    since += dt;
    if (since > (target === BREAK ? 4.6 : 3.3)) { since = 0; go((target + 1) % STATES.length, false); }
  }
  // the switch: thrown for the break, held over while the puck is still in the spur
  const swTo = target === BREAK || inSpur ? 1 : 0;
  pose.sw = calm ? swTo : pose.sw + (swTo - pose.sw) * (1 - Math.exp(-dt / 0.22));
  pose.dim = target === BREAK ? 1 : 0;
  let rem = remaining();
  let step = 0;
  if (rem > 0) {
    v += (190 - v) * (1 - Math.exp(-dt / 0.22));
    step = calm ? rem : Math.min(rem, v * dt, rem * (1 - Math.exp(-dt / 0.16)) + 8 * dt);
    // nothing leaves station 3 while the clamp is down, and nothing passes the toe before the blade is over
    if (!calm && pose.act[2] > 0.08 && atStation3()) step = 0;
    if (!calm && target === BREAK && pose.sw < 0.9) step = Math.min(step, Math.max(0, (inSpur ? G.TOE - pose.w : mod(G.S[2] - pose.s, G.LOOP) + G.TOE) - 0.5));
    advance(step);
    rem = remaining();
  } else v = 0;
  const arrived = rem < 0.3;
  for (let i = 0; i < 7; i++) {
    const to = target === i && arrived ? 1 : 0;
    pose.act[i] = calm ? to : pose.act[i] + (to - pose.act[i]) * (1 - Math.exp(-dt / (to > pose.act[i] ? 0.5 : 0.22)));
    if (Math.abs(pose.act[i] - to) < 0.002) pose.act[i] = to;
  }
  if (!calm) pose.drum += dt * (0.25 + 1.6 * pose.act[4]);
  if (Math.abs(pose.sw - swTo) < 0.002) pose.sw = swTo;
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
function jump(i) {
  const r = G.restPose(i);
  pose = { ...r, act: [...r.act], drum: pose.drum };
  inSpur = r.w != null;
  target = i;
  draw();
}
function go(i, user) {
  if (i === target) return;
  target = i;
  since = 0;
  if (user) { touring = false; clearTimeout(idle); if (!held) idle = setTimeout(() => { touring = !still.matches && !held; since = 0; run(); }, 6000); }
  if (frames === 0 || still.matches) jump(i);
  label();
  run();
}
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const m = svg.getScreenCTM();
  if (!m) return;
  const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse());
  let best = -1, dist = 64;
  G.ANCHORS.forEach(([x, y], i) => { const dd = Math.hypot(p.x - x, p.y - y); if (dd < dist) { dist = dd; best = i; } });
  if (best >= 0) go(best, true);
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = (target + 1) % STATES.length;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = (target + STATES.length - 1) % STATES.length;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = BREAK;
  if (/^[1-8]$/.test(event.key)) to = Number(event.key) - 1;
  if (to === null) return;
  event.preventDefault();
  go(to, true);
});
label();
draw();
window.figureApi = {
  states: STATES,
  set(i) { held = true; touring = false; clearTimeout(idle); go(Math.max(0, Math.min(BREAK, i)), false); },
  hold() { held = true; touring = false; clearTimeout(idle); },
};
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "The leak loop",
  hint: "Point at a station · ← → steps",
  readout: M.readoutOf(KEY),
  keys: [
    { mark: "lit", label: "Puck: the user's intent" },
    { mark: "raised", label: "Stations 1–7: the loop a token cap starts" },
    { mark: "edge", label: "Switch at 3: owned, uncapped capacity sends intent into OWNED (8)" },
  ],
  caption:
    "Capping tokens starts a loop. Usage explodes (one agency went from 0 to 19,000 users in 45 days), the meter arrives, and the CFO caps the heaviest users first. Capped users go personal: 66% of office workers use AI tools they believe aren't allowed, and 88% have pasted work information into them. Consumer plans carry the training toggle, with 5-year retention when it is on, and the enterprise contract never sees that traffic; the labs sort usage into 30+ categories of work, and the next capability spike lands where that map is densest. Owned, uncapped capacity is the switch at step 3: intent goes into OWNED and steps 4–7 never happen. The machine is illustrative. Sources: PagerDuty, June 2026 (n = 1,250); AI Weekly, Aug 2026; Anthropic consumer terms, Aug 2025; Anthropic Economic Index.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="The leak loop: arrow keys or 1 to 8 step the puck through the loop and the break at station 3" aria-valuemin="0" aria-valuemax="${M.STATES.length - 1}" aria-valuenow="${KEY}">${keySvg}</div>`,
});
const s = M.STEPS[KEY];
const BOARD = `<div class="board loop-board" aria-live="polite">
  <div class="cell"><span class="lab">Step</span><span class="num" data-board="step">${s.n}</span></div>
  <div class="cell"><span class="lab">Station</span><span class="num name" data-board="name">${s.name}</span></div>
  <div class="cell key"><span class="lab" data-board="klab">${s.keyLab}</span><span class="num" data-board="key">${s.key}</span></div>
  <div class="note"><span data-board="note">${s.note}</span></div>
</div>`;
const LOOP_CSS = `
.board.loop-board{grid-template-columns:auto minmax(0,1.5fr) minmax(0,1fr);gap:8px 28px}
.loop-board .num.name{font-size:clamp(20px,2.6vw,34px);white-space:normal;line-height:1.1}
.loop-board .key .num{font-size:clamp(22px,3vw,40px);color:var(--anatomy-lit)}
.loop-board .note{font-size:clamp(15px,1.7vw,19px);line-height:1.45;color:var(--anatomy-text);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.iso [data-part^="st"] :is(path,text){transition:stroke .7s ease,fill .7s ease}
@media (max-width:700px){.board.loop-board{grid-template-columns:1fr}}
`;
const figure = body.replace("</div><figcaption", `</div>${BOARD}<figcaption`);
if (figure === body) throw new Error("board not placed");
const page = k
  .pageHtml({ title: "The leak loop", theme: "light", body: figure, script: kitScript() + live + EMBED_JS, width: 1120 })
  .replace("</style>", `${PAPER_CSS}${STAGE_CSS}${EMBED_CSS}${LOOP_CSS}</style>`);
writeFileSync(join(HERE, "loop.html"), page);
console.log("wrote loop.html", (page.length / 1024).toFixed(0) + " KB", "· scale", G.P.scale.toFixed(3), "· solids in key state", (keySvg.match(/class="iso-solid/g) || []).length);
