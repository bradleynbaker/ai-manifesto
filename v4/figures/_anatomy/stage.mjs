// Stage type for the v4 talk: every figure's words sized to read from the back of a room on a projector.
export const STAGE_CSS = `
.iso{--anatomy-weight:.85px}
.iso-page{width:min(1120px,100% - 32px);margin:40px auto 72px}
.iso-plate{padding:76px 28px 64px}
.iso-plate-corners{inset:22px 28px}
.iso-plate-corner{font-size:15px;letter-spacing:.06em}
.iso-plate-corner[data-corner="fig"]{font-size:17px;font-weight:600}
.iso-plate-corner[data-corner="title"]{font-size:20px;font-weight:700;color:var(--anatomy-strong);letter-spacing:.08em}
.iso-plate-corner[data-corner="hint"]{bottom:0;font-size:14px}
.iso-plate-corner[data-corner="readout"]{font-size:22px;font-weight:700;color:var(--anatomy-strong)}
.iso-legend{font-size:17px;line-height:1.55;gap:12px;margin-top:18px;color:var(--anatomy-text)}
.iso-keys{gap:8px 26px}
.iso-swatch{width:22px;height:14px}
.board{display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr;align-items:end;gap:6px 16px;margin-top:18px;padding:18px 22px;background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-mid);font-family:var(--anatomy-mono);color:var(--anatomy-strong)}
.board .cell{display:grid;gap:6px;min-width:0}
.board .lab{font-size:13px;white-space:nowrap;letter-spacing:.12em;text-transform:uppercase;color:var(--anatomy-muted)}
.board .num{font-size:clamp(26px,4vw,46px);font-weight:700;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap}
.board .op{font-size:clamp(22px,3vw,36px);color:var(--anatomy-muted);padding-bottom:4px}
.board input.num{width:100%;min-width:0;background:var(--anatomy-face);border:0;box-shadow:inset 0 0 0 1.5px var(--anatomy-hi);padding:6px 10px;color:inherit;font-family:inherit}
.board input.num:focus{outline:3px solid var(--anatomy-hi);outline-offset:2px}
.board .bill .num{color:var(--anatomy-lit)}
.board .note{grid-column:1/-1;font-size:14px;color:var(--anatomy-muted);display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.board button{font:inherit;font-size:14px;background:none;border:0;box-shadow:inset 0 0 0 1px var(--anatomy-mid);padding:6px 12px;color:var(--anatomy-text);cursor:pointer}
.board button[hidden]{display:none}
@media (max-width:700px){.board{grid-template-columns:1fr;padding:14px 16px}.board .op{display:none}.board .lab{white-space:normal}.iso-plate-corner[data-corner="hint"]{display:none}.iso-plate-corner{font-size:13px}.iso-plate-corner[data-corner="title"],.iso-plate-corner[data-corner="readout"]{font-size:16px}}
`;
