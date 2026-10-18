// V5.1 · the talk, for the AI natives. Two editions from one source: G (government) and C (commercial).
// The audience is the one in a thousand: the people who already build with AI and burn the most tokens.
// They have to sell up the chain. Every slide either arms them with a fact or hands them a sentence.
// Rules: action titles (~15 words), one message per slide, answer first, concrete before abstract,
// gray first and one red thing, dense detail in the notes. min = minutes on the clock (sums to 30).
import { MODELS } from "./variants.mjs";

const M = MODELS;
const pick = (v, g, c) => (v === "G" ? g : c);

export function talk(v) {
  return {
    title: "An AI Manifesto",
    thesis: "Intent is the new oil. Capping tokens is the leak.",
    speaker: "Brad Baker",
    edition: pick(v, "V5.1.1G · government", "V5.1C · commercial"),
    version: pick(v, "5.1.1G", "5.1C"),
    minutes: 30,
  };
}

export function slides(v) {
  const G = v === "G";
  const exec = pick(v, "agency head", "CEO");
  const S = [];

  // ───────────────────────────── open ─────────────────────────────
  S.push({
    id: "cover", type: "cover", section: "", min: 0.5,
    title: "Intent is the new oil. Capping tokens is the leak.",
    kicker: pick(v, "For the government's AI natives", "For the one in a thousand"),
    meta: ["Brad Baker", "30 minutes", "one vote"],
    art: "loop",
    notes: pick(v,
      `This talk is for you — the people in the agency who already build with AI. Not the ones who attended the training. The ones who stayed late wiring an agent to a harness because the procurement queue was eighteen months long. You see something your leadership doesn't. My job in the next thirty minutes is to hand you the facts and the exact sentences to carry upstairs, so you come back with capacity instead of a cap. At the end, you vote.`,
      `This talk is for you — the one in a thousand. The people who build with AI, not the ones who were issued a seat. You see something your leadership doesn't. My job in the next thirty minutes is to hand you the facts and the exact sentences to carry upstairs, so you come back with capacity instead of a cap. At the end, you vote.`),
  });

  if (G) {
    S.push({
      id: "onegov", type: "flow", section: "The problem", min: 1,
      title: "The $1 era is over. On October 1, government AI went on a meter.",
      steps: ["$1 deals, Aug 2025", "3.5M employees onboarded", "Sept 30: the $1 ends", "Oct 1: pay per token, half off, to 2028"],
      example: { n: "Oct 31", l: "Claude's $1 extension runs out. Gemini renews “at a per user price,” price unnamed. FY27 renewals are being written now." },
      source: "GSA OneGov; FedScoop, 10 & 17 Sep 2026 (OpenAI successor deal; Anthropic extension); Gemini offer terms as reported.",
      notes: `Start with the thing you already felt. In August last year every major lab sold the government AI for a dollar. Three and a half million federal employees got access. On September thirtieth the dollar ended. OpenAI's successor deal runs to 2028: no seat fee, half-off tokens, pay for what you use. That sounds generous until you read it as a CFO: it's a meter, wired to how hard your best people work. Anthropic's dollar runs to October thirty-first. Google says renewal is per user, price unnamed. This is hook-then-meter on the largest workforce in the country, on a published date. And you're the reason the meter will spin.`,
    });
  } else {
    S.push({
      id: "q1", type: "quote", section: "The problem", min: 1,
      title: "“My company spent my entire 2026 budget in Q1. Can you make this more efficient?”",
      cite: "A client complaint Sam Altman quoted on stage, June 2026. He called token costs “a huge issue” that “never came up” six months earlier.",
      notes: `This isn't me. This is the vendor's own CEO, on stage in June, quoting a customer. Six months earlier nobody asked this question. Now it's the question. And look around: the reason that budget went in Q1 is in this room. It's you. Hands up if you've been asked to "be more efficient" with tokens this year. [pause] Keep it up if the answer upstairs was a cap. That's who I'm talking to. Altman's answer is efficiency. Mine is ownership.`,
    });
  }

  S.push({
    id: "you", type: "fig", layout: "side", section: "You", min: 1,
    title: "You're the one in a thousand. That's why the people who sign can't see what you see.",
    fig: { slot: "natives", steps: [1, 2], board: false },
    stats: [
      { n: "1 in 1,000", l: "people actually building their own agents on a harness: you", accent: true },
      { n: "> 998", l: "you burn more tokens than everyone else in the building combined" },
      { n: "3 months", l: "until the people next to you are doing it too, on the same meter" },
    ],
    source: "1-in-1,000: Brad's field observation of people building their own agents. Spread illustrative.",
    notes: `Here's the floor of your ${G ? "agency" : "company"}. A thousand people. Two of them are building agents on a harness and burning more tokens than the other nine hundred and ninety-eight combined. That's you. Surveys will tell your leadership that forty percent of large organizations are "scaling agents" — that counts deployments, not builders. The builders are one in a thousand. [advance] And three months later, the people sitting next to you have caught it. Demo by demo, team by team. Every red stack is on the meter. That's the curve your ${G ? "comptroller" : "CFO"} is about to see, and they'll reach for the only tool they have: a cap. This talk is how you get there first.`,
  });

  S.push({
    id: "ask", type: "ask", section: "The answer first", min: 1,
    title: "Your ask upstairs: owned capacity for the people who burn the most, not more seats.",
    cols: [
      { k: "The meter", v: "Demand outruns price. The bill detonates in the quarters you're winning." },
      { k: "The leak", v: "Cap you, and you route around them — through a door the contract doesn't cover." },
      { k: "The ladder", v: "Three rungs you own, one gate you rent. Volume uncapped; judgment escalates." },
    ],
    lead: { k: "Your kit", v: "Three sentences, two numbers, one ask. You leave with all of them." },
    notes: `Answer first, so you can check my working. The ask you carry upstairs: fund owned capacity for the people who burn the most — you — instead of buying more seats and capping them. Three things get you there. The meter: demand is outrunning price, and that's a finance problem. The leak: when they cap you, the work doesn't stop; it goes somewhere they can't see. The ladder: the architecture that fixes both. Then I'll give you the three sentences for your ${G ? "CFO, your CIO and your agency head" : "CFO, CIO and CEO"}, and the two numbers that turn a talk into a purchase order.`,
  });

  // ───────────────────────────── the meter ─────────────────────────────
  S.push({
    id: "meter", type: "fig", layout: "side", section: "1 · The meter", min: 1.5,
    title: "Token demand rose a millionfold; the price fell sixteenfold. The bill is the problem.",
    fig: { slot: "token-meter", steps: [0, 7], board: "under" },
    stats: [
      { n: "×1,000,000", l: "top customer's tokens a month, 2019 → 2026 (100K → 100B)" },
      { n: "÷16", l: "frontier list price per million tokens ($60 → $3.85)" },
      { n: "×64,000", l: "the monthly bill", accent: true },
    ],
    source: "Altman on stage, June 2026 (volume); 2020 API launch pricing and Artificial Analysis (price); log-interpolated.",
    notes: `This is the first thing you show upstairs. The needle is tokens a month on a log dial, one big tick for every ten times. 2019 to 2026. [advance] A millionfold. The tariff carriage — price per million — barely moves: sixty dollars to three eighty-five. Everyone tells leadership tokens are getting cheaper, and yesterday's capability is. But the price of the best model stays in the same band, and usage grows faster than prices fall. The bill went up sixty-four thousand times. Type your own monthly burn into the box before your meeting. That number is your opening line.`,
  });

  S.push({
    id: "team", type: "big", section: "1 · The meter", min: 1,
    title: "One three-person team burned 603 billion tokens in a month.",
    big: "$1.3M",
    under: "one month · ~100 coding agents · 7.6M requests",
    aside: "That's what you look like at full speed. Make them budget for it, instead of discovering it.",
    source: "OpenClaw creator Peter Steinberger's published monthly bill (Tom's Hardware).",
    notes: `Here's the other end of the meter. Three people, about a hundred coding agents, six hundred and three billion tokens, one point three million dollars, one month. Upstairs, that's a horror story. In here, it's a picture of you without the cap. Your job is to make sure leadership sees this number in a plan you wrote, not on an invoice they didn't expect.`,
  });

  S.push(G ? {
    id: "ration", type: "flow", section: "1 · The meter", min: 1,
    title: "One agency went from zero to 19,000 users in 45 days. Then it rationed them.",
    steps: ["Turned it on", "19,000 users in 45 days", "Per-token bill", "Ration the users"],
    example: { n: "45 days", l: "from launch to rationing at one large federal service: small jobs by hundreds of thousands of people “get expensive real, real fast.”" },
    source: "AI Weekly, Aug 2026: a $49M five-year wrapped-LLM contract with an LLM-agnostic router; the CIO imposed user-based rationing.",
    notes: `You don't have to imagine this. One large federal service turned on an AI platform — a router across four vendors' models — and went from zero to nineteen thousand users in forty-five days. Then the bill arrived, and the CIO rationed the users. Not because it didn't work. Because it worked. Their own words: token and compute cost is directly shaping which use cases they'll scale. A comptroller can live with a big number. A comptroller cannot live with a number that detonates. That's the conversation you're walking into.`,
  } : {
    id: "flatdies", type: "flow", section: "1 · The meter", min: 1,
    title: "Every flat plan dies the same way: hooked first, metered second.",
    steps: ["Flat plan", "5-hour session caps", "Weekly caps", "Pay-as-you-go overflow"],
    example: { n: "0 → 19,000", l: "users in 45 days at one large agency — then rationing, because small jobs by hundreds of thousands of people “get expensive real, real fast.”" },
    source: "Usage-limit changes, 2026; AI Weekly, Aug 2026 (the agency rollout).",
    notes: `You've lived this as a consumer. The flat plan gets you hooked. Then the five-hour session cap. Then the weekly cap. Then pay-as-you-go overflow. The enterprise version is the same arc with a bigger number: one large agency went from zero to nineteen thousand users in forty-five days and then rationed them. That's the budget detonation. Last year AI was a subscription anyone could forecast. This year it's a meter wired to how hard you work, and it goes off in exactly the quarters you're winning. A CFO can live with a big number. A CFO cannot live with a number that detonates.`,
  });

  S.push({
    id: "spend", type: "fig", layout: "side", section: "1 · The meter", min: pick(v, 1, 1.5),
    title: pick(v, "The best employers spend half a salary on tokens. Your seat cost a dollar.", "The median business spends $137 a person a year on AI. The best spend half a salary."),
    fig: { slot: "scale", steps: [0, 2, 3], board: false },
    stats: G ? [
      { n: "$1", l: "per user: the OneGov price that just expired", accent: true },
      { n: "$137", l: "the median US business, per employee a year" },
      { n: "$250K", l: "Jensen Huang's bar for a $500K engineer — half the salary" },
    ] : [
      { n: "$137", l: "median business, per employee a year", accent: true },
      { n: "$89K", l: "top 1% of businesses, growing ~14% a month" },
      { n: "$250K", l: "Jensen Huang's bar for a $500K engineer — half the salary" },
    ],
    source: "Ramp AI Index, June 2026 (70,000+ US businesses, annualized); Huang on the record (Tom's Hardware).",
    notes: pick(v,
      `So what's a sane number? Industry finally has benchmarks. This steelyard reads spend per person per year on a log beam. The median US business: a hundred and thirty-seven dollars. [advance] The top one percent: eighty-nine thousand. [advance] And Jensen Huang, on the record: if a five-hundred-thousand-dollar engineer doesn't burn two hundred and fifty thousand in tokens, he's "deeply alarmed." Half the salary. The government's number was a dollar a seat. That dollar was never the price; it was the hook. When you go upstairs, don't defend a big number. Show them where the best sit on this beam, and where you are.`,
      `So what's a sane number? The industry finally has benchmarks, and the spread is the story. The median business spends a hundred and thirty-seven dollars per person a year. [advance] The top one percent: eighty-nine thousand, growing fourteen percent a month. [advance] Jensen Huang, on the record: a five-hundred-thousand-dollar engineer who doesn't burn two hundred and fifty thousand in tokens has him "deeply alarmed." Half the salary. When you go upstairs, don't defend a big number. Show them where the best sit on this beam and where your company is.`),
  });

  S.push({
    id: "could", type: "fig", layout: "wide", section: "1 · The meter", min: 1.5,
    title: "Models could do 94% of the tasks in computing jobs. We let them do a third.",
    fig: { slot: "loom", steps: [0, 1, 2], board: true },
    source: "Massenkoff & McCrory, “Labor market impacts of AI,” Anthropic, 5 March 2026.",
    notes: `Spend is one way to see the gap. Work is the other. In March, Anthropic published two numbers per occupation: what share of tasks a model could do, and what share it's observed doing at work. Computer and math jobs: could, ninety-four percent. [advance] Does: thirty-three. [advance] The sixty-one points in between aren't a capability problem. Look at what holds the warp: a clamp, a coin box, a padlock. Permission, plumbing and the meter. You know exactly which of those three is stopping you. Name it upstairs. It's the most fundable sentence you have.`,
  });

  // ───────────────────────────── the leak ─────────────────────────────
  S.push({
    id: "doors", type: "fig", layout: "side", section: "2 · The leak", min: 1.5,
    title: "When they cap you, the side door is right there, and the contract doesn't cover it.",
    fig: { slot: "doors", steps: [0, 1, 2], board: false },
    stats: [
      { n: "66%", l: "of office workers used AI tools they believed weren't allowed", accent: true },
      { n: "88%", l: "shared work information through them" },
      { n: "81%", l: "believe leadership plays by different rules" },
    ],
    source: "PagerDuty, June 2026 (n = 1,250 office professionals, companies ≥ $500M).",
    notes: `Be honest with yourselves for a second. The front door is the ${G ? "authorized environment" : "enterprise contract"} — metered, not trained on. [advance] They cap it. The bar drops. Your work doesn't stop. It backs up. [advance] And then it goes out the side door, on a personal account. Sixty-six percent of office workers have used AI tools they believed weren't allowed. Eighty-eight percent have shared work information through them. Some of you have done it this month. I'm not here to scold you — I'm here to point out that every time a cap pushes you out that door, your ${G ? "agency's" : "company's"} intent goes with you. That's the argument you take upstairs: the cap doesn't save money, it moves the work somewhere nobody can see.`,
  });

  S.push({
    id: "contract", type: "compare", section: "2 · The leak", min: 1,
    title: "The contract protects the front door. The training toggle lives at the side door.",
    head: ["", pick(v, "Authorized · API · enterprise", "Enterprise · API · government"), "Consumer plans"],
    rows: [
      ["Who's on it", pick(v, "The seats the agency bought", "The seats you provisioned"), "Two-thirds of the workforce, quietly"],
      ["Training", "Excluded by commercial terms", "A toggle in the user's settings"],
      ["Retention", "Zero-retention agreements exist", "Five years, if the toggle is on"],
      ["Who sees it", pick(v, "Your ATO, your logs", "Your contract, your logs"), pick(v, "Nobody at your agency", "Nobody at your company")],
    ],
    line: "What leaks isn't customer data. It's how you work: which tools, which decisions, which features you're building next.",
    source: "Anthropic consumer terms (Aug 2025) and commercial terms; equivalent terms at every major lab.",
    notes: `Read the terms and you'll see what they protect: the traffic that goes through the front door. ${G ? "Government," : "Enterprise,"} API and commercial traffic is excluded from training at every major lab. The consumer plans are where the training toggle lives, with five-year retention if it's on. And what flows out isn't the database. It's how you work: which tools, which decisions, which features you're building next${G ? ", which mission you're planning" : ""}. The early leak is a leader thinking something through before a dollar is committed. The expensive leak is later: the features and fixes you ship through someone else's model.`,
  });

  S.push({
    id: "spikes", type: "fig", layout: "wide", section: "2 · The leak", min: 1.5,
    title: "The labs ship where the usage map is dense: images, code, security, finance, legal.",
    fig: { slot: "spikes", steps: [0, 1, 2, 3, 4, 5, 6], board: false },
    source: `Public product launches, in order; Anthropic Economic Index (30+ categories); Artificial Analysis Intelligence Index v4.3.2, Oct 2026 (${pick(v, M.usopen.index, M.open.index)} vs ${M.frontier.index}). Heights illustrative; the causal reading is Brad's.`,
    notes: `The labs say this part out loud. Anthropic publishes an Economic Index built by classifying millions of conversations into more than thirty categories of work. That's this table. [advance] Image generation. [advance] Software. [advance] Security. [advance] Finance. [advance] Legal. Each one a capability spike dropped where the map was dense. Nobody's alleging a lab lifted a feature from a customer — it's aggregate, by their own published method. The two glass planes are today's scores: ${pick(v, `the best US open model at ${M.usopen.index}`, `the best open-weight model at ${M.open.index}`)}, runnable on your own iron, uncapped, and the frontier at ${M.frontier.index}, metered. Most of the map sits under the open plane. [advance] And the dashed cell is the question for your leadership: is ours next?`,
  });

  S.push({
    id: "loop", type: "fig", layout: "wide", section: "2 · The leak", min: 1.5,
    title: "Capping tokens starts an eight-step loop. Owned capacity breaks it at step three.",
    fig: { slot: "loop", steps: [0, 1, 2, 3, 4, 5, 6, 7], board: true },
    source: "PagerDuty, June 2026; AI Weekly, Aug 2026; Anthropic consumer terms, Aug 2025; Anthropic Economic Index.",
    notes: `Put it together and you get a loop, and every step is already happening somewhere. One: usage explodes — that's you. [advance] Two: the meter arrives. [advance] Three: they cap you. [advance] Four: you go personal. [advance] Five: personal accounts train. [advance] Six: intent becomes their roadmap. [advance] Seven: the spike eats the eighty percent. [advance] Eight is the only step your leadership controls. They can't set the labs' prices or what a consumer account trains on. They control whether they cap you. Owned, uncapped capacity throws the switch at step three, and four through seven never happen. That's your whole pitch on one machine.`,
  });

  // ───────────────────────────── the ladder ─────────────────────────────
  S.push(G ? {
    id: "openvs", type: "models", section: "3 · The ladder", min: 1.5,
    title: "American open weights now sit three points behind Opus 4.8, at a fifth of the price.",
    models: [
      { ...M.frontier, tag: "Anthropic · GovCloud 22 Sep" },
      { ...M.opus48, tag: "Anthropic · GovCloud 30 Jun" },
      { ...M.usopen, tag: "Meta · sibling of Wonder Full", hot: true },
      { ...M.nemotron, tag: "NVIDIA · permissive licence · 120B" },
    ],
    line: "Meta's closed Muse Wonder Full scores 56. Watch what Meta opens next.",
    caveat: "Caveat: most benchmarks are gamed. Labs tune to the test and publish the wins. Trust your own evals, on your own work.",
    source: "US-built models only. Artificial Analysis Intelligence Index v4.3.2, read 18 Oct 2026 (Muse Wonder Full: 12 Oct); blended $/M at 7:2:1; first-party speed.",
    notes: `Every model on this slide is American. Today's market, on Artificial Analysis's own index, read this weekend. The frontier, Opus 5.5: fifty-eight, in GovCloud since September twenty-second. Opus 4.8 — May's frontier, in GovCloud since June — forty-two. Then the open weights you can run on your own iron. Meta's Muse Spark Open: thirty-nine. Three points behind Opus 4.8, at a fifth of the price and twice the speed. And it's the small open sibling of something bigger: Meta's closed Muse Wonder Full scores fifty-six, two points off the frontier, released last week. Watch what Meta opens next. NVIDIA's Nemotron 3.5 Super: twenty-six, but fourteen cents a million, nearly four hundred tokens a second, on a permissive licence — the workhorse for the routine eighty percent. Read Muse's licence before any defense deployment; Nemotron's is the cleaner one. Now the caveat, and say it out loud: most benchmarks are gamed. Labs tune to the test and publish the wins. These numbers tell you the shape of the market. Your own evals, on your own work, tell you what to buy.`,
  } : {
    id: "openvs", type: "models", section: "3 · The ladder", min: 1.5,
    title: "The best open model now beats last spring's frontier, at a twentieth of the price.",
    models: [
      { ...M.frontier, tag: "frontier · metered" },
      { ...M.open, tag: "best open weights · MIT licence", hot: true },
      { ...M.opus48, tag: "the frontier in May" },
      { ...M.usopen, tag: "best US open weights · Muse licence" },
    ],
    line: "Run open weights uncapped on capacity you own. Escalate to the 58 for judgment only.",
    source: "Artificial Analysis Intelligence Index v4.3.2 and model pages, read 18 Oct 2026. Blended $/M at 7:2:1 cache-hit:input:output; output speed on the first-party API.",
    notes: `Here's today's market, on Artificial Analysis's own index, read this weekend. The frontier, Opus 5.5: fifty-eight, about three dollars per million tokens. The best open-weight model in the world, Xiaomi's MiMo: forty-six, for eighteen cents. Opus 4.8 — the frontier in May — forty-two, at three eighty-five. So the open model you can download today beats the frontier of five months ago at a twentieth of the price. If provenance matters to you, the best American open model, Meta's Muse Spark Open, is thirty-nine at seventy-eight cents and a hundred and thirty tokens a second. Either way the pattern holds: run the routine on open weights you own, uncapped, and escalate to the fifty-eight when the problem earns it.`,
  });

  S.push({
    id: "ladder", type: "fig", layout: "side", section: "3 · The ladder", min: 1.5,
    title: "Three rungs you own, one gate you rent: routine stays inside, judgment escalates.",
    fig: { slot: "ladder", steps: [0, 1, 2, 3, 4], board: false },
    stats: G ? [
      { n: String(M.usopen.index), l: `US open on the rungs you own: $${M.usopen.price.toFixed(2)} per million tokens, ${Math.round(M.usopen.tps)} a second, uncapped` },
      { n: String(M.frontier.index), l: `the frontier, through one gate: $${M.frontier.price.toFixed(2)} per million, ${Math.round(M.frontier.tps)} a second, metered`, accent: true },
      { n: "1 gate", l: "sensitive context stripped on the way out" },
    ] : [
      { n: String(M.open.index), l: `open weights on the rungs you own: $${M.open.price.toFixed(2)} per million tokens, uncapped` },
      { n: String(M.frontier.index), l: `the frontier, through one gate: $${M.frontier.price.toFixed(2)} per million, metered`, accent: true },
      { n: "1 gate", l: "sensitive context stripped on the way out" },
    ],
    source: "Artificial Analysis Intelligence Index v4.3.2, Oct 2026. Token mix illustrative.",
    notes: `This is what you're asking for. Three rungs inside the fence. [advance] Device: your machine, refreshed now — NPU laptops and workstations. [advance] Workgroup: a desktop inference box your team shares. [advance] Core: the racks, built later, out of the growth you create. [advance] And one gate, the only way out. Escalation to the frontier is earned and metered, and sensitive context is stripped on the way through. [advance] Two rules at once: volume is uncapped on the rungs, because the capacity is yours; escalation is earned, because that's where the meter and the leak live. You stop picking models. The router does it.`,
  });

  S.push({
    id: "rfp", type: "fig", layout: "wide", section: "3 · The ladder", min: 1.5,
    title: pick(v, "On a Tuesday, four pieces of an RFP stay inside. Two leave without the bid.", "On a Tuesday, four pieces of an RFP stay inside. Two leave without the bid."),
    fig: { slot: "rfp", steps: [0, 1, 2], board: true },
    source: "Illustrative workflow from the manifesto.",
    notes: `Make it concrete for them with a Tuesday. Someone drops in an RFP${G ? " — or a solicitation you're writing" : ""} — pricing, technical, capabilities, logistics — and asks what to do first. [advance] The router splits it. Four pieces land on your own rungs and get answered inside. The two hard questions need the outside world. [advance] Watch the gate: the number, the deadline, the bid — stripped, logged, policy-checked. [advance] The world sees a capability search. A human makes the call. That's the demo you build next week to show your ${G ? "CIO" : "leadership"} the ladder isn't a slide.`,
  });

  S.push({
    id: "vend", type: "fig", layout: "wide", section: "3 · The ladder", min: 1.5,
    title: "Past 5.3 hours a day, owning the box beats renting it. You already work twelve.",
    fig: { slot: "vending", steps: [1, 2, 3], board: true },
    source: "Lenovo 2026 TCO (vendor study): 5-year life, zero residual, 12% maintenance, $0.12/kWh; ~5.2-month break-even. Frontier and wrapped rates are Brad's reads.",
    notes: `Now the money. Same item — a million tokens of the same open model — four ways to buy it. Cloud GPU: ninety-seven cents. Frontier API at a blended coding rate: about twelve dollars. ${G ? "A wrapped federal LLM" : "A wrapped enterprise LLM"}: up to forty-five. And owned capacity, whose price depends on one thing. [advance] At three hours a day, a dollar seventy-one. [advance] At five point three hours a day it matches cloud; about a five-month break-even. [advance] At twelve hours — your day — forty-three cents. The gap is utilization. Which is the point: you're not asking them to buy boxes for everyone. You're asking them to buy boxes for the people who keep them busy.`,
  });

  // ───────────────────────────── selling up ─────────────────────────────
  S.push({
    id: "tubes", type: "fig", layout: "wide", section: "4 · Selling up the chain", min: 1.5,
    title: "Your job upstairs: send each office the one sentence it can sign.",
    fig: { slot: "tubes", steps: [0, 1, 2, 3], board: false },
    source: "The manifesto's three drivers — pricing, security, operations — translated per office.",
    notes: pick(v,
      `Here's the part you came for. Your leadership doesn't need this talk. Each office needs one sentence it can sign. [advance] The CFO: capacity is a fixed obligation; a meter is not. No agency may obligate more than it has, and a per-token bill under a continuing resolution is exactly the thing that keeps comptrollers up at night. Owned capacity is a number they can plan. [advance] The CIO: IT rules for models. A curated model repository, a shim on every device, retrieval that follows the access controls you already have. It's the muscle they already have, extended to models. [advance] The agency head: our decision graph is either our asset or their training data. [advance] Three tubes, three sentences. Don't send the CFO the agency head's sentence.`,
      `Here's the part you came for. Your leadership doesn't need this talk. Each office needs one sentence it can sign. [advance] The CFO: a cap costs more than capacity. Their problem isn't the size of the number; it's the detonation. Owned capacity is the predictable number. [advance] The CIO: IT rules for models. A curated model repository, a shim on every device, retrieval that follows the access controls you already have. [advance] The CEO: our decision graph is either our asset or their training data. [advance] Three tubes, three sentences. Don't send the CFO the CEO's sentence.`),
  });

  S.push({
    id: "numbers", type: "ba", section: "4 · Selling up the chain", min: 1,
    title: "Bring two numbers upstairs: your token-burn map and your hours a day.",
    before: { k: "Before", v: pick(v, "AI is a line item: seats on a schedule, a cap when it runs hot.", "AI is a line item: seats, a subscription, a cap when it runs hot.") },
    lever: [
      { k: "Your token-burn map", v: "Every system with an AI feature, who pays for its tokens, which model it calls, what breaks when that model is down." },
      { k: "Your hours a day", v: "How long you keep a box busy. Above 5.3, capacity is cheaper than rent." },
    ],
    after: { k: "After", v: pick(v, "AI is capacity: a fixed obligation with a payback date, sized to the people who use it most.", "AI is capacity: a purchase with a payback date, sized to the people who burn the most.") },
    notes: `Sentences get you the meeting. Numbers get you the purchase order. Bring two. First, the token-burn map: every system in the ${G ? "agency" : "company"} with an AI feature, who pays for its tokens, which model it calls, and what happens when that model is down. Your ${G ? "CIO" : "CIO"} can't answer the last column today. You can. That's your opening. Second, your hours a day: how long you and the people like you keep a box busy. That number turns the vending machine into a payback date. Before, AI is a line item that gets capped. After, it's capacity with a break-even.`,
  });

  S.push({
    id: "sequence", type: "steps", section: "4 · Selling up the chain", min: 1,
    title: "Ask for it one refresh at a time: your machine now, the team's box next, the core when proven.",
    steps: [
      { k: "Now", v: "An emergency refresh for the natives: secured, uncapped machines.", accent: true },
      { k: "Next", v: "A shared workgroup box. Everyone else rides it." },
      { k: "When proven", v: "The core, built out of the growth you create." },
      { k: "Always", v: "The frontier through one gate, metered, for judgment only." },
    ],
    source: "AI-capable PCs pass half of shipments in 2026 (Counterpoint). Power is the long pole: plan it now.",
    notes: `And don't ask for a datacenter. You'll lose. Nobody can put one down fast enough, and nobody signs a ten-megawatt facility for a usage base that doesn't exist yet. Sequence it around yourselves. Now: an emergency refresh for the power users — don't wait for the cycle. Next: a workgroup box everyone else shares. The core gets built when you've proven it, out of the growth you create. And the frontier stays, through one gate, metered, for the hard calls. Prices are going up, allocation is tighter, and power is the long pole. This is not an IT ticket.`,
  });

  S.push(G ? {
    id: "deadline", type: "three", section: "4 · Selling up the chain", min: 1.5,
    title: "Your moat is data. Your crisis is people. Your deadline has a date.",
    head: ["", "The fact", "What you ask for"],
    rows: [
      ["Data", "Every need-to-know enclave is its own sovereign organization. The hyperscalers solved IL6 multi-tenancy in their buildings, at their prices, behind their meter.", "Ephemeral GPU zones inside your boundary: spikes from the core, not fingers reaching out.", true],
      ["People", "Federal pay sits 27.5% behind the private sector. The ones who could have run a Manhattan Project already left.", "Uncapped machines for the geniuses who stayed. AI is how you keep them."],
      ["Deadline", "Claude's $1 ends October 31. The continuing resolution runs to December 11. FY27 renewals are being written now.", "Sovereign capacity priced against the renewal, before it's signed."],
    ],
    source: "Federal Salary Council (27.54%, Nov 2023); FedScoop, Sep 2026; continuing resolution signed 2 Sep 2026; Azure Government Secret / AWS Secret Region (IL6).",
    notes: `Three facts for the government room. Your moat is data: treat every need-to-know enclave as its own sovereign org. The hyperscalers solved IL6 multi-tenancy — in their buildings, at their prices, behind their meter. Nobody has solved it in yours, and that's the reason to own it. Your crisis is people: federal pay is twenty-seven and a half percent behind private. The ones who could have run a Manhattan Project left and founded companies, some of them the labs. AI is how you keep the ones who stayed — you. Your deadline has a date: Claude's dollar ends October thirty-first, the CR runs to December eleventh, and FY27 renewals are being written right now. Get your numbers in front of the person writing them.`,
  } : {
    id: "proof", type: "three", section: "4 · Selling up the chain", min: 1,
    title: "The winners already run agents on a graph, with a human at the gate.",
    head: ["", "What they did", "What it shows"],
    rows: [
      ["Cisco, 2026", "Agents for 90,000 employees; each picks its model; 80–90% of SEC-filing first drafts; primarily on-prem.", "It works at scale — on their own iron.", true],
      ["Salesforce benchmark", "12 agents per enterprise; half operate completely alone.", "Ungoverned agents are the new shadow IT."],
      ["Futurum · CMU", "11% of planned agentic use cases reached production; an all-agent company hit 24% task success.", "Loops fail. Graphs with a human at the gate don't."],
    ],
    source: "Fortune, Jul 2026; Salesforce 2026 Connectivity Benchmark; Futurum 1H 2026; CMU TheAgentCompany.",
    notes: `When someone upstairs says this is theoretical: Cisco put agents in front of ninety thousand employees this year. Each agent picks its model. AI writes eighty to ninety percent of the first draft of their SEC filing narratives. Primarily on-prem. Meanwhile the average enterprise runs twelve agents and half report to nobody, which is why only eleven percent of planned agentic projects reach production. The difference is the graph and the human at the gate. Your business brain is the highest-intent object your company will ever own. Don't let it run on someone else's meter.`,
  });

  // ───────────────────────────── the fork ─────────────────────────────
  S.push({
    id: "vote", type: "vote", section: "5 · The fork", min: 1.5,
    title: pick(v, "By 2029 every agency has chosen, by acting or by not acting. Vote.", "By 2029 every organization has chosen, by acting or by not acting. Vote."),
    options: [
      { id: "own", k: "Own the boundary", v: "Uncap the natives on capacity you own, stand up the ladder, put a shim on every device." },
      { id: "rent", k: "Keep renting", v: pick(v, "Sign the per-token renewal, cap the heavy users, trust the contract to cover traffic it never sees.", "Sign the renewal, cap the heavy users, trust the contract to cover traffic it never sees.") },
    ],
    notes: `So here's the fork. By 2029 the capacity crunch, the renewals and the spikes have all arrived. The only variable left is the decision made back here, now. Scan the code and vote for where your ${G ? "agency" : "organization"} actually is — not where you'd like it to be. [wait 30–45 seconds; read the tally] That split is the market. And everyone who voted "renting" just found out why they're in the room. (Fallback: show of hands; press 1 for own, 2 for rent.)`,
  });

  S.push({
    id: "futures", type: "futures", section: "5 · The fork", min: 1,
    title: "Renting goes flat, flat, then vertical. Owning compounds.",
    rented: G ? [
      "The renewal comes per user or per token. It isn't a dollar, and the meter has no ceiling.",
      "The natives hit the caps within a quarter; the side door does the rest.",
      "The routine work of your mission ships as someone else's feature.",
      "Your best builders leave for the private sector — 27.5% richer.",
    ] : [
      "The renewal comes per user, in tiers. It isn't a dollar.",
      "The natives hit the caps within a quarter; the side door does the rest.",
      "By year four the spike reaches your industry: the routine 80% ships as someone else's feature.",
      "Your best builders leave — some to build the thing aimed at you.",
    ],
    owned: [
      "The full ladder is standard: device, workgroup, core, gated frontier.",
      "Enterprise agents with a registry, kill switches and a human at the gate.",
      pick(v, "The mission brain runs on your rungs and never phones home.", "The business brain runs on your rungs and never phones home."),
      pick(v, "Small teams outrun bureaucracy. Building sovereign is how America wins this.", "Small teams outrun giants. The crew that wires the graph is the one everyone quotes."),
    ],
    notes: pick(v,
      `Here's each branch. Rented: the renewal comes per user or per token, and a meter with no ceiling is a problem no comptroller can sign. The natives hit the caps in a quarter. The spend goes flat, flat, then vertical. The routine work of your mission ships as somebody else's feature, and the builders leave for twenty-seven percent more money. Owned: the ladder is standard, the agents have real guardrails, and the mission brain compounds on your own rungs. Every agency that does the hard thing now compounds the country's capacity. Building sovereign is how America wins this.`,
      `Here's each branch. Rented: the renewal comes per user, in tiers. The natives hit the caps in a quarter. The spend goes flat, flat, then vertical, and the caps didn't stop it; they moved it to the door the contract doesn't cover. By year four, the spike reaches your industry. Owned: the ladder is standard, the agents have guardrails, and the business brain compounds on your own rungs. It's the moment small, fast teams outrun giants. Be that team.`),
  });

  S.push({
    id: "monday", type: "close", section: "Monday", min: 1,
    title: "Monday: build the map, log your hours, book three meetings.",
    roles: [
      { k: "Build the map", v: `Every system with an AI feature, who pays for its tokens, which model, what fails when it's down. One page.` },
      { k: "Log your hours", v: "How long you keep a box busy, for two weeks. Past 5.3 a day, you've paid for the box." },
      { k: "Book three", v: `${pick(v, "CFO, CIO, agency head", "CFO, CIO, CEO")}: one sentence each, one ask. Capacity for the people who burn the most.` },
    ],
    notes: `Three things for Monday, and none of them need anyone's permission. Build the map: one page, every system with an AI feature, who pays, which model, what breaks when it's down. Log your hours: two weeks of how long you keep a box busy. Past five point three a day you've paid for the box. Then book three meetings — ${G ? "the CFO, the CIO and the agency head" : "CFO, CIO, CEO"} — one sentence each, one ask: capacity for the people who burn the most. Go get it before the meter caps you.`,
  });

  S.push({
    id: "end", type: "end", section: "", min: 0.5,
    title: "Intent is the new oil. Capping tokens is the leak.",
    sub: "Go get the capacity.",
    notes: `The enemy isn't the lab — the router still sends your hardest calls to the best models in the world, and it should. The enemy is the default. The default plan trains. The default deployment meters. The default ${G ? "agency" : "org"} caps its best people and then wonders where they went. You're the best people. Go get the capacity. Thank you.`,
  });

  return S;
}
