// Linha Final, episódio 1: "Última Parada". Timeline engine + 10 scenes.
const W = 1080, H = 1920;
const $ = (id) => document.getElementById(id);
const clamp = (x) => Math.max(0, Math.min(1, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = (x) => { const c = 1.9; x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const FONT = `font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold"`;
const nestArt = (art, x, y, w, h) => art.replace("<svg ", `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet" `);
const charBy = (n) => chars.find((c) => c.name === n);
const itemBy = (n) => items.find((c) => c.name === n);
let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// --- talking mouths -------------------------------------------------------
const MOUTH = {
  valdir: ["Seu Valdir", '<path d="M90 138 Q100 142 110 138" fill="none" stroke-width="3.5"/>', '<ellipse cx="100" cy="139" rx="9" ry="8" fill="#7a2e2e" stroke-width="3.5"/>'],
  je: ["Jé", '<path d="M86 130 Q104 138 118 124" fill="none" stroke-width="4"/>', '<ellipse cx="102" cy="131" rx="11" ry="10" fill="#7a2e2e" stroke-width="3.5"/>'],
  otavio: ["Professor Otávio", '<path d="M84 130 q4 -5 8 0 t8 0 t8 0 t8 0" fill="none" stroke-width="3.5"/>', '<ellipse cx="100" cy="131" rx="10" ry="11" fill="#7a2e2e" stroke-width="3.5"/>'],
  cida: ["Dona Cida", '<path d="M82 126 Q100 144 118 126 Q100 134 82 126 Z" fill="#7a2e2e" stroke-width="3.5"/>', '<ellipse cx="100" cy="132" rx="13" ry="11" fill="#7a2e2e" stroke-width="3.5"/>'],
  kaua: ["Kauã", '<path d="M84 122 Q100 146 116 122 Z" fill="#7a2e2e" stroke-width="3.5"/><path d="M88 124 L112 124" fill="none" stroke="#fff" stroke-width="4"/>', '<ellipse cx="100" cy="132" rx="15" ry="18" fill="#7a2e2e" stroke-width="3.5"/><path d="M90 119 L110 119" fill="none" stroke="#fff" stroke-width="4"/>'],
};
const artOf = (who, open) => {
  const [name, closed, opened] = MOUTH[who];
  const a = charBy(name).art("");
  return open ? a.replace(closed, opened) : a;
};
// An actor that can talk: both mouth states drawn, one shown at a time.
function actor(who, id, x, y, w, h) {
  return `<g id="${id}"><g id="${id}C">${nestArt(artOf(who, false), x, y, w, h)}</g><g id="${id}O" style="display:none">${nestArt(artOf(who, true), x, y, w, h)}</g></g>`;
}
const talking = (who, T) => SPEECH.some((s) => s.who === who && T >= s.t0 && T < s.t1);
function mouth(id, who, T) {
  const s = SPEECH.find((s) => s.who === who && T >= s.t0 && T < s.t1);
  const open = !!s && Math.floor((T - s.t0) * 9) % 2 === 0;
  $(id + "C").style.display = open ? "none" : "";
  $(id + "O").style.display = open ? "" : "none";
}

// --- shared pieces ----------------------------------------------------------
function araucaria(x, base, h, c) {
  const t = [];
  for (let i = 0; i < 4; i++) { const y = base - h + i * h * 0.12, w = h * (0.18 + i * 0.07); t.push(`<path d="M${x - w} ${y + 18} Q${x} ${y - 22} ${x + w} ${y + 18} Q${x} ${y + 2} ${x - w} ${y + 18} Z" fill="${c}"/>`); }
  return `<rect x="${x - 5}" y="${base - h * 0.75}" width="10" height="${h * 0.75}" fill="${c}"/>${t.join("")}`;
}
function nightView(id, x, y, w, h, inner = "") {
  seed = x + y + 3;
  const stars = Array.from({ length: 24 }, () => `<circle cx="${x + rnd() * w}" cy="${y + rnd() * h * 0.5}" r="${1.5 + rnd() * 2}" fill="#fff" opacity="${0.3 + rnd() * 0.5}"/>`).join("");
  const blds = Array.from({ length: 7 }, (_, i) => { const bw = w / 7, bh = h * (0.25 + rnd() * 0.3); return `<rect x="${x + i * bw}" y="${y + h - bh}" width="${bw - 6}" height="${bh}" fill="#1a2440"/>` + Array.from({ length: 6 }, (_, j) => (rnd() < 0.5 ? `<rect x="${x + i * bw + 12 + (j % 2) * (bw / 2 - 10)}" y="${y + h - bh + 16 + Math.floor(j / 2) * 34}" width="12" height="16" fill="#ffd77a" opacity=".85"/>` : "")).join(""); }).join("");
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26"/></clipPath><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1430"/><stop offset="1" stop-color="#28345e"/></linearGradient></defs>
    <g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}s)"/>${stars}${blds}
      ${araucaria(x + w * 0.2, y + h, h * 0.6, "#0e1628")}${araucaria(x + w * 0.8, y + h, h * 0.5, "#0e1628")}${inner}
      <path d="M${x + 40} ${y + h} L${x + w * 0.35} ${y}" stroke="#fff" stroke-width="16" opacity=".08"/></g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="none" stroke="${INK}" stroke-width="12"/>`;
}
const interior = () => `<defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a66"/><stop offset="1" stop-color="#1e2738"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#wallG)"/><rect width="${W}" height="230" fill="#4a5a76"/>
  <rect x="140" y="100" width="800" height="32" rx="16" fill="#f4fbff" stroke="${INK}" stroke-width="6"/>`;
const seatRow = (x, y, w, h) => `<g stroke="${INK}" stroke-width="6"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#f0a020"/><rect x="${x}" y="${y}" width="${w}" height="60" rx="26" fill="#2f5fb3"/></g>`;
function tag(text, x, y, bg = INK, fg = "#ffd34d", size = 40, id = "") {
  const w = text.length * size * 0.66 + 60;
  return `<g ${id ? `id="${id}"` : ""} ${FONT}><rect x="${x - w / 2}" y="${y - size - 18}" width="${w}" height="${size + 40}" rx="16" fill="${bg}" stroke="${INK}" stroke-width="5"/><text x="${x}" y="${y + 4}" fill="${fg}" font-size="${size}" text-anchor="middle" letter-spacing="2">${text}</text></g>`;
}
const corredor = (x, y, w, h) => nestArt(charBy("Lerdo comum").art("")
  .replace('fill="#3a3a30"', 'fill="#3a3a30"'), x, y, w, h) +
  `<g ${O}><rect x="${x + w * 0.28}" y="${y + h * 0.62}" width="${w * 0.42}" height="${h * 0.06}" rx="10" fill="#e8453c"/><rect x="${x + w * 0.3}" y="${y + h * 0.13}" width="${w * 0.46}" height="${h * 0.03}" rx="6" fill="#f4f4f4"/></g>`;
function caption(lines, y, size, fill = "#fff", id = "") {
  return `<g ${id ? `id="${id}"` : ""} ${FONT} text-anchor="middle">${lines.map((l, i) => `<text x="${W / 2}" y="${y + i * size * 1.15}" font-size="${size}" fill="${fill}" stroke="${INK}" stroke-width="${size / 5}" paint-order="stroke">${l}</text>`).join("")}</g>`;
}
function puffs(id) { return `<g id="${id}"></g>`; }
function drawPuffs(id, t, x0, y0, dx) {
  let s = "";
  for (let i = 0; i < 9; i++) { const p = clamp(t * 2.2 - i * 0.12); if (p > 0 && p < 1) s += `<circle cx="${x0 + p * dx}" cy="${y0 + Math.sin(i * 2) * 60 * p}" r="${26 + p * 110}" fill="#ffffff" opacity="${0.92 - p * 0.6}" stroke="${INK}" stroke-width="5"/>`; }
  $(id).innerHTML = s;
}
const doorView = (outside, id = "dv") => `
  ${interior()}
  <rect x="160" y="300" width="760" height="1420" rx="20" fill="#2b2b33" stroke="${INK}" stroke-width="10"/>
  <defs><clipPath id="${id}c"><rect x="180" y="320" width="720" height="1380" rx="12"/></clipPath>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1430"/><stop offset=".6" stop-color="#29355e"/><stop offset="1" stop-color="#3a3a44"/></linearGradient></defs>
  <g clip-path="url(#${id}c)"><rect x="180" y="320" width="720" height="1380" fill="url(#${id}g)"/>
    <rect x="180" y="1460" width="720" height="240" fill="#5a5a64"/><path d="M180 1460 L900 1460" stroke="${INK}" stroke-width="6"/>
    ${outside}</g>
  <g id="${id}L"><rect x="180" y="320" width="360" height="1380" fill="#7fb2d6" opacity=".28" stroke="${INK}" stroke-width="8"/><path d="M200 1100 L400 400" stroke="#fff" stroke-width="14" opacity=".2"/></g>
  <g id="${id}R"><rect x="540" y="320" width="360" height="1380" fill="#7fb2d6" opacity=".28" stroke="${INK}" stroke-width="8"/><path d="M580 1100 L780 400" stroke="#fff" stroke-width="14" opacity=".2"/></g>
  <rect x="900" y="230" width="30" height="1690" fill="#ffd34d" stroke="${INK}" stroke-width="6"/>`;
const openDoor = (id, k) => { $(id + "L").setAttribute("transform", `translate(${-330 * k} 0)`); $(id + "R").setAttribute("transform", `translate(${330 * k} 0)`); };

// --- scenes -----------------------------------------------------------------
const scenes = [];
// 1 (0–3): Kauã's selfie, the Lerdo slams the window.
scenes.push([0, 3, () => buildCena1(), (t, T) => {
  const talkNow = talking("kaua", T);
  const s = SPEECH.find((s) => s.who === "kaua" && T >= s.t0 && T < s.t1);
  const open = !!s && Math.floor((T - s.t0) * 9) % 2 === 0;
  $("kC").style.display = open ? "none" : ""; $("kO").style.display = open ? "" : "none";
  $("kaua").setAttribute("transform", `translate(0 ${talkNow ? Math.sin(t * 16) * 7 : Math.sin(t * 3) * 3})`);
  $("shout").style.display = talkNow ? "" : "none";
  const rise = backOut((t - 1.2) / 0.25), turn = clamp((t - 1.95) / 0.45);
  $("zomb").setAttribute("transform", `translate(${-26 * turn} ${(1 - rise) * 560}) rotate(${-9 * turn} 580 620)`);
  $("win").setAttribute("transform", `translate(${t > 1.42 && t < 1.75 ? Math.sin(t * 90) * 10 : 0} 0)`);
}]);

// 2 (3–8): Valdir drives, calm, a Lerdo chewing the side mirror.
scenes.push([3, 8, () => `
  ${interior()}
  ${nightView("ws", 60, 280, 960, 560, `<g id="road">${Array.from({ length: 8 }, (_, i) => `<rect x="${500 + i * 10}" y="${700 + i * 20}" width="${14 + i * 6}" height="${30 + i * 8}" fill="#ffd34d" opacity=".6"/>`).join("")}</g>`)}
  <g transform="translate(860 520)"><g id="mirror">
    <g ${O}><rect x="40" y="-10" width="16" height="120" fill="#2b2b33"/><rect x="0" y="60" width="150" height="190" rx="24" fill="#2b2b33"/><rect x="14" y="74" width="122" height="162" rx="16" fill="#7fb2d6"/></g>
    ${nestArt(charBy("Lerdo comum").art(""), -40, -60, 230, 403)}
  </g></g>
  <rect x="0" y="1260" width="${W}" height="660" fill="#22262f" stroke="${INK}" stroke-width="8"/>
  ${actor("valdir", "va", 140, 760, 620, 1085)}
  <g ${O} stroke-width="12"><ellipse cx="450" cy="1330" rx="300" ry="90" fill="none" stroke="#1b1b22" stroke-width="44"/><ellipse cx="450" cy="1330" rx="300" ry="90" fill="none" stroke="#3a3a44" stroke-width="20"/><rect x="420" y="1300" width="60" height="140" fill="#2b2b33"/></g>
  <rect x="0" y="1400" width="${W}" height="520" fill="#2b2f3a" stroke="${INK}" stroke-width="8"/>
  <g id="kpeek">${actor("kaua", "kp", 700, 1080, 480, 840)}</g>`,
  (t, T) => {
    mouth("va", "valdir", T); mouth("kp", "kaua", T);
    $("mirror").setAttribute("transform", `rotate(${Math.sin(t * 18) * 3})`);
    $("road").setAttribute("transform", `translate(0 ${(t * 80) % 40})`);
    $("kpeek").setAttribute("transform", `translate(${(1 - easeOut((t - 0.1) / 0.3)) * 500 + (t > 2.6 ? easeOut((t - 2.6) / 0.4) * 500 : 0)} 0)`);
    $("va").setAttribute("transform", `translate(0 ${Math.sin(t * 2) * 3})`);
  }]);

// 3 (8–14): terminal stop — Dona Cida and Rex at the door.
scenes.push([8, 14, () => doorView(`
    <rect x="620" y="560" width="220" height="70" rx="10" fill="#1b1b22" stroke="${INK}" stroke-width="5"/>
    <text x="730" y="608" ${FONT} font-size="34" fill="#ffd34d" text-anchor="middle">TERMINAL</text>
    <rect x="720" y="630" width="14" height="840" fill="#3a3a44"/>
    <g id="cidaG">${actor("cida", "ci", 260, 700, 560, 980)}</g>
    <g id="rexG">${nestArt(charBy("Rex").art(""), 560, 1150, 320, 560)}</g>`),
  (t, T) => {
    openDoor("dv", easeInOut((t - 0.3) / 0.6));
    mouth("ci", "cida", T);
    $("cidaG").setAttribute("transform", `translate(0 ${Math.sin(t * 3) * 4})`);
    const bark = talking("rex", T);
    $("rexG").setAttribute("transform", `translate(0 ${bark ? -26 : 0})`);
  }]);

// 4 (14–20): Professor Otávio runs in under an open umbrella; Cida offers cake.
scenes.push([14, 20, () => `
  ${interior()}
  ${nightView("w4", 60, 300, 960, 460)}
  ${seatRow(-60, 1300, 380, 560)}${seatRow(760, 1300, 380, 560)}
  <g id="cida4">${actor("cida", "c4", -40, 760, 560, 980)}
    <g transform="translate(330 1250) scale(.42)">${nestArt(itemBy("Bolo de pote").art(""), 0, 0, 240, 220)}</g></g>
  <g id="ota">${actor("otavio", "ot", 420, 640, 640, 1120)}
    <g transform="translate(470 320)"><g id="umb">${nestArt(itemBy("Guarda-chuva").art(""), 0, 0, 560, 513)}</g></g></g>`,
  (t, T) => {
    mouth("c4", "cida", T); mouth("ot", "otavio", T);
    const inK = easeOut(t / 0.7);
    $("ota").setAttribute("transform", `translate(${(1 - inK) * 700 + Math.sin(t * 40) * 3} ${Math.abs(Math.sin(t * 10)) * (t < 0.7 ? 20 : 0)})`);
    $("umb").setAttribute("transform", `rotate(${Math.sin(t * 20) * 3} 280 200)`);
    const offer = easeOut((t - 3.4) / 0.4);
    $("cida4").setAttribute("transform", `translate(${offer * 60} 0)`);
  }]);

// 5 (20–26): Jé outruns a Corredor and dives through the window.
scenes.push([20, 23.3, () => `
  <defs><linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070d22"/><stop offset="1" stop-color="#2a3660"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sky5)"/><circle cx="880" cy="360" r="60" fill="#fff6d6"/>
  ${[80, 380, 700, 1000].map((x, i) => araucaria(x, 1180, 360 + (i % 2) * 100, "#0d1530")).join("")}
  <rect x="0" y="1180" width="${W}" height="740" fill="#1a1f2c"/>
  ${nestArt(itemBy("A Lata").art(""), 360, 880, 1000, 426)}
  <g id="je5">${nestArt(charBy("Jé").art(""), 0, 0, 300, 525)}</g>
  <g id="cor5">${corredor(0, 0, 320, 560)}</g>`,
  (t) => {
    const run = clamp(t / 2.0);
    const jx = -300 + run * 620, jy = 1200 + Math.abs(Math.sin(t * 14)) * -24;
    let x = jx, y = jy, rot = 0, sc = 1;
    if (t > 2.0) { const k = clamp((t - 2.0) / 0.6); x = 320 + k * 220; y = 1200 - Math.sin(k * Math.PI) * 420 - k * 120; rot = k * 40; sc = 1 - k * 0.35; }
    $("je5").setAttribute("transform", `translate(${x} ${y - 525}) rotate(${rot} 150 260) scale(${sc})`);
    $("je5").style.display = t > 2.6 ? "none" : "";
    const cx = -560 + clamp(t / 2.6) * 820;
    $("cor5").setAttribute("transform", `translate(${cx} ${1190 - 560 + Math.abs(Math.sin(t * 12)) * -18})`);
  }]);
scenes.push([23.3, 26, () => `
  ${interior()}
  ${nightView("w5", 60, 300, 960, 460)}
  ${seatRow(140, 1260, 800, 600)}
  <g id="je5b">${actor("je", "jb", 240, 640, 600, 1050)}</g>
  ${seatRow(100, 1460, 880, 460)}`,
  (t, T) => {
    mouth("jb", "je", T);
    const land = backOut(t / 0.35);
    $("je5b").setAttribute("transform", `translate(0 ${(1 - land) * -500})`);
  }]);

// 6 (26–30): PALPITE — the Corredor grabs the door, freeze frame.
scenes.push([26, 30, () => `<g id="frzG">` + doorView(`<g id="cor6">${corredor(300, 700, 520, 910)}</g>`, "d6") + `</g>
  <rect id="frz" width="${W}" height="${H}" fill="#0b1022" opacity="0"/>
  <g id="pq" opacity="0">
    ${tag("PALPITE", W / 2, 360, "#e8453c", "#fff", 60)}
    <rect x="60" y="520" width="960" height="250" rx="30" fill="#fff" stroke="${INK}" stroke-width="8"/>
    <text x="540" y="620" ${FONT} font-size="58" fill="${INK}" text-anchor="middle">O que o Seu Valdir</text><text x="540" y="700" ${FONT} font-size="58" fill="${INK}" text-anchor="middle">vai fazer?</text>
    <g ${O} stroke-width="8"><rect x="60" y="830" width="960" height="170" rx="30" fill="#f2c230"/><rect x="60" y="1040" width="960" height="170" rx="30" fill="#e8453c"/></g>
    <text x="110" y="940" ${FONT} font-size="64" fill="${INK}">A) Acelerar</text><text x="110" y="1150" ${FONT} font-size="64" fill="#fff">B) Usar o extintor</text>
    <circle cx="540" cy="1430" r="120" fill="#fff" stroke="${INK}" stroke-width="10"/><path id="clk" fill="#1b1b22" d=""/>
    <text id="cnum" x="540" y="1470" ${FONT} font-size="110" fill="#e8453c" text-anchor="middle" stroke="#fff" stroke-width="10" paint-order="stroke">3</text>
  </g>`,
  (t) => {
    const grab = easeOut(t / 0.4);
    $("cor6").setAttribute("transform", `translate(0 ${(1 - grab) * 300}) rotate(${Math.sin(t * 30) * (t < 0.6 ? 2 : 0)} 560 1150)`);
    const f = t > 0.6;
    $("frz").setAttribute("opacity", f ? 0.55 : 0);
    $("frzG").style.filter = f ? "grayscale(.8)" : "";
    $("pq").setAttribute("opacity", f ? 1 : 0);
    const left = clamp((t - 0.8) / 3.0);
    const a = left * Math.PI * 2, r = 100;
    $("clk").setAttribute("d", left > 0 ? `M540 1430 L540 ${1430 - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${540 + r * Math.sin(a)} ${1430 - r * Math.cos(a)} Z` : "");
    $("cnum").textContent = String(Math.max(1, 3 - Math.floor((t - 0.8))));
  }]);

// 7 (30–36): the answer is C — Valdir asks for the fare; then the extinguisher.
scenes.push([30, 36, () => doorView(`<g id="cor7">${corredor(330, 700, 520, 910)}<g id="qm" ${FONT} font-size="120" fill="#ffd34d" stroke="${INK}" stroke-width="10" paint-order="stroke"><text x="470" y="690">?</text><text x="620" y="650">?</text></g></g>${puffs("pf7")}`, "d7") + `
  ${actor("valdir", "v7", -160, 900, 640, 1120)}
  <g transform="translate(470 1560) rotate(-62)"><g id="ext7">${nestArt(itemBy("Extintor").art(""), -120, -110, 240, 220)}</g></g>
  <g id="ans" opacity="0">${tag("RESPOSTA: C) COBRAR A PASSAGEM", W / 2, 260, "#2f5fb3", "#fff", 40)}</g>
  <g id="card" opacity="0">
    <rect x="600" y="330" width="420" height="200" rx="24" fill="#fff" stroke="${INK}" stroke-width="8"/>
    <text x="810" y="410" ${FONT} font-size="46" fill="${INK}" text-anchor="middle">EXTINTOR</text>
    <text x="680" y="490" ${FONT} font-size="54" fill="${INK}">1</text><text x="790" y="490" ${FONT} font-size="54" fill="${INK}">2</text><text x="900" y="490" ${FONT} font-size="54" fill="${INK}">3</text>
    <path d="M664 490 L716 440" stroke="#e8453c" stroke-width="10" stroke-linecap="round"/></g>`,
  (t, T) => {
    $("stage").style.filter = "";
    openDoor("d7", easeInOut(t / 0.35));
    mouth("v7", "valdir", T);
    $("ans").setAttribute("opacity", t > 0.9 && t < 3.6 ? 1 : 0);
    $("qm").setAttribute("opacity", t > 1.1 && t < 2.4 ? 1 : 0);
    const fall = clamp((t - 2.3) / 0.5);
    $("cor7").setAttribute("transform", `translate(${fall * 120} ${fall * 700}) rotate(${fall * 40} 590 1610)`);
    if (t > 2.8) drawPuffs("pf7", t - 2.8, 420, 1240, 520); else $("pf7").innerHTML = "";
    $("ext7").setAttribute("transform", `translate(${t > 2.8 && t < 3.6 ? Math.sin(t * 70) * 6 : 0} 0)`);
    $("card").setAttribute("opacity", clamp((t - 3.5) / 0.2));
  }]);

// 8 (36–42): silence, the camera pans the passengers and finds the Passenger in the back.
const panCast = [["Jé", 0], ["Professor Otávio", 1], ["Dona Cida", 2], ["Rex", 3], ["Kauã", 4]];
scenes.push([36, 42, () => `
  ${interior()}
  <g id="pan">
    ${Array.from({ length: 5 }, (_, i) => nightView("p8w" + i, 40 + i * 620, 300, 560, 420)).join("")}
    ${panCast.map(([n, i]) => nestArt(charBy(n).art(""), 40 + i * 620, n === "Rex" ? 1000 : 760, 560, n === "Rex" ? 560 : 980)).join("")}
    <g id="pasG">${nestArt(charBy("O Passageiro do Fundo").art(""), 40 + 5 * 620, 740, 580, 1015)}
      <ellipse cx="${40 + 5 * 620 + 260}" cy="986" rx="10" ry="7" fill="#e9f0ff"/><ellipse cx="${40 + 5 * 620 + 318}" cy="986" rx="10" ry="7" fill="#e9f0ff"/></g>
    ${Array.from({ length: 6 }, (_, i) => seatRow(20 + i * 620, 1440, 600, 480)).join("")}
  </g>
  <rect id="dim8" width="${W}" height="${H}" fill="#000" opacity="0"/>`,
  (t) => {
    const p = easeInOut(t / 4.0);
    const x = -p * (5 * 620 - 250);
    const z = easeInOut((t - 4.2) / 1.2);
    const cx = 40 + 5 * 620 + 290 + x;
    $("pan").setAttribute("transform", `translate(${cx} 1100) scale(${1 + z * 0.55}) translate(${-cx} -1100) translate(${x} 0)`);
    $("dim8").setAttribute("opacity", 0.15 + z * 0.3);
  }]);

// 9 (42–51): the diesel light; the post has a socket; "TOMADA?!" and every Lerdo turns.
scenes.push([42, 45.9, () => `
  <rect width="${W}" height="${H}" fill="#171b24"/>
  <rect x="80" y="420" width="920" height="1000" rx="60" fill="#22262f" stroke="${INK}" stroke-width="10"/>
  <path d="M240 1060 A300 300 0 0 1 840 1060" fill="none" stroke="#e9f0ff" stroke-width="16"/>
  ${[0, 1, 2, 3, 4].map((i) => { const a = Math.PI + i * Math.PI / 4; return `<path d="M${540 + 270 * Math.cos(a)} ${1060 + 270 * Math.sin(a)} L${540 + 310 * Math.cos(a)} ${1060 + 310 * Math.sin(a)}" stroke="#e9f0ff" stroke-width="12"/>`; }).join("")}
  <text x="250" y="1140" ${FONT} font-size="64" fill="#e8453c">R</text><text x="790" y="1140" ${FONT} font-size="64" fill="#7fe0a8">C</text>
  <g id="needle"><path d="M540 1060 L300 1000" stroke="#e8453c" stroke-width="16" stroke-linecap="round"/></g><circle cx="540" cy="1060" r="30" fill="#e9f0ff" stroke="${INK}" stroke-width="6"/>
  <g id="lamp9"><circle cx="540" cy="1260" r="70" fill="#e8453c" stroke="${INK}" stroke-width="8"/>
    <g fill="#fff"><rect x="510" y="1220" width="44" height="70" rx="6"/><rect x="556" y="1236" width="16" height="40" rx="6"/></g></g>
  ${tag("DIESEL: 1 PARADA", W / 2, 620, "#e8453c", "#fff", 52)}`,
  (t) => {
    $("lamp9").setAttribute("opacity", Math.floor(t * 4) % 2 ? 0.35 : 1);
    $("needle").setAttribute("transform", `rotate(${Math.sin(t * 9) * 2} 540 1060)`);
  }]);
scenes.push([45.9, 51, () => `
  ${interior()}
  ${nightView("w9", 60, 280, 960, 600, `<g id="heads">${[0, 1, 2, 3].map((i) => `<g id="hd${i}">${nestArt(charBy("Lerdo comum").art(""), 80 + i * 230, 480, 260, 455)}</g>`).join("")}</g>`)}
  ${seatRow(-40, 1320, 560, 600)}${seatRow(560, 1320, 560, 600)}
  ${actor("je", "j9", -60, 820, 560, 980)}
  <g id="k9">${actor("kaua", "kk", 470, 760, 640, 1120)}</g>
  <g id="bat" opacity="0"><rect x="700" y="420" width="250" height="110" rx="18" fill="#1b1b22" stroke="#fff" stroke-width="6"/><rect x="950" y="455" width="16" height="40" fill="#fff"/>
    <rect x="716" y="436" width="30" height="78" fill="#e8453c"/><text x="850" y="500" ${FONT} font-size="52" fill="#e8453c" text-anchor="middle">3%</text></g>`,
  (t, T) => {
    mouth("j9", "je", T); mouth("kk", "kaua", T);
    const yell = T >= 48.2 && T < 48.8;
    $("k9").setAttribute("transform", `translate(${yell ? Math.sin(t * 60) * 8 : 0} ${yell ? -30 : 0})`);
    $("bat").setAttribute("opacity", T > 47.6 ? 1 : 0);
    const turn = easeOut((T - 48.6) / 0.4);
    for (let i = 0; i < 4; i++) $("hd" + i).setAttribute("transform", `translate(${turn * 40} ${-turn * 30}) rotate(${turn * (14 + i * 3)} ${210 + i * 230} 700)`);
  }]);

// 10 (51–60): the vote. Kauã whispers to the camera.
scenes.push([51, 60, () => `
  ${interior()}
  ${nightView("w10", 60, 280, 960, 520)}
  ${seatRow(-60, 1380, 1200, 540)}
  <g id="k10">${actor("kaua", "kz", 160, 520, 760, 1330)}</g>
  <g id="rex10">${nestArt(charBy("Rex").art(""), 760, 1340, 300, 525)}</g>
  <g id="vote" opacity="0">
    ${tag("VOTAÇÃO", W / 2, 360, "#e8453c", "#fff", 60)}
    <g ${O} stroke-width="8"><rect x="50" y="460" width="470" height="300" rx="30" fill="#f2c230"/><rect x="560" y="460" width="470" height="300" rx="30" fill="#e8453c"/></g>
    <text x="285" y="590" ${FONT} font-size="110" fill="${INK}" text-anchor="middle">A</text><text x="285" y="690" ${FONT} font-size="40" fill="${INK}" text-anchor="middle">Posto de</text><text x="285" y="738" ${FONT} font-size="40" fill="${INK}" text-anchor="middle">gasolina</text>
    <text x="795" y="590" ${FONT} font-size="110" fill="#fff" text-anchor="middle">B</text><text x="795" y="700" ${FONT} font-size="44" fill="#fff" text-anchor="middle">Terminal</text>
  </g>
  <g id="cta" opacity="0">${caption(["Comenta A ou B.", "O mais votado vira", "o episódio 2."], 1560, 62, "#ffd34d")}</g>`,
  (t, T) => {
    mouth("kz", "kaua", T);
    $("k10").setAttribute("transform", `translate(0 ${Math.sin(t * 2) * 6})`);
    $("rex10").setAttribute("transform", `translate(0 ${talking("rex", T) ? -24 : 0})`);
    const v = backOut((t - 1.5) / 0.4);
    $("vote").setAttribute("opacity", clamp((t - 1.5) / 0.2));
    $("vote").setAttribute("transform", `translate(540 600) scale(${0.8 + 0.2 * v}) translate(-540 -600)`);
    $("cta").setAttribute("opacity", clamp((t - 4.4) / 0.3));
  }]);

// --- subtitles overlay ------------------------------------------------------
function wrap(text, max = 22) {
  const out = []; let line = "";
  for (const w of text.split(" ")) { if ((line + " " + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line); return out;
}
let lastSub = null;
function subtitles(T) {
  const s = SPEECH.find((s) => T >= s.t0 - 0.05 && T < s.t1 + 0.35);
  const key = s ? s.t0 : null;
  if (key === lastSub) return; lastSub = key;
  if (!s) { $("sub").innerHTML = ""; return; }
  const lines = wrap(s.text.toUpperCase());
  const y0 = 1640 - (lines.length - 1) * 40;
  $("sub").innerHTML = `<text x="540" y="${y0 - 90}" ${FONT} font-size="42" fill="#ffd34d" text-anchor="middle" stroke="${INK}" stroke-width="10" paint-order="stroke" letter-spacing="4">${s.label}</text>` +
    lines.map((l, i) => `<text x="540" y="${y0 + i * 80}" ${FONT} font-size="66" fill="#fff" text-anchor="middle" stroke="${INK}" stroke-width="15" paint-order="stroke">${l}</text>`).join("");
}

let current = -1;
window.setFrame = (T) => {
  const i = scenes.findIndex(([a, b]) => T >= a && T < b);
  const idx = i < 0 ? scenes.length - 1 : i;
  const [a, , build, update] = scenes[idx];
  if (idx !== current) {
    $("stage").innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${build()}</svg>`;
    $("stage").style.filter = "";
    current = idx;
  }
  update(T - a, T);
  subtitles(T);
  $("tagT").style.display = T < 3 ? "none" : "";
};
setFrame(0);
