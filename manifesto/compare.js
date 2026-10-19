(() => {
  const MODES = { "3": "v-3", "52": "v-52", cmp: "v-cmp" };
  const q = new URLSearchParams(location.search);
  let mode = MODES[q.get("v")] ? q.get("v") : "cmp";
  const btns = [...document.querySelectorAll(".modebar button")];
  function setMode(m, push) {
    mode = m;
    document.body.classList.remove(...Object.values(MODES));
    document.body.classList.add(MODES[m]);
    btns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    if (push) { const u = new URL(location.href); u.searchParams.set("v", m); history.replaceState(null, "", u); }
    dispatchEvent(new Event("resize"));
  }
  btns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode, true)));
  setMode(mode, false);

  document.querySelectorAll(".figpair.tabs").forEach(fp => {
    const bs = fp.querySelectorAll(".fptabs button");
    bs.forEach(b => b.addEventListener("click", () => {
      fp.dataset.show = b.dataset.fp;
      bs.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      dispatchEvent(new Event("resize"));
    }));
  });

  // On a phone, put each figure's readout under the drawing instead of beside it.
  if (innerWidth < 700) document.querySelectorAll('iframe[data-slot]').forEach(f => {
    if (f.src.includes("board=side")) f.src = f.src.replace("board=side", "board=1");
  });

  // Drive the V5.2 figures from the scrolling steps the V3.1 figures already use.
  const want = new Map();  // iframe -> state
  const send = (f, st) => { want.set(f, st); try { f.contentWindow.postMessage({ anatomy: "set", state: st }, "*"); } catch (e) {} };
  addEventListener("message", e => {
    if (!e.data || e.data.anatomy !== "ready") return;
    for (const [f, st] of want) if (f.contentWindow === e.source) send(f, st);
  });
  const MAP = [["data-step", "loop", n => n - 1], ["data-rstep", "rfp", n => n - 1], ["data-dstep", "natives", n => n]];
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    for (const [attr, slot, f] of MAP) {
      if (!el.hasAttribute(attr)) continue;
      const box = el.closest(".scrolly");
      const frame = box && box.querySelector(`iframe[data-slot="${slot}"]`);
      if (frame) send(frame, f(Number(el.getAttribute(attr))));
    }
  }), { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll(".step[data-step], .step[data-rstep], .step[data-dstep]").forEach(s => io.observe(s));
})();
