// V5 · builds the talk deck from slides.mjs.
//   node build.mjs  → index.html (GitHub Pages, full document), artifact.html (claude.ai Artifact body),
//                     deck.json (the slide model, for the Bento port) and figures/ (copied from ../v4/figures).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SLIDES, TALK } from "./slides.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIGS = join(HERE, "..", "v4", "figures");
const CONFIG = JSON.parse(readFileSync(join(HERE, "config.json"), "utf8"));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------- copy the figures the deck uses ----------
const slots = [...new Set(SLIDES.filter((s) => s.fig).map((s) => s.fig.slot).concat(["loop"]))];
for (const slot of slots) {
  const from = join(FIGS, slot), to = join(HERE, "figures", slot);
  mkdirSync(to, { recursive: true });
  for (const f of readdirSync(from)) if (f === `${slot}.html` || f.endsWith(".svg")) copyFileSync(join(from, f), join(to, f));
}
const stateSvg = (slot, state) => {
  const f = `figures/${slot}/${slot}-${state + 1}.svg`;
  return existsSync(join(HERE, f)) ? f : `figures/${slot}/${slot}.svg`;
};

// ---------- slide renderers ----------
const head = (s, n) => `
  <header class="sl-top"><span class="sec">${esc(s.section || TALK.title)}</span><span class="no">${s.fig && s.fig.steps.length > 1 ? `<span class="steps-dots" aria-hidden="true">${s.fig.steps.map(() => "<i></i>").join("")}</span>` : ""}${String(n).padStart(2, "0")}</span></header>`;
const title = (s, cls = "") => `<h1 class="t ${cls}">${esc(s.title)}</h1>`;
const source = (s) => (s.source ? `<p class="src">${esc(s.source)}</p>` : "");

function figFrame(s) {
  const f = s.fig, st = f.steps[0];
  return `<div class="fig" data-slot="${f.slot}">
    <img class="fig-still" alt="" src="${stateSvg(f.slot, st)}" data-still>
    <iframe title="${esc(s.title)}" tabindex="-1" loading="lazy" data-src="figures/${f.slot}/${f.slot}.html?embed=1&still=1&board=${f.board === "under" ? 1 : f.board ? "side" : 0}&state=${st}"></iframe>
  </div>`;
}

