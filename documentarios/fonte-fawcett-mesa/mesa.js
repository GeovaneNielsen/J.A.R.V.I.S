// "Mesa de investigação" style for the Fawcett documentary (16:9). One beat per narration sentence.
const W = 1920, H = 1080, INKD = "#1b1b22";
const $ = (id) => document.getElementById(id);
const clamp = (x) => Math.max(0, Math.min(1, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const backOut = (x) => { const c = 1.6; x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const HEAVY = `font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold" letter-spacing="-3"`;
const ITAL = `font-family="DejaVu Serif, Georgia, serif" font-style="italic"`;
const SERIF = `font-family="DejaVu Serif, Georgia, serif"`;
const PAPER = "#e9e2cf", GRAYT = "#d8d4c8", MUSTARD = "#d9a520", REDB = "#c0261f";
let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------- static desk -------------------------------------------------------
const DEFS = `<defs>
  <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#0f3d2e"/><path d="M36 0 L0 0 0 36" fill="none" stroke="#2f6b55" stroke-width="1.2" opacity=".55"/></pattern>
  <pattern id="grid5" width="180" height="180" patternUnits="userSpaceOnUse"><path d="M180 0 L0 0 0 180" fill="none" stroke="#3d7d65" stroke-width="2" opacity=".5"/></pattern>
  <filter id="blinds" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="28"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="14" dy="18" stdDeviation="12" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="rim" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="#e8902a"/><feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="o" stdDeviation="2" result="ob"/><feColorMatrix in="SourceGraphic" type="saturate" values=".15" result="g"/><feMerge><feMergeNode in="ob"/><feMergeNode in="g"/></feMerge></filter>
  <filter id="mono"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.1" intercept="-.04"/><feFuncG type="linear" slope="1.05" intercept="-.04"/><feFuncB type="linear" slope=".95" intercept="-.04"/></feComponentTransfer></filter>
  <filter id="redtint"><feColorMatrix type="matrix" values=".55 .45 .2 0 .12  .12 .12 .06 0 0  .1 .1 .06 0 0  0 0 0 1 0"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".18"/></feComponentTransfer></filter>
  <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".78"/></radialGradient>
  <linearGradient id="hl" x1="0" x2="1"><stop offset="0" stop-color="#f2d34a" stop-opacity=".85"/><stop offset="1" stop-color="#f2d34a" stop-opacity=".7"/></linearGradient>
</defs>`;
function deskBase() {
  return `${DEFS}<rect width="${W}" height="${H}" fill="url(#grid)"/><rect width="${W}" height="${H}" fill="url(#grid5)"/>`;
}
function deskTop(part) {
  // separate layers so the page can move them every frame
  if (part === "blinds") return `<g filter="url(#blinds)">${Array.from({ length: 11 }, (_, i) => `<rect x="${-1400 + i * 520}" y="-600" width="230" height="3400" fill="#000" transform="rotate(38 ${-1400 + i * 520} 0)"/>`).join("")}</g>`;
  return `<rect width="${W}" height="${H}" fill="url(#vig)"/><rect width="${W}" height="${H}" filter="url(#grain)" opacity=".9"/>`;
}

// ---------- paper props -------------------------------------------------------
function torn(x, y, w, h, fill = PAPER, sd = 1) {
  seed = Math.floor(x * 7 + y * 3 + sd); const pts = [];
  const n = 14, j = 6;
  for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n, y + (rnd() - 0.5) * j]);
  for (let i = 0; i <= n; i++) pts.push([x + w + (rnd() - 0.5) * j, y + (h * i) / n]);
  for (let i = n; i >= 0; i--) pts.push([x + (w * i) / n, y + h + (rnd() - 0.5) * j]);
  for (let i = n; i >= 0; i--) pts.push([x + (rnd() - 0.5) * j, y + (h * i) / n]);
  return `<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="${fill}"/>`;
}
const lines = (x, y, w, n, gap = 26, sd = 1, col = "#6a6050") => { seed = sd * 13 + 5; return Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${w * (0.55 + rnd() * 0.45)}" height="7" rx="3" fill="${col}" opacity=".7"/>`).join(""); };
const scrawl = (x, y, w, n, gap = 34, sd = 1) => { seed = sd * 17 + 3; return Array.from({ length: n }, (_, i) => { let d = `M${x} ${y + i * gap}`; for (let k = 0; k < 16; k++) d += ` q${w / 32} ${-7 + rnd() * 14} ${w / 16} 0`; return `<path d="${d}" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>`; }).join(""); };
// newspaper with a fictional masthead; headline gets the yellow highlighter
function newspaper(cx, cy, s, rot, mast, head, sub, hlK, img = "") {
  const w = 760, h = 980;
  const hlW = 680 * clamp(hlK);
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(${-w / 2} ${-h / 2})" filter="url(#shadow)">
    ${torn(0, 0, w, h, "#ece6d6", 3)}
    <text x="${w / 2}" y="92" font-family="DejaVu Serif, serif" font-weight="bold" font-size="66" fill="#1b1b22" text-anchor="middle">${mast}</text>
    <rect x="30" y="112" width="${w - 60}" height="4" fill="#1b1b22"/><rect x="30" y="122" width="${w - 60}" height="2" fill="#1b1b22"/>
    <rect x="34" y="170" width="${hlW}" height="${sub ? 150 : 90}" fill="url(#hl)" opacity="${hlK > 0 ? 1 : 0}"/>
    <text x="40" y="232" ${SERIF} font-weight="bold" font-size="60" fill="#1b1b22">${head[0] || ""}</text>
    ${head[1] ? `<text x="40" y="300" ${SERIF} font-weight="bold" font-size="60" fill="#1b1b22">${head[1]}</text>` : ""}
    ${sub ? `<text x="40" y="360" ${ITAL} font-size="30" fill="#3a3a44">${sub}</text>` : ""}
    <rect x="40" y="390" width="${w - 80}" height="300" fill="#2a2a30"/>${img}
    ${lines(40, 720, 210, 8, 26, 2)}${lines(280, 720, 210, 8, 26, 3)}${lines(520, 720, 200, 8, 26, 4)}
  </g>`;
}
function polaroid(cx, cy, s, rot, inner, cap = "", tint = false, tear = 0) {
  const w = 420, h = 480;
  const half = (side) => `<g transform="translate(${side * tear * 60} ${side * tear * 10}) rotate(${side * tear * 6} ${w / 2} ${h / 2})"><clipPath id="pc${side}${Math.round(cx)}"><path d="${side < 0 ? `M-10 -10 L${w / 2 + 6} -10 L${w / 2 - 10} 120 L${w / 2 + 10} 240 L${w / 2 - 6} 360 L${w / 2 + 8} ${h + 10} L-10 ${h + 10} Z` : `M${w / 2 + 6} -10 L${w + 10} -10 L${w + 10} ${h + 10} L${w / 2 + 8} ${h + 10} L${w / 2 - 6} 360 L${w / 2 + 10} 240 L${w / 2 - 10} 120 Z`}"/></clipPath>
    <g clip-path="url(#pc${side}${Math.round(cx)})">${torn(0, 0, w, h, "#f2efe6", 7)}<g ${tint ? `filter="url(#redtint)"` : `filter="url(#mono)"`}><svg x="30" y="30" width="${w - 60}" height="${h - 120}" viewBox="0 0 360 360"><rect width="360" height="360" fill="#9aa0a6"/>${inner}</svg></g>
    ${cap ? `<text x="${w / 2}" y="${h - 36}" font-family="DejaVu Sans Mono, monospace" font-size="26" fill="#3a3a44" text-anchor="middle">${cap}</text>` : ""}</g></g>`;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(${-w / 2} ${-h / 2})" filter="url(#shadow)">${half(-1)}${half(1)}</g>`;
}
function card(cx, cy, s, rot, w, h, inner, fill = PAPER) {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(${-w / 2} ${-h / 2})" filter="url(#shadow)">${torn(0, 0, w, h, fill, Math.round(w + h))}${inner}</g>`;
}
function brush(cx, cy, k, text, w = 620) {
  const ww = w * easeOut(k);
  seed = 9; let d = `M${cx - w / 2} ${cy - 50}`;
  for (let i = 0; i <= 12; i++) d += ` L${cx - w / 2 + (w * i) / 12} ${cy - 50 + (rnd() - 0.5) * 18}`;
  for (let i = 12; i >= 0; i--) d += ` L${cx - w / 2 + (w * i) / 12} ${cy + 50 + (rnd() - 0.5) * 18}`;
  return `<clipPath id="bc${Math.round(cx + cy)}"><rect x="${cx - w / 2 - 30}" y="${cy - 90}" width="${ww + 30}" height="180"/></clipPath>
    <g clip-path="url(#bc${Math.round(cx + cy)})"><path d="${d} Z" fill="${REDB}" opacity=".92"/>${[-1, 1].map((s) => `<path d="M${cx - w / 2 - 20} ${cy + s * 34} L${cx + w / 2 + 10} ${cy + s * 40}" stroke="${REDB}" stroke-width="10" opacity=".7"/>`).join("")}</g>
    <text x="${cx}" y="${cy + 32}" ${HEAVY} font-size="96" fill="${GRAYT}" text-anchor="middle" opacity="${clamp((k - 0.3) / 0.3)}" stroke="#000" stroke-opacity=".25" stroke-width="2">${text}</text>`;
}
// Fawcett as a cut-out: our illustration, desaturated, with the orange rim of the reference.
function fawcettCut(x, y, s, young = false) { return `<g filter="url(#rim)"><g filter="url(#mono)">${fawcett(x, y, s, young)}</g></g>`; }
const silh = (x, y, s, hat = false, fill = "#e9e2cf") => `<g filter="url(#shadow)">${silhouette(x, y, s, hat, fill)}</g>`;

// ---------- props drawn as small illustrations ------------------------------------
const PROPS = {
  letter: (k) => card(960, 640, 1, -4, 680, 460, `${scrawl(60, 90, 560, 9, 36, 4)}<text x="600" y="60" ${ITAL} font-size="28" fill="#3a2a20" text-anchor="end">29 de maio de 1925</text>`),
  compass: () => `<g filter="url(#shadow)"><circle cx="960" cy="650" r="190" fill="#c9a24a" stroke="${INKD}" stroke-width="8"/><circle cx="960" cy="650" r="150" fill="#f2efe6" stroke="${INKD}" stroke-width="4"/><path d="M960 520 L990 650 L960 780 L930 650 Z" fill="${REDB}" stroke="${INKD}" stroke-width="4"/><text x="960" y="545" ${SERIF} font-size="34" text-anchor="middle">N</text></g>`,
  books: () => `<g filter="url(#shadow)">${["#5a3a2a", "#2f4a6a", "#6a2a2a", "#3a5a3a"].map((c, i) => `<rect x="${760 + i * 4}" y="${520 + i * 70}" width="${400 - i * 12}" height="66" rx="6" fill="${c}" stroke="${INKD}" stroke-width="5"/><rect x="${790 + i * 4}" y="${545 + i * 70}" width="${180}" height="10" fill="${MUSTARD}"/>`).join("")}</g>`,
  gifts: () => `<g filter="url(#shadow)">
    <g transform="translate(560 560) rotate(-20)"><path d="M0 0 L230 -18 Q270 0 230 18 Z" fill="#d9dde3" stroke="${INKD}" stroke-width="6"/><rect x="-140" y="-24" width="150" height="48" rx="14" fill="#6a4a2a" stroke="${INKD}" stroke-width="6"/><circle cx="-110" cy="0" r="6" fill="${MUSTARD}"/><circle cx="-30" cy="0" r="6" fill="${MUSTARD}"/></g>
    <g>${Array.from({ length: 19 }, (_, i) => { const a = Math.PI * (0.1 + 0.8 * i / 18); return `<circle cx="${960 + 170 * Math.cos(a)}" cy="${560 + 190 * Math.sin(a)}" r="17" fill="${["#c0261f", "#f2efe6", "#2f6fb0", "#d9a520"][i % 4]}" stroke="${INKD}" stroke-width="4"/>`; }).join("")}</g>
    <g transform="translate(1360 600) rotate(18)"><rect x="-22" y="70" width="44" height="200" rx="16" fill="#8a5a2a" stroke="${INKD}" stroke-width="6"/><circle r="110" fill="#b8862a" stroke="${INKD}" stroke-width="7"/><circle r="84" fill="#cfe3ef" stroke="${INKD}" stroke-width="4"/><path d="M-50 -40 L-10 -70 M-40 -10 L20 -55" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/></g>
    <text x="960" y="900" font-family="DejaVu Sans Mono, monospace" font-size="34" fill="${GRAYT}" text-anchor="middle">facas · miçangas · espelhos</text></g>`,
  statuette: () => `<g filter="url(#shadow)"><path d="M960 400 Q1050 400 1050 510 Q1050 590 1005 620 L1050 900 L870 900 L915 620 Q870 590 870 510 Q870 400 960 400 Z" fill="#3e8a62" stroke="${INKD}" stroke-width="8"/><path d="M925 700 L995 700 M925 745 L995 745" stroke="${INKD}" stroke-width="5"/></g>`,
  manuscript: () => card(960, 640, 1, 3, 620, 560, `${scrawl(60, 120, 500, 11, 36, 9)}<text x="310" y="72" ${SERIF} font-size="34" fill="#3a2a20" text-anchor="middle">Manuscrito 512</text>`, "#dcc89a"),
  arches: () => card(960, 640, 1, -3, 700, 460, `<g stroke="#3a2a20" stroke-width="6" fill="none">${[0, 1, 2].map((i) => `<path d="M${90 + i * 180} 400 L${90 + i * 180} 220 Q${170 + i * 180} 120 ${250 + i * 180} 220 L${250 + i * 180} 400"/>`).join("")}<path d="M60 400 L640 400"/></g><text x="350" y="80" ${ITAL} font-size="34" fill="#3a2a20" text-anchor="middle">esboço · arcos, estátua, templo</text>`),
  hourglass: () => `<g filter="url(#shadow)"><path d="M860 440 L1060 440 L980 640 L1060 840 L860 840 L940 640 Z" fill="#e9eef5" stroke="${INKD}" stroke-width="8"/><path d="M890 470 L1030 470 L960 620 Z M900 820 L1020 820 L960 720 Z" fill="${MUSTARD}"/><rect x="830" y="420" width="260" height="30" rx="8" fill="#8a5a2a" stroke="${INKD}" stroke-width="6"/><rect x="830" y="830" width="260" height="30" rx="8" fill="#8a5a2a" stroke="${INKD}" stroke-width="6"/></g>`,
  medal: () => `<g filter="url(#shadow)"><path d="M910 400 L960 600 L1010 400 Z" fill="${REDB}" stroke="${INKD}" stroke-width="6"/><path d="M960 560 L1010 660 L1120 670 L1040 740 L1070 850 L960 790 L850 850 L880 740 L800 670 L910 660 Z" fill="${MUSTARD}" stroke="${INKD}" stroke-width="7"/></g>`,
  ouija: (k) => card(960, 650, 1, -5, 900, 520, `<g ${SERIF} font-size="50" fill="#3a2a20" text-anchor="middle"><text x="450" y="210" letter-spacing="8">A B C D E F G H I J K L M</text><text x="450" y="290" letter-spacing="8">N O P Q R S T U V W X Y Z</text><text x="150" y="110">SIM</text><text x="750" y="110">NÃO</text><text x="450" y="430">1 2 3 4 5 6 7 8 9 0</text></g>
     <g transform="translate(${300 + Math.sin(k * 5) * 260} ${250 + Math.cos(k * 7) * 50})"><path d="M0 -60 Q55 0 0 80 Q-55 0 0 -60 Z" fill="#f4e2c0" stroke="${INKD}" stroke-width="5"/><circle r="20" fill="#bcdcf0" stroke="${INKD}" stroke-width="4"/></g>`, "#c99a4a"),
  ticket: () => card(960, 640, 1, 6, 760, 300, `<rect x="30" y="30" width="700" height="240" fill="none" stroke="#3a2a20" stroke-width="4" stroke-dasharray="12 8"/><text x="380" y="130" ${SERIF} font-size="54" fill="#3a2a20" text-anchor="middle">PASSAGEM · 3ª CLASSE</text><text x="380" y="210" ${ITAL} font-size="36" fill="#3a2a20" text-anchor="middle">Europa → Rio de Janeiro</text>`, "#e6d5a8"),
  thermo: () => `<g filter="url(#shadow)" transform="rotate(-30 960 640)"><rect x="940" y="380" width="40" height="460" rx="20" fill="#f4f4f4" stroke="${INKD}" stroke-width="6"/><circle cx="960" cy="860" r="44" fill="${REDB}" stroke="${INKD}" stroke-width="6"/><rect x="950" y="460" width="20" height="400" fill="${REDB}"/></g>`,
  kit: () => `<g filter="url(#shadow)">${[0, 1, 2].map((i) => `<rect x="${560 + i * 110}" y="480" width="90" height="140" rx="10" fill="#c9c9cf" stroke="${INKD}" stroke-width="6"/>`).join("")}<rect x="940" y="470" width="190" height="160" rx="14" fill="#f4f4f4" stroke="${INKD}" stroke-width="6"/><text x="1035" y="560" ${HEAVY} font-size="30" text-anchor="middle">LEITE</text>
    <path d="M1180 640 L1320 460 L1460 640 Z" fill="#c99a4a" stroke="${INKD}" stroke-width="6"/><circle cx="1320" cy="780" r="90" fill="${MUSTARD}" stroke="${INKD}" stroke-width="6"/><path d="M1320 780 L1320 720 M1320 780 L1365 805" stroke="${INKD}" stroke-width="7"/><rect x="600" y="720" width="460" height="56" rx="14" fill="#3a3a44" stroke="${INKD}" stroke-width="5"/></g>`,
  caravan: () => `<g filter="url(#shadow)">${Array.from({ length: 12 }, (_, i) => `<g transform="translate(${460 + (i % 6) * 200} ${560 + Math.floor(i / 6) * 200}) scale(.8)"><ellipse cx="0" cy="0" rx="70" ry="38" fill="${i < 2 ? "#6a4a2a" : i < 10 ? "#8a6a3e" : "#c9a96a"}" stroke="${INKD}" stroke-width="6"/><path d="M50 -20 L90 -60 L100 -40 L70 -10 Z" fill="#8a6a3e" stroke="${INKD}" stroke-width="5"/>${[-40, -15, 15, 40].map((x) => `<rect x="${x}" y="20" width="10" height="56" fill="#5a4030"/>`).join("")}</g>`).join("")}</g>`,
  magnifier: () => `<g filter="url(#shadow)"><circle cx="900" cy="600" r="170" fill="#9fd3f0" fill-opacity=".25" stroke="#2b2b33" stroke-width="30"/><rect x="1010" y="720" width="60" height="280" rx="24" fill="#3a2a20" transform="rotate(-40 1040 860)"/></g>`,
  calendar: (k) => card(960, 640, 1, -3, 520, 560, `<rect x="0" y="0" width="520" height="130" fill="${REDB}"/><text x="260" y="95" ${HEAVY} font-size="70" fill="#fff" text-anchor="middle">${["JUN", "AGO", "OUT", "DEZ", "1926"][Math.min(4, Math.floor(k * 5))]}</text><text x="260" y="400" ${HEAVY} font-size="200" fill="#3a3a44" text-anchor="middle">?</text>`),
  ring: () => `<g filter="url(#shadow)"><circle cx="960" cy="660" r="150" fill="none" stroke="${MUSTARD}" stroke-width="44"/><circle cx="960" cy="660" r="150" fill="none" stroke="${INKD}" stroke-width="4"/><rect x="900" y="460" width="120" height="80" rx="18" fill="${MUSTARD}" stroke="${INKD}" stroke-width="6"/>
     ${card(1360, 820, 0.7, 12, 300, 140, `<text x="150" y="85" font-family="DejaVu Sans Mono, monospace" font-size="40" fill="#3a2a20" text-anchor="middle">LOTE 1979</text>`)}</g>`,
  plaque: () => `<g filter="url(#shadow)"><rect x="600" y="520" width="380" height="160" rx="14" fill="#c9c9cf" stroke="${INKD}" stroke-width="6"/><text x="790" y="615" ${SERIF} font-size="40" text-anchor="middle">P. H. FAWCETT</text></g>${PROPS.compass().replace('cx="960" cy="650" r="190"', 'cx="1300" cy="640" r="150"').replace(/cx="960" cy="650" r="150"/, 'cx="1300" cy="640" r="115"').replace('M960 520 L990 650 L960 780 L930 650 Z', 'M1300 540 L1324 640 L1300 740 L1276 640 Z').replace('x="960" y="545"', 'x="1300" y="560"')}`,
  bones: () => card(960, 640, 1, 4, 620, 420, `<g fill="#f4f4f4" stroke="${INKD}" stroke-width="5">${[0, 1, 2].map((i) => `<rect x="${150 + i * 140}" y="${110 + (i % 2) * 30}" width="40" height="220" rx="20" transform="rotate(${[-20, 10, 40][i]} ${170 + i * 140} 220)"/>`).join("")}</g><text x="310" y="390" font-family="DejaVu Sans Mono, monospace" font-size="28" fill="#3a2a20" text-anchor="middle">Museu Nacional · 1951</text>`),
  notebook: () => card(960, 640, 1, -6, 560, 640, `<rect x="0" y="0" width="40" height="640" fill="#8a2a2a"/>${scrawl(80, 120, 420, 13, 36, 21)}<text x="300" y="70" ${ITAL} font-size="32" fill="#3a2a20" text-anchor="middle">Alto Xingu · 2005</text>`, "#f2ecd8"),
  matches: (k) => `<g filter="url(#shadow)">${Array.from({ length: 6 }, (_, i) => { const lit = i < 5 && k * 6 > i; return `<g transform="translate(${560 + i * 160} 520)"><rect x="-8" y="0" width="16" height="300" fill="#e0c08a" stroke="${INKD}" stroke-width="4"/><ellipse cx="0" cy="0" rx="18" ry="24" fill="${i < 5 ? "#3a2a20" : REDB}" stroke="${INKD}" stroke-width="4"/>${lit ? `<path d="M0 -10 Q-26 -60 0 -110 Q26 -60 0 -10" fill="#ffb000" opacity=".9"/>` : ""}<text x="0" y="380" ${HEAVY} font-size="44" fill="${GRAYT}" text-anchor="middle">${i + 1}ª</text></g>`; }).join("")}</g>`,
  jar: () => `<g filter="url(#shadow)"><rect x="840" y="440" width="240" height="380" rx="40" fill="#e9f4ff" fill-opacity=".3" stroke="${INKD}" stroke-width="8"/><rect x="852" y="560" width="216" height="248" rx="30" fill="#2a1a10"/><rect x="820" y="410" width="280" height="50" rx="12" fill="#8a6a3e" stroke="${INKD}" stroke-width="6"/></g>${card(1300, 760, 0.7, 8, 320, 140, `<text x="160" y="88" font-family="DejaVu Sans Mono, monospace" font-size="38" fill="#3a2a20" text-anchor="middle">EGEPE</text>`)}`,
  magazine: () => card(960, 620, 1, 4, 560, 720, `<rect x="0" y="0" width="560" height="720" fill="#e9eef5"/><text x="280" y="90" ${SERIF} font-size="54" fill="#1b1b22" text-anchor="middle">REVISTA</text><rect x="40" y="130" width="480" height="420" fill="#2a2a30"/><text x="280" y="620" ${ITAL} font-size="36" fill="#1b1b22" text-anchor="middle">“A cidade perdida de Z”</text><text x="280" y="680" font-family="DejaVu Sans Mono, monospace" font-size="26" fill="#3a3a44" text-anchor="middle">2005</text>`),
  book: () => card(960, 620, 1, -3, 480, 720, `<rect width="480" height="720" fill="#1f4a33"/><text x="240" y="330" ${SERIF} font-size="260" fill="#f2d34a" text-anchor="middle">Z</text><text x="240" y="440" ${SERIF} font-size="34" fill="#f2d34a" text-anchor="middle">A CIDADE PERDIDA</text><text x="240" y="640" ${ITAL} font-size="28" fill="#f2d34a" text-anchor="middle">2009</text>`, "#1f4a33"),
  reel: (k) => `<g filter="url(#shadow)" transform="translate(960 640) rotate(${k * 120})"><circle r="250" fill="#2b2b33" stroke="#c9c9cf" stroke-width="10"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${150 * Math.cos(i * 1.256)}" cy="${150 * Math.sin(i * 1.256)}" r="56" fill="#0f3d2e" stroke="#c9c9cf" stroke-width="6"/>`).join("")}<circle r="34" fill="#c9c9cf"/></g>`,
  laser: (k) => polaroid(960, 640, 1.05, -3, `<rect width="360" height="360" fill="#1f3a2a"/>${Array.from({ length: 14 }, (_, i) => `<line x1="180" y1="20" x2="${20 + i * 24}" y2="340" stroke="#d8f0ff" stroke-width="2" opacity="${0.4 + 0.3 * Math.sin(k * 6 + i)}"/>`).join("")}<path d="M20 280 Q120 230 200 270 T340 240" stroke="#f2d34a" stroke-width="7" fill="none"/>`, "Bolívia · 2022"),
  aerial: (k) => card(960, 640, 1, 2, 820, 560, `<clipPath id="aer"><rect width="820" height="560"/></clipPath><rect width="820" height="560" fill="#2e5a3a"/><g clip-path="url(#aer)">${Array.from({ length: 70 }, (_, i) => { seed = i * 7919 + 12345; rnd(); rnd(); return `<circle cx="${rnd() * 820}" cy="${rnd() * 560}" r="${20 + rnd() * 30}" fill="${["#3d7a4a", "#26502f", "#4a8a55"][i % 3]}"/>`; }).join("")}</g>
     <g fill="none" stroke="#f2d34a" stroke-width="8" stroke-linecap="round" opacity="${clamp(k * 1.5)}"><circle cx="260" cy="260" r="100"/><circle cx="600" cy="330" r="120"/><path d="M360 270 L480 320 M260 360 L230 540 M720 330 L820 300 M260 160 L330 20"/></g>
     <text x="410" y="530" font-family="DejaVu Sans Mono, monospace" font-size="28" fill="#f2efe6" text-anchor="middle">Kuhikugu · Alto Xingu</text>`, "#2e5a3a"),
  note: () => card(960, 620, 1, -2, 760, 420, `<text x="380" y="150" ${ITAL} font-size="52" fill="#3a2a20" text-anchor="middle">“Se não voltarmos,</text><text x="380" y="230" ${ITAL} font-size="52" fill="#3a2a20" text-anchor="middle">ninguém deve vir</text><text x="380" y="310" ${ITAL} font-size="52" fill="#3a2a20" text-anchor="middle">nos procurar.”</text>`, "#f6f0e0"),
  papers3: (k) => [0, 1, 2].map((i) => card(560 + i * 400, 640, 0.8, [-8, 4, 10][i], 360, 480, `${lines(40, 80, 280, 12, 30, 30 + i)}<text x="180" y="440" ${HEAVY} font-size="40" fill="${REDB}" text-anchor="middle">${["briga?", "doença?", "vizinhos?"][i]}</text>`)).join(""),
  scattered: () => [PROPS.compass().replace('cx="960" cy="650" r="190"', 'cx="560" cy="720" r="120"').replace(/cx="960" cy="650" r="150"/, 'cx="560" cy="720" r="90"'), card(1000, 560, 0.6, -8, 680, 460, scrawl(60, 90, 560, 9, 36, 4)), PROPS.ring().replace('cx="960" cy="660" r="150" fill="none" stroke="#d9a520"', 'cx="1460" cy="760" r="90" fill="none" stroke="#d9a520"')].join(""),
};

// map pieces: torn paper with a simplified Brazil and optional route/pins
function mapPiece(k, o = {}) {
  const P = proj(o.cx ?? 900, o.cy ?? 540, o.k ?? 18);
  const pts = BR.map(P).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const route = o.route ? `<polyline points="${o.route.map(P).map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="${REDB}" stroke-width="9" stroke-linecap="round" stroke-dasharray="1" pathLength="1" stroke-dashoffset="${1 - easeOut(k * 1.4)}"/>` : "";
  const pins = (o.pins || []).map(([lo, la, lab, col], i) => { const [x, y] = P([lo, la]); return `<g opacity="${clamp(k * 3 - i * 0.4)}"><circle cx="${x}" cy="${y}" r="13" fill="${col || REDB}" stroke="${INKD}" stroke-width="4"/>${lab ? `<text x="${x + 22}" y="${y + 10}" font-family="DejaVu Sans Mono, monospace" font-size="28" fill="#2a2a30" stroke="${PAPER}" stroke-width="6" paint-order="stroke">${lab}</text>` : ""}</g>`; }).join("");
  const q = (o.q || []).map(([lo, la]) => { const [x, y] = P([lo, la]); return `<text x="${x}" y="${y}" ${HEAVY} font-size="80" fill="${REDB}" text-anchor="middle">?</text>`; }).join("");
  const band = o.band ? (() => { const y1 = P([0, o.band[0]])[1], y2 = P([0, o.band[1]])[1]; return `<rect x="400" y="${y1}" width="1120" height="${y2 - y1}" fill="${REDB}" opacity="${0.25 * clamp(k * 2)}"/>`; })() : "";
  const blank = o.blank ? `<path d="M760 300 Q880 260 940 360 Q1000 470 940 560 Q880 640 760 600 Q680 480 760 300 Z" fill="#fffdf6" stroke="#2a2a30" stroke-width="3" stroke-dasharray="10 8"/>` : "";
  return `<g transform="translate(960 600) scale(.76) translate(-960 -560)"><g filter="url(#shadow)" transform="rotate(${o.rot ?? -3} 960 560)">${torn(380, 120, 1160, 860, "#e2d6b6", 11)}
    <g opacity=".9"><polygon points="${pts}" fill="#cfd8b0" stroke="#2a2a30" stroke-width="4" stroke-linejoin="round"/></g>${o.border ? `<polyline points="${BORDER_BO.map(P).map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="${REDB}" stroke-width="10" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - easeOut(k * 1.4)}"/>` : ""}
    ${band}${blank}${route}${pins}${q}</g></g>`;
}
