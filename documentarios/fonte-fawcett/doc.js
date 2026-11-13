// Documentário: O Coronel Fawcett e a Cidade Z — 16:9 renderer driven by the narration timeline (TL).
const W = 1920, H = 1080;
const $ = (id) => document.getElementById(id);
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const FONT = `font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold"`;
const SERIF = `font-family="DejaVu Serif, Georgia, serif"`;
const PAPER = "#efe2c4", INKD = "#1b1b22", JUNGLE = "#1f4a33", JUNGLE2 = "#2e6b45", SEPIA = "#7a5a32";
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// --- map ------------------------------------------------------------------
const BR = [[-51.6,4.2],[-50,1.8],[-48.5,-1],[-44.5,-2.5],[-41,-2.9],[-38.5,-3.7],[-35.2,-5.4],[-34.8,-7.5],[-35.3,-9.5],[-37,-11],[-38.9,-13],[-39,-17.5],[-40.2,-20.3],[-41.8,-22.9],[-44.5,-23.3],[-46.6,-24.2],[-48.5,-26],[-48.7,-28.5],[-50.2,-30.5],[-52,-32.2],[-53.4,-33.7],[-55.8,-30.9],[-57.6,-30.2],[-55.6,-28.1],[-53.8,-27],[-54.6,-25.6],[-54.3,-24],[-55.6,-22.6],[-57.8,-22.1],[-58.1,-20.2],[-57.5,-18],[-58.4,-16.3],[-60.2,-15.1],[-60.5,-13.7],[-62.2,-13.1],[-64.4,-12.5],[-65.4,-11],[-66.6,-9.9],[-68.6,-11.1],[-70.5,-11],[-70.6,-9.5],[-72.5,-9.5],[-73.9,-7.3],[-72.9,-5.2],[-70,-4.2],[-69.4,-1.2],[-69.8,1.1],[-67.8,2],[-66.9,1.2],[-64,2.1],[-63.4,3.9],[-60,5.2],[-59.8,4],[-57,2],[-54,2.2]];
const BORDER_BO = BR.slice(29, 40);
function proj(cx, cy, k) { return ([lon, lat]) => [cx + (lon + 54) * k, cy + (-14 - lat) * -k * -1]; }
function brazil({ cx = 960, cy = 560, k = 22, fill = "#cfe3b8", sea = "#a9cfe6", extra = "" } = {}) {
  const p = proj(cx, cy, k);
  const pts = BR.map(p).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return `<rect width="${W}" height="${H}" fill="${sea}"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${i * 100} Q480 ${i * 100 + 18} 960 ${i * 100} T1920 ${i * 100}" stroke="#ffffff" stroke-opacity=".18" stroke-width="3" fill="none"/>`).join("")}
    <rect x="${cx - 32 * k}" y="${cy - 22 * k}" width="${64 * k}" height="${44 * k}" fill="#e8dcb8" opacity=".55"/>
    <polygon points="${pts}" fill="${fill}" stroke="${INKD}" stroke-width="5" stroke-linejoin="round"/>${extra}`;
}
const pt = (lon, lat, o = {}) => proj(o.cx ?? 960, o.cy ?? 560, o.k ?? 22)([lon, lat]);
function marker(lon, lat, label, o = {}, color = "#e8453c", id = "") {
  const [x, y] = pt(lon, lat, o);
  return `<g ${id ? `id="${id}"` : ""}><circle cx="${x}" cy="${y}" r="16" fill="${color}" stroke="${INKD}" stroke-width="5"/>
    ${label ? `<text x="${x + 26}" y="${y + 12}" ${FONT} font-size="34" fill="${INKD}" stroke="#fff" stroke-width="8" paint-order="stroke">${label}</text>` : ""}</g>`;
}

// --- people and props -----------------------------------------------------
// Fawcett as an explorer (slouch hat, moustache, khaki) or as a young officer (cap, red tunic).
function fawcett(x, y, s, young = false) {
  const sk = "#eac39b";
  return `<g transform="translate(${x} ${y}) scale(${s})"><g ${O}>
    ${young ? S("rect", `x="40" y="150" width="120" height="170" rx="26"`, "#b8322f") + `<path d="M100 150 L100 320" stroke-width="3"/>${[0, 1, 2, 3].map((i) => `<circle cx="100" cy="${180 + i * 34}" r="5" fill="#ffd34d"/>`).join("")}`
            : S("rect", `x="40" y="150" width="120" height="170" rx="26"`, "#b59b6a") + `<path d="M74 152 L100 196 L126 152" fill="#e9dcc0" stroke-width="3"/><rect x="58" y="210" width="34" height="30" rx="4" fill="#a08656" stroke-width="3"/><rect x="108" y="210" width="34" height="30" rx="4" fill="#a08656" stroke-width="3"/>`}
    ${S("rect", `x="88" y="130" width="24" height="26" rx="5"`, sk, { dx: -3, dy: -2 })}
    ${ears(sk)}${S("circle", `cx="100" cy="98" r="52"`, sk)}
    ${eyes({ y: 100, brow: "flat", browColor: "#5a4030", lid: true })}${nose(sk)}
    ${S("path", `d="M72 122 Q86 110 100 118 Q114 110 128 122 Q114 132 100 126 Q86 132 72 122 Z"`, "#6b4a30", { dx: -2, dy: -3 })}
    ${young ? S("path", `d="M50 70 Q50 40 100 38 Q150 40 150 70 L150 80 L50 80 Z"`, "#1b1b22") + `<rect x="46" y="76" width="108" height="14" rx="6" fill="#ffd34d"/>`
            : S("path", `d="M20 72 Q100 52 180 72 Q180 84 100 80 Q20 84 20 72 Z"`, "#7a5a32") + S("path", `d="M56 72 Q56 26 100 24 Q144 26 144 72 Z"`, "#8a6a3e") + `<rect x="56" y="58" width="88" height="12" fill="#3a2a20"/>`}
  </g></g>`;
}
const silhouette = (x, y, s, hat = true, fill = INKD) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">
  <circle cx="0" cy="-150" r="26"/>${hat ? `<ellipse cx="0" cy="-166" rx="44" ry="9"/><path d="M-22 -168 Q0 -200 22 -168 Z"/>` : ""}
  <path d="M-30 -124 L30 -124 L36 -30 L-36 -30 Z"/><path d="M-30 -30 L-12 -30 L-18 40 L-34 40 Z M12 -30 L30 -30 L34 40 L18 40 Z"/>
  <path d="M30 -116 L64 -60 L54 -54 L24 -96 Z"/><rect x="-62" y="-120" width="28" height="70" rx="8"/></g>`;
