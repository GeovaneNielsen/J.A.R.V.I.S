// Composition: static desk image + per-beat props + kinetic captions + overlay (blinds, vignette, grain).
const FR = TL.frases, BL = TL.blocos.filter((b) => "b" in b), TC = TL.blocos.find((b) => "title_card" in b).title_card;
const SEQ = FR.map((f, i) => ({ start: f.t0 - 0.15, f, beat: BEATS[i] }));
SEQ.push({ start: TC, title: true });
SEQ.sort((a, b) => a.start - b.start);
SEQ.forEach((s, i) => (s.end = SEQ[i + 1] ? SEQ[i + 1].start : TL.total));

function caption(lines, t, f) {
  const words = []; let on = null;
  const parsed = lines.map((ln) => { const small = ln.startsWith("~"); const ws = ln.replace(/^~/, "").split(" ");
    return { small, ws: ws.map((w) => { let col = on; if (w.startsWith("*")) { on = "m"; col = "m"; w = w.slice(1); } if (w.startsWith("_")) { on = "r"; col = "r"; w = w.slice(1); }
      let end = false; if (/[*_][?.!,]?$/.test(w)) { w = w.replace(/[*_]([?.!,]?)$/, "$1"); end = true; } const o = { w, col }; if (end) on = null; words.push(o); return o; }) }; });
  const dur = Math.max(0.6, f.t1 - f.t0), N = words.length;
  words.forEach((o, j) => (o.k = clamp((t - 0.1 - (j / N) * dur * 0.6) / 0.12)));
  let y = 150, out = "";
  for (const p of parsed) {
    const size = p.small ? 54 : 112, h = p.small ? 70 : 118;
    out += `<text x="960" y="${y + (p.small ? 40 : 92)}" text-anchor="middle" ${p.small ? ITAL : HEAVY} font-size="${size}" fill="${GRAYT}" stroke="#0a0f0c" stroke-opacity=".75" stroke-width="${p.small ? 7 : 12}" paint-order="stroke" stroke-linejoin="round">${p.ws.map((o) => `<tspan fill="${o.col === "m" ? MUSTARD : o.col === "r" ? "#e04a3a" : GRAYT}" opacity="${o.k}">${o.w}</tspan>`).join(" ")}</text>`;
    y += h;
  }
  return out;
}
function tape(text) {
  const w = text.length * 24 + 80;
  return `<g transform="translate(40 28) rotate(-1.5) scale(.8)" filter="url(#shadow)"><rect width="${w}" height="70" fill="#d9cfa6" opacity=".93"/><text x="40" y="47" font-family="DejaVu Sans Mono, monospace" font-size="34" fill="#2a2a30">${text}</text></g>`;
}
function titleCard(t) {
  return drop(t, newspaper(960, 600, 0.95, -2, "A OU B · ARQUIVO", ["O CORONEL", "FAWCETT"], "um documentário A ou B", at(t, 0.8, 1.8), `<text x="380" y="640" ${SERIF} font-weight="bold" font-size="300" fill="#e9e2cf" text-anchor="middle">Z</text>`), { y: 600 })
    + brush(1390, 860, at(t, 1.6, 2.4), "E A CIDADE Z", 680);
}
const chapterAt = (T) => { let c = null; for (const blk of BL) if (T >= blk.t0 - 0.9) c = blk; return c; };
const PROP_T = `translate(960 690) scale(1.2) translate(-960 -640)`;
function beatSvg(s, t) {
  if (s.title) return titleCard(t);
  const d = s.end - s.start;
  return `<g transform="${PROP_T}">${s.beat[1](t, d)}</g>`;
}
window.setFrame = (T) => {
  let idx = 0; for (let i = 0; i < SEQ.length; i++) if (T >= SEQ[i].start) idx = i;
  if (T < SEQ[0].start) idx = 0;
  const s = SEQ[idx], t = Math.max(0, T - s.start);
  let props = beatSvg(s, t);
  // the previous sheet is swept off the desk as the new one lands
  if (idx > 0 && t < 0.3) { const p = SEQ[idx - 1], k = easeOut(t / 0.3); props = `<g transform="translate(${-1900 * k} ${120 * k}) rotate(${-8 * k} 960 540)">${beatSvg(p, p.end - p.start)}</g>` + props; }
  let cap = "";
  if (!s.title) cap = caption(s.beat[0], t, s.f);
  const ch = chapterAt(T); const showCh = ch && ch.b > 0 && T - ch.t0 < 4.5 && T - ch.t0 > -0.6;
  const tp = showCh ? tape(`${String(ch.b).padStart(2, "0")} · ${BLOCOS[ch.b][0].toUpperCase()}`) : "";
  // final beat: subscribe line
  const last = idx === SEQ.length - 1 ? `<text x="960" y="1010" ${ITAL} font-size="48" fill="${GRAYT}" text-anchor="middle" opacity="${fade(t, 1.4, 1.8)}">inscreva-se para o próximo mistério</text>` : "";
  $("stage").innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${DEFS}${props}${cap}${tp}${last}</svg>`;
  // living light: blinds sway and slide (wind), clouds dim the sun, camera breathes
  const ph = (ch ? ch.b : 0) * 1.7;
  const bx = 220 * Math.sin(T * 0.16 + ph) + 80 * Math.sin(T * 0.05), by = 60 * Math.sin(T * 0.09 + ph) + 20 * Math.sin(T * 1.6) * Math.max(0, Math.sin(T * 0.23));
  const br = 4 * Math.sin(T * 0.07 + ph) + 0.6 * Math.sin(T * 0.9) * Math.max(0, Math.sin(T * 0.17 + 1));
  const cloud = 0.5 + 0.5 * Math.sin(T * 0.13 + ph) * Math.sin(T * 0.051 + 0.7);
  $("persiana").style.transform = `translate(${bx}px, ${by}px) rotate(${br}deg)`;
  $("persiana").style.opacity = String(0.35 + 0.4 * cloud);
  $("sun").style.opacity = String(0.25 + 0.6 * cloud);
  const z = 1.03 + 0.015 * Math.sin(T * 0.045);
  $("cam").style.transform = `translate(${9 * Math.sin(T * 0.09)}px, ${6 * Math.sin(T * 0.071 + 1)}px) scale(${z})`;
  const g = Math.floor(T * 15) % 3; for (let i = 0; i < 3; i++) $("ov" + i).style.display = i === g ? "block" : "none";
};
