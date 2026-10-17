// F2 · the token meter — the one model the needle, the carriage, the knob and the readout all read.
// Sources (Appendix A of the manifesto):
//   volume: the top customer used ~100K tokens a month in 2019 and ~100B a month in 2026 (Altman, on stage, June 2026)
//   price:  frontier list price $60 per M tokens at the 2020 API launch (Davinci, $0.06 / 1K, cut to $0.02 on 1 Sept 2022),
//           Opus-class frontier $3.85 per M blended in 2026 (Artificial Analysis comparison)
//   team:   one 3-person team, 603B tokens and a $1.3M bill in one month (published bill)
// Between the published points both curves are interpolated on a log scale; 2019 uses the 2020 launch price.
export const STOPS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "team"];
export const LAST = STOPS.length - 1;
const lerp = (a, b, t) => a + (b - a) * t;
const logLerp = (a, b, t) => Math.pow(10, lerp(Math.log10(a), Math.log10(b), t));
export const TEAM = { tokens: 603e9, bill: 1.3e6 };
export function at(u) {
  const s = Math.min(LAST, Math.max(0, u));
  let tokens, price;
  if (s <= 7) {
    tokens = logLerp(1e5, 1e11, s / 7);
    price = s <= 1 ? 60 : logLerp(60, 3.85, (s - 1) / 6);
  } else {
    const t = s - 7;
    tokens = logLerp(1e11, TEAM.tokens, t);
    price = logLerp(3.85, TEAM.bill / (TEAM.tokens / 1e6), t);
  }
  return { u: s, tokens, price, bill: (tokens / 1e6) * price };
}
export const money = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(v >= 1e5 ? 0 : v >= 1e4 ? 1 : 2)}K` : v >= 100 ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`);
export const count = (v) => (v >= 1e9 ? `${(v / 1e9).toFixed(v >= 1e11 ? 0 : 1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(v >= 1e8 ? 0 : 1)}M` : `${(v / 1e3).toFixed(0)}K`);
