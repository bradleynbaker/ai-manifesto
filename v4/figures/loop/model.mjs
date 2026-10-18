// Fig 1 · The leak loop — the words and numbers every part of the figure reads.
// Sources (the manifesto's verified appendix):
//   shadow AI: 66% of office workers use AI tools they believe aren't allowed; 88% have pasted work info into them
//              (PagerDuty survey, June 2026, n = 1,250)
//   adoption:  one agency went from 0 to 19,000 users in 45 days (AI Weekly, Aug 2026)
//   training:  consumer plans carry the training toggle; 5-year retention if it is on (Anthropic consumer terms, Aug 2025)
//   roadmap:   the labs classify usage into 30+ categories of work (Anthropic Economic Index, published method)
// The machine itself (track, stations, switch) is illustrative; only these numbers are claims.
export const STEPS = [
  {
    n: 1,
    name: "USAGE EXPLODES",
    lines: ["USAGE", "EXPLODES"],
    key: "0 → 19,000",
    keyLab: "Users in 45 days",
    note: "One agency went from 0 to 19,000 users in 45 days.",
  },
  {
    n: 2,
    name: "THE METER ARRIVES",
    lines: ["THE METER", "ARRIVES"],
    key: "Flat → PAYG",
    keyLab: "How the plans change",
    note: "Flat plans → session caps → weekly caps → pay-as-you-go overflow.",
  },
  {
    n: 3,
    name: "CAP THE NATIVES",
    lines: ["CAP THE", "NATIVES"],
    key: "Heaviest first",
    keyLab: "Who gets capped",
    note: "Rationing is how a CFO survives a meter; everyone caps their heaviest users first.",
  },
  {
    n: 4,
    name: "GO PERSONAL",
    lines: ["GO", "PERSONAL"],
    key: "66% · 88%",
    keyLab: "Use banned tools · pasted work info",
    note: "66% of office workers use AI tools they believe aren't allowed; 88% have pasted work info into them.",
  },
  {
    n: 5,
    name: "PERSONAL ACCOUNTS TRAIN",
    lines: ["PERSONAL", "ACCOUNTS", "TRAIN"],
    key: "5 years",
    keyLab: "Retention, toggle on",
    note: "Consumer plans carry the training toggle; 5-year retention if it's on; the enterprise contract never sees this traffic.",
  },
  {
    n: 6,
    name: "INTENT → ROADMAP",
    lines: ["INTENT →", "ROADMAP"],
    key: "30+",
    keyLab: "Categories of work",
    note: "The labs classify usage into 30+ categories of work (their published method).",
  },
  {
    n: 7,
    name: "THE SPIKE EATS THE 80%",
    lines: ["SPIKE EATS", "THE 80%"],
    key: "The 80%",
    keyLab: "Where spikes land",
    note: "Capability spikes land where the map is dense: images, code, security, finance, legal.",
  },
  {
    n: 8,
    name: "OWN THE BOUNDARY",
    lines: ["OWN THE", "BOUNDARY"],
    key: "Step 3",
    keyLab: "Where the loop stops",
    note: "Owned, uncapped capacity stops the loop at step 3: the switch sends intent into OWNED, and 4–7 never happen.",
  },
];
export const STATES = ["1", "2", "3", "4", "5", "6", "7", "8 · break"];
export const KEY_STATE = 3; // step 4: the full loop, intent already leaking out of the side door
export const readoutOf = (i) => `Step ${STEPS[i].n} · ${STEPS[i].name}`;
