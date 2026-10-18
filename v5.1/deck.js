(() => {
  "use strict";
  const D = window.DECK, SL = D.slides, N = SL.length;
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const stage = $("#stage"), slides = $$(".slide", stage);
  const chan = "BroadcastChannel" in window ? new BroadcastChannel("ai-manifesto-" + (D.version || "v5")) : null;
  const NS = "ai-manifesto-" + (D.version || "v5") + ":";
  const store = { get(k) { try { return localStorage.getItem(NS + k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(NS + k, v); } catch {} } };
  const stepsOf = (k) => (SL[k].fig ? SL[k].fig.steps.length : 1);
  let i = 0, s = 0;

  // ---------- fit the 1920×1080 stage to the window ----------
  function fit() {
    const w = innerWidth, h = innerHeight, k = Math.min(w / 1920, h / 1080);
    stage.style.transform = `translate(${-960 * k}px, ${-540 * k}px) scale(${k})`;
  }
  addEventListener("resize", fit); fit();

  // ---------- figures (live iframes, lazily loaded; the still SVG shows until the figure is ready) ----------
  function frameOf(k) { return slides[k] && $("iframe", slides[k]); }
  function load(k) {
    const f = frameOf(k);
    if (!f || f.src || document.body.classList.contains("mode-presenter")) return;
    f.src = f.dataset.src;
    f.addEventListener("load", () => {
      f.parentElement.classList.add("live");
      sendState(k);
      try { // forward deck keys pressed inside a figure (clickers send PgUp/PgDn)
        f.contentWindow.addEventListener("keydown", (e) => {
          const t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
          const arrows = /^Arrow/.test(e.key) && t && t.closest && t.closest(".iso-stage");
          if (typing || arrows) return;
          if (onKey(e)) e.preventDefault();
        });
      } catch {}
    }, { once: true });
  }
  function sendState(k) {
    const f = frameOf(k), sl = SL[k];
    if (!f || !sl.fig || !f.contentWindow) return;
    const st = sl.fig.steps[k === i ? s : 0];
    try { f.contentWindow.postMessage({ anatomy: "set", state: st }, "*"); } catch {}
  }
  addEventListener("message", (e) => {
    if (e.data && e.data.anatomy === "ready") slides.forEach((el, k) => { if (frameOf(k) && frameOf(k).contentWindow === e.source) sendState(k); });
  });

  // ---------- navigation ----------
  function render(fromRemote) {
    slides.forEach((el, k) => (el.hidden = k !== i));
    [i - 1, i, i + 1, i + 2].forEach((k) => k >= 0 && k < N && load(k));
    const dots = $$(".steps-dots i", slides[i]);
    dots.forEach((d, k) => d.classList.toggle("on", k <= s));
    sendState(i);
    $("#prog").style.width = `${((i + (s + 1) / stepsOf(i)) / N) * 100}%`;
    $("#count").textContent = `${i + 1} / ${N}`;
    const sl = SL[i];
    $("#n-meta").textContent = `${i + 1}/${N} · ${sl.section || "—"} · ~${sl.min} min${stepsOf(i) > 1 ? ` · step ${s + 1}/${stepsOf(i)}` : ""}`;
    $("#n-text").textContent = sl.notes;
    if (location.hash !== `#${i + 1}` && !document.body.classList.contains("mode-presenter")) history.replaceState(null, "", `#${i + 1}`);
    $$("#ov-list li[data-k]").forEach((li) => li.classList.toggle("cur", +li.dataset.k === i));
    if (!fromRemote && chan) chan.postMessage({ i, s });
    presenter();
    if (SL[i].type === "vote") drawQr();
  }
  function go(k, st = 0) { i = Math.max(0, Math.min(N - 1, k)); s = Math.max(0, Math.min(stepsOf(i) - 1, st)); render(); }
  function next() { if (s < stepsOf(i) - 1) { s++; render(); } else if (i < N - 1) go(i + 1, 0); }
  function prev() { if (s > 0) { s--; render(); } else if (i > 0) go(i - 1, stepsOf(i - 1) - 1); }

  // ---------- overlays ----------
  const toggle = (id, on) => { const el = $(id); el.hidden = on === undefined ? !el.hidden : !on; return !el.hidden; };
  const ov = $("#ov-list"); let last = null;
  SL.forEach((sl, k) => {
    if (sl.section && sl.section !== last) { const h = document.createElement("li"); h.className = "sec"; h.textContent = sl.section; ov.append(h); }
    last = sl.section;
    const li = document.createElement("li"); li.dataset.k = k;
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<span class="k">${String(k + 1).padStart(2, "0")}</span><span></span>`;
    b.lastChild.textContent = sl.title;
    b.addEventListener("click", () => { toggle("#overview", false); go(k, 0); });
    li.append(b); ov.append(li);
  });

  // ---------- keys ----------
  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return false;
    const k = e.key;
    if (["ArrowRight", "ArrowDown", " ", "PageDown", "Enter"].includes(k)) { next(); return true; }
    if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { prev(); return true; }
    if (k === "Home") { go(0); return true; }
    if (k === "End") { go(N - 1); return true; }
    if (k === "n" || k === "N") { toggle("#notes"); return true; }
    if (k === "o" || k === "O") { const on = toggle("#overview"); if (on) { const c = $("#ov-list li.cur button"); c && c.focus(); } return true; }
    if (k === "?") { toggle("#help"); return true; }
    if (k === "p" || k === "P") { openPresenter(); return true; }
    if (k === "f" || k === "F") { const el = document.documentElement; (document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen()).catch?.(() => {}); return true; }
    if (k === "Escape") { toggle("#overview", false); toggle("#help", false); toggle("#notes", false); return true; }
    if (SL[i].type === "vote" && (e.code === "Digit1" || e.code === "Digit2")) { hand(e.code === "Digit1" ? "own" : "rent", e.shiftKey ? -1 : 1); return true; }
    return false;
  }
  addEventListener("keydown", (e) => {
    if (document.body.classList.contains("mode-vote")) return;
    const t = e.target; if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (document.body.classList.contains("mode-presenter")) { if (presenterKey(e)) e.preventDefault(); return; }
    if (onKey(e)) e.preventDefault();
  });
  $("#b-next").addEventListener("click", next);
  $("#b-prev").addEventListener("click", prev);
  $("#b-help").addEventListener("click", () => toggle("#help"));
  $("#help").addEventListener("click", () => toggle("#help", false));
  $$(".fig").forEach((f) => f.addEventListener("pointerleave", () => { try { window.focus(); } catch {} }));

  // ---------- presenter view (same deck, second window, #presenter) ----------
  let t0 = Number(store.get("v5-t0")) || 0;
  function openPresenter() {
    const url = location.href.replace(/#.*$/, "") + "#presenter";
    let w = null; try { w = window.open(url, "ai-manifesto-presenter", "width=1100,height=760"); } catch {}
    if (!w) { toggle("#help", true); }
  }
  const plan = SL.reduce((a, sl, k) => (a.push((a[k - 1] || 0) + (k ? SL[k - 1].min : 0)), a), []);
  function presenter() {
    if (!document.body.classList.contains("mode-presenter")) return;
    const sl = SL[i];
    $("#p-now").textContent = `${i + 1}. ${sl.title}`;
    $("#p-step").textContent = `${sl.section || "—"}${stepsOf(i) > 1 ? ` · step ${s + 1} of ${stepsOf(i)}` : ""} · ~${sl.min} min`;
    $("#p-notes").textContent = sl.notes;
    $("#p-next").textContent = i < N - 1 ? `${i + 2}. ${SL[i + 1].title}` : "End";
  }
  function tick() {
    if (!document.body.classList.contains("mode-presenter")) return;
    if (!t0) { t0 = Date.now(); store.set("v5-t0", String(t0)); }
    const el = (Date.now() - t0) / 1000, m = Math.floor(el / 60), sec = Math.floor(el % 60);
    $("#p-clock").textContent = `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    const due = plan[i], diff = el / 60 - due;
    const pace = $("#p-pace");
    pace.textContent = `plan for this slide: ${due.toFixed(1)} min · ${diff > 0.5 ? `${diff.toFixed(1)} min behind` : diff < -0.5 ? `${(-diff).toFixed(1)} min ahead` : "on pace"} · ends at 30:00`;
    pace.classList.toggle("late", diff > 1);
  }
  function presenterKey(e) {
    if (["ArrowRight", " ", "PageDown", "Enter"].includes(e.key)) { next(); return true; }
    if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { prev(); return true; }
    return false;
  }
  $("#p-reset").addEventListener("click", () => { t0 = Date.now(); store.set("v5-t0", String(t0)); tick(); });
  $("#p-prev").addEventListener("click", prev);
  $("#p-next-b").addEventListener("click", next);
  if (chan) chan.onmessage = (e) => { const d = e.data || {}; if (Number.isInteger(d.i)) { i = d.i; s = d.s || 0; render(true); } if (d.vote) applyTally(d.vote); };

  // ---------- the vote ----------
  const counts = { own: 0, rent: 0 }, hands = { own: 0, rent: 0 };
  let dbCount = { own: 0, rent: 0 };
  try { const h = JSON.parse(store.get("v5-hands") || "null"); if (h) Object.assign(hands, h); } catch {}
  function applyTally(c) {
    Object.assign(counts, c);
    const total = counts.own + counts.rent || 1;
    ["own", "rent"].forEach((o) => {
      $$(`[data-count="${o}"]`).forEach((el) => (el.textContent = counts[o]));
      $$(`[data-bar="${o}"]`).forEach((el) => (el.style.width = `${(counts[o] / total) * 100}%`));
    });
    const sum = counts.own + counts.rent;
    $$("[data-tally]").forEach((el) => (el.textContent = sum ? `This room: ${counts.own} own the boundary · ${counts.rent} keep renting` : ""));
  }
  function recount(remote) { applyTally({ own: dbCount.own + hands.own, rent: dbCount.rent + hands.rent }); if (!remote && chan) chan.postMessage({ vote: counts }); }
  function hand(o, d) { hands[o] = Math.max(0, hands[o] + d); store.set("v5-hands", JSON.stringify(hands)); recount(); }
  let qrDone = false;
  function drawQr() {
    const url = D.voteUrl;
    $$("[data-vote-url]").forEach((el) => (el.textContent = url ? url.replace(/^https?:\/\//, "") : "Publish the deck to get a vote link."));
    if (qrDone || !url || !window.QRCode) return;
    try { new QRCode($("#qr"), { text: url, width: 348, height: 348, colorDark: "#1b1b19", colorLight: "#f4f4ef", correctLevel: QRCode.CorrectLevel.M }); qrDone = true; } catch {}
  }
  const useCap = (name) => (window.claude && typeof window.claude.use === "function" ? window.claude.use(name) : Promise.resolve(null));
  async function liveTally() {
    const db = await useCap("db");
    const status = (t) => $$("[data-vote-status]").forEach((el) => (el.textContent = t));
    if (!db) { status("Show of hands works too: press 1 or 2 to count them."); return; }
    status("Live: votes arrive as people tap.");
    db.collection("votes").onSnapshot((snap) => {
      const c = { own: 0, rent: 0 };
      snap.docs.forEach((d) => { const v = d.data(); if (v && (v.choice === "own" || v.choice === "rent")) c[v.choice]++; });
      dbCount = c; recount();
    }, () => status("The live count paused. Hands still count: press 1 or 2."));
  }

  // audience page: #vote
  async function votePage() {
    document.body.classList.add("mode-vote");
    toggle("#votepage", true);
    const st = $("#vp-status"), btns = $$("[data-vote]");
    const [db, user] = await Promise.all([useCap("db"), useCap("user")]);
    const id = user ? await user.id() : null;
    if (!db || !id) { st.textContent = "Voting needs you signed in to claude.ai with access to this deck. If you can't, raise your hand instead."; btns.forEach((b) => (b.disabled = true)); return; }
    const mine = db.doc(`votes/${id}`);
    try { const snap = await mine.get(); const v = snap.exists && snap.data(); if (v && v.choice) { btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vote === v.choice))); st.textContent = "Your vote is in. Tap the other one to change it."; } } catch {}
    let busy = false;
    btns.forEach((b) => b.addEventListener("click", async () => {
      if (busy) return; busy = true;
      try {
        await mine.set({ choice: b.dataset.vote, at: new Date().toISOString() });
        btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        st.textContent = `Counted: ${$("b", b).textContent}. Watch the screen. Tap the other one to change your vote.`;
      } catch (err) { st.textContent = "That vote didn't go through. You may only have view access; raise your hand instead."; }
      busy = false;
    }));
  }

  // ---------- boot ----------
  const hash = location.hash.slice(1);
  if (hash === "vote") { votePage(); return; }
  if (hash === "presenter") { document.body.classList.add("mode-presenter"); toggle("#presenter", true); setInterval(tick, 1000); tick(); }
  const start = Number(hash);
  if (Number.isInteger(start) && start >= 1 && start <= N) i = start - 1;
  else { const saved = Number(store.get("v5-slide")); if (hash !== "presenter" && saved >= 1 && saved <= N) i = saved - 1; }
  addEventListener("beforeunload", () => store.set("v5-slide", String(i + 1)));
  recount(true);
  render();
  liveTally();
})();
