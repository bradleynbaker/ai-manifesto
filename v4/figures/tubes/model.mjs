// F11 · The chain of command: the one model the tubes, the diverter, the cards, the readout and the board all read.
// No numbers in this figure: its truth is the wording. Every sentence below is the manifesto's own
// ("Selling up the chain", the three sentences for a CFO, a CIO and a CEO), and each card is that sentence
// cut to two short lines so it reads from the back of the room. The three offices map onto the manifesto's
// three drivers in the order the talk gives them: pricing, security, operations.
export const OFFICES = [
  {
    id: "CFO",
    driver: "Pricing",
    card: ["A CAP COSTS MORE", "THAN CAPACITY"],
    sentence: "A cap costs more than capacity.",
    note: "The budget detonation: a CFO can live with a big number, not one that detonates. Owned capacity is the predictable number.",
  },
  {
    id: "CIO",
    driver: "Security",
    card: ["IT RULES", "FOR MODELS"],
    sentence: "IT rules for models.",
    note: "Curated model repo, a shim on every device, retrieval that follows the ACLs you already have.",
  },
  {
    id: "CEO",
    driver: "Operations",
    card: ["OUR ASSET OR", "THEIR TRAINING DATA"],
    sentence: "Our decision graph: our asset or their training data.",
    note: "Your decision graph is either your asset or their training data. Own the boundary.",
  },
];

export const ALL = {
  id: "all three",
  driver: "One each",
  note: "One sentence per office, each in the words that office signs: pricing to the CFO, security to the CIO, operations to the CEO.",
};

export const STATES = [...OFFICES.map((office) => office.id), ALL.id];
export const KEY = STATES.length - 1; // "all three": every card up