const R = {
  cover: (s) => `
    <div class="cover">
      <p class="kick">${esc(s.kicker)}</p>
      <h1 class="cover-t">Intent is the new oil.<br>Capping tokens is the <em>leak</em>.</h1>
      <p class="meta">${s.meta.map(esc).join(`<span aria-hidden="true">·</span>`)}</p>
    </div>
    <img class="cover-art" alt="" src="figures/${s.art}/${s.art}.svg">`,

  quote: (s) => `${head(s, s.n)}
    <blockquote class="quote"><p>${esc(s.title.replace(/^“/, ""))}</p><footer>${esc(s.cite)}</footer></blockquote>`,

  ask: (s) => `${head(s, s.n)}${title(s)}
    <div class="ask">
      ${s.cols.map((c, k) => `<div class="ask-c"><span class="ix">${k + 1}</span><h2>${esc(c.k)}</h2><p>${esc(c.v)}</p></div><span class="arr" aria-hidden="true">→</span>`).join("")}
      <div class="ask-c lead"><span class="ix">=</span><h2>${esc(s.lead.k)}</h2><p>${esc(s.lead.v)}</p></div>
    </div>`,

  fig: (s) => `${head(s, s.n)}${title(s)}
    <div class="figwrap ${s.layout}">
      ${figFrame(s)}
      ${s.layout === "side" ? `<ul class="stats">${s.stats.map((x) => `<li${x.accent ? ' class="hot"' : ""}><b>${esc(x.n)}</b><span>${esc(x.l)}</span></li>`).join("")}</ul>` : ""}
    </div>
    ${source(s)}`,

  big: (s) => `${head(s, s.n)}${title(s)}
    <div class="bignum"><div><b>${esc(s.big)}</b><span>${esc(s.under)}</span></div><p>${esc(s.aside)}</p></div>${source(s)}`,

  flow: (s) => `${head(s, s.n)}${title(s)}
    <ol class="flow">${s.steps.map((x, k) => `<li${k === s.steps.length - 1 ? ' class="hot"' : ""}><span>${k + 1}</span>${esc(x)}</li>`).join("")}</ol>
    <div class="example"><b>${esc(s.example.n)}</b><p>${esc(s.example.l)}</p></div>${source(s)}`,

  compare: (s) => `${head(s, s.n)}${title(s)}
    <table class="cmp"><thead><tr>${s.head.map((h, k) => `<th${k === 2 ? ' class="side"' : ""}>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${s.rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td class="side">${esc(r[2])}</td></tr>`).join("")}</tbody></table>
    <p class="line">${esc(s.line)}</p>${source(s)}`,

  bars: (s) => {
    const row = (r) => {
      const max = Math.max(r.a, r.b);
      const v = (x) => (r.fmt === "$" ? "$" + x.toFixed(2) : String(x));
      const bar = (x, cls) => `<div class="bar ${cls}"><i style="width:${((x / max) * 100).toFixed(1)}%"></i><b>${v(x)}</b></div>`;
      return `<div class="brow${r.accent ? " hot" : ""}"><h3>${esc(r.k)}</h3><div class="bpair">${bar(r.a, "a")}${bar(r.b, "b")}</div><p>${esc(r.note)}</p></div>`;
    };
    return `${head(s, s.n)}${title(s)}
    <div class="bars"><p class="keys"><span class="ka">${esc(s.names[0])}</span><span class="kb">${esc(s.names[1])}</span></p>${s.rows.map(row).join("")}</div>
    <p class="line">${esc(s.line)}</p>${source(s)}`;
  },

  ba: (s) => `${head(s, s.n)}${title(s)}
    <div class="ba">
      <div class="panel"><h2>${esc(s.before.k)}</h2><p>${esc(s.before.v)}</p></div>
      <span class="arr" aria-hidden="true">→</span>
      <div class="panel lever"><h2>The lever</h2>${s.lever.map((l, k) => `<div class="lv"><b>${k + 1} · ${esc(l.k)}</b><p>${esc(l.v)}</p></div>`).join("")}</div>
      <span class="arr" aria-hidden="true">→</span>
      <div class="panel"><h2>${esc(s.after.k)}</h2><p>${esc(s.after.v)}</p></div>
    </div>${source(s)}`,

  steps: (s) => `${head(s, s.n)}${title(s)}
    <ol class="tl">${s.steps.map((x) => `<li${x.accent ? ' class="hot"' : ""}><i></i><h2>${esc(x.k)}</h2><p>${esc(x.v)}</p></li>`).join("")}</ol>${source(s)}`,

  three: (s) => `${head(s, s.n)}${title(s)}
    <table class="ex"><thead><tr>${s.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${s.rows.map((r) => `<tr${r[3] ? ' class="hot"' : ""}><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td class="so">${esc(r[2])}</td></tr>`).join("")}</tbody></table>${source(s)}`,

  vote: (s) => `${head(s, s.n)}${title(s)}
    <div class="vote">
      <div class="opts">${s.options.map((o, k) => `
        <div class="opt" data-opt="${o.id}"><div class="ok"><kbd>${k + 1}</kbd><h2>${esc(o.k)}</h2><b data-count="${o.id}">0</b></div><p>${esc(o.v)}</p><div class="meterbar"><i data-bar="${o.id}"></i></div></div>`).join("")}
      </div>
      <aside class="qr"><div id="qr" class="qr-box" aria-label="QR code to the vote"></div><p class="qr-l">Scan to vote</p><p class="qr-u" data-vote-url></p><p class="qr-s" data-vote-status>Show of hands works too.</p></aside>
    </div>`,

  futures: (s) => `${head(s, s.n)}${title(s)}
    <div class="fut">
      <section class="rent"><h2>Keep renting</h2>
        <svg class="spend" viewBox="0 0 820 220" role="img" aria-label="Spend over three years: flat, flat, then vertical"><path class="ax" d="M40 180H800M40 180V14"/><path class="tk" d="M290 180v8M540 180v8M790 180v8"/><path class="ln" d="M40 164 L290 161 L540 154 L640 138 L700 96 L740 22"/><text x="50" y="26">spend</text><text x="165" y="210" text-anchor="middle">year 1</text><text x="415" y="210" text-anchor="middle">year 2</text><text x="665" y="210" text-anchor="middle">year 3</text></svg>
        <ul>${s.rented.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
      <section class="own"><h2>Own the boundary</h2><ul>${s.owned.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
    </div>`,

  close: (s) => `${head(s, s.n)}${title(s)}
    <div class="roles">${s.roles.map((r) => `<div class="role"><h2>${esc(r.k)}</h2><p>${esc(r.v)}</p></div>`).join("")}</div>`,

  end: (s) => `
    <div class="end"><h1 class="cover-t">Intent is the new oil.<br>Capping tokens is the <em>leak</em>.</h1><p class="sub">${esc(s.sub)}</p>
    <p class="tally" data-tally></p><p class="meta">${esc(TALK.speaker)} · ${esc(TALK.title)} · ${esc(TALK.edition)}</p></div>`,
};

SLIDES.forEach((s, k) => (s.n = k + 1));
const slideHtml = SLIDES.map((s, k) => `<section class="slide s-${s.type}" id="s${k + 1}" data-type="${s.type}" aria-label="Slide ${k + 1}: ${esc(s.title)}"${k ? " hidden" : ""}>${R[s.type](s)}</section>`).join("\n");

const MODEL = SLIDES.map((s) => ({ id: s.id, type: s.type, title: s.title, section: s.section, min: s.min, notes: s.notes, fig: s.fig ? { slot: s.fig.slot, steps: s.fig.steps } : null }));

// ---------- style ----------
const CSS = readFileSync(join(HERE, "deck.css"), "utf8");
const JS = readFileSync(join(HERE, "deck.js"), "utf8");
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">`;
const QR = `<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>`;

const body = `
<div class="deck" id="deck">
  <div class="stage" id="stage">
${slideHtml}
  </div>
  <div class="hud" aria-hidden="true"><div class="prog"><i id="prog"></i></div></div>
  <nav class="ctl" aria-label="Deck controls">
    <button type="button" id="b-prev" aria-label="Previous">←</button>
    <span id="count">1 / ${SLIDES.length}</span>
    <button type="button" id="b-next" aria-label="Next">→</button>
    <button type="button" id="b-help" aria-label="Keys">?</button>
  </nav>
</div>
<div class="notes" id="notes" hidden><div class="notes-in"><p class="n-meta" id="n-meta"></p><p class="n-text" id="n-text"></p></div></div>
<div class="overview" id="overview" hidden><h2>The ghost deck · titles only</h2><ol id="ov-list"></ol></div>
<div class="help" id="help" hidden><div><h2>Keys</h2><dl>
  <dt>→ · Space · PgDn</dt><dd>next step / slide</dd><dt>← · PgUp</dt><dd>back</dd>
  <dt>N</dt><dd>speaker notes</dd><dt>O</dt><dd>ghost deck (titles only)</dd><dt>P</dt><dd>presenter view (open the same link in a second window, add #presenter)</dd>
  <dt>F</dt><dd>full screen</dd><dt>1 · 2</dt><dd>on the vote: add a hand for own · rent (Shift removes one)</dd><dt>Esc</dt><dd>close</dd></dl></div></div>
<div class="presenter" id="presenter" hidden>
  <header><b id="p-clock">00:00</b><span id="p-pace"></span><button type="button" id="p-reset">Reset clock</button></header>
  <main><p class="p-now" id="p-now"></p><p class="p-step" id="p-step"></p><div class="p-notes" id="p-notes"></div></main>
  <footer><span>Next</span><p id="p-next"></p><div class="p-ctl"><button type="button" id="p-prev">← Back</button><button type="button" id="p-next-b">Next →</button></div></footer>
</div>
<div class="votepage" id="votepage" hidden>
  <h1>By 2029, which future is your organization standing in?</h1>
  <p class="vp-sub">Be honest about where you are, not where you'd like to be.</p>
  <div class="vp-opts">${SLIDES.find((s) => s.type === "vote").options.map((o) => `<button type="button" data-vote="${o.id}"><b>${esc(o.k)}</b><span>${esc(o.v)}</span></button>`).join("")}</div>
  <p class="vp-status" id="vp-status" aria-live="polite"></p>
</div>
<script>window.DECK=${JSON.stringify({ slides: MODEL, voteUrl: CONFIG.voteUrl || "" })};</script>
${QR}
<script>${JS}</script>`;

const TITLE = "AI Manifesto Talk";
const artifact = `<title>${TITLE}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${FONTS}\n<style>${CSS}</style>${body}`;
const full = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${TITLE}</title>${FONTS}<style>${CSS}</style></head><body>${body}</body></html>`;
writeFileSync(join(HERE, "artifact.html"), artifact);
writeFileSync(join(HERE, "index.html"), full);
writeFileSync(join(HERE, "deck.json"), JSON.stringify({ talk: TALK, slides: SLIDES }, null, 2));
console.log(`wrote index.html ${(full.length / 1024).toFixed(0)} KB · ${SLIDES.length} slides · ${slots.length} figures`);
