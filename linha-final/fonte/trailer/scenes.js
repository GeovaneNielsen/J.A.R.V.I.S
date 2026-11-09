// Trailer timeline. Each scene: [start, end, build() -> svg inner markup, update(localTime)]
const W = 1080, H = 1920;
const $ = (id) => document.getElementById(id);
const clamp = (x) => Math.max(0, Math.min(1, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const backOut = (x) => { const c = 1.9; x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const nestArt = (art, x, y, w, h, id = "") => art.replace("<svg ", `<svg ${id ? `id="${id}" ` : ""}x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet" `);
const charBy = (n) => chars.find((c) => c.name === n);
const itemBy = (n) => items.find((c) => c.name === n);
function caption(text, y, size = 84, fill = "#fff", id = "") {
  const lines = Array.isArray(text) ? text : [text];
  return `<g ${id ? `id="${id}"` : ""} font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold" text-anchor="middle">${lines.map((l, i) =>
    `<text x="${W / 2}" y="${y + i * size * 1.15}" font-size="${size}" fill="${fill}" stroke="${INK}" stroke-width="${size / 5}" paint-order="stroke">${l}</text>`).join("")}</g>`;
}
function tag(text, x, y, bg = INK, fg = "#ffd34d", size = 40, id = "") {
  const w = text.length * size * 0.66 + 60;
  return `<g ${id ? `id="${id}"` : ""} font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold"><rect x="${x - w / 2}" y="${y - size - 18}" width="${w}" height="${size + 40}" rx="16" fill="${bg}" stroke="${INK}" stroke-width="5"/>
    <text x="${x}" y="${y + 4}" fill="${fg}" font-size="${size}" text-anchor="middle" letter-spacing="2">${text}</text></g>`;
}
function araucaria(x, base, h, c) {
  const t = [];
  for (let i = 0; i < 4; i++) {
    const y = base - h + i * h * 0.12, w = h * (0.18 + i * 0.07);
    t.push(`<path d="M${x - w} ${y + 18} Q${x} ${y - 22} ${x + w} ${y + 18} Q${x} ${y + 2} ${x - w} ${y + 18} Z" fill="${c}"/>`);
  }
  return `<rect x="${x - 5}" y="${base - h * 0.75}" width="10" height="${h * 0.75}" fill="${c}"/>${t.join("")}`;
}
let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const scenes = [];

// A — black screen, radio static
scenes.push([0, 2, () => `<rect width="${W}" height="${H}" fill="#050608"/><g id="noise"></g>${tag("CURITIBA, 23h40", W / 2, 980, "#050608", "#ffd34d", 54, "tA")}`,
  (t) => {
    seed = Math.floor(t * 30) + 7;
    let s = "";
    for (let i = 0; i < 60; i++) s += `<rect x="${rnd() * W}" y="${rnd() * H}" width="${40 + rnd() * 260}" height="${2 + rnd() * 4}" fill="#fff" opacity="${0.05 + rnd() * 0.12}"/>`;
    $("noise").innerHTML = s;
    $("tA").setAttribute("opacity", clamp((t - 0.4) / 0.4));
  }]);

// B — the bus crossing a foggy street
scenes.push([2, 4, () => `
  <defs><linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070d22"/><stop offset="1" stop-color="#2a3660"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#skyB)"/>
  <circle cx="820" cy="420" r="70" fill="#fff6d6"/>
  <g id="bgTrees">${[0, 1, 2, 3, 4, 5].map((i) => araucaria(i * 300 + 80, 1180, 380 + (i % 2) * 120, "#0d1530")).join("")}${[0, 1, 2, 3, 4, 5].map((i) => araucaria(i * 300 + 1880, 1180, 380 + (i % 2) * 120, "#0d1530")).join("")}</g>
  <rect x="0" y="1180" width="${W}" height="740" fill="#1a1f2c"/>
  <g id="dash">${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 180}" y="1420" width="100" height="16" rx="8" fill="#ffd34d" opacity=".7"/>`).join("")}</g>
  <path d="M760 1320 L1200 1180 L1200 1460 Z" fill="#ffe98a" opacity=".22"/>
  <g id="busB">${nestArt(itemBy("A Lata").art(""), 40, 1010, 1000, 426)}</g>
  <rect x="0" y="1080" width="${W}" height="120" fill="#c9d4e6" opacity=".12"/><rect x="0" y="1300" width="${W}" height="90" fill="#c9d4e6" opacity=".10"/>
  ${tag("O ÚLTIMO ÔNIBUS DA NOITE", W / 2, 1700, INK, "#fff", 50, "tB")}`,
  (t) => {
    $("bgTrees").setAttribute("transform", `translate(${-t * 520} 0)`);
    $("dash").setAttribute("transform", `translate(${-(t * 900) % 180} 0)`);
    $("busB").setAttribute("transform", `translate(${-80 + t * 60} ${Math.sin(t * 22) * 4})`);
    $("tB").setAttribute("opacity", clamp((t - 0.3) / 0.3));
  }]);

// C — the zombie slams the window (the episode 1 opening, without Kauã's line)
scenes.push([4, 6, () => buildCena1() + `<rect x="0" y="1460" width="${W}" height="460" fill="url(#fadeC)"/>
  <defs><linearGradient id="fadeC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient></defs>
  ${caption(["...E O PRIMEIRO DIA", "DO FIM DO MUNDO"], 1640, 80, "#fff", "tC")}`,
  (t) => {
    $("kO").style.display = ""; $("kC").style.display = "none";
    const rise = backOut((t - 0.25) / 0.25);
    $("zomb").setAttribute("transform", `translate(${-26 * clamp((t - 0.9) / 0.5)} ${(1 - rise) * 560}) rotate(${-9 * clamp((t - 0.9) / 0.5)} 580 620)`);
    const sh = t > 0.47 && t < 0.8 ? Math.sin(t * 90) * 10 : 0;
    $("win").setAttribute("transform", `translate(${sh} 0)`);
    $("kaua").setAttribute("transform", `translate(0 ${t > 0.5 ? -14 : 0})`);
    $("tC").setAttribute("opacity", clamp((t - 0.6) / 0.3));
  }]);

// D — character cards
const cards = [
  ["Seu Valdir", "SEU VALDIR · MOTORISTA", "Ninguém desce fora do ponto.", 1.6],
  ["Jé", "JÉ · ENTREGADORA", "Cinco estrelas pra mim, hein?", 1.2],
  ["Professor Otávio", "PROFESSOR OTÁVIO · QUÍMICO", "Tecnicamente, isso é uma péssima ideia.", 2.0],
  ["Dona Cida", "DONA CIDA · BOLO DE POTE", "Come que passa.", 1.3],
  ["Kauã", "KAUÃ · QUER VIRALIZAR", "Galera, isso aqui tá surreal!", 1.7],
  ["Rex", "REX · ALARME DE ZUMBI", "Au! Au!", 1.2],
];
let at = 6;
for (const [name, label, line, dur] of cards) {
  const c = charBy(name), start = at;
  const words = line.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = line.length > 22 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [line];
  scenes.push([start, start + dur, () => `
    <rect width="${W}" height="${H}" fill="${mix(c.color, "#ffffff", 0.72)}"/>
    <g opacity=".35">${Array.from({ length: 14 }, (_, i) => `<rect x="${-200 + i * 110}" y="-100" width="44" height="2200" fill="${mix(c.color, "#ffffff", 0.55)}" transform="rotate(18 540 960)"/>`).join("")}</g>
    <circle cx="${W / 2}" cy="980" r="420" fill="#ffffff" opacity=".45"/>
    <g id="cArt">${nestArt(c.art(""), 190, 380, 700, 1225)}</g>
    <g id="cTag">${tag(label, W / 2, 300, INK, "#ffd34d", 44)}</g>
    ${caption(lines.map((l) => (l === lines[0] ? "“" : "") + l + (l === lines[lines.length - 1] ? "”" : "")), 1700, 78, "#fff", "cLine")}`,
    (t) => {
      const k = easeOut(t / 0.22);
      $("cArt").setAttribute("transform", `translate(${(1 - k) * 260} ${Math.sin(t * 9) * 6}) `);
      $("cTag").setAttribute("transform", `translate(${(1 - k) * -400} 0)`);
      $("cLine").setAttribute("opacity", clamp((t - 0.12) / 0.15));
    }]);
  at += dur;
}

// E — the light flickers and the Passenger is there
scenes.push([15, 18, () => `
  <rect width="${W}" height="${H}" fill="#151b28"/>
  <rect x="60" y="330" width="960" height="520" rx="34" fill="#0b1022" stroke="${INK}" stroke-width="14"/>
  <rect x="140" y="110" width="800" height="34" rx="17" id="lampE" fill="#f4fbff" stroke="${INK}" stroke-width="6"/>
  <g stroke="${INK}" stroke-width="6"><rect x="80" y="1160" width="920" height="420" rx="40" fill="#8a5a10"/><rect x="80" y="1160" width="920" height="80" rx="30" fill="#1e3a70"/></g>
  <g id="pas" opacity="0">${nestArt(charBy("O Passageiro do Fundo").art(""), 240, 520, 600, 1050)}
    <ellipse cx="510" cy="760" rx="12" ry="8" fill="#e9f0ff" opacity=".9"/><ellipse cx="570" cy="760" rx="12" ry="8" fill="#e9f0ff" opacity=".9"/></g>
  <rect id="darkE" width="${W}" height="${H}" fill="#000" opacity=".55"/>
  ${caption("E ELE.", 1760, 110, "#e9f0ff", "tE")}`,
  (t) => {
    const flick = t < 1.1 ? (Math.floor(t * 14) % 3 === 0 ? 0.92 : 0.45) : t < 1.3 ? 0.97 : 0.5;
    $("darkE").setAttribute("opacity", flick);
    $("pas").setAttribute("opacity", t >= 1.3 ? 1 : 0);
    $("pas").setAttribute("transform", `translate(0 ${t >= 1.3 ? -Math.min(1, (t - 1.3) * 0.6) * 20 : 0})`);
    $("tE").setAttribute("opacity", clamp((t - 1.7) / 0.3));
  }]);

// F — action montage
scenes.push([18, 19, () => `
  <rect width="${W}" height="${H}" fill="#f6d0cc"/>
  <g id="ext">${nestArt(itemBy("Extintor").art(""), 60, 620, 720, 660)}</g>
  <g id="puffs"></g>
  ${caption("EXTINTOR: 3 USOS", 1640, 86, "#fff")}`,
  (t) => {
    let s = "";
    for (let i = 0; i < 9; i++) { const p = clamp(t * 2.2 - i * 0.12); if (p > 0) s += `<circle cx="${330 + p * 700}" cy="${770 + Math.sin(i * 2) * 70 * p}" r="${30 + p * 120}" fill="#ffffff" opacity="${0.9 - p * 0.5}" stroke="${INK}" stroke-width="5"/>`; }
    $("puffs").innerHTML = s;
    $("ext").setAttribute("transform", `translate(${Math.sin(t * 70) * 6} 0)`);
  }]);
scenes.push([19, 20, () => `
  <rect width="${W}" height="${H}" fill="#cdd6e2"/>
  <g id="umb" transform="translate(180 540)"><g id="umbIn">${nestArt(itemBy("Guarda-chuva").art(""), 0, 0, 720, 660)}</g></g>
  ${caption("QUEBRA NA HORA ERRADA", 1640, 74, "#fff")}<g id="crack" opacity="0">${caption("CRAC!", 520, 140, "#ffd34d")}</g>`,
  (t) => {
    const flip = t > 0.45;
    $("umbIn").setAttribute("transform", flip ? "translate(0 300) scale(1 -1) translate(0 -300)" : `rotate(${Math.sin(t * 40) * 4} 360 300)`);
    $("crack").setAttribute("opacity", flip && t < 0.85 ? 1 : 0);
  }]);
scenes.push([20, 21, () => `
  <rect width="${W}" height="${H}" fill="#cfe0f6"/>
  <g id="zf">${nestArt(charBy("Lerdo comum").art(""), 560, 640, 420, 735)}</g>
  <g id="cart">${nestArt(itemBy("Carrinho de feira").art(""), -500, 860, 560, 513)}</g>
  <g id="tum" opacity="0">${caption("TUM!", 620, 150, "#ffd34d")}</g>
  ${caption("DONA CIDA PASSANDO", 1640, 80, "#fff")}`,
  (t) => {
    const x = easeOut(t / 0.45) * 620;
    $("cart").setAttribute("transform", `translate(${x} 0)`);
    const hit = clamp((t - 0.42) / 0.3);
    $("zf").setAttribute("transform", `rotate(${hit * 82} 900 1370) translate(${hit * 60} 0)`);
    $("tum").setAttribute("opacity", t > 0.42 && t < 0.9 ? 1 : 0);
  }]);

// G — title on the destination sign, Kauã whispers, question
scenes.push([21, 25, () => `
  <rect width="${W}" height="${H}" fill="#070b16"/>
  <rect x="60" y="560" width="960" height="300" rx="30" fill="#141414" stroke="#3a3a44" stroke-width="10"/>
  <g id="sign" font-family="DejaVu Sans Mono, monospace" font-weight="bold" text-anchor="middle">
    <text x="540" y="760" font-size="150" fill="#ffd34d" letter-spacing="8" style="filter: drop-shadow(0 0 18px #ffb000)">LINHA FINAL</text></g>
  <text x="540" y="960" font-family="DejaVu Sans, Arial, sans-serif" font-size="46" font-weight="bold" fill="#e9f0ff" text-anchor="middle" letter-spacing="6" id="soon">ESTREIA EM BREVE</text>
  <g id="kG">${nestArt(charBy("Kauã").art(""), 520, 1080, 620, 1085)}</g>
  <g id="q" opacity="0">
    <rect x="50" y="1180" width="980" height="300" rx="26" fill="#ffffff" stroke="${INK}" stroke-width="8"/>
    <g font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold" text-anchor="middle" fill="${INK}">
      <text x="540" y="1270" font-size="54">Quem você acha que</text><text x="540" y="1340" font-size="54">não chega ao fim da linha?</text>
      <text x="540" y="1430" font-size="46" fill="#d8322f">Comenta o nome</text></g></g>
  <g id="wh">${caption(["“E quem decide o que", "acontece... são vocês.”"], 1700, 66, "#fff")}</g>`,
  (t) => {
    const on = t < 0.25 ? (Math.floor(t * 30) % 2 ? 1 : 0.2) : 1;
    $("sign").setAttribute("opacity", on);
    $("soon").setAttribute("opacity", clamp((t - 0.4) / 0.3));
    const peek = easeOut((t - 0.5) / 0.4);
    $("kG").setAttribute("transform", `translate(${(1 - peek) * 600} 0)`);
    $("wh").setAttribute("opacity", t > 0.6 && t < 2.6 ? 1 : 0);
    const qa = clamp((t - 2.6) / 0.25);
    $("q").setAttribute("opacity", qa);
    $("q").setAttribute("transform", `translate(540 1330) scale(${0.85 + 0.15 * backOut((t - 2.6) / 0.3)}) translate(-540 -1330)`);
  }]);

let current = -1;
window.setFrame = (t) => {
  const i = scenes.findIndex(([a, b]) => t >= a && t < b);
  const idx = i < 0 ? scenes.length - 1 : i;
  const [a, , build, update] = scenes[idx];
  if (idx !== current) {
    $("stage").innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${build()}</svg>`;
    current = idx;
  }
  update(t - a);
};
setFrame(0);