const jungleBg = (dark = false) => `<rect width="${W}" height="${H}" fill="${dark ? "#3a5a78" : "#cfe8d0"}"/>${dark ? `<circle cx="1560" cy="200" r="70" fill="#fff6d6"/>` : ""}
  ${Array.from({ length: 22 }, (_, i) => { seed = i * 31 + 5; const x = rnd() * W, h = 300 + rnd() * 500, c = dark ? ["#123524", "#174430", "#0b2a1b"][i % 3] : [JUNGLE, JUNGLE2, "#3d8a57"][i % 3]; return `<rect x="${x - 10}" y="${H - h}" width="20" height="${h}" fill="${dark ? "#0a1e14" : "#4a3524"}"/><ellipse cx="${x}" cy="${H - h}" rx="${120 + rnd() * 120}" ry="${80 + rnd() * 60}" fill="${c}"/>`; }).join("")}
  <rect y="${H - 120}" width="${W}" height="120" fill="${dark ? "#0b2a1b" : "#2e6b45"}"/>`;
const paperBg = () => `<rect width="${W}" height="${H}" fill="${PAPER}"/>${Array.from({ length: 40 }, (_, i) => { seed = i * 17 + 3; return `<circle cx="${rnd() * W}" cy="${rnd() * H}" r="${30 + rnd() * 120}" fill="#d9c79f" opacity=".18"/>`; }).join("")}`;
const handLines = (x, y, w, n, id = "", gap = 44) => `<g ${id ? `id="${id}"` : ""}>${Array.from({ length: n }, (_, i) => { seed = i * 7 + x; let d = `M${x} ${y + i * gap}`; for (let k = 0; k < 18; k++) d += ` q${w / 36} ${-8 + rnd() * 16} ${w / 18} 0`; return `<path d="${d}" stroke="#3a2a20" stroke-width="4" fill="none" stroke-linecap="round" class="hl" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`; }).join("")}</g>`;
function stamp(text, x, y, r = -12, color = "#d8322f", size = 90, id = "") {
  const w = text.length * size * 0.7 + 60;
  return `<g ${id ? `id="${id}"` : ""} transform="rotate(${r} ${x} ${y})"><rect x="${x - w / 2}" y="${y - size * 0.85}" width="${w}" height="${size * 1.25}" rx="14" fill="none" stroke="${color}" stroke-width="12"/>
    <text x="${x}" y="${y + size * 0.15}" ${FONT} font-size="${size}" fill="${color}" text-anchor="middle" letter-spacing="4">${text}</text></g>`;
}
const card = (x, y, w, h, fill = "#fff", r = 18) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${INKD}" stroke-width="6"/>`;
const bigText = (t, x, y, size, fill = "#fff", anchor = "middle", extra = "") => `<text x="${x}" y="${y}" ${FONT} font-size="${size}" fill="${fill}" text-anchor="${anchor}" stroke="${INKD}" stroke-width="${size / 7}" paint-order="stroke" ${extra}>${t}</text>`;
function smokeCols(n, alive) { return Array.from({ length: n }, (_, i) => { const x = 360 + i * 300; return `<g opacity="${i < alive ? 1 : 0.0}"><path d="M${x} 640 C${x - 40} 560 ${x + 40} 500 ${x} 420 C${x - 40} 360 ${x + 30} 300 ${x} 240" stroke="#e8eef5" stroke-width="34" stroke-linecap="round" fill="none" opacity=".75"/><circle cx="${x}" cy="652" r="18" fill="#ffb35c"/></g>`; }).join(""); }

