// --- scenes: episode 2, "Abastece em Silêncio" -------------------------------
const lerdoArt = () => charBy("Lerdo comum").art("");
// A Lerdo that can sway, sleep (Zzz) or turn; wrapped so the transform pivots at its feet.
const lerdoAt = (id, x, y, w, h) => `<g id="${id}">${nestArt(lerdoArt(), x, y, w, h)}</g>`;
const zzz = (id, x, y) => `<g id="${id}" ${FONT} fill="#e9f0ff" stroke="${INK}" stroke-width="6" paint-order="stroke"><text x="${x}" y="${y}" font-size="44">z</text><text x="${x + 30}" y="${y - 40}" font-size="56">Z</text></g>`;
const pivot = (id) => { const b = $(id).getBBox(); return [b.x + b.width / 2, b.y + b.height]; };
const rotAt = (id, deg) => { const [px, py] = pivot(id); $(id).setAttribute("transform", `rotate(${deg} ${px} ${py})`); };
const swayAt = (id, t, amp, sp, px, py, ph = 0) => { if (!px) { $(id).removeAttribute("transform"); [px, py] = pivot(id); } $(id).setAttribute("transform", `rotate(${Math.sin(t * sp + ph) * amp} ${px} ${py})`); };
function postoBg(withLerdos = true) {
  return `<defs><linearGradient id="skyP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070d22"/><stop offset="1" stop-color="#2a3660"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#skyP)"/>
  ${[60, 980].map((x) => araucaria(x, 1180, 380, "#0d1530")).join("")}
  <rect x="0" y="1180" width="${W}" height="740" fill="#2a2f3a"/>
  <g ${O} stroke-width="8">
    <rect x="40" y="520" width="1000" height="90" rx="12" fill="#e9eef5"/><rect x="40" y="590" width="1000" height="20" fill="#e8453c" stroke="none"/>
    <rect x="200" y="610" width="40" height="580" fill="#c9c9cf"/><rect x="840" y="610" width="40" height="580" fill="#c9c9cf"/>
    <rect x="460" y="920" width="160" height="270" rx="14" fill="#e8453c"/><rect x="480" y="950" width="120" height="70" rx="6" fill="#1b1b22"/>
  </g>
  <g id="neon"><rect x="300" y="380" width="480" height="110" rx="20" fill="#1b1b22" stroke="${INK}" stroke-width="6"/>
    <text x="540" y="458" ${FONT} font-size="66" fill="#7fe0ff" text-anchor="middle" style="filter: drop-shadow(0 0 12px #39c6ff)">POSTO 24H</text></g>
  <rect x="0" y="600" width="${W}" height="1320" fill="#ffe98a" opacity=".05"/>
  ${withLerdos ? [[60, 0], [300, 1], [640, 2], [860, 3]].map(([x, i]) => lerdoAt("pl" + i, x, 820, 240, 420) + zzz("pz" + i, x + 150, 840)).join("") : ""}`;
}
function sleepers(t, n = 4) { for (let i = 0; i < n; i++) { swayAt("pl" + i, t, 2.5, 1.6, 0, 0, i); $("pz" + i).setAttribute("transform", `translate(0 ${-((t * 30 + i * 20) % 60)})`); $("pz" + i).setAttribute("opacity", 0.5 + 0.5 * Math.sin(t * 2 + i)); } }
function shop() {
  const shelf = (x, y) => `<g ${O} stroke-width="6"><rect x="${x}" y="${y}" width="300" height="20" fill="#8a97ab"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 10 + i * 58}" y="${y - 70}" width="48" height="70" rx="6" fill="${["#e8453c", "#f2c230", "#3a7bd5", "#7fe0a8", "#f07fb0"][i]}"/>`).join("")}</g>`;
  return `<rect width="${W}" height="${H}" fill="#cfd8e6"/><rect y="0" width="${W}" height="220" fill="#e9eef5"/>
    <rect x="120" y="90" width="840" height="30" rx="15" fill="#ffffff" stroke="${INK}" stroke-width="6"/>
    <rect x="0" y="1380" width="${W}" height="540" fill="#9aa5b8"/><path d="M0 1380 L${W} 1380" stroke="${INK}" stroke-width="8"/>
    ${shelf(40, 520)}${shelf(40, 760)}${shelf(40, 1000)}
    <g ${O} stroke-width="8"><rect x="720" y="380" width="320" height="1000" rx="20" fill="#e9f4ff"/><rect x="740" y="400" width="280" height="460" rx="10" fill="#9fd3f0"/><rect x="740" y="880" width="280" height="460" rx="10" fill="#9fd3f0"/></g>
    <g id="spk"><g ${O} stroke-width="8"><rect x="430" y="300" width="180" height="250" rx="24" fill="#2b2b33"/><circle cx="520" cy="390" r="44" fill="#4a4a58"/><circle cx="520" cy="490" r="26" fill="#4a4a58"/></g></g>
    <g id="notes" ${FONT} font-size="70" fill="#e8453c" stroke="${INK}" stroke-width="6" paint-order="stroke"></g>`;
}
function drawNotes(t, glyph, color) {
  let s = "";
  for (let i = 0; i < 5; i++) { const p = ((t * 0.6 + i * 0.2) % 1); s += `<text x="${400 + i * 60 + Math.sin(p * 6 + i) * 30}" y="${300 - p * 220}" fill="${color}" opacity="${1 - p}">${glyph}</text>`; }
  $("notes").innerHTML = s;
}
const vote = (a, b) => `<g id="vote" opacity="0">
    ${tag("VOTAÇÃO", W / 2, 360, "#e8453c", "#fff", 60)}
    <g ${O} stroke-width="8"><rect x="50" y="460" width="470" height="320" rx="30" fill="#f2c230"/><rect x="560" y="460" width="470" height="320" rx="30" fill="#e8453c"/></g>
    <text x="285" y="590" ${FONT} font-size="110" fill="${INK}" text-anchor="middle">A</text>${a.map((l, i) => `<text x="285" y="${680 + i * 50}" ${FONT} font-size="42" fill="${INK}" text-anchor="middle">${l}</text>`).join("")}
    <text x="795" y="590" ${FONT} font-size="110" fill="#fff" text-anchor="middle">B</text>${b.map((l, i) => `<text x="795" y="${680 + i * 50}" ${FONT} font-size="42" fill="#fff" text-anchor="middle">${l}</text>`).join("")}
  </g>`;
function palpiteCard(q1, q2, a, b) {
  return `<g id="pq" opacity="0">
    ${tag("PALPITE", W / 2, 360, "#e8453c", "#fff", 60)}
    <rect x="60" y="520" width="960" height="250" rx="30" fill="#fff" stroke="${INK}" stroke-width="8"/>
    <text x="540" y="620" ${FONT} font-size="58" fill="${INK}" text-anchor="middle">${q1}</text><text x="540" y="700" ${FONT} font-size="58" fill="${INK}" text-anchor="middle">${q2}</text>
    <g ${O} stroke-width="8"><rect x="60" y="830" width="960" height="170" rx="30" fill="#f2c230"/><rect x="60" y="1040" width="960" height="170" rx="30" fill="#e8453c"/></g>
    <text x="110" y="940" ${FONT} font-size="62" fill="${INK}">${a}</text><text x="110" y="1150" ${FONT} font-size="62" fill="#fff">${b}</text>
    <circle cx="540" cy="1430" r="120" fill="#fff" stroke="${INK}" stroke-width="10"/><path id="clk" fill="#1b1b22" d=""/>
    <text id="cnum" x="540" y="1470" ${FONT} font-size="110" fill="#e8453c" text-anchor="middle" stroke="#fff" stroke-width="10" paint-order="stroke">3</text></g>`;
}
function palpiteUpdate(t, t0 = 0.6) {
  const f = t > t0;
  $("frz").setAttribute("opacity", f ? 0.55 : 0);
  $("frzG").style.filter = f ? "grayscale(.8)" : "";
  $("pq").setAttribute("opacity", f ? 1 : 0);
  const left = clamp((t - t0 - 0.2) / 3.0), a = left * Math.PI * 2, r = 100;
  $("clk").setAttribute("d", left > 0 ? `M540 1430 L540 ${1430 - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${540 + r * Math.sin(a)} ${1430 - r * Math.cos(a)} Z` : "");
  $("cnum").textContent = String(Math.max(1, 3 - Math.floor(t - t0 - 0.2)));
}

const scenes = [];
// 1 (0–3): Kauã whispers; through the window, the gas station full of sleeping Lerdos.
scenes.push([0, 3, () => `
  ${interior()}
  ${nightView("w1", 60, 280, 960, 620, `<g transform="translate(60 120) scale(.9)"><rect x="200" y="380" width="480" height="110" rx="20" fill="#1b1b22"/><text x="440" y="458" ${FONT} font-size="66" fill="#7fe0ff" text-anchor="middle" id="neon1" style="filter: drop-shadow(0 0 12px #39c6ff)">POSTO 24H</text></g>
    ${[0, 1, 2, 3, 4].map((i) => lerdoAt("pl" + i, 80 + i * 180, 620, 170, 300) + zzz("pz" + i, 190 + i * 180, 640)).join("")}`)}
  ${seatRow(-60, 1380, 1200, 540)}
  <g id="k1">${actor("kaua", "ka", 160, 600, 760, 1330)}</g>
  ${tag("VOCÊS VOTARAM: A) POSTO", W / 2, 230, "#f2c230", INK, 30)}`,
  (t, T) => {
    mouth("ka", "kaua", T); sleepers(t, 5);
    $("k1").setAttribute("transform", `translate(0 ${Math.sin(t * 2) * 5})`);
    $("neon1").setAttribute("opacity", Math.floor(t * 3) % 4 === 0 ? 0.4 : 1);
  }]);

// 2a (3–5.6): A Lata coasts into the station with the engine off.
scenes.push([3, 5.6, () => postoBg() + `<g id="bus2">${nestArt(itemBy("A Lata").art(""), 0, 980, 1000, 426)}</g>`,
  (t) => {
    sleepers(t);
    $("bus2").setAttribute("transform", `translate(${-1000 + easeOut(t / 2.2) * 1060} 0)`);
    $("neon").setAttribute("opacity", Math.floor(t * 3) % 5 === 0 ? 0.4 : 1);
  }]);
// 2b (5.6–9.6): inside, whispering — Otávio explains, Jé cuts him off.
scenes.push([5.6, 9.6, () => `
  ${interior()}
  ${nightView("w2", 60, 280, 960, 520, [0, 1, 2, 3].map((i) => lerdoAt("pl" + i, 100 + i * 230, 520, 200, 350) + zzz("pz" + i, 230 + i * 230, 540)).join(""))}
  ${seatRow(-40, 1320, 560, 600)}${seatRow(560, 1320, 560, 600)}
  ${actor("otavio", "o2", -20, 620, 620, 1085)}
  ${actor("je", "j2", 470, 700, 600, 1050)}`,
  (t, T) => { sleepers(t); mouth("o2", "otavio", T); mouth("j2", "je", T); }]);

// 3 (9.6–15): the pump beeps every liter; every beep, a Lerdo twitches.
scenes.push([9.6, 15, () => postoBg() + `
  <g ${O} stroke-width="10"><rect x="560" y="700" width="420" height="760" rx="30" fill="#e8453c"/><rect x="600" y="760" width="340" height="200" rx="14" fill="#1b1b22"/>
    <path d="M940 1100 Q1060 1180 980 1320 Q900 1440 760 1400" fill="none" stroke="#1b1b22" stroke-width="26"/></g>
  <text id="lit" x="770" y="900" ${FONT} font-size="110" fill="#7fe0a8" text-anchor="middle">0 L</text>
  <g id="beep" opacity="0" ${FONT}><text x="760" y="680" font-size="90" fill="#ffd34d" text-anchor="middle" stroke="${INK}" stroke-width="12" paint-order="stroke">BIP!</text></g>
  ${actor("je", "j3", 120, 760, 600, 1050)}`,
  (t, T) => {
    mouth("j3", "je", T);
    const L = Math.floor(Math.max(0, t - 0.8) / 1.1);
    $("lit").textContent = L + " L";
    const since = Math.max(0, t - 0.8) % 1.1;
    const b = t > 0.8 && since < 0.35;
    $("beep").setAttribute("opacity", b ? 1 : 0);
    for (let i = 0; i < 4; i++) { const tw = b ? Math.sin(since * 40) * 8 : 0; $("pl" + i).removeAttribute("transform"); rotAt("pl" + i, tw + Math.sin(t * 1.6 + i) * 2); $("pz" + i).setAttribute("opacity", b ? 0 : 0.8); }
    $("j3").setAttribute("transform", `translate(0 ${b ? -10 : 0})`);
  }]);

// 4 (15–21): Kauã charges his phone in the shop; loud music, the Lerdos sway.
scenes.push([15, 21, () => shop() + `
  ${[0, 1, 2].map((i) => lerdoAt("sl" + i, 40 + i * 230, 760, 330, 580)).join("")}
  <path d="M470 1700 Q620 1600 760 1380" fill="none" stroke="#1b1b22" stroke-width="10"/>
  <g id="k4">${actor("kaua", "k4a", 300, 1060, 500, 875)}</g>
  <g id="bat4"><rect x="700" y="240" width="300" height="120" rx="18" fill="#1b1b22" stroke="#fff" stroke-width="6"/><rect x="1000" y="275" width="18" height="50" fill="#fff"/>
    <rect id="batF" x="716" y="256" width="30" height="88" fill="#e8453c"/><text id="batT" x="890" y="325" ${FONT} font-size="58" fill="#e8453c" text-anchor="middle">3%</text></g>`,
  (t, T) => {
    mouth("k4a", "kaua", T);
    drawNotes(t, "♪", "#e8453c");
    $("spk").setAttribute("transform", `translate(520 425) scale(${1 + Math.abs(Math.sin(t * 8)) * 0.06}) translate(-520 -425)`);
    for (let i = 0; i < 3; i++) swayAt("sl" + i, t, 9, 8, 205 + i * 230, 1340, i);
    const pct = T < 17.4 ? 3 : T < 18.0 ? 4 : 5;
    $("batT").textContent = pct + "%"; $("batF").setAttribute("width", 30 + (pct - 3) * 18);
  }]);

// 5 (21–25): PALPITE — one Lerdo stops dancing and stares at Kauã.
scenes.push([21, 25, () => `<g id="frzG">${shop()}${[0, 1, 2].map((i) => lerdoAt("sl" + i, 40 + i * 230, 760, 330, 580)).join("")}
    <g id="k5">${actor("kaua", "k5a", 300, 1060, 500, 875)}</g></g>
  <rect id="frz" width="${W}" height="${H}" fill="#0b1022" opacity="0"/>
  ${palpiteCard("O que o Kauã", "vai fazer?", "A) Desligar o som", "B) Sair correndo")}`,
  (t) => {
    drawNotes(t, "♪", "#e8453c");
    for (let i = 0; i < 3; i++) i === 2 ? $("sl2").setAttribute("transform", `rotate(${-14 * easeOut(t / 0.4)} 665 1340)`) : swayAt("sl" + i, Math.min(t, 0.6), 9, 8, 205 + i * 230, 1340, i);
    palpiteUpdate(t);
  }]);

// 6 (25–34): the answer is C — a slow love song, the Lerdos slow-dance in pairs.
scenes.push([25, 34, () => shop() + `
  <g id="pa">${lerdoAt("d0", 20, 760, 330, 580)}${lerdoAt("d1", 240, 760, 330, 580)}</g>
  <g id="pb">${lerdoAt("d2", 520, 820, 300, 525)}</g>
  <g id="k6">${actor("kaua", "k6a", 560, 1080, 480, 840)}</g>
  <g id="door6"><rect x="-10" y="1000" width="260" height="900" fill="#7fb2d6" opacity=".35" stroke="${INK}" stroke-width="8"/></g>
  ${actor("je", "j6", -160, 1140, 520, 910)}
  ${actor("otavio", "o6", 200, 1200, 440, 770)}
  <g id="ans6" opacity="0">${tag("RESPOSTA: C) TROCAR A MÚSICA", W / 2, 260, "#2f5fb3", "#fff", 42)}</g>`,
  (t, T) => {
    mouth("j6", "je", T); mouth("o6", "otavio", T); mouth("k6a", "kaua", T);
    drawNotes(t, "♥", "#f07fb0");
    const sw = Math.sin(t * 1.8) * 6;
    $("d0").setAttribute("transform", `rotate(${sw + 8} 185 1340)`); $("d1").setAttribute("transform", `rotate(${sw - 8} 405 1340) translate(-40 0)`);
    $("d2").setAttribute("transform", `rotate(${-sw} 670 1345)`);
    $("pa").setAttribute("transform", `translate(${Math.sin(t * 0.9) * 20} 0)`);
    $("ans6").setAttribute("opacity", t > 0.5 && t < 4 ? 1 : 0);
  }]);

// 7 (34–41): Dona Cida, who missed the plan, shouts at the counter; the music ends; everyone turns.
scenes.push([34, 41, () => shop() + `
  ${[0, 1].map((i) => lerdoAt("t" + i, 40 + i * 260, 760, 300, 525)).join("")}
  <g ${O} stroke-width="8"><rect x="420" y="1060" width="660" height="420" rx="16" fill="#8a5a2a"/><rect x="420" y="1040" width="660" height="40" rx="10" fill="#b07a40"/>
    <rect x="860" y="900" width="160" height="140" rx="14" fill="#2b2b33"/><rect x="880" y="920" width="120" height="60" rx="6" fill="#7fe0a8"/></g>
  <g id="fren">${nestArt(lerdoArt(), 560, 640, 300, 525)}<g ${O} stroke-width="6"><path d="M630 690 Q710 620 790 690 Z" fill="#e8453c"/><rect x="700" y="676" width="110" height="18" rx="9" fill="#e8453c"/></g></g>
  <rect x="420" y="1080" width="660" height="420" fill="#8a5a2a" stroke="${INK}" stroke-width="8"/>
  <g id="cida7">${actor("cida", "c7", -80, 840, 640, 1120)}</g>
  <g id="shout7" ${FONT} fill="#ffd34d" stroke="${INK}" stroke-width="10" paint-order="stroke"><text x="480" y="840" font-size="110">!!</text></g>`,
  (t, T) => {
    mouth("c7", "cida", T);
    const music = T < 37.0;
    if (music) drawNotes(t, "♥", "#f07fb0"); else $("notes").innerHTML = "";
    const turn = easeOut((T - 39.2) / 0.3);
    for (let i = 0; i < 2; i++) $("t" + i).setAttribute("transform", `rotate(${music ? Math.sin(t * 1.8 + i) * 6 : turn * 12} ${190 + i * 260} 1285)`);
    $("fren").setAttribute("transform", `rotate(${-turn * 10} 710 1165)`);
    const yell = talking("cida", T);
    $("shout7").setAttribute("opacity", yell ? 1 : 0);
    $("cida7").setAttribute("transform", `translate(0 ${yell ? Math.sin(t * 50) * 4 : 0})`);
  }]);

// 8 (41–47): the run to the bus; Dona Cida's cart debuts as a battering ram.
scenes.push([41, 47, () => postoBg(false) + `
  <g id="bus8">${nestArt(itemBy("A Lata").art(""), 420, 900, 1000, 426)}</g>
  ${[0, 1, 2].map((i) => lerdoAt("f" + i, 0, 0, 220, 385)).join("")}
  <g id="runK">${nestArt(charBy("Kauã").art(""), 0, 0, 220, 385)}</g>
  <g id="runJ">${nestArt(charBy("Jé").art(""), 0, 0, 230, 400)}</g>
  <g id="runO">${nestArt(charBy("Professor Otávio").art(""), 0, 0, 230, 400)}</g>
  <g id="runR">${nestArt(charBy("Rex").art(""), 0, 0, 200, 350)}</g>
  <g id="runC">${actor("cida", "c8", 0, 0, 260, 455)}<g transform="translate(220 230)">${nestArt(itemBy("Carrinho de feira").art(""), 0, 0, 200, 183)}</g></g>
  <g id="tum8" opacity="0">${caption(["TUM!"], 980, 140, "#ffd34d")}</g>
  <g id="card8" opacity="0">${tag("CARRINHO DE FEIRA: ESTREIA", W / 2, 260, "#3a7bd5", "#fff", 40)}</g>`,
  (t, T) => {
    mouth("c8", "cida", T);
    const run = (id, delay, y, speed) => { const x = -300 + (t - delay) * speed; $(id).setAttribute("transform", `translate(${x} ${y + Math.abs(Math.sin(t * 14 + delay * 5)) * -20})`); };
    run("runJ", 0, 1500 - 400, 300); run("runK", 0.3, 1520 - 385, 290); run("runO", 0.6, 1500 - 400, 280); run("runR", 0.2, 1540 - 350, 320);
    const cx = -420 + t * 260;
    $("runC").setAttribute("transform", `translate(${cx} ${1520 - 455})`);
    [380, 560, 740].forEach((fx, i) => {
      const hitT = (fx - 200 + 420) / 260; const k = clamp((t - hitT) / 0.4);
      $("f" + i).setAttribute("transform", `translate(${fx + k * 80} ${1520 - 385}) rotate(${k * 80} 110 385)`);
    });
    $("tum8").setAttribute("opacity", [380, 560, 740].some((fx) => { const h = (fx - 200 + 420) / 260; return t > h && t < h + 0.35; }) ? 1 : 0);
    $("card8").setAttribute("opacity", clamp((t - 0.4) / 0.2));
  }]);

// 9 (47–53): back on the road; Rex sniffs the last seat — empty, only the bandage left.
scenes.push([47, 53, () => `
  ${interior()}
  <g id="z9">
    ${nightView("w9", 60, 300, 960, 460)}
    ${seatRow(220, 1000, 640, 560)}
    <g ${O} stroke-width="6"><rect x="440" y="1340" width="200" height="56" rx="10" fill="#f4f4f4" transform="rotate(-8 540 1368)"/><path d="M460 1370 L620 1350" stroke="#c9c9cf" stroke-width="4"/></g>
    ${seatRow(100, 1460, 880, 460)}
    <g id="rex9">${nestArt(charBy("Rex").art(""), 620, 1100, 340, 595)}</g>
    <g id="sniff" ${FONT} font-size="46" fill="#e9f0ff" stroke="${INK}" stroke-width="8" paint-order="stroke" opacity="0"><text x="640" y="1250">snif</text><text x="700" y="1190">snif</text></g>
  </g>`,
  (t) => {
    const z = easeInOut((t - 2.0) / 3.0);
    $("z9").setAttribute("transform", `translate(540 1370) scale(${1 + z * 0.35}) translate(-540 -1370)`);
    $("rex9").setAttribute("transform", `translate(${-easeOut(t / 1.5) * 40} ${Math.sin(t * 10) * 4})`);
    $("sniff").setAttribute("opacity", t > 0.5 && t < 3 && Math.floor(t * 3) % 2 === 0 ? 1 : 0);
  }]);

// 10 (53–60): the vote.
scenes.push([53, 60, () => `
  ${interior()}
  ${nightView("w10", 60, 280, 960, 520)}
  ${seatRow(-60, 1380, 1200, 540)}
  <g id="k10">${actor("kaua", "kz", 160, 520, 760, 1330)}</g>
  <g id="rex10">${nestArt(charBy("Rex").art(""), 760, 1340, 300, 525)}</g>
  ${vote(["Voltar ao posto", "atrás dele"], ["Seguir pro", "terminal"])}
  <g id="cta" opacity="0">${caption(["Comenta A ou B.", "O mais votado vira", "o episódio 3."], 1560, 62, "#ffd34d")}</g>`,
  (t, T) => {
    mouth("kz", "kaua", T);
    $("k10").setAttribute("transform", `translate(0 ${Math.sin(t * 2) * 6})`);
    $("rex10").setAttribute("transform", `translate(0 ${talking("rex", T) ? -24 : 0})`);
    const v = backOut((t - 1.2) / 0.4);
    $("vote").setAttribute("opacity", clamp((t - 1.2) / 0.2));
    $("vote").setAttribute("transform", `translate(540 600) scale(${0.8 + 0.2 * v}) translate(-540 -600)`);
    $("cta").setAttribute("opacity", clamp((t - 3.4) / 0.3));
  }]);

