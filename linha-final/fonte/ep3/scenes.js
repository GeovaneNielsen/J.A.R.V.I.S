// --- scenes: episode 3, "A Catraca" ---------------------------------------
// The Cobrador: a big Lerdo in a bus-company cap with the change bag on his chest.
function cobrador(id, x, y, w, h) {
  return `<g id="${id}">${nestArt(lerdoArt(), x, y, w, h)}<g ${O} stroke-width="6">
    <path d="M${x + 0.233 * w} ${y + 0.125 * h} Q${x + 0.5 * w} ${y - 0.01 * h} ${x + 0.767 * w} ${y + 0.125 * h} Z" fill="#2f5fb3"/>
    <rect x="${x + 0.467 * w}" y="${y + 0.099 * h}" width="${0.367 * w}" height="${0.035 * h}" rx="8" fill="#244a8c"/>
    <rect x="${x + 0.47 * w}" y="${y + 0.075 * h}" width="${0.08 * w}" height="${0.03 * h}" rx="3" fill="#ffd34d"/>
    <rect x="${x + 0.33 * w}" y="${y + 0.5 * h}" width="${0.32 * w}" height="${0.13 * h}" rx="10" fill="#6b3a1f"/>
    <path d="M${x + 0.36 * w} ${y + 0.5 * h} L${x + 0.5 * w} ${y + 0.4 * h} L${x + 0.62 * w} ${y + 0.5 * h}" fill="none" stroke-width="5"/></g>
    <text x="${x + 0.49 * w}" y="${y + 0.59 * h}" ${FONT} font-size="${0.06 * h}" fill="#ffd34d" text-anchor="middle">R$</text></g>`;
}
// A three-arm turnstile; the arms group rotates.
function catraca(id, x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g ${O} stroke-width="8">
    <rect x="-70" y="0" width="140" height="300" rx="16" fill="#8a97ab"/><rect x="-70" y="-20" width="140" height="40" rx="12" fill="#c9d4e6"/>
    <rect x="-44" y="40" width="88" height="40" rx="8" fill="#1b1b22"/><circle cx="-20" cy="60" r="8" fill="#7fe0a8" stroke="none"/></g>
    <g id="${id}" transform="translate(0 140)"><g ${O} stroke-width="8">${[0, 120, 240].map((a) => `<rect x="0" y="-12" width="190" height="24" rx="12" fill="#c9c9cf" transform="rotate(${a})"/>`).join("")}<circle r="30" fill="#5a5a64"/></g></g></g>`;
}
function terminalHall() {
  return `<rect width="${W}" height="${H}" fill="#2a3346"/><rect width="${W}" height="260" fill="#3a4560"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${90 + i * 240}" y="120" width="170" height="26" rx="13" fill="#f4fbff" stroke="${INK}" stroke-width="5" id="lamp${i}"/>`).join("")}
    <rect x="0" y="1300" width="${W}" height="620" fill="#4a5468"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 120} 1300 L${i * 120 - 200} 1920" stroke="#3a4356" stroke-width="5"/>`).join("")}
    <g ${O} stroke-width="8"><rect x="600" y="420" width="420" height="520" rx="16" fill="#ffe9a8"/><rect x="600" y="420" width="420" height="90" rx="16" fill="#e8453c"/></g>
    <text x="810" y="485" ${FONT} font-size="56" fill="#fff" text-anchor="middle">ABRIGO</text>
    <g ${O} stroke-width="8"><circle cx="300" cy="460" r="110" fill="#f4f4f4"/><path d="M300 460 L300 380 M300 460 L360 490" stroke-width="10"/></g>`;
}
const coinsSvg = (id) => `<g id="${id}"></g>`;
function drawCoins(id, n, x, y) {
  let s = ""; for (let i = 0; i < n; i++) s += `<ellipse cx="${x + (i % 2) * 8}" cy="${y - i * 16}" rx="44" ry="14" fill="#ffd34d" stroke="${INK}" stroke-width="5"/>`;
  $(id).innerHTML = s;
}
// Dr. Ivo Prates — the Passenger's face, hood down, on the missing poster.
function drIvo(x, y, s) {
  const sk = "#e8c4a0";
  return `<g transform="translate(${x} ${y}) scale(${s})"><g ${O}>
    <path d="M40 260 Q100 200 160 260 L170 330 L30 330 Z" fill="#f4f4f4"/><path d="M85 215 L100 260 L115 215 Z" fill="#6c6f78"/>
    ${S("rect", `x="90" y="136" width="20" height="30" rx="4"`, sk, { dx: -3, dy: -2 })}
    ${ears(sk)}${S("circle", `cx="100" cy="98" r="52"`, sk)}
    <path d="M50 92 Q52 60 70 52 L72 86 Z M150 92 Q148 60 130 52 L128 86 Z" fill="#b0b0b8"/>
    ${eyes({ y: 102, brow: "worried", browColor: "#8a8a92", lid: true })}
    <rect x="66" y="88" width="32" height="26" rx="6" fill="none" stroke-width="3.5"/><rect x="102" y="88" width="32" height="26" rx="6" fill="none" stroke-width="3.5"/><path d="M98 100 L102 100" stroke-width="3"/>
    ${nose(sk)}<path d="M88 132 L112 132" fill="none" stroke-width="3.5"/><path d="M70 128 q4 8 0 14" fill="none" stroke="${dark(sk, 0.35)}" stroke-width="3"/></g></g>`;
}

const scenes = [];
// 1 (0–3): Kauã whispers; through the window, the empty terminal and a flickering lamp over the turnstile.
scenes.push([0, 3, () => `
  ${interior()}
  ${nightView("w1", 60, 280, 960, 620, `<rect x="60" y="560" width="960" height="340" fill="#2a3346"/><rect x="420" y="430" width="240" height="20" rx="10" fill="#f4fbff" id="tl1"/>${catraca("c1arms", 540, 560, 0.9)}`)}
  ${seatRow(-60, 1380, 1200, 540)}
  <g id="k1">${actor("kaua", "ka", 160, 600, 760, 1330)}</g>
  ${tag("VOCÊS VOTARAM: B) TERMINAL", W / 2, 230, "#e8453c", "#fff", 30)}`,
  (t, T) => { mouth("ka", "kaua", T); $("k1").setAttribute("transform", `translate(0 ${Math.sin(t * 2) * 5})`); $("tl1").setAttribute("opacity", Math.floor(t * 5) % 3 === 0 ? 0.2 : 1); }]);

// 2 (3–9): the deserted terminal hall; the shelter glows behind the turnstile.
scenes.push([3, 9, () => terminalHall() + `
  ${catraca("c2arms", 540, 1000, 1)}
  ${actor("valdir", "v2", -120, 780, 640, 1120)}
  ${actor("otavio", "o2", 520, 700, 640, 1120)}`,
  (t, T) => { mouth("v2", "valdir", T); mouth("o2", "otavio", T); $("lamp2").setAttribute("opacity", Math.floor(t * 4) % 5 === 0 ? 0.25 : 1); }]);

// 3 (9–15): the Cobrador at his booth.
scenes.push([9, 15, () => terminalHall() + `
  <g ${O} stroke-width="8"><rect x="220" y="560" width="640" height="560" rx="20" fill="#2f5fb3"/><rect x="260" y="600" width="560" height="300" rx="12" fill="#9fd3f0" opacity=".6"/></g>
  ${cobrador("cob", 300, 380, 480, 840)}
  <rect x="220" y="900" width="640" height="220" fill="#2f5fb3" stroke="${INK}" stroke-width="8"/>
  ${catraca("c3arms", 540, 1080, 1)}
  ${actor("je", "j3", -140, 1060, 520, 910)}
  ${actor("valdir", "v3", 640, 1080, 520, 910)}
  <g id="card3" opacity="0">${tag("O COBRADOR", W / 2, 300, "#2f5fb3", "#fff", 52)}</g>`,
  (t, T) => {
    mouth("j3", "je", T); mouth("v3", "valdir", T);
    const g = talking("cobrador", T);
    $("cob").setAttribute("transform", `translate(${g ? Math.sin(t * 30) * 6 : 0} ${g ? -10 : 0})`);
    $("c3arms").setAttribute("transform", `translate(0 140) rotate(${g ? Math.sin(t * 20) * 6 : 0})`);
    $("card3").setAttribute("opacity", clamp((t - 0.3) / 0.2));
  }]);

// 4 (15–21): nobody has a card. Kauã turns out his pockets; Dona Cida opens a purse full of coins.
scenes.push([15, 21, () => terminalHall() + `
  ${actor("kaua", "k4", -80, 760, 600, 1050)}
  <g id="pk" ${O} stroke-width="6"><path d="M90 1430 l60 0 l-10 60 l-40 0 Z" fill="#f4f4f4"/><path d="M330 1430 l60 0 l-10 60 l-40 0 Z" fill="#f4f4f4"/></g>
  <g id="bat4"><rect x="60" y="560" width="250" height="100" rx="16" fill="#1b1b22" stroke="#fff" stroke-width="5"/><rect x="310" y="590" width="14" height="40" fill="#fff"/><rect x="74" y="574" width="46" height="72" fill="#e8453c"/><text x="215" y="630" ${FONT} font-size="50" fill="#e8453c" text-anchor="middle">5%</text></g>
  ${actor("cida", "c4", 440, 760, 640, 1120)}
  <g id="purse" transform="translate(800 1560)"><g ${O} stroke-width="7"><path d="M-110 0 Q0 -80 110 0" fill="none" stroke-width="12"/><rect x="-130" y="0" width="260" height="170" rx="30" fill="#f07fb0"/></g>
    <g id="pc"></g></g>`,
  (t, T) => {
    mouth("k4", "kaua", T); mouth("c4", "cida", T);
    $("pk").setAttribute("opacity", t > 0.3 ? 1 : 0);
    const open = clamp((t - 2.6) / 0.4);
    let s = ""; for (let i = 0; i < 9; i++) { const p = clamp(open * 1.2 - i * 0.05); s += `<ellipse cx="${-90 + (i % 5) * 45}" cy="${-10 - p * (40 + (i % 3) * 30) - Math.floor(i / 5) * 24}" rx="26" ry="9" fill="#ffd34d" stroke="${INK}" stroke-width="4" opacity="${p > 0 ? 1 : 0}"/>`; }
    $("pc").innerHTML = s;
  }]);

// 5 (21–25): PALPITE — Dona Cida holds out the coins to the Cobrador.
scenes.push([21, 25, () => `<g id="frzG">${terminalHall()}
    ${cobrador("cob5", 440, 420, 480, 840)}${catraca("c5arms", 640, 1080, 1)}
    ${actor("cida", "c5", -60, 840, 620, 1085)}
    <g transform="translate(470 1260)">${[0, 1, 2].map((i) => `<ellipse cx="${i * 30}" cy="${-i * 14}" rx="30" ry="10" fill="#ffd34d" stroke="${INK}" stroke-width="5"/>`).join("")}</g></g>
  <rect id="frz" width="${W}" height="${H}" fill="#0b1022" opacity="0"/>
  ${palpiteCard("O que o Cobrador", "vai fazer?", "A) Aceitar as moedas", "B) Atacar a Dona Cida")}`,
  (t) => { palpiteUpdate(t); }]);

// 6 (25–33): the answer is C — he counts every coin, slowly, and gives exact change.
scenes.push([25, 33, () => terminalHall() + `
  <g ${O} stroke-width="8"><rect x="300" y="1060" width="760" height="70" rx="14" fill="#2f5fb3"/></g>
  ${cobrador("cob6", 520, 300, 480, 840)}
  <rect x="300" y="1100" width="760" height="300" fill="#2f5fb3" stroke="${INK}" stroke-width="8"/>
  ${coinsSvg("stack")}${coinsSvg("troco")}
  <g id="cida6">${actor("cida", "c6", -80, 860, 600, 1050)}</g>
  ${actor("je", "j6", 620, 1240, 440, 770)}
  <g id="ans6" opacity="0">${tag("RESPOSTA: C) DAR O TROCO", W / 2, 260, "#2f5fb3", "#fff", 44)}</g>
  <g id="tear" opacity="0" ${FONT} font-size="80" fill="#f07fb0" stroke="${INK}" stroke-width="6" paint-order="stroke"><text x="380" y="900">♥</text></g>`,
  (t, T) => {
    mouth("c6", "cida", T); mouth("j6", "je", T);
    const n = Math.min(8, Math.floor(Math.max(0, t - 0.4) / 0.4));
    drawCoins("stack", n, 760, 1050);
    const back = clamp((t - 3.4) / 0.5);
    $("troco").innerHTML = back > 0 ? `<ellipse cx="${760 - back * 320}" cy="${1050 - Math.sin(back * Math.PI) * 120}" rx="44" ry="14" fill="#ffd34d" stroke="${INK}" stroke-width="5"/>` : "";
    $("cob6").setAttribute("transform", `rotate(${Math.sin(t * 2.5) * 3} 760 1140)`);
    $("ans6").setAttribute("opacity", t > 0.4 && t < 3.2 ? 1 : 0);
    $("tear").setAttribute("opacity", talking("cida", T) ? 1 : 0);
    $("tear").setAttribute("transform", `translate(0 ${-((t * 60) % 80)})`);
  }]);

// 7 (33–41): through the turnstile one by one; Rex crawls under and gets a free pass.
const passers = [["Seu Valdir", 0], ["Jé", 1], ["Professor Otávio", 2], ["Dona Cida", 3], ["Kauã", 4]];
scenes.push([33, 41, () => terminalHall() + `
  ${cobrador("cob7", 700, 560, 380, 665)}
  ${passers.map(([n], i) => `<g id="ps${i}">${nestArt(charBy(n).art(""), 0, 0, 480, 840)}</g>`).join("")}
  ${catraca("c7arms", 540, 1240, 1.1)}
  <g id="rex7">${nestArt(charBy("Rex").art(""), 0, 0, 380, 665)}</g>
  <g id="stamp" opacity="0" transform="rotate(-12 540 760)"><rect x="200" y="640" width="680" height="220" rx="20" fill="none" stroke="#e8453c" stroke-width="18"/>
    <text x="540" y="800" ${FONT} font-size="110" fill="#e8453c" text-anchor="middle">PASSE LIVRE</text></g>`,
  (t, T) => {
    for (let i = 0; i < 5; i++) {
      const k = clamp((t - i * 0.9) / 0.9);
      $("ps" + i).setAttribute("transform", `translate(${-500 + k * 1600} ${1560 - 840 + Math.abs(Math.sin(t * 10 + i)) * -10})`);
      $("ps" + i).style.display = k > 0 && k < 1 ? "" : "none";
    }
    const turn = Math.floor(Math.max(0, t) / 0.9) * 40 + easeOut((t % 0.9) / 0.3) * 40;
    $("c7arms").setAttribute("transform", `translate(0 140) rotate(${t < 4.5 ? turn : 200})`);
    const r = clamp((t - 4.6) / 1.4);
    $("rex7").setAttribute("transform", `translate(${-400 + r * 1600} ${1600 - 665})`);
    const st = backOut((t - 6.3) / 0.25);
    $("stamp").setAttribute("opacity", t > 6.3 ? 1 : 0);
    $("stamp").setAttribute("transform", `rotate(-12 540 760) translate(540 760) scale(${1.6 - 0.6 * st}) translate(-540 -760)`);
  }]);

// 8 (41–49): the notice board in the shelter — a missing poster with the Passenger's face.
scenes.push([41, 49, () => `
  <rect width="${W}" height="${H}" fill="#ffe9a8"/>
  <g id="z8">
    <rect x="80" y="300" width="920" height="1100" rx="20" fill="#b98a55" stroke="${INK}" stroke-width="10"/>
    ${[[130, 360, -6, "#f4f4f4"], [720, 380, 5, "#cfe9ff"], [150, 1060, 4, "#ffd9e6"], [760, 1050, -4, "#f4f4f4"]].map(([x, y, r, c]) => `<rect x="${x}" y="${y}" width="200" height="240" fill="${c}" stroke="${INK}" stroke-width="5" transform="rotate(${r} ${x + 100} ${y + 120})"/>`).join("")}
    <g transform="rotate(-2 540 800)"><rect x="300" y="420" width="480" height="760" fill="#ffffff" stroke="${INK}" stroke-width="8"/>
      <text x="540" y="510" ${FONT} font-size="64" fill="#e8453c" text-anchor="middle">DESAPARECIDO</text>
      <defs><clipPath id="photo"><rect x="360" y="540" width="360" height="380"/></clipPath></defs><rect x="360" y="540" width="360" height="380" fill="#e9eef5"/>
      <g clip-path="url(#photo)">${drIvo(320, 500, 2.2)}</g><rect x="360" y="540" width="360" height="380" fill="none" stroke="${INK}" stroke-width="5"/>
      <text x="540" y="990" ${FONT} font-size="46" fill="${INK}" text-anchor="middle">DR. IVO PRATES</text>
      <text x="540" y="1050" ${FONT} font-size="30" fill="#5a6470" text-anchor="middle">LABORATÓRIO MUNICIPAL</text>
      <text x="540" y="1110" ${FONT} font-size="28" fill="#5a6470" text-anchor="middle">Visto pela última vez: Terminal</text>
      <circle cx="540" cy="440" r="14" fill="#e8453c" stroke="${INK}" stroke-width="4"/></g>
  </g>
  ${actor("otavio", "o8", -160, 1100, 560, 980)}`,
  (t, T) => {
    mouth("o8", "otavio", T);
    const z = easeInOut(t / 6);
    $("z8").setAttribute("transform", `translate(540 760) scale(${1 + z * 0.25}) translate(-540 -760)`);
  }]);

// 9 (49–53): the lights die; heavy footsteps in the dark.
scenes.push([49, 53, () => terminalHall() + `
  ${actor("kaua", "k9", 160, 700, 760, 1330)}
  <rect id="dark9" width="${W}" height="${H}" fill="#03050a" opacity="0"/>
  <g id="eyes9" opacity="0"><ellipse cx="470" cy="1090" rx="20" ry="24" fill="#fff"/><ellipse cx="610" cy="1090" rx="20" ry="24" fill="#fff"/><circle cx="474" cy="1094" r="8" fill="${INK}"/><circle cx="614" cy="1094" r="8" fill="${INK}"/></g>
  <g id="steps" ${FONT} font-size="80" fill="#5a6470" text-anchor="middle"></g>`,
  (t, T) => {
    mouth("k9", "kaua", T);
    const off = t > 0.3 ? (t < 0.8 ? (Math.floor(t * 20) % 2 ? 0.95 : 0.4) : 0.95) : 0;
    $("dark9").setAttribute("opacity", off);
    $("eyes9").setAttribute("opacity", t > 0.8 ? 1 : 0);
    let s = ""; for (let i = 0; i < 5; i++) { const at = 1.0 + i * 0.6; if (t > at) s += `<text x="${200 + i * 170}" y="${560 - i * 40}" opacity="${Math.max(0.2, 1 - (t - at) * 0.6)}">TUM</text>`; }
    $("steps").innerHTML = s;
  }]);

// 10 (53–60): the vote, lit only by Kauã's phone.
scenes.push([53, 60, () => `
  <rect width="${W}" height="${H}" fill="#05070d"/>
  <defs><radialGradient id="glow10" cx=".62" cy=".5" r=".5"><stop offset="0" stop-color="#7fb2ff" stop-opacity=".45"/><stop offset="1" stop-color="#7fb2ff" stop-opacity="0"/></radialGradient></defs>
  <g id="k10">${actor("kaua", "kz", 160, 520, 760, 1330)}</g>
  <rect width="${W}" height="${H}" fill="url(#glow10)"/>
  <rect width="${W}" height="${H}" fill="#05070d" opacity=".35"/>
  <g id="rex10">${nestArt(charBy("Rex").art(""), 760, 1340, 300, 525)}</g>
  ${vote(["Ir ao", "laboratório"], ["Passar a noite", "no abrigo"])}
  <g id="cta" opacity="0">${caption(["Comenta A ou B.", "O mais votado vira", "o episódio 4."], 1560, 62, "#ffd34d")}</g>`,
  (t, T) => {
    mouth("kz", "kaua", T);
    $("k10").setAttribute("transform", `translate(0 ${Math.sin(t * 2) * 6})`);
    $("rex10").setAttribute("transform", `translate(0 ${talking("rex", T) ? -24 : 0})`);
    const v = backOut((t - 1.2) / 0.4);
    $("vote").setAttribute("opacity", clamp((t - 1.2) / 0.2));
    $("vote").setAttribute("transform", `translate(540 600) scale(${0.8 + 0.2 * v}) translate(-540 -600)`);
    $("cta").setAttribute("opacity", clamp((t - 3.6) / 0.3));
  }]);

