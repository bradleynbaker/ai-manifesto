#!/usr/bin/env python3
"""Build manifesto/index.html: the V3.1 Broadsheet manifesto with a V5.2 layer on top, so one page shows either
edition or both side by side.

  python3 manifesto/build.py

V3.1 is v3/index.html, untouched in substance. V5.2 swaps each hand-drawn figure for the interactive Anatomy figure
the talk uses (v5.2/g/figures), brings the numbers to October 2026, tells the RFP from the writer's side, and adds
"Owning the box makes people better at AI". In the page, everything V3.1-only carries class o3 and everything
V5.2-only carries n52; body.v-3 / body.v-52 / body.v-cmp pick what shows. In compare mode, struck red is V3.1 and
highlighted is V5.2, and figures sit side by side (or behind a V3.1 / V5.2 tab inside the scrolling figures).
"""
import re, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "v3/index.html").read_text()
s = src

def once(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"expected 1 match, found {n}: {old[:90]!r}"
    s = s.replace(old, new)

def diff(old, new):  # inline text change
    return f'<del class="o3">{old}</del><ins class="n52">{new}</ins>'

FIG = "../v5.2/g/figures"

def anat(slot, title, aspect, board="0", still=None):
    q = f"embed=1&board={board}" + (f"&still=1&state={still}" if still is not None else "")
    return (f'<div class="frame anat b-{board}" style="aspect-ratio:{aspect}"><iframe loading="lazy" title="{html.escape(title)}" '
            f'data-slot="{slot}" src="{FIG}/{slot}/{slot}.html?{q}"></iframe></div>')

def swap_figure(fig_id, new_frame, new_caption, tabs=False):
    """Wrap a figure's original frame + caption as V3.1 and add the V5.2 frame + caption."""
    global s
    m = re.search(r'<figure[^>]*\bid="%s"[^>]*>' % re.escape(fig_id), s)
    assert m, fig_id
    start = m.end()
    fstart = s.index('<div class="frame', start)
    cstart = s.index("<figcaption", fstart)
    cend = s.index("</figcaption>", cstart) + len("</figcaption>")
    old_frame, old_cap = s[fstart:cstart], s[cstart:cend]
    old_cap_inner = re.sub(r"^<figcaption>|</figcaption>$", "", old_cap)
    pair = (f'<div class="figpair{" tabs" if tabs else ""}">'
            f'<div class="fptabs" role="group" aria-label="Edition"><button type="button" data-fp="3">V3.1</button><button type="button" data-fp="52" aria-pressed="true">V5.2</button></div>'
            f'<div class="fp o3"><span class="fptag">V3.1</span>{old_frame}</div>'
            f'<div class="fp n52"><span class="fptag">V5.2</span>{new_frame}</div></div>'
            f'<figcaption><span class="o3">{old_cap_inner}</span><span class="n52">{new_caption}</span></figcaption>')
    s = s[:fstart] + pair + s[cend:]

def fignum(n):
    return f'<span class="fig">Figure {n}</span>'

# ---------------------------------------------------------------- head, mode bar, masthead
once("<title>An AI Manifesto</title>", "<title>An AI Manifesto · V3.1 and V5.2</title>")
once("</head>", '<link rel="stylesheet" href="compare.css">\n</head>')
once('<div class="topprog" id="topprog" aria-hidden="true"></div>',
     '<div class="topprog" id="topprog" aria-hidden="true"></div>\n'
     '<div class="modebar" role="group" aria-label="Edition"><span>Edition</span>'
     '<button type="button" data-mode="3">V3.1 · Sept</button><button type="button" data-mode="52">V5.2 · Oct</button>'
     '<button type="button" data-mode="cmp">Compare</button></div>')
once('<span class="eyebrow">Wednesday, September 2, 2026 · V3.1.0</span>',
     '<span class="eyebrow">' + diff("Wednesday, September 2, 2026 · V3.1.0", "Monday, October 19, 2026 · V5.2") + "</span>")

# ---------------------------------------------------------------- what changed (shown in V5.2 and compare)
once("<article>", """<div class="wrap n52"><aside class="changes">
  <h2>What changed from V3.1 to V5.2</h2>
  <ul>
    <li><b>New figures.</b> Eleven hand-drawn sketches and charts are now interactive machines: the loop, the meter, the steelyard, the loom, the two doors, the spike press, the ladder, the RFP sorter, one in a thousand, one token at four prices, and the chain of command. Move across any of them to run it.</li>
    <li><b>October numbers.</b> Model scores from Artificial Analysis as of October 18, 2026: the frontier at 58, the best US open-weight model at 39.</li>
    <li><b>The $1 era ended.</b> Government AI went on a per-token meter on October 1.</li>
    <li><b>The RFP, from the writer's side.</b> Use AI on your own machines to write the requirements you actually want, from your timeline and budget.</li>
    <li><b>New: owning the box makes people better at AI.</b> Token efficiency, smaller models and fine-tuning, and why that skill stays with the agency.</li>
  </ul>
  <p class="cmpkey"><span class="o3k">struck = V3.1</span> <span class="n52k">highlighted = V5.2</span> in Compare.</p>
</aside></div>
<article>""")

# ---------------------------------------------------------------- hero stat: the $1 countdown
once('<div class="stat rv"><div class="eyebrow" style="margin-bottom:6px">[ ONEGOV EXPIRY ]</div>',
     '<div class="stat rv n52"><div class="eyebrow" style="margin-bottom:6px">[ THE $1 ERA ]</div><div class="n amber sm">Oct 1</div>'
     '<div class="l">the day government AI went on a per-token meter. Claude\'s $1 extension ends October 31.</div></div>'
     '<div class="stat rv o3"><div class="eyebrow" style="margin-bottom:6px">[ ONEGOV EXPIRY ]</div>')

# ---------------------------------------------------------------- figures
swap_figure("loopwrap", anat("loop", "The leak loop", "16 / 9.4", board="side", still=0),
    fignum(1) + "The leak loop as a machine. Scroll the steps and the stations light in order: usage explodes, the meter arrives, the cap, the side door, training, the roadmap, the spike. Station eight is the only one your leadership controls; owned capacity throws the switch at step three.", tabs=True)
swap_figure("meterfig", anat("token-meter", "The token meter", "16 / 11", board="1"),
    fignum(2) + "The token meter, log scale. Tokens a month grew a millionfold from 2019 to 2026 while the frontier price fell sixteenfold ($60 to $3.85), so the bill went up 64,000 times. Type your own monthly tokens into the box. (Altman on stage, June 2026; 2020 API launch pricing; Artificial Analysis.)")
swap_figure("budgetfig", anat("scale", "The spend steelyard", "16 / 9"),
    fignum("2B") + "What the best spend per person per year, on a log beam: the median US business at $137, the top 1% at $89,000, and Jensen Huang's bar of $250,000 for a $500,000 engineer. (Ramp AI Index, June 2026.)")
swap_figure("radarfig", anat("loom", "Could vs does", "16 / 8.2", board="side"),
    fignum("2C") + "Could vs. does, as a loom: models could do 94% of the tasks in computer and math jobs and are seen doing 33%. What holds the threads back is a clamp, a coin box and a padlock: permission, plumbing and the meter. (Massenkoff &amp; McCrory, Anthropic, March 2026.)")
swap_figure("doorfig", anat("doors", "The two doors", "16 / 9"),
    fignum(3) + "Two doors. The front door is the contract: metered and not trained on. Cap it and the work backs up, then leaves by the side door on personal accounts, where training is a user setting with five years of retention. (PagerDuty, June 2026; lab consumer terms.)")
swap_figure("spikefig", anat("spikes", "The capability spikes", "16 / 8.6"),
    fignum(4) + "The spike press. Each shipped product lands where the usage map is densest: image generation, software, security, finance, legal. The two glass planes are October 2026 scores: the best US open-weight model at 39, which you can run on your own hardware, and the frontier at 58, metered. Spike heights are illustrative.")

MODELS = [("Opus 5.5", "Anthropic · frontier, metered", 58, 2.94, 98, False),
          ("Opus 4.8", "Anthropic · the frontier in May", 42, 3.85, 65, False),
          ("Muse Spark Open", "Meta · best US open weights", 39, 0.78, 131, True),
          ("Nemotron 3.5 Super", "NVIDIA · permissive license · 120B", 26, 0.14, 388, False)]
mx = [max(m[i] for m in MODELS) for i in (2, 3, 4)]
rows = "".join(
    f'<div class="mr{" hot" if hot else ""}"><div class="mn"><b>{n}</b><span>{t}</span></div>'
    + "".join(f'<div class="mc"><i style="width:{v / mx[k] * 78:.1f}%"></i><b>{f}</b></div>'
              for k, (v, f) in enumerate([(a, str(a)), (p, f"${p:.2f}"), (sp, str(sp))]))
    + "</div>" for n, t, a, p, sp, hot in MODELS)
models_html = (f'<div class="frame anat models52"><div class="mh"><span></span><span>Intelligence index</span><span>$ per million tokens</span>'
               f'<span>Tokens per second</span></div>{rows}<p class="mline">US open weights now sit three points behind Opus 4.8 at a fifth of the price, and they run inside your boundary.</p></div>')
swap_figure("circlefig", models_html,
    fignum("4B") + "US-built models only, on Artificial Analysis's Intelligence Index v4.3.2, read October 18, 2026 (blended $/M at 7:2:1; first-party speed). Most benchmarks are gamed; use them for the shape of the market and your own evaluations to decide what to buy.")
swap_figure("ladderfig", anat("ladder", "The sovereign ladder", "16 / 9.5"),
    fignum(5) + "The ladder: three rungs you own (device, workgroup, core) and one metered gate to the frontier, with sensitive context removed on the way out. Volume on the rungs has no cap; escalation is earned.")
swap_figure("rfpfig", anat("rfp", "Writing the RFP with AI", "16 / 8.4", board="side", still=0),
    fignum(7) + "The RFP, from the writer's side. Requirements, evaluation, security and schedule are drafted inside from documents you already have. Market research and pricing go out through the gate with the solicitation number, budget and evaluation plan removed. A person makes the decisions.", tabs=True)
swap_figure("dotfig", anat("natives", "One in a thousand", "16 / 9", still=1),
    fignum(8) + "One in a thousand. Two people on a floor of a thousand build agents and use more tokens than everyone else combined; three months later the people around them have caught it, and every red stack is on the meter. (Illustrative; the 1-in-1,000 count is a field observation.)", tabs=True)
swap_figure("tcofig", anat("vending", "One token, four prices", "16 / 8.4", board="side"),
    fignum(9) + "One million tokens of the same open model, bought four ways: cloud GPU $0.97, frontier API about $12, a wrapped federal LLM up to $45, and owned capacity, whose price depends on use: $1.71 at 3 hours a day, cloud parity at 5.3, $0.43 at 12. (Lenovo 2026 TCO, vendor study.)")

# ---------------------------------------------------------------- the RFP text, from the writer's side
once("Here's what that looks like on a Tuesday. Someone uploads an RFP asking for pricing, a technical response, business capabilities, and logistics, and asks what to do first. The router breaks it apart and hands each piece to an agent running a model that's excellent at exactly that job. Corporate capabilities and standard content get answered inside the boundary, easily. The hard questions — should we partner because we lack a capability, what's the risk, what's the upside — go out as filtered queries. The world sees a capability search. Only the boundary knows there's an RFP, a deadline, and a bid. The options come back and a human decides.",
     '<span class="o3">Here\'s what that looks like on a Tuesday. Someone uploads an RFP asking for pricing, a technical response, business capabilities, and logistics, and asks what to do first. The router breaks it apart and hands each piece to an agent running a model that\'s excellent at exactly that job. Corporate capabilities and standard content get answered inside the boundary, easily. The hard questions — should we partner because we lack a capability, what\'s the risk, what\'s the upside — go out as filtered queries. The world sees a capability search. Only the boundary knows there\'s an RFP, a deadline, and a bid. The options come back and a human decides.</span>'
     '<span class="n52">Here\'s what that looks like on a Tuesday, for the people who write the solicitations. Use AI on your own machines to write the RFP for this capacity. Give it your timeline and a budget to work from, for example four million dollars with five years of support, running before the end of the fiscal year, and ask what that buys and what the requirements have to say so you get it on time. The router splits the work. Requirements, evaluation criteria, security clauses and the schedule come from documents you already have, so agents on your own rungs draft them and nothing leaves. Market research on who can deliver by your date, and current pricing, need the outside world. Those go out through the gate with the solicitation number, the budget and the evaluation plan removed, because source selection plans and technical evaluation plans are source selection information under the FAR. The world sees a capability question. A person makes the decisions.</span>')
once('<b>The router breaks the RFP apart</b>Pricing, technical response, corporate capabilities, logistics — four pieces settle onto your own rungs and get answered inside the boundary. Nothing about them ever leaves.',
     '<b>' + diff("The router breaks the RFP apart", "The router splits the work") + '</b>' + diff("Pricing, technical response, corporate capabilities, logistics — four pieces settle onto your own rungs and get answered inside the boundary. Nothing about them ever leaves.", "Requirements, evaluation criteria, security and schedule come from documents you already have. Agents on your own rungs draft them, and nothing leaves."))
once('<b>Two hard questions head for the gate</b>Partnering and risk need the outside world. Watch what the gate does before they cross: the RFP number, the deadline, the bid — stripped, logged, policy-checked.',
     '<b>' + diff("Two hard questions head for the gate", "Two parts need outside information") + '</b>' + diff("Partnering and risk need the outside world. Watch what the gate does before they cross: the RFP number, the deadline, the bid — stripped, logged, policy-checked.", "Market research and pricing go out through the gate with the solicitation number, the budget and the evaluation plan removed, and the request is logged."))
once('<b>The world sees a capability search</b>The frontier answers a generic question, options come back inside, and a human makes the call. Only the boundary ever knew there was a bid.',
     '<b>The world sees a capability search</b>' + diff("The frontier answers a generic question, options come back inside, and a human makes the call. Only the boundary ever knew there was a bid.", "The outside model answers a general question, the answers come back inside, and you make the decisions. Then ask for the estimate: the site, or us."))

# ---------------------------------------------------------------- new section: owning the box makes people better at AI
NEW_SECTION = """
  <div class="n52 newblock">
  <h3 class="rv">Owning the box makes people better at AI</h3>
  <div class="row">
    <div class="prose">
      <p class="rv">There's a second return on owned capacity that a cost-per-token chart doesn't show: people get better at using it. On a rented meter the habit is to send everything to the biggest model and hope. On a box they own, people see what each request costs in time and power, so they learn to write tighter prompts, reuse what they've cached, and send each job to the smallest model that does it well. The same work takes fewer tokens every month.</p>
      <p class="rv">Those smaller models have never been better. The best US open-weight model sits three points behind last spring's frontier at a fifth of the price, and efficient models like Nemotron run at hundreds of tokens a second on a single machine. They handle most routine work, and they leave the frontier for the questions that need it.</p>
      <p class="rv">Then comes the step a meter never allows: fine-tuning. People who own their capacity can train a small model on their own work, their documents, their formats and their judgment, and it gets better at their job every month. An analyst who tunes a model on a year of their own reporting has a tool no vendor can sell them.</p>
      <p class="rv">All of it stays with the agency. The prompts, the routing rules, the tuned models and the know-how compound inside the boundary, and they get cheaper and better over time. Tokens rented from the largest systems buy an answer. Capacity you own builds a capability, and the people who build it become the ones everyone else learns from.</p>
    </div>
    <aside class="note rv"><b>Three habits a meter never teaches.</b> Token efficiency: tighter prompts, caching, routing. Right-sizing: the smallest model that does the job. Fine-tuning: a model trained on your own work. Each one compounds, and each one stays with you.</aside>
  </div>
  <figure class="rv" id="craftfig">
    <div class="frame anat craft">CRAFT_SVG</div>
    <figcaption><span class="fig">Figure 9B</span>Renting tokens buys answers; owning capacity builds a craft. On owned capacity the same task takes fewer tokens as people learn, smaller and tuned models take over the routine work, and what they learn stays inside the boundary. (Illustrative.)</figcaption>
  </figure>
  </div>
"""
craft_svg = """<svg viewBox="0 0 1000 400" role="img" aria-label="Two lanes. Rented: every request goes to the biggest model on a meter, and what is learned stays with the lab. Owned: requests go through a router to small and fine-tuned models on your own hardware, people get more efficient, the tuned model improves, and what is learned stays with the agency." font-family="IBM Plex Sans, system-ui, sans-serif">
  <rect width="1000" height="400" fill="#f4f4ef"/>
  <text x="24" y="34" font-size="13" font-weight="700" fill="#d8373f" letter-spacing=".08em">RENTED TOKENS</text>
  <g font-size="13" fill="#1b1b19">
    <rect x="24" y="52" width="150" height="54" fill="#fff" stroke="#c4c4bc"/><text x="99" y="84" text-anchor="middle">every request</text>
    <path d="M178 79h76" stroke="#1b1b19" stroke-width="2"/><path d="M254 79l-9-5v10z" fill="#1b1b19"/>
    <rect x="260" y="44" width="210" height="70" fill="#1b1b19"/><text x="365" y="75" text-anchor="middle" fill="#fff" font-weight="700">the biggest model</text><text x="365" y="95" text-anchor="middle" fill="#ebebe5" font-size="12">on someone else's meter</text>
    <path d="M474 79h76" stroke="#1b1b19" stroke-width="2"/><path d="M550 79l-9-5v10z" fill="#1b1b19"/>
    <rect x="556" y="52" width="130" height="54" fill="#fff" stroke="#c4c4bc"/><text x="621" y="84" text-anchor="middle">an answer</text>
    <path d="M365 118v34" stroke="#d8373f" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="380" y="146" fill="#d8373f" font-size="12.5">what's learned stays with the lab</text>
  </g>
  <g transform="translate(720 44)">
    <text x="0" y="12" font-size="12" fill="#6a6a63">tokens per task, month by month</text>
    <g fill="#d8373f">${RENT_BARS}</g>
  </g>
  <line x1="24" y1="186" x2="976" y2="186" stroke="#c4c4bc"/>
  <text x="24" y="222" font-size="13" font-weight="700" fill="#1b1b19" letter-spacing=".08em">OWNED CAPACITY</text>
  <g font-size="13" fill="#1b1b19">
    <rect x="24" y="240" width="150" height="54" fill="#fff" stroke="#c4c4bc"/><text x="99" y="263" text-anchor="middle">every request</text><text x="99" y="281" text-anchor="middle" font-size="11.5" fill="#6a6a63">tighter, cached</text>
    <path d="M178 267h46" stroke="#1b1b19" stroke-width="2"/><path d="M224 267l-9-5v10z" fill="#1b1b19"/>
    <rect x="230" y="240" width="96" height="54" fill="#fff" stroke="#1b1b19"/><text x="278" y="272" text-anchor="middle" font-weight="600">router</text>
    <path d="M330 255l50-18M330 279l50 18" stroke="#1b1b19" stroke-width="2"/>
    <rect x="384" y="216" width="172" height="40" fill="#1b1b19"/><text x="470" y="241" text-anchor="middle" fill="#fff" font-weight="600">small open model</text>
    <rect x="384" y="278" width="172" height="40" fill="#1b1b19"/><text x="470" y="303" text-anchor="middle" fill="#fff" font-weight="600">model tuned on our work</text>
    <path d="M560 236h52M560 298h52" stroke="#1b1b19" stroke-width="2"/><path d="M612 236l-9-5v10zM612 298l-9-5v10z" fill="#1b1b19"/>
    <rect x="618" y="246" width="96" height="44" fill="#fff" stroke="#c4c4bc"/><text x="666" y="273" text-anchor="middle">better work</text>
    <path d="M666 294v44H470v-16" fill="none" stroke="#d8373f" stroke-width="2"/><path d="M470 322l-5 9h10z" fill="#d8373f"/>
    <text x="490" y="356" fill="#d8373f" font-size="12.5">fine-tune on what worked · what's learned stays with the agency</text>
  </g>
  <g transform="translate(740 232)">
    <text x="0" y="12" font-size="12" fill="#6a6a63">tokens per task, month by month</text>
    <g fill="#1b1b19">${OWN_BARS}</g>
  </g>
  <text x="24" y="390" font-size="11" fill="#6a6a63">Illustrative. The habits: write tighter prompts, cache, route to the smallest model that works, fine-tune on your own work.</text>
</svg>"""
bar = lambda vals, x0: "".join(f'<rect x="{x0 + i * 20}" y="{110 - v}" width="14" height="{v}"/>' for i, v in enumerate(vals))
craft_svg = craft_svg.replace("${RENT_BARS}", bar([86, 88, 87, 90, 89, 91, 90, 92, 91, 93, 92, 94], 0))
craft_svg = craft_svg.replace("${OWN_BARS}", bar([86, 70, 58, 50, 44, 39, 35, 32, 29, 27, 25, 24], 0))
NEW_SECTION = NEW_SECTION.replace("CRAFT_SVG", craft_svg)
once("""  <div class="row">
    <div class="prose">
      <p class="rv">If you don't enable your natives, they'll go somewhere that will""",
     NEW_SECTION + """  <div class="row">
    <div class="prose">
      <p class="rv">If you don't enable your natives, they'll go somewhere that will""")

# ---------------------------------------------------------------- the close: one sentence per office, and the date
once('<p class="rv d3 rolenote">',
     """<figure class="rv n52" id="tubesfig">""" + anat("tubes", "One sentence per office", "16 / 8.6") +
     """<figcaption><span class="fig">Figure 12B</span>Selling it up the chain: each office gets one sentence it can sign. The CFO: capacity is a fixed obligation, and a meter is not. The CIO: apply the IT rules you already have to models. The agency head: our decision-making data is either our asset or someone else's training data.</figcaption></figure>
  <p class="rv d3 rolenote">""")
once("The dollar expires September 30. The renewal is per-user, tiered, and — by the vendors' own statements — not a dollar;",
     diff("The dollar expires September 30. The renewal is per-user, tiered, and — by the vendors' own statements — not a dollar;",
          "The dollar ended September 30, and on October 1 government AI went on a per-token meter. Claude's extension ends October 31, the continuing resolution runs to December 11, and FY27 renewals are being written now. The renewal is not a dollar;"))

# ---------------------------------------------------------------- script
once("</body>", '<script src="compare.js"></script>\n</body>')
(ROOT / "manifesto/index.html").write_text(s)
print("manifesto/index.html", round(len(s) / 1024), "KB")