// --- shots per block: [sentence index within block, svg builder, optional animation(t)] ----------
const BLOCK_SHOTS = {
  0: [
    [0, () => `<rect width="${W}" height="${H}" fill="#24160c"/><radialGradient id="lampG" cx=".72" cy=".3" r=".6"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
      <rect width="${W}" height="${H}" fill="url(#lampG)"/><rect x="0" y="760" width="${W}" height="320" fill="#5a3a20"/>
      <g transform="rotate(-4 900 560)">${card(560, 300, 760, 560, PAPER, 6)}${handLines(620, 430, 640, 8, "letter")}
        <text x="1240" y="380" ${SERIF} font-size="40" fill="#3a2a20" text-anchor="end" font-style="italic">29 de maio de 1925</text></g>
      <g ${O}><rect x="1420" y="380" width="120" height="240" rx="30" fill="#c99a4a"/><ellipse cx="1480" cy="380" rx="70" ry="20" fill="#e8c27a"/><path d="M1480 330 Q1510 290 1480 250 Q1450 290 1480 330" fill="#ffb000"/></g>`,
      (t) => { document.querySelectorAll("#letter .hl").forEach((el, i) => el.setAttribute("stroke-dashoffset", 1 - clamp((t - i * 0.9) / 0.9))); }],
    [4, () => brazil({ extra: `<g id="mtDot">${marker(-53.5, -12, "Mato Grosso")}</g>` }) + bigText("1925", 1600, 200, 110, "#fff", "middle"),
      (t) => { $("mtDot").setAttribute("opacity", Math.floor(t * 2) % 2 ? 0.4 : 1); }],
    [5, () => `${jungleBg(true)}${silhouette(820, 860, 1.6)}${silhouette(1000, 870, 1.45, false)}${silhouette(1150, 875, 1.4, false)}<rect width="${W}" height="${H}" fill="#000" opacity=".25"/>`],
    [6, () => `${paperBg()}${fawcett(560, 140, 2.6)}<g transform="translate(1180 230)"><text x="0" y="560" ${SERIF} font-size="640" fill="#3a2a20" opacity=".9">Z</text></g>`],
  ],
  1: [
    [0, () => `<rect width="${W}" height="${H}" fill="#bcdcf0"/><path d="M0 700 Q400 640 800 700 T1920 680 L1920 1080 L0 1080 Z" fill="#6aa5c8"/><path d="M1100 1080 L1200 520 L1920 440 L1920 1080 Z" fill="#d9c79f" stroke="${INKD}" stroke-width="6"/>
      ${fawcett(260, 160, 2.6, true)}${bigText("1867 · Torquay, Inglaterra", 1300, 260, 64, "#fff")}`],
    [3, () => `${paperBg()}<g ${O} stroke-width="8">${card(260, 180, 1400, 760, "#f6ecd4", 10)}</g>${Array.from({ length: 9 }, (_, i) => `<path d="M${300 + i * 150} 200 L${300 + i * 150} 920 M280 ${220 + i * 85} L1640 ${220 + i * 85}" stroke="#c9b48a" stroke-width="3"/>`).join("")}
      <path id="coast" d="M400 820 Q600 600 820 640 T1220 420 T1520 300" stroke="${INKD}" stroke-width="8" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
      <g ${O}><path d="M1300 700 L1420 940 M1300 700 L1220 940" stroke-width="10"/><circle cx="1300" cy="700" r="20" fill="#c9c9cf"/></g>${bigText("Royal Geographical Society · 1901", 960, 130, 52, "#fff")}`,
      (t) => $("coast").setAttribute("stroke-dashoffset", 1 - clamp(t / 4))],
    [5, () => `<rect width="${W}" height="${H}" fill="#0b1430"/>${Array.from({ length: 60 }, (_, i) => { seed = i * 13 + 1; return `<circle cx="${rnd() * W}" cy="${rnd() * H}" r="${1 + rnd() * 3}" fill="#fff" opacity=".6"/>`; }).join("")}
      <circle cx="960" cy="540" r="380" fill="#6aa5c8" stroke="${INKD}" stroke-width="8"/><path d="M780 260 Q860 230 900 300 Q960 380 920 470 Q900 560 960 660 Q1000 760 940 840 Q880 800 860 700 Q800 600 820 480 Q780 380 780 260 Z" fill="#fff" stroke="${INKD}" stroke-width="6" id="blank"/>
      <path d="M1100 300 Q1200 340 1180 440 Q1120 500 1080 420 Z" fill="#cfe3b8" stroke="${INKD}" stroke-width="6"/>${bigText("?", 900, 600, 200, "#d8322f")}`,
      (t) => $("blank").setAttribute("fill", Math.floor(t * 1.5) % 2 ? "#ffffff" : "#fff7d6")],
  ],
  2: [
    [0, () => brazil({ k: 30, cx: 1160, cy: 520, extra: `<polyline id="bo" points="${BORDER_BO.map(proj(1160, 520, 30)).map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="#d8322f" stroke-width="14" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>` }) + bigText("Fronteira Brasil–Bolívia · 1906", 520, 860, 58, "#fff"),
      (t) => $("bo").setAttribute("stroke-dashoffset", 1 - clamp(t / 3))],
    [3, () => `${jungleBg()}<path d="M0 760 Q480 700 960 760 T1920 740 L1920 900 L0 900 Z" fill="#5aa0c8"/><g id="canoe"><path d="M-300 790 Q-150 840 0 790 Z" fill="#7a4a24" stroke="${INKD}" stroke-width="6"/>${silhouette(-200, 790, 0.5)}${silhouette(-90, 790, 0.5, false)}</g>${bigText("Sete expedições · 1906–1924", 960, 160, 64, "#fff")}`,
      (t) => $("canoe").setAttribute("transform", `translate(${300 + t * 140} 0)`)],
    [6, () => `${jungleBg()}<path id="snake" d="M120 860 C420 700 620 980 920 820 S1420 700 1760 860" stroke="#5a7a2a" stroke-width="80" stroke-linecap="round" fill="none"/><circle cx="1760" cy="860" r="60" fill="#5a7a2a" stroke="${INKD}" stroke-width="6"/><circle cx="1780" cy="842" r="9" fill="${INKD}"/>
      ${bigText("19 metros?", 960, 300, 110, "#fff")}${stamp("SERÁ?", 1500, 420, 10, "#d8322f", 80)}`],
    [7, () => `${jungleBg()}${[0, 1, 2].map((i) => `<g transform="translate(${560 + i * 300} 700)"><g ${O}><path d="M-80 0 L80 0 L60 140 L-60 140 Z" fill="${["#e8b04a", "#d8322f", "#3a7bd5"][i]}"/><path d="M-80 0 Q0 -60 80 0" fill="none" stroke-width="8"/></g></g>`).join("")}${bigText("Presentes e paciência", 960, 220, 72, "#fff")}`],
    [8, () => `<rect width="${W}" height="${H}" fill="#14261c"/><radialGradient id="jg"><stop offset="0" stop-color="#7fe0a8" stop-opacity=".5"/><stop offset="1" stop-color="#7fe0a8" stop-opacity="0"/></radialGradient><circle cx="960" cy="560" r="420" fill="url(#jg)"/>
      <g ${O} stroke-width="8"><path d="M960 300 Q1040 300 1040 400 Q1040 470 1000 500 L1040 760 L880 760 L920 500 Q880 470 880 400 Q880 300 960 300 Z" fill="#3e9a6a"/><path d="M930 600 L990 600 M930 640 L990 640" stroke-width="5"/></g>${bigText("A estatueta de pedra verde", 960, 900, 60, "#fff")}`],
    [9, () => `${paperBg()}<g transform="rotate(-3 960 540)">${card(700, 140, 520, 760, "#2f5f3a", 10)}<text x="960" y="380" ${SERIF} font-size="74" fill="#ffe08a" text-anchor="middle">O MUNDO</text><text x="960" y="470" ${SERIF} font-size="74" fill="#ffe08a" text-anchor="middle">PERDIDO</text>
      <path d="M800 760 L880 600 L940 700 L1000 560 L1120 760 Z" fill="#1f4a33" stroke="#ffe08a" stroke-width="5"/><text x="960" y="840" ${SERIF} font-size="34" fill="#ffe08a" text-anchor="middle">Arthur Conan Doyle</text></g>`],
  ],
  3: [
    [0, () => `${jungleBg(true)}<text id="bigZ" x="960" y="760" ${SERIF} font-size="720" fill="#ffe08a" text-anchor="middle" opacity="0">Z</text>`,
      (t) => $("bigZ").setAttribute("opacity", clamp((t - 2) / 2) * 0.9)],
    [2, () => `${paperBg()}<g transform="rotate(2 960 540)">${card(520, 120, 880, 860, "#e9d6a6", 6)}${handLines(600, 280, 720, 13, "", 48)}<text x="960" y="230" ${SERIF} font-size="56" fill="#3a2a20" text-anchor="middle">Manuscrito 512 · 1753</text></g>${bigText("Biblioteca Nacional, Rio de Janeiro", 1560, 90, 40, "#fff")}`,
      (t) => document.querySelectorAll(".hl").forEach((el, i) => el.setAttribute("stroke-dashoffset", 1 - clamp((t - i * 0.25) / 0.6)))],
    [3, () => `${jungleBg()}<g ${O} stroke-width="8">${[0, 1, 2].map((i) => `<path d="M${540 + i * 300} 900 L${540 + i * 300} 560 Q${690 + i * 300} 400 ${840 + i * 300} 560 L${840 + i * 300} 900 L${790 + i * 300} 900 L${790 + i * 300} 590 Q${690 + i * 300} 470 ${590 + i * 300} 590 L${590 + i * 300} 900 Z" fill="#c9b48a"/>`).join("")}</g>${bigText("Arcos, uma estátua, um templo", 960, 200, 70, "#fff")}`],
    [4, () => brazil({ extra: [[-50, -10], [-45, -12], [-55, -8], [-41, -13]].map(([lo, la]) => { const [x, y] = pt(lo, la); return bigText("?", x, y, 120, "#d8322f"); }).join("") }) + bigText("Mas onde?", 1560, 180, 90, "#fff")],
  ],
  4: [
    [0, () => `<rect width="${W}" height="${H}" fill="#8a8070"/><rect y="0" width="${W}" height="500" fill="#c9bfa8"/>${Array.from({ length: 8 }, (_, i) => silhouette(200 + i * 220, 820, 0.9, false, "#2b2b33")).join("")}<rect y="800" width="${W}" height="280" fill="#5a4a38"/>
      ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 170} 800 l40 -60 l40 60" stroke="#2b2b33" stroke-width="6" fill="none"/>`).join("")}${bigText("Flandres · 1914–1918", 960, 200, 80, "#fff")}`],
    [2, () => `${paperBg()}<g ${O} stroke-width="8"><path d="M900 160 L960 420 L1020 160 Z" fill="#d8322f"/><path d="M960 380 L1010 480 L1120 490 L1040 560 L1070 670 L960 610 L850 670 L880 560 L800 490 L910 480 Z" fill="#ffd34d"/></g>${bigText("Ordem de Serviço Distinto · 1917", 960, 840, 60, "#fff")}`],
    [3, () => `<rect width="${W}" height="${H}" fill="#2a1c12"/><g transform="rotate(-6 960 540)">${card(360, 220, 1200, 640, "#c99a4a", 30)}<g ${SERIF} font-size="64" fill="#3a2a20" text-anchor="middle">
      <text x="960" y="460" letter-spacing="10">A B C D E F G H I J K L M</text><text x="960" y="560" letter-spacing="10">N O P Q R S T U V W X Y Z</text><text x="560" y="340">SIM</text><text x="1360" y="340">NÃO</text><text x="960" y="760">1 2 3 4 5 6 7 8 9 0</text></g></g>
      <g id="plan"><g ${O} stroke-width="6"><path d="M0 -70 Q60 0 0 90 Q-60 0 0 -70 Z" fill="#f4e2c0"/><circle cx="0" cy="0" r="24" fill="#bcdcf0"/></g></g>`,
      (t) => $("plan").setAttribute("transform", `translate(${760 + Math.sin(t * 0.8) * 300} ${520 + Math.cos(t * 1.1) * 80}) rotate(${Math.sin(t) * 20})`)],
    [4, () => `<rect width="${W}" height="${H}" fill="#9fd3f0"/><rect y="640" width="${W}" height="440" fill="#3a7bd5"/><g id="ship"><g ${O} stroke-width="8"><path d="M-260 600 L260 600 L200 700 L-200 700 Z" fill="#2b2b33"/><rect x="-140" y="500" width="260" height="100" fill="#f4f4f4"/><rect x="-40" y="400" width="60" height="100" fill="#d8322f"/></g></g>${bigText("De volta ao Brasil", 960, 200, 80, "#fff")}`,
      (t) => $("ship").setAttribute("transform", `translate(${-300 + t * 260} ${Math.sin(t * 2) * 8})`)],
    [5, () => `${jungleBg(true)}<g ${O}><path d="M900 900 L960 760 L1020 900 Z" fill="#c9b48a"/></g><circle cx="960" cy="930" r="40" fill="#ff8a3a" opacity=".9"/>${silhouette(1160, 940, 1.1)}${bigText("1920 · sozinho", 960, 200, 80, "#fff")}<rect width="${W}" height="${H}" fill="#3a0a0a" opacity=".2" id="fever"/>`,
      (t) => $("fever").setAttribute("opacity", 0.15 + Math.abs(Math.sin(t * 1.5)) * 0.2)],
    [8, () => `<rect width="${W}" height="${H}" fill="#f7c58a"/><circle cx="960" cy="760" r="260" fill="#ffe08a"/>${jungleBg().replace(`fill="#cfe8d0"`, `fill="none"`)}${bigText("“Na próxima vez, até o fim.”", 960, 200, 70, "#fff")}`],
  ],
  5: [
    [0, () => brazil({ k: 30, cx: 1060, cy: 480, extra: marker(-56.1, -15.6, "Cuiabá", { k: 30, cx: 1060, cy: 480 }) }) + bigText("20 de abril de 1925", 1500, 160, 70, "#fff")],
    [1, () => `${jungleBg()}<g id="walk">${silhouette(700, 900, 1.3)}${silhouette(880, 905, 1.2, false)}${silhouette(1040, 910, 1.2, false)}</g>${bigText("Percy, Jack e Raleigh", 960, 180, 76, "#fff")}`,
      (t) => $("walk").setAttribute("transform", `translate(${t * 40} 0)`)],
    [3, () => `<rect width="${W}" height="${H}" fill="#6b4a30"/><rect x="100" y="80" width="1720" height="920" rx="30" fill="#8a6a3e"/>
      <g ${O} stroke-width="7">${[0, 1, 2].map((i) => `<rect x="${260 + i * 110}" y="260" width="90" height="130" rx="10" fill="#c9c9cf"/>`).join("")}<rect x="700" y="240" width="200" height="170" rx="14" fill="#f4f4f4"/>
        <path d="M1100 420 L1300 220 L1500 420 Z" fill="#c99a4a"/><circle cx="1300" cy="560" r="100" fill="#ffd34d"/><path d="M1300 560 L1300 490 M1300 560 L1350 590" stroke-width="8"/>
        <rect x="300" y="600" width="420" height="60" rx="14" fill="#3a3a44"/><rect x="820" y="620" width="70" height="200" rx="10" fill="#d8322f"/></g>
      <g ${FONT} font-size="34" fill="#fff" text-anchor="middle"><text x="415" y="440">latas</text><text x="800" y="450">leite em pó</text><text x="1300" y="460">sextante</text><text x="1300" y="710">cronômetro</text><text x="510" y="720">armas</text><text x="855" y="870">sinalizador</text></g>`],
    [4, () => `${jungleBg()}${Array.from({ length: 8 }, (_, i) => `<g transform="translate(${180 + i * 200} 880)"><g ${O} stroke-width="5"><ellipse cx="0" cy="0" rx="70" ry="38" fill="#8a6a3e"/><path d="M50 -20 L90 -60 L100 -40 L70 -10 Z" fill="#8a6a3e"/>${[-40, -15, 15, 40].map((x) => `<rect x="${x}" y="20" width="10" height="60" fill="#5a4030"/>`).join("")}</g></g>`).join("")}${bigText("2 cavalos · 8 mulas · 2 cães", 960, 200, 70, "#fff")}`],
    [5, () => `${paperBg()}<g transform="rotate(-3 960 520)">${card(520, 220, 880, 560, "#fffaf0", 8)}<text x="960" y="420" ${SERIF} font-size="64" fill="#3a2a20" text-anchor="middle">Se não voltarmos,</text><text x="960" y="520" ${SERIF} font-size="64" fill="#3a2a20" text-anchor="middle">ninguém deve</text><text x="960" y="620" ${SERIF} font-size="64" fill="#3a2a20" text-anchor="middle">vir nos procurar.</text></g>`],
    [6, () => brazil({ k: 34, cx: 1100, cy: 420, extra: `<polyline id="route" points="${[[-56.1, -15.6], [-55.4, -14.5], [-55, -13.2], [-54.58, -11.72]].map(proj(1100, 420, 34)).map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="#d8322f" stroke-width="12" stroke-dasharray="1" stroke-dashoffset="1" pathLength="1" stroke-linecap="round"/>${marker(-56.1, -15.6, "Cuiabá", { k: 34, cx: 1100, cy: 420 })}${marker(-54.58, -11.72, "Acampamento do Cavalo Morto", { k: 34, cx: 1100, cy: 420 }, "#ffd34d")}` }) + bigText("29 de maio de 1925", 1500, 160, 70, "#fff"),
      (t) => $("route").setAttribute("stroke-dashoffset", 1 - clamp(t / 4))],
  ],
  6: [
    [0, () => `<rect width="${W}" height="${H}" fill="#24160c"/><g transform="rotate(-2 960 540)">${card(360, 160, 1200, 760, PAPER, 6)}${handLines(440, 300, 1040, 4, "", 52)}
      <g id="coord"><text x="960" y="620" ${SERIF} font-size="110" fill="#3a2a20" text-anchor="middle">11° 43' S</text><text x="960" y="760" ${SERIF} font-size="70" fill="#3a2a20" text-anchor="middle">54° 35' W</text></g></g>`],
    [3, () => brazil({ k: 70, cx: 1180, cy: 260, extra: `<rect id="band" x="0" y="${pt(0, -11.72, { k: 70, cx: 1180, cy: 260 })[1]}" width="${W}" height="${2 * 70}" fill="#ffd34d" opacity=".25"/>${marker(-54.58, -11.72, "11° 43' S (carta)", { k: 70, cx: 1180, cy: 260 }, "#ffd34d")}${marker(-54.58, -13.72, "13° 43' S (imprensa)", { k: 70, cx: 1180, cy: 260 })}` }) + bigText("≈ 220 km de diferença", 960, 150, 64, "#fff")],
    [5, () => `${jungleBg(true)}${bigText("Erro de digitação?", 960, 420, 96, "#fff")}${bigText("Ou de propósito?", 960, 600, 96, "#ffd34d")}`],
  ],
  7: [
    [0, () => `${paperBg()}${[0, 1, 2, 3].map((i) => `<g transform="rotate(${[-6, 4, -3, 7][i]} ${480 + i * 320} 520)">${card(330 + i * 320, 300, 300, 420, "#f6f1e4", 4)}<text x="${480 + i * 320}" y="380" ${SERIF} font-size="34" fill="${INKD}" text-anchor="middle">${["FAWCETT", "SEM NOTÍCIAS", "PERDIDOS", "1927"][i]}</text>${handLines(355 + i * 320, 430, 250, 6, "", 36)}</g>`).join("")}`],
    [3, () => `${paperBg()}<g ${O} stroke-width="7"><rect x="420" y="380" width="360" height="160" rx="14" fill="#c9c9cf"/><circle cx="1260" cy="460" r="130" fill="#ffd34d"/><path d="M1260 460 L1260 360 M1260 460 L1330 500" stroke-width="10"/></g>
      <text x="600" y="480" ${SERIF} font-size="40" fill="${INKD}" text-anchor="middle">P. H. FAWCETT</text>${stamp("FALSO", 600, 760, -10)}${stamp("FALSO", 1260, 760, 8)}`],
    [6, () => `<rect width="${W}" height="${H}" fill="#9fd3f0"/><rect y="760" width="${W}" height="320" fill="#3a7bd5"/><g id="plane"><g ${O} stroke-width="7"><path d="M-200 0 L200 0 L240 -30 L-160 -40 Z" fill="#f4f4f4"/><rect x="-60" y="-110" width="40" height="120" fill="#d8322f"/><rect x="-260" y="-24" width="520" height="22" rx="10" fill="#ffd34d"/><path d="M-120 40 L-140 90 M120 40 L140 90" stroke-width="6"/><rect x="-180" y="86" width="120" height="20" rx="8" fill="#2b2b33"/><rect x="60" y="86" width="120" height="20" rx="8" fill="#2b2b33"/></g></g>${bigText("Aloha Wanderwell · 1930–1931", 960, 180, 70, "#fff")}`,
      (t) => $("plane").setAttribute("transform", `translate(${300 + t * 160} ${420 + Math.min(1, t / 6) * 300})`)],
    [7, () => `${paperBg()}<g ${O} stroke-width="6">${[0, 1, 2].map((i) => `<rect x="${640 + i * 220}" y="${420 + (i % 2) * 40}" width="40" height="220" rx="20" fill="#f4f4f4" transform="rotate(${[-20, 10, 40][i]} ${660 + i * 220} 530)"/>`).join("")}</g>${bigText("1951 · os ossos", 960, 220, 80, "#fff")}${stamp("NÃO ERAM DELE", 960, 760, -6, "#d8322f", 74)}`],
    [8, () => `${paperBg()}<g ${O} stroke-width="8"><circle cx="960" cy="540" r="160" fill="none" stroke="#ffd34d" stroke-width="40"/><circle cx="960" cy="540" r="160" fill="none"/><rect x="900" y="330" width="120" height="80" rx="16" fill="#ffd34d"/></g>${bigText("1979 · o anel, numa casa de penhores", 960, 900, 60, "#fff")}`],
    [9, () => `<rect width="${W}" height="${H}" fill="#14141c"/><text id="num" x="960" y="700" ${FONT} font-size="420" fill="#fff" text-anchor="middle">100</text>${bigText("pessoas mortas na busca?", 960, 900, 64, "#ffd34d")}`,
      (t) => { $("num").textContent = t < 4.5 ? "100" : "1"; $("num").setAttribute("fill", t < 4.5 ? "#ffffff" : "#ffd34d"); }],
  ],
  8: [
    [0, () => `${jungleBg()}<rect y="700" width="${W}" height="380" fill="#c9a96a"/>${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${260 + i * 340} 760)"><path d="M-130 0 Q-130 -220 0 -240 Q130 -220 130 0 Z" fill="#b08a4a" stroke="${INKD}" stroke-width="6"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${-110 + k * 44} 0 Q${-90 + k * 36} -120 0 -230" stroke="#8a6a3e" stroke-width="4" fill="none"/>`).join("")}<rect x="-24" y="-80" width="48" height="80" rx="20" fill="#5a4030"/></g>`).join("")}${bigText("Os Kalapalo · Alto Xingu", 960, 180, 76, "#fff")}`],
    [3, () => `<rect width="${W}" height="${H}" fill="#14203a"/>${Array.from({ length: 50 }, (_, i) => { seed = i * 29 + 7; return `<circle cx="${rnd() * W}" cy="${rnd() * 500}" r="${1 + rnd() * 2.5}" fill="#fff" opacity=".7"/>`; }).join("")}${jungleBg(true).replace(`fill="#0e2418"`, `fill="none"`)}<g id="smoke"></g><g id="nights" ${FONT} font-size="56" fill="#ffe08a" text-anchor="middle"></g>`,
      (t) => { const n = Math.min(6, Math.floor(t / 1.6) + 1); $("smoke").innerHTML = smokeCols(5, n <= 5 ? n : 0); $("nights").innerHTML = `<text x="960" y="160">${n <= 5 ? n + "ª noite" : "6ª noite"}</text>`; }],
  ],
  9: [
    [0, () => `${jungleBg()}${bigText("Sonhador?", 960, 540, 140, "#fff")}`],
    [2, () => `<rect width="${W}" height="${H}" fill="#1f4a33"/>${Array.from({ length: 140 }, (_, i) => { seed = i * 11 + 9; return `<circle cx="${rnd() * W}" cy="${rnd() * H}" r="${30 + rnd() * 50}" fill="${["#2e6b45", "#3d8a57", "#174430"][i % 3]}"/>`; }).join("")}
      <g id="ruins" opacity="0" fill="none" stroke="#ffe08a" stroke-width="10" stroke-linecap="round"><circle cx="560" cy="460" r="150"/><circle cx="1300" cy="600" r="180"/><path d="M710 460 L1120 600 M560 610 L520 900 M1480 600 L1800 520 M560 310 L700 120"/><path d="M380 460 L280 470" stroke-dasharray="20 20"/></g>${bigText("Kuhikugu · Alto Xingu", 960, 130, 60, "#fff")}`,
      (t) => $("ruins").setAttribute("opacity", clamp(t / 3))],
    [5, () => `<rect width="${W}" height="${H}" fill="#2e6b45"/><rect y="640" width="${W}" height="440" fill="#3a2a20"/><rect y="640" width="${W}" height="60" fill="#1b120c"/>${bigText("Terra preta: séculos de agricultura", 960, 200, 70, "#fff")}${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${200 + i * 300} 640 Q${230 + i * 300} 520 ${260 + i * 300} 640" fill="#7fc04a" stroke="${INKD}" stroke-width="5"/>`).join("")}`],
    [7, () => `<rect width="${W}" height="${H}" fill="#0b1430"/><g id="las" stroke="#7fe0ff" stroke-width="3" opacity=".7"></g><path d="M300 700 Q700 600 1100 680 T1700 620" stroke="#ffe08a" stroke-width="10" fill="none"/><circle cx="820" cy="640" r="70" fill="none" stroke="#ffe08a" stroke-width="10"/>${bigText("Bolívia · 2022 · laser", 960, 180, 70, "#fff")}<g ${O} stroke-width="6"><path d="M860 260 L1060 260 L1100 290 L820 290 Z" fill="#c9c9cf"/></g>`,
      (t) => { let s = ""; for (let i = 0; i < 30; i++) s += `<line x1="960" y1="290" x2="${200 + i * 52}" y2="${900 - Math.sin(i + t) * 40}"/>`; $("las").innerHTML = s; }],
  ],
  10: [
    [0, () => `${paperBg()}${[0, 1, 2].map((i) => `<g transform="rotate(${[-8, 3, 10][i]} ${700 + i * 220} 540)">${card(560 + i * 220, 240, 300, 420, ["#f4f4f4", "#e9eef5", "#fff6e0"][i], 4)}<text x="${710 + i * 220}" y="320" ${SERIF} font-size="34" fill="${INKD}" text-anchor="middle">THE NEW YORKER</text></g>`).join("")}${bigText("2005", 960, 860, 90, "#fff")}`],
    [1, () => `${paperBg()}<g transform="rotate(3 960 540)">${card(720, 160, 480, 720, "#1f4a33", 8)}<text x="960" y="440" ${SERIF} font-size="300" fill="#ffe08a" text-anchor="middle">Z</text><text x="960" y="560" ${SERIF} font-size="40" fill="#ffe08a" text-anchor="middle">A CIDADE PERDIDA</text><text x="960" y="800" ${SERIF} font-size="30" fill="#ffe08a" text-anchor="middle">David Grann · 2009</text></g>`],
    [2, () => `<rect width="${W}" height="${H}" fill="#14141c"/><g id="reel"><g ${O} stroke-width="8" stroke="#c9c9cf"><circle cx="0" cy="0" r="220" fill="#2b2b33"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${130 * Math.cos(i * 1.256)}" cy="${130 * Math.sin(i * 1.256)}" r="50" fill="#14141c"/>`).join("")}<circle r="30" fill="#c9c9cf"/></g></g>${bigText("2016 · no cinema", 1300, 540, 90, "#fff", "middle")}`,
      (t) => $("reel").setAttribute("transform", `translate(600 540) rotate(${t * 40})`)],
  ],
  11: [
    [0, () => `${paperBg()}${fawcett(760, 120, 2.4)}${bigText("O que aconteceu", 1480, 480, 72, "#fff")}${bigText("com ele?", 1480, 580, 72, "#fff")}`],
    [1, () => `<rect width="${W}" height="${H}" fill="#1b1b22"/>${card(140, 220, 760, 640, "#f2c230", 40)}<text x="520" y="460" ${FONT} font-size="220" fill="${INKD}" text-anchor="middle">A</text><text x="520" y="610" ${FONT} font-size="64" fill="${INKD}" text-anchor="middle">Morreu na selva</text>
      <g opacity=".3">${card(1020, 220, 760, 640, "#e8453c", 40)}</g>`],
    [2, () => `<rect width="${W}" height="${H}" fill="#1b1b22"/><g opacity=".3">${card(140, 220, 760, 640, "#f2c230", 40)}</g>${card(1020, 220, 760, 640, "#e8453c", 40)}<text x="1400" y="460" ${FONT} font-size="220" fill="#fff" text-anchor="middle">B</text><text x="1400" y="610" ${FONT} font-size="64" fill="#fff" text-anchor="middle">Sumiu de propósito</text>`],
    [4, () => `<rect width="${W}" height="${H}" fill="#1b1b22"/>${card(140, 220, 760, 640, "#f2c230", 40)}<text x="520" y="460" ${FONT} font-size="220" fill="${INKD}" text-anchor="middle">A</text><text x="520" y="610" ${FONT} font-size="64" fill="${INKD}" text-anchor="middle">Morreu na selva</text>
      ${card(1020, 220, 760, 640, "#e8453c", 40)}<text x="1400" y="460" ${FONT} font-size="220" fill="#fff" text-anchor="middle">B</text><text x="1400" y="610" ${FONT} font-size="64" fill="#fff" text-anchor="middle">Sumiu de propósito</text>${bigText("Comenta A ou B", 960, 150, 80, "#ffd34d")}`],
  ],
};

// --- composition ------------------------------------------------------------
const FR = TL.frases, BL = TL.blocos.filter((b) => "b" in b), TC = TL.blocos.find((b) => "title_card" in b).title_card;
function shotStart(b, si) { const f = FR.find((x) => x.b === b && x.s === si); return f ? f.t0 - 0.25 : null; }
const SCENES = [];
for (const blk of BL) {
  const shots = BLOCK_SHOTS[blk.b];
  shots.forEach(([si, build, anim], k) => {
    const start = k === 0 ? blk.t0 - (blk.b === 0 ? 0.8 : 0.9) : shotStart(blk.b, si);
    SCENES.push({ start, build, anim, b: blk.b });
  });
}
SCENES.push({ start: TC, build: () => `<rect width="${W}" height="${H}" fill="#14141c"/>${jungleBg(true).replace(`fill="#0e2418"`, `fill="none"`)}<rect width="${W}" height="${H}" fill="#000" opacity=".45"/>
  <text x="960" y="470" ${SERIF} font-size="96" fill="#ffe08a" text-anchor="middle">O CORONEL FAWCETT</text><text x="960" y="600" ${SERIF} font-size="96" fill="#ffe08a" text-anchor="middle">E A CIDADE Z</text>
  <text x="960" y="720" ${FONT} font-size="36" fill="#cfe0ff" text-anchor="middle" letter-spacing="8">UM DOCUMENTÁRIO A OU B</text>`, b: -1, title: true });
SCENES.push({ start: TL.total - 4.2, build: () => `<rect width="${W}" height="${H}" fill="#0b1022"/>
  <g transform="translate(960 470) scale(1.3)"><g ${O} stroke-width="10"><g transform="translate(-122 6) rotate(-9)">${S("rect", `x="-120" y="-120" width="240" height="240" rx="46"`, "#f2c230", { dx: -12, dy: -10 })}<text x="0" y="62" ${FONT} font-size="190" text-anchor="middle" fill="#fff" stroke="${INKD}" stroke-width="10" paint-order="stroke">A</text></g>
  <g transform="translate(122 -6) rotate(9)">${S("rect", `x="-120" y="-120" width="240" height="240" rx="46"`, "#e8453c", { dx: -12, dy: -10 })}<text x="0" y="62" ${FONT} font-size="190" text-anchor="middle" fill="#fff" stroke="${INKD}" stroke-width="10" paint-order="stroke">B</text></g>
  ${S("circle", `cx="0" cy="0" r="64"`, "#ffffff", { dx: -5, dy: -5 })}<text x="0" y="22" ${FONT} font-size="62" text-anchor="middle" fill="${INKD}" stroke="none">ou</text></g></g>
  ${bigText("Inscreva-se para o próximo mistério", 960, 900, 60, "#fff")}`, b: -2 });
SCENES.sort((a, b) => a.start - b.start);

const chapterAt = (T) => { let c = null; for (const blk of BL) if (T >= blk.t0 - 0.9) c = blk; return c; };
function wrap(text, max = 52) { const out = []; let line = ""; for (const w of text.split(" ")) { if ((line + " " + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + " " + w).trim(); } if (line) out.push(line); return out; }

let cur = -1, lastSub = null, lastChap = null;
window.setFrame = (T) => {
  let idx = 0; for (let i = 0; i < SCENES.length; i++) if (T >= SCENES[i].start) idx = i;
  const sc = SCENES[idx];
  if (idx !== cur) {
    $("stage").innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><g id="kb">${sc.build()}</g></svg>`;
    cur = idx;
  }
  const t = T - sc.start, next = SCENES[idx + 1] ? SCENES[idx + 1].start : TL.total, dur = next - sc.start;
  // slow Ken Burns push-in, alternating direction
  const k = clamp(t / Math.max(1, dur)), z = 1 + 0.06 * k, dx = (idx % 2 ? -1 : 1) * 30 * k;
  $("kb").setAttribute("transform", `translate(${960 + dx} 540) scale(${z}) translate(-960 -540)`);
  if (sc.anim) sc.anim(t);
  $("stage").style.opacity = String(Math.min(1, 0.25 + t / 0.4));
  // chapter lower third for the first 4 s of each chapter
  const ch = chapterAt(T); const showCh = ch && ch.b > 0 && T - ch.t0 < 4.0 && T - ch.t0 > -0.6;
  const chKey = showCh ? ch.b : null;
  if (chKey !== lastChap) { lastChap = chKey; $("chap").innerHTML = showCh ? `<rect x="60" y="56" width="${BLOCOS[ch.b][0].length * 26 + 200}" height="74" rx="14" fill="#1b1b22" opacity=".85"/><rect x="60" y="56" width="16" height="74" rx="6" fill="#f2c230"/><text x="96" y="106" ${FONT} font-size="38" fill="#fff">${String(ch.b).padStart(2, "0")} · ${BLOCOS[ch.b][0]}</text>` : ""; }
  // subtitles
  const f = FR.find((x) => T >= x.t0 - 0.05 && T < x.t1 + 0.25);
  const key = f ? f.i : null;
  if (key !== lastSub) { lastSub = key; $("sub").innerHTML = f ? wrap(f.text).map((l, i, a) => `<text x="960" y="${1010 - (a.length - 1 - i) * 54}" ${FONT} font-size="44" fill="#fff" text-anchor="middle" stroke="#000" stroke-width="9" paint-order="stroke">${l}</text>`).join("") : ""; }
};
setFrame(0);
