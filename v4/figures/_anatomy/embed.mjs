// Deck embedding + static snapshots, shared by every v4 figure.
//
// Live (deck):   <iframe src="figures/<slot>/<slot>.html?embed=1&state=3&still=1&board=0">
//   embed=1   strip the plate chrome (corners, legend, caption, page margins); the machine fills the frame
//   state=N   start at the figure's state N (see window.figureApi.states)
//   still=1   no idle tour: the figure holds the state the deck gives it
//   board=0   hide the scoreboard under the plate (if the figure has one); board=side stacks it beside the plate
//   The deck can also drive it: frame.contentWindow.postMessage({ anatomy: "set", state: N }, "*")
//
// Each figure's live script must define, before EMBED_JS runs:
//   window.figureApi = { states: ["2019", "2020", …], set(i) { …jump/ease to state i, stop the tour… } }
//
// Static (Bento / print): writeSnapshot(dir, name, svgMarkup) writes <name>.svg with the kit CSS and
// the paper tokens inlined, so it renders with no page around it.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ISO_CSS } from "./kit/iso-kit.mjs";
import { PAPER_CSS } from "./paper.mjs";

export const EMBED_CSS = `
html.embed,html.embed body{height:100%;margin:0;overflow:hidden;background:#ebebe5;color-scheme:light}
html.embed .iso-page{width:100%;height:100%;margin:0}
html.embed .iso-figure{height:100%;margin:0;display:flex;flex-direction:column;gap:14px}
html.embed .iso-plate{flex:1;min-height:0;padding:0;background:none;box-shadow:none;border:0}
html.embed .iso-plate-corners,html.embed .iso-legend{display:none}
html.embed .iso-stage{height:100%;outline:none}
html.embed .iso-svg{width:100%;height:100%}
html.embed .board{margin-top:0;flex:none}
html.embed.no-board .board{display:none}
html.embed.board-side .iso-figure{flex-direction:row;gap:24px}
html.embed.board-side .iso-plate{flex:1;min-width:0}
html.embed.board-side .board{align-self:center;width:min(36%,430px);grid-template-columns:1fr!important;align-content:center;gap:14px 0!important;padding:22px 24px;margin:0}
html.embed.board-side .board .op{display:none!important}
html.embed.board-side .board .note{grid-column:auto!important}
html.embed.board-side .board .num{font-size:clamp(26px,3.4vw,44px)}
`;

export const EMBED_JS = `
;(() => {
  const q = new URLSearchParams(location.search);
  const root = document.documentElement;
  if (q.get("embed") === "1") root.classList.add("embed");
  if (q.get("board") === "0") root.classList.add("no-board");
  if (q.get("board") === "side") root.classList.add("board-side");
  const api = () => window.figureApi;
  const go = (i) => { const a = api(); if (a && Number.isFinite(i)) a.set(Math.max(0, Math.min(a.states.length - 1, i))); };
  if (q.has("state")) go(Number(q.get("state")));
  if (q.get("still") === "1" && api() && api().hold) api().hold();
  addEventListener("message", (e) => { const d = e.data; if (d && d.anatomy === "set") go(Number(d.state)); });
  if (parent !== window) parent.postMessage({ anatomy: "ready", states: api() ? api().states : [] }, "*");
})();
`;

export function standaloneSvg(svg, { background = "#ebebe5" } = {}) {
  const css = `${ISO_CSS}${PAPER_CSS}.iso-svg{background:${background}}`;
  return svg
    .replace(/^<svg([^>]*?)class="iso-svg/, `<svg$1class="iso-svg iso`)
    .replace(/^<svg/, `<svg data-theme="light"`)
    .replace(/^(<svg[^>]*>)/, `$1<style>${css}</style>`);
}

export function writeSnapshot(dir, name, svg, options) {
  const out = standaloneSvg(svg, options);
  writeFileSync(join(dir, `${name}.svg`), out);
  return out;
}
