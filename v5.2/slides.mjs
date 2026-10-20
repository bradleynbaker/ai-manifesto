// V5.2 · the talk, for the AI natives. Two editions from one source: G (government) and C (commercial).
// The audience is the one in a thousand: the people who already build with AI and use the most tokens. They have
// to sell up the chain, and in government most of them also write the solicitations.
// 5.2 changes from 5.1: a 25-minute talk with 5 minutes of Q&A (min sums to 25); the team, contract and two-numbers
// slides folded into meter, doors and Monday; the RFP told from the writer's side and moved after the money; plain
// spoken English in the notes and titles (full sentences, no stage directions, absolute dates).
// Rules: action titles, one message per slide, answer first, concrete before abstract, gray first and one red thing.
import { MODELS } from "./variants.mjs";

const M = MODELS;
const pick = (v, g, c) => (v === "G" ? g : c);

export function talk(v) {
  return {
    title: "An AI Manifesto",
    thesis: "Intent is the new oil. Capping tokens is the leak.",
    speaker: "Brad Baker",
    edition: pick(v, "V5.2G · government", "V5.2C · commercial"),
    version: pick(v, "5.2G", "5.2C"),
    minutes: 25,
  };
}

export function slides(v) {
  const G = v === "G";
  const org = pick(v, "agency", "company");
  const S = [];

  // ───────────────────────────── open ─────────────────────────────
  S.push({
    id: "cover", type: "cover", section: "", min: 0.5,
    title: "Intent is the new oil. Capping tokens is the leak.",
    kicker: pick(v, "For the government's AI natives", "For the one in a thousand"),
    meta: ["Brad Baker", "25 minutes", "a vote on where we think we are going"],
    art: "loop",
    notes: pick(v,
      `This talk is for the people in the agency who already build with AI: the ones who wired an agent to a harness on their own time because the procurement queue was eighteen months long. You can see something your leadership can't see yet. In the next twenty-five minutes I want to give you the facts and the sentences to take upstairs, so that you come back with capacity instead of a cap. At the end we'll vote, and then we'll take questions.`,
      `This talk is for the one in a thousand: the people who build with AI, not the people who were issued a seat. You can see something your leadership can't see yet. In the next twenty-five minutes I want to give you the facts and the sentences to take upstairs, so that you come back with capacity instead of a cap. At the end we'll vote, and then we'll take questions.`),
  });

  if (G) {
    S.push({
      id: "onegov", type: "flow", section: "The problem", min: 1,
      title: "The $1 era is over: on October 1, government AI went on a meter.",
      steps: ["$1 deals, Aug 2025", "3.5M employees onboarded", "Sept 30: the $1 ends", "Oct 1: pay per token, half off, to 2028"],
      example: { n: "Oct 31", l: "Claude's $1 extension ends. Gemini renews at a per-user price it hasn't named. FY27 renewals are being written now." },
      source: "GSA OneGov; FedScoop, 10 & 17 Sep 2026 (OpenAI successor deal; Anthropic extension); Gemini offer terms as reported.",
      notes: `In August 2025 every major lab sold its AI to the government for a dollar, and three and a half million federal employees got access. That price ended on September thirtieth. OpenAI's follow-on deal runs to 2028 with no seat fee and half-price tokens, so you pay for what you use. That sounds generous until you read it the way a CFO does: it is a meter, and it is tied to how hard your best people work. Anthropic's dollar runs until October thirty-first. It's the pattern you know from consumer apps: get people using it first, then start metering. And the people in this room are the ones who will run that meter up.`,
    });
  } else {
    S.push({
      id: "q1", type: "quote", section: "The problem", min: 1,
      title: "“My company spent my entire 2026 budget in Q1. Can you make this more efficient?”",
      cite: "A client complaint Sam Altman quoted on stage, June 2026. He called token costs “a huge issue” that “never came up” six months earlier.",
      notes: `This is a customer complaint that the vendor's own CEO repeated on stage in June. Six months earlier nobody was asking this question, and now everyone is. The reason that budget ran out in the first quarter is probably sitting in this room. Raise your hand if you've been asked to be more efficient with tokens this year. [pause] Keep it up if the answer from upstairs was a cap. You're the people I'm talking to. Altman's answer is efficiency, and mine is ownership.`,
    });
  }

  S.push({
    id: "you", type: "fig", layout: "side", section: "You", min: 1,
    title: "You're the one in a thousand, which is why the people who sign can't see what you see.",
    fig: { slot: "natives", steps: [1, 2], board: false },
    stats: [
      { n: "1 in 1,000", l: "people actually building their own agents on a harness: you", accent: true },
      { n: "> 998", l: "you use more tokens than everyone else on the floor combined" },
      { n: "3 months", l: "until the people next to you are doing it too, on the same meter" },
    ],
    source: "1-in-1,000: Brad's field observation of people building their own agents. Spread illustrative.",
    notes: `Picture a floor of a thousand people in your ${org}. Two of them are building agents on a harness, and they use more tokens than the other nine hundred and ninety-eight together. That's you. Surveys will tell your leadership that forty percent of large organizations are scaling agents, but that counts deployments, not builders. Builders are closer to one in a thousand. [advance] Three months later the people around you have started doing the same thing, one demo and one team at a time, and every red stack is on the meter. Your ${G ? "comptroller" : "CFO"} is about to see that curve, and the only tool they have is a cap. The point of this talk is to get to them first with a better option.`,
  });

  S.push({
    id: "ask", type: "ask", section: "The answer first", min: 1,
    title: "Your ask upstairs is owned capacity for the people who use the most, not more metered tokens.",
    cols: [
      { k: "The meter", v: "Demand grows faster than prices fall, so the bill spikes in the quarters you're most productive." },
      { k: "The leak", v: "If they cap you, the work moves to tools the contract doesn't cover." },
      { k: "The ladder", v: "Three levels of capacity you own, and one metered gate to the frontier." },
    ],
    lead: { k: "Your kit", v: "Three sentences, two numbers and one ask. You'll leave with all of them." },
    notes: `I'll give you the answer first so you can check my reasoning as we go. The ask you take upstairs is to fund owned capacity for the people who use the most, which is you, instead of buying more tokens on a meter and then capping them. Three things get you there. The meter: demand is growing faster than prices are falling, and that turns into a finance problem. The leak: when you're capped, the work doesn't stop, it moves somewhere nobody can see. The ladder: the setup that fixes both. After that I'll give you one sentence each for your ${G ? "CFO, your CIO and your agency head" : "CFO, your CIO and your CEO"}, and the two numbers that turn a conversation into a purchase order.`,
  });

  // ───────────────────────────── the meter ─────────────────────────────
  S.push({
    id: "meter", type: "fig", layout: "side", section: "1 · The meter", min: 1,
    title: "Token use grew a millionfold while the price fell sixteenfold, so the bill went up.",
    fig: { slot: "token-meter", steps: [0, 7], board: "under" },
    stats: [
      { n: "×1,000,000", l: "top customer's tokens a month, 2019 → 2026 (100K → 100B)" },
      { n: "÷16", l: "frontier list price per million tokens ($60 → $3.85)" },
      { n: "×64,000", l: "the monthly bill", accent: true },
    ],
    source: "Altman on stage, June 2026 (volume); 2020 API launch pricing and Artificial Analysis (price); log-interpolated. $1.3M month: Peter Steinberger's published bill (Tom's Hardware).",
    notes: `This is the first chart to show upstairs. The needle shows tokens per month on a log scale, with one big tick for every factor of ten, from 2019 to 2026. [advance] Usage went up a millionfold. Over the same period the price per million tokens for the best model only fell from sixty dollars to three eighty-five. Leadership keeps hearing that tokens are getting cheaper, and older models are. But the best model stays in roughly the same price range, and usage is growing much faster than prices fall, so the monthly bill went up sixty-four thousand times. At the extreme, one three-person team ran about a hundred coding agents and spent one point three million dollars in a single month. Before your meeting, type your own monthly usage into the box. That number is a good way to open.`,
  });

  S.push(G ? {
    id: "ration", type: "flow", section: "1 · The meter", min: 1,
    title: "One agency went from zero to 19,000 users in 45 days, then had to ration them.",
    steps: ["Turned it on", "19,000 users in 45 days", "Per-token bill", "Ration the users"],
    example: { n: "45 days", l: "from launch to rationing at one large federal service: small jobs by hundreds of thousands of people “get expensive real, real fast.”" },
    source: "AI Weekly, Aug 2026: a $49M five-year wrapped-LLM contract with an LLM-agnostic router; the CIO imposed user-based rationing.",
    notes: `This has already happened at one large federal service. They launched an AI platform that routes work across four vendors' models, and it reached nineteen thousand users in forty-five days. When the bill came in, the CIO started rationing users, because the platform was working and the cost grew with every one of them. In their own words, token and compute cost now decides which use cases they scale. A comptroller can plan around a large number, but not one that grows faster than the budget. That's the conversation you'll be walking into.`,
  } : {
    id: "flatdies", type: "flow", section: "1 · The meter", min: 1,
    title: "Flat AI plans tend to end the same way: people get hooked, then they get metered.",
    steps: ["Flat plan", "5-hour session caps", "Weekly caps", "Pay-as-you-go overflow"],
    example: { n: "0 → 19,000", l: "users in 45 days at one large agency, then rationing, because small jobs by hundreds of thousands of people “get expensive real, real fast.”" },
    source: "Usage-limit changes, 2026; AI Weekly, Aug 2026 (the agency rollout).",
    notes: `You've seen this as a consumer. A flat plan gets you using the product. Then come five-hour session limits, then weekly limits, then pay-as-you-go charges for anything over. The enterprise version follows the same path with bigger numbers: one large agency went from zero to nineteen thousand users in forty-five days and then had to ration them. Last year AI was a subscription anyone could forecast. This year it's a meter tied to how hard you work, and it spikes in the quarters when you're doing your best work. A CFO can plan around a large number, but not one that grows faster than the budget.`,
  });

  S.push({
    id: "spend", type: "fig", layout: "side", section: "1 · The meter", min: pick(v, 1, 1.5),
    title: pick(v, "The most AI-heavy employers spend half a salary on tokens, and your seat cost a dollar.", "The median business spends $137 a person a year on AI, and the leaders spend half a salary."),
    fig: { slot: "scale", steps: [0, 2, 3], board: false },
    stats: G ? [
      { n: "$1", l: "per user: the OneGov price that is ending", accent: true },
      { n: "$137", l: "the median US business, per employee per year" },
      { n: "$250K", l: "Jensen Huang's bar for a $500K engineer: half the salary" },
    ] : [
      { n: "$137", l: "the median business, per employee per year", accent: true },
      { n: "$89K", l: "the top 1% of businesses, growing about 14% a month" },
      { n: "$250K", l: "Jensen Huang's bar for a $500K engineer: half the salary" },
    ],
    source: "Ramp AI Index, June 2026 (70,000+ US businesses, annualized); Huang on the record (Tom's Hardware).",
    notes: pick(v,
      `So what is a reasonable amount to spend? There are finally benchmarks. This scale shows AI spend per person per year on a log beam. The median US business spends a hundred and thirty-seven dollars. [advance] The top one percent spend eighty-nine thousand. [advance] Jensen Huang has said on the record that if a five-hundred-thousand-dollar engineer isn't using two hundred and fifty thousand dollars in tokens, he'd be deeply alarmed. That's half the salary. The government paid a dollar a seat, and that was never the real price; it was how the labs got you started. When you go upstairs, you don't need to defend a big number. Show them where the leaders sit on this scale, and where you are.`,
      `So what is a reasonable amount to spend? There are finally benchmarks, and the spread is wide. The median business spends a hundred and thirty-seven dollars per person a year. [advance] The top one percent spend eighty-nine thousand, and that number is growing about fourteen percent a month. [advance] Jensen Huang has said on the record that if a five-hundred-thousand-dollar engineer isn't using two hundred and fifty thousand dollars in tokens, he'd be deeply alarmed. That's half the salary. When you go upstairs, you don't need to defend a big number. Show them where the leaders sit on this scale, and where your company is.`),
  });

  S.push({
    id: "could", type: "fig", layout: "wide", section: "1 · The meter", min: 1,
    title: "Models could do 94% of the tasks in computing jobs, but at work they do about a third.",
    fig: { slot: "loom", steps: [0, 1, 2], board: true },
    source: "Massenkoff & McCrory, “Labor market impacts of AI,” Anthropic, 5 March 2026.",
    notes: `Spending is one way to see the gap, and work is another. In March, Anthropic published two numbers for each occupation: the share of tasks a model could do, and the share it is actually seen doing at work. For computer and math jobs the first number is ninety-four percent. [advance] The second is thirty-three. [advance] The sixty-one points in between aren't about what the models can do. The loom shows what's holding them back: a clamp, a coin box and a padlock, which stand for permission, plumbing and the meter. You know which of those three is stopping you. Name it when you go upstairs, because it's one of the easiest things for leadership to fund.`,
  });

  // ───────────────────────────── the leak ─────────────────────────────
  S.push({
    id: "doors", type: "fig", layout: "side", section: "2 · The leak", min: 1.5,
    title: "When they cap you, the work moves to personal accounts, and the contract doesn't cover those.",
    fig: { slot: "doors", steps: [0, 1, 2], board: false },
    stats: [
      { n: "66%", l: "of office workers used AI tools they believed weren't allowed", accent: true },
      { n: "88%", l: "of them shared work information through those tools" },
      { n: "5 years", l: "retention on consumer plans when the training setting is on" },
    ],
    source: "PagerDuty, June 2026 (n = 1,250 office professionals, companies ≥ $500M); Anthropic consumer and commercial terms (Aug 2025), with equivalent terms at every major lab.",
    notes: `The front door is the ${G ? "authorized environment" : "enterprise contract"}. It's metered, and your data isn't used for training. [advance] Now suppose they cap it. The work doesn't stop, it backs up. [advance] And some of it goes out the side door, on a personal account. Sixty-six percent of office workers say they've used AI tools they believed weren't allowed, and eighty-eight percent of those shared work information through them. The contract only protects the front door. ${G ? "Government," : "Enterprise,"} API and commercial traffic is excluded from training at every major lab, but on consumer plans training is a setting the user controls, with five years of retention if it's on. What leaks that way isn't a database. It's how your ${org} works: which tools, which decisions, and ${G ? "which mission you're planning next" : "which features you're building next"}. So the argument for upstairs is that a cap doesn't save money. It moves the work to a place nobody can see.`,
  });

  S.push({
    id: "spikes", type: "fig", layout: "wide", section: "2 · The leak", min: 1,
    title: "The labs ship new products where their usage is densest: images, code, security, finance and legal.",
    fig: { slot: "spikes", steps: [0, 1, 2, 3, 4, 5, 6], board: false },
    source: `Public product launches, in order; Anthropic Economic Index (30+ categories); Artificial Analysis Intelligence Index v4.3.2, Oct 2026 (${pick(v, M.usopen.index, M.open.index)} vs ${M.frontier.index}). Heights illustrative; the causal reading is Brad's.`,
    notes: `The labs are open about this part. Anthropic publishes an Economic Index, built by sorting millions of conversations into more than thirty categories of work. That's this table. [advance] Image generation. [advance] Software. [advance] Security. [advance] Finance. [advance] Legal. Each of these launches landed where the usage map was densest. I'm not suggesting any lab took a feature from a particular customer. This is aggregate data, using their own published method. The two glass planes are today's scores: ${pick(v, `the best US open model at ${M.usopen.index}`, `the best open-weight model at ${M.open.index}`)}, which you can run on your own hardware without a cap, and the frontier at ${M.frontier.index}, which is metered. Most of the map sits under the lower plane. [advance] The dashed cell is the question for your leadership: is our area next?`,
  });

  S.push({
    id: "loop", type: "fig", layout: "wide", section: "2 · The leak", min: 1.5,
    title: "Capping tokens starts an eight-step loop, and owned capacity breaks it at step three.",
    fig: { slot: "loop", steps: [0, 1, 2, 3, 4, 5, 6, 7], board: true },
    source: "PagerDuty, June 2026; AI Weekly, Aug 2026; Anthropic consumer terms, Aug 2025; Anthropic Economic Index.",
    notes: `Put those pieces together and you get a loop, and each step is already happening somewhere. Step one: usage grows quickly, and that's you. [advance] Two: the meter arrives. [advance] Three: they cap you. [advance] Four: people move to personal accounts. [advance] Five: consumer accounts can feed training. [advance] Six: your ${org}'s intent becomes part of a lab's roadmap. [advance] Seven: a new product covers the routine eighty percent of your work. [advance] Step eight is the only one your leadership controls. They can't set the labs' prices or decide what a consumer account trains on, but they can decide whether to cap you. Owned capacity without a cap stops the loop at step three, so steps four through seven never happen. That's the whole pitch in one picture.`,
  });

  // ───────────────────────────── the ladder ─────────────────────────────
  S.push(G ? {
    id: "openvs", type: "models", section: "3 · The ladder", min: 1.5,
    title: "The best US open-weight model is three points behind Opus 4.8, at a fifth of the price.",
    models: [
      { ...M.frontier, tag: "Anthropic · GovCloud 22 Sep" },
      { ...M.opus48, tag: "Anthropic · GovCloud 30 Jun" },
      { ...M.usopen, tag: "Meta · sibling of Wonder Full", hot: true },
      { ...M.nemotron, tag: "NVIDIA · permissive licence · 120B" },
    ],
    line: "Meta's closed Muse Wonder Full scores 56, so watch what Meta releases openly next.",
    caveat: "Caveat: most benchmarks are gamed. Labs tune for the tests and publish their best results, so run your own evaluations on your own work.",
    source: "US-built models only. Artificial Analysis Intelligence Index v4.3.2, read 18 Oct 2026 (Muse Wonder Full: 12 Oct); blended $/M at 7:2:1; first-party speed.",
    notes: `Every model on this slide is American, and the scores are from Artificial Analysis, read on October eighteenth. The frontier, Opus 5.5, scores fifty-eight. Opus 4.8, the frontier in May, scores forty-two. Meta's Muse Spark Open, which you can run on your own hardware, scores thirty-nine: three points behind Opus 4.8 at a fifth of the price and twice the speed. Its closed sibling, Muse Wonder Full, scored fifty-six when it came out on October twelfth, so watch what Meta releases openly next. NVIDIA's Nemotron 3.5 Super scores twenty-six, but it costs fourteen cents per million tokens, runs at nearly four hundred tokens a second and has a permissive licence, which makes it a good fit for routine work. Check Muse's licence before any defense use. Last, a caveat: most benchmarks are gamed. Use these numbers for the shape of the market, and use your own tests to decide what to buy.`,
  } : {
    id: "openvs", type: "models", section: "3 · The ladder", min: 1.5,
    title: "The best open model now beats last spring's frontier at a twentieth of the price.",
    models: [
      { ...M.frontier, tag: "frontier · metered" },
      { ...M.open, tag: "best open weights · MIT licence", hot: true },
      { ...M.opus48, tag: "the frontier in May" },
      { ...M.usopen, tag: "best US open weights · Muse licence" },
    ],
    line: "Run open weights without a cap on capacity you own, and send only the hard problems to the 58.",
    source: "Artificial Analysis Intelligence Index v4.3.2 and model pages, read 18 Oct 2026. Blended $/M at 7:2:1 cache-hit:input:output; output speed on the first-party API.",
    notes: `These are today's scores from Artificial Analysis, read on October eighteenth. The frontier, Opus 5.5, scores fifty-eight at about three dollars per million tokens. The best open-weight model in the world, Xiaomi's MiMo, scores forty-six for eighteen cents. Opus 4.8, the frontier in May, scores forty-two at three eighty-five. So an open model you can download today beats the frontier of five months ago at a twentieth of the price. If you need an American model, Meta's Muse Spark Open scores thirty-nine at seventy-eight cents and a hundred and thirty tokens a second. Either way the approach is the same: run routine work on open weights you own, without a cap, and send a problem to the fifty-eight only when it needs it. One caveat: most benchmarks are gamed, so test on your own work before you buy.`,
  });

  S.push({
    id: "ladder", type: "fig", layout: "side", section: "3 · The ladder", min: 1.5,
    title: "Own three levels and rent one gate: routine work stays inside, and hard problems go out.",
    fig: { slot: "ladder", steps: [0, 1, 2, 3, 4], board: false },
    stats: G ? [
      { n: String(M.usopen.index), l: `US open on the rungs you own: $${M.usopen.price.toFixed(2)} per million tokens, ${Math.round(M.usopen.tps)} a second, no cap` },
      { n: String(M.frontier.index), l: `the frontier, through one gate: $${M.frontier.price.toFixed(2)} per million, ${Math.round(M.frontier.tps)} a second, metered`, accent: true },
      { n: "1 gate", l: "sensitive context removed on the way out" },
    ] : [
      { n: String(M.open.index), l: `open weights on the rungs you own: $${M.open.price.toFixed(2)} per million tokens, no cap` },
      { n: String(M.frontier.index), l: `the frontier, through one gate: $${M.frontier.price.toFixed(2)} per million, metered`, accent: true },
      { n: "1 gate", l: "sensitive context removed on the way out" },
    ],
    source: "Artificial Analysis Intelligence Index v4.3.2, Oct 2026. Token mix illustrative.",
    notes: `This is what you're asking for: three levels of capacity inside the fence. [advance] The first is your own machine, refreshed now with NPU laptops and workstations. [advance] The second is a shared inference box for your team. [advance] The third is the core, the rack-scale build, which comes later and is paid for by the growth you create. [advance] Then there's one gate, which is the only way out. Work that needs the frontier goes through it, it's metered, and sensitive context is removed on the way out. [advance] So two rules apply. Volume on the levels you own has no cap, because you own the capacity. Use of the frontier has to be justified, because that's where the cost and the leak are. Nobody has to pick a model by hand; a router does that.`,
  });

  S.push({
    id: "vend", type: "fig", layout: "wide", section: "3 · The ladder", min: 1,
    title: "Above 5.3 hours a day, owning the hardware costs less than renting it, and you work about twelve.",
    fig: { slot: "vending", steps: [1, 2, 3], board: true },
    source: "Lenovo 2026 TCO (vendor study): 5-year life, zero residual, 12% maintenance, $0.12/kWh; ~5.2-month break-even. Frontier and wrapped rates are Brad's reads.",
    notes: `Now the money. Take one item, a million tokens from the same open model, and buy it four ways. On a cloud GPU it costs ninety-seven cents. Through a frontier API at a typical coding mix it's about twelve dollars. ${G ? "A wrapped federal LLM service" : "A wrapped enterprise LLM service"} charges up to forty-five. With capacity you own, the price depends on how much you use it. [advance] At three hours a day it's a dollar seventy-one. [advance] At five point three hours a day it matches the cloud, which is about a five-month break-even. [advance] At twelve hours a day, which is closer to how you work, it's forty-three cents. The difference comes down to utilization. You aren't asking them to buy hardware for everyone, only for the people who will keep it busy.`,
  });

  S.push({
    id: "rfp", type: "fig", layout: "wide", section: "3 · The ladder", min: 1.5,
    title: "Use AI to write the capacity RFP: give it your timeline and budget, and get the requirements you want.",
    fig: { slot: "rfp", steps: [0, 1, 2], board: true },
    source: pick(v,
      "Illustrative workflow from the manifesto. Source selection plans and technical evaluation plans are source selection information under FAR 2.101.",
      "Illustrative workflow from the manifesto."),
    notes: pick(v,
      `Most of you write the solicitations, so write the one for this capacity with AI, on your own machines. Give it your timeline and a budget to work from. For example: four million dollars, with five years of support, running before the end of the fiscal year. Ask it what that buys and what the requirements have to say so you get it on time. [advance] The router splits the work. Requirements, evaluation criteria, security clauses and the schedule come from documents you already have, so agents on your own machines draft them and nothing leaves. Two parts need outside information: market research on who can deliver by your date, and current pricing. [advance] Those two go out through the gate with the solicitation number, the budget and the evaluation plan removed, and the request is logged. That matters, because source selection plans and technical evaluation plans are source selection information under the FAR. [advance] The outside model only sees a general capability question, and you make the decisions. The follow-up site gives you the prompt and a rough estimate. Or ask us, and we'll give you an estimate.`,
      `Many of you write the RFPs your company buys with, so write the one for this capacity with AI, on your own machines. Give it your timeline and a budget to work from. For example: four million dollars, with five years of support, running next quarter. Ask it what that buys and what the requirements have to say so you get it on time. [advance] The router splits the work. Requirements, evaluation criteria, security terms and the schedule come from documents you already have, so agents on your own machines draft them and nothing leaves. Two parts need outside information: market research on who can deliver by your date, and current pricing. [advance] Those two go out through the gate with the RFP number, the budget and the evaluation plan removed, and the request is logged. Your budget and the way you'll score vendors are exactly what a vendor would most like to see. [advance] The outside model only sees a general capability question, and you make the decisions. The follow-up site gives you the prompt and a rough estimate. Or ask us, and we'll give you an estimate.`),
  });

// ───────────────────────────── selling up ─────────────────────────────
  S.push({
    id: "tubes", type: "fig", layout: "wide", section: "4 · Selling up the chain", min: 1.5,
    title: "Your job upstairs is to give each office one sentence it can agree to.",
    fig: { slot: "tubes", steps: [0, 1, 2, 3], board: false },
    source: "The manifesto's three drivers (pricing, security, operations) translated for each office.",
    notes: pick(v,
      `This is the part you'll use most. Your leadership doesn't need this whole talk. Each office needs one sentence it can agree to. [advance] For the CFO: capacity is a fixed obligation, and a meter is not. No agency may obligate more than it has, and a per-token bill during a continuing resolution is exactly what comptrollers worry about. Owned capacity is a number they can plan for. [advance] For the CIO: apply the IT rules you already have to models. That means a curated model repository, a gateway on every device, and retrieval that follows your existing access controls. It extends work they already know how to do. [advance] For the agency head: our decision-making data is either our asset or someone else's training data. [advance] Three offices, three sentences. Make sure each office gets its own.`,
      `This is the part you'll use most. Your leadership doesn't need this whole talk. Each office needs one sentence it can agree to. [advance] For the CFO: a cap ends up costing more than owning capacity. Their concern isn't the size of the number, it's that nobody can predict it. Owned capacity is a number they can predict. [advance] For the CIO: apply the IT rules you already have to models. That means a curated model repository, a gateway on every device, and retrieval that follows your existing access controls. [advance] For the CEO: our decision-making data is either our asset or someone else's training data. [advance] Three offices, three sentences. Make sure each office gets its own.`),
  });

  S.push({
    id: "sequence", type: "steps", section: "4 · Selling up the chain", min: 1,
    title: "Ask for it in stages: your machine now, the team's box next and the core once it's proven.",
    steps: [
      { k: "Now", v: "An emergency refresh for the heaviest users: secured machines with no cap.", accent: true },
      { k: "Next", v: "A shared workgroup box that everyone else can use." },
      { k: "Once proven", v: "The core, paid for by the growth you create." },
      { k: "Always", v: "The frontier through one metered gate, for the hard problems." },
    ],
    source: "AI-capable PCs pass half of shipments in 2026 (Counterpoint). Power takes the longest to arrange, so plan it now.",
    notes: `Don't ask for a data center. You'll lose that argument. Nobody approves a ten-megawatt facility for usage that doesn't exist yet. Plan it around the people who use it. Now: an emergency refresh for the heaviest users, without waiting for the normal cycle. Next: a shared workgroup box that everyone else can use. The core gets built once you've proven the demand, paid for by the growth you create. The frontier stays available through one gate, metered, for the hard problems. Prices are rising, hardware is hard to get, and power takes the longest to arrange, so this needs to be planned like a capital project rather than filed as an IT ticket.`,
  });

  S.push(G ? {
    id: "deadline", type: "three", section: "4 · Selling up the chain", min: 1.5,
    title: "Your advantage is your data, your risk is losing people, and your deadline is October 31.",
    head: ["", "The fact", "What you ask for"],
    rows: [
      ["Data", "Every need-to-know enclave is effectively its own organization. The large cloud providers handle IL6 multi-tenancy in their own buildings, at their prices, on their meter.", "Temporary GPU zones inside your own boundary, drawn from the core, so the data never has to leave.", true],
      ["People", "Federal pay is 27.5% behind the private sector, and many of the strongest builders have already left.", "Machines with no cap for the builders who stayed. It's one of the best reasons for them to stay."],
      ["Deadline", "Claude's $1 price ends October 31. The continuing resolution runs to December 11. FY27 renewals are being written now.", "Owned capacity, priced against the renewal before the renewal is signed."],
    ],
    source: "Federal Salary Council (27.54%, Nov 2023); FedScoop, Sep 2026; continuing resolution signed 2 Sep 2026; Azure Government Secret / AWS Secret Region (IL6).",
    notes: `Three facts that are specific to government. First, your advantage is your data. Treat every need-to-know enclave as its own organization. The large cloud providers have solved IL6 multi-tenancy, but in their buildings, at their prices and on their meter. Second, your risk is people. Federal pay is about twenty-seven and a half percent behind the private sector. Many of the people who could have led this have already left, some of them to found the labs. The right tools are one of the best ways to keep the ones who stayed, which means you. Third, the deadline is real. Claude's dollar price ends on October thirty-first, the continuing resolution runs to December eleventh, and FY27 renewals are being written now. Get your numbers to the people writing them.`,
  } : {
    id: "proof", type: "three", section: "4 · Selling up the chain", min: 1,
    title: "The companies doing this well run agents on a defined workflow, with a person approving key steps.",
    head: ["", "What they did", "What it shows"],
    rows: [
      ["Cisco, 2026", "Agents for 90,000 employees; each picks its model; 80–90% of SEC-filing first drafts; mostly on its own hardware.", "It works at scale, on their own hardware.", true],
      ["Salesforce benchmark", "12 agents per enterprise, and half of them operate with no oversight.", "Ungoverned agents are the new shadow IT."],
      ["Futurum · CMU", "11% of planned agent projects reached production; an all-agent company hit 24% task success.", "Open-ended loops fail; defined workflows with human approval work."],
    ],
    source: "Fortune, Jul 2026; Salesforce 2026 Connectivity Benchmark; Futurum 1H 2026; CMU TheAgentCompany.",
    notes: `If someone upstairs says this is theoretical, point to Cisco. This year it put agents in front of ninety thousand employees, with each agent choosing its own model. AI now writes eighty to ninety percent of the first drafts of their SEC filing narratives, and it runs mostly on their own hardware. Meanwhile the average enterprise runs twelve agents and half of them report to nobody, which helps explain why only eleven percent of planned agent projects reach production. The difference is a defined workflow with a person approving the key steps. Your company's decision-making data is the most valuable thing it will build, so don't run it on someone else's meter.`,
  });

  // ───────────────────────────── the fork ─────────────────────────────
  S.push({
    id: "vote", type: "vote", section: "5 · The fork", min: 1.5,
    title: pick(v, "By 2029 every agency will have chosen, by acting or by waiting, so vote for where yours is today.", "By 2029 every organization will have chosen, by acting or by waiting, so vote for where yours is today."),
    options: [
      { id: "own", k: "Own the boundary", v: "Remove the cap for the heaviest users on capacity you own, build the ladder, and put a gateway on every device." },
      { id: "rent", k: "Keep renting", v: pick(v, "Sign the per-token renewal, cap the heavy users, and rely on the contract to cover traffic it never sees.", "Sign the renewal, cap the heavy users, and rely on the contract to cover traffic it never sees.") },
    ],
    notes: `So this is the choice. By 2029 the capacity shortage, the renewals and the new products will all have arrived, and the decision you can still make is the one made now. Scan the code and vote for where your ${pick(v, "agency", "organization")} actually is today, not where you'd like it to be. [wait 30 to 45 seconds, then read the tally] That split is a good picture of the market. If you voted for renting, you now know why you were invited to this talk. (Fallback: show of hands; press 1 for own, 2 for rent.)`,
  });

  S.push({
    id: "futures", type: "futures", section: "5 · The fork", min: 1,
    title: "Renting stays flat for two years and then climbs steeply, while owning keeps paying off.",
    rented: G ? [
      "The renewal comes priced per user or per token. It won't be a dollar, and the meter has no ceiling.",
      "The heaviest users hit the caps within a quarter, and personal accounts take the rest.",
      "Routine mission work ships as someone else's product feature.",
      "Your best builders leave for the private sector, where pay is 27.5% higher.",
    ] : [
      "The renewal comes priced per user, in tiers. It won't be a dollar.",
      "The heaviest users hit the caps within a quarter, and personal accounts take the rest.",
      "By year four a new product reaches your industry, and the routine 80% ships as someone else's feature.",
      "Your best builders leave, and some of them build the product aimed at you.",
    ],
    owned: [
      "The full setup is standard: device, workgroup, core and a gated frontier.",
      "Agents have a registry, kill switches and a person approving key steps.",
      pick(v, "Mission data runs on your own hardware and never leaves.", "Business data runs on your own hardware and never leaves."),
      pick(v, "Small teams move faster than the bureaucracy, and building your own capacity is how the US stays ahead.", "Small teams move faster than large ones, and the team that builds this is the one others copy."),
    ],
    notes: pick(v,
      `These are the two paths. If you keep renting, the renewal is priced per user or per token, and a meter without a ceiling is something no comptroller can sign. The heaviest users hit the caps within a quarter. Spending stays flat for a while and then climbs steeply. Routine mission work shows up as someone else's product feature, and the builders leave for twenty-seven percent more pay. If you own the capacity, the setup becomes standard, agents have real controls, and your mission data keeps getting more valuable on your own hardware. Every agency that does this now adds to the country's capacity.`,
      `These are the two paths. If you keep renting, the renewal is priced per user, in tiers. The heaviest users hit the caps within a quarter. Spending stays flat for a while and then climbs steeply, and the caps don't stop that; they move the work to tools the contract doesn't cover. By year four a new product reaches your industry. If you own the capacity, the setup becomes standard, agents have real controls, and your business data keeps getting more valuable on your own hardware. This is a moment when small, fast teams can beat much larger ones.`),
  });

  S.push({
    id: "monday", type: "close", section: "Monday", min: 1,
    title: "On Monday, build the map, log your hours and book three meetings.",
    roles: [
      { k: "Build the map", v: "Every system with an AI feature, who pays for its tokens, which model it uses and what fails when that model is down. One page." },
      { k: "Log your hours", v: "How many hours a day you keep a machine busy, for two weeks. Above 5.3 a day, owning the hardware pays off." },
      { k: "Book three", v: `${pick(v, "CFO, CIO and agency head", "CFO, CIO and CEO")}: one sentence each and one ask, capacity for the people who use the most.` },
    ],
    notes: `There are three things to do on Monday, and none of them needs anyone's permission. First, build the map: one page listing every system with an AI feature, who pays for its tokens, which model it uses, and what breaks when that model is down. Your CIO probably can't answer that last question today, and you can. Second, log your hours for two weeks: how long each day you keep a machine busy. Above five point three hours a day, owning the hardware pays for itself. The map and the hours are the two numbers that turn a conversation into a purchase order. Third, book three meetings, with ${G ? "the CFO, the CIO and the agency head" : "the CFO, the CIO and the CEO"}, and bring one sentence for each and one ask: capacity for the people who use the most. The link on the last slide turns your answers into a one-page request.`,
  });

  S.push({
    id: "end", type: "end", section: "", min: 0.5,
    title: "Intent is the new oil. Capping tokens is the leak.",
    sub: "Go get the capacity.",
    notes: `The labs aren't the problem. The router still sends your hardest questions to the best models in the world, and it should. The problem is the default setup. By default, consumer plans can train on your data, deployments are metered, and ${G ? "agencies" : "companies"} cap their best people and then wonder why they leave. You're those people, so go get the capacity. Thank you. Let's take questions.`,
  });

  return S;
}
