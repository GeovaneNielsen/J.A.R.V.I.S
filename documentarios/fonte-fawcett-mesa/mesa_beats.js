// Beats: one per narration sentence. Each = [caption lines, build(t, d)] where t = seconds since beat start, d = beat length.
// Caption syntax: "BIG LINE" (heavy gray) or "~small italic line"; *word* = mustard keyword, _word_ = red keyword.
const at = (t, a, b) => clamp((t - a) / (b - a));
// entry animations
const drop = (t, svg, o = {}) => { const k = backOut(at(t, o.d ?? 0, (o.d ?? 0) + 0.45)), r = (o.r ?? 6) * (1 - k), s = 1.3 - 0.3 * k + 0.03 * at(t, 0, 8);
  return `<g opacity="${clamp(at(t, o.d ?? 0, (o.d ?? 0) + 0.12))}" transform="translate(${o.x ?? 960} ${o.y ?? 640}) rotate(${r}) scale(${s}) translate(${-(o.x ?? 960)} ${-(o.y ?? 640)})">${svg}</g>`; };
const rise = (t, svg, o = {}) => { const k = easeOut(at(t, o.d ?? 0, (o.d ?? 0) + 0.6)); return `<g transform="translate(${(o.dx ?? 0) * (1 - k)} ${(o.dy ?? 800) * (1 - k)})">${svg}</g>`; };
const slideIn = (t, svg, dir = 1, d = 0) => rise(t, svg, { dx: 1500 * dir, dy: 0, d });
const push = (t, svg, z = 0.05, cx = 960, cy = 640) => { const s = 1 + z * at(t, 0, 7); return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${svg}</g>`; };
const sc = (svg, s, cx = 960, cy = 640) => `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${svg}</g>`;
const fade = (t, a, b) => clamp(at(t, a, b));
function stamp(t, at0, text, x, y, r = -10, size = 80, col = REDB) {
  const k = at(t, at0, at0 + 0.22); if (k <= 0) return "";
  const s = 1.8 - 0.8 * k, w = text.length * size * 0.66 + 60;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${0.92 * k}"><rect x="${-w / 2}" y="${-size * 0.8}" width="${w}" height="${size * 1.25}" rx="10" fill="none" stroke="${col}" stroke-width="9"/>
    <text x="0" y="${size * 0.3}" ${HEAVY} letter-spacing="2" font-size="${size}" fill="${col}" text-anchor="middle">${text}</text></g>`;
}
const BIGT = (txt, y, size, col = GRAYT) => `<text x="960" y="${y}" ${HEAVY} font-size="${size}" fill="${col}" text-anchor="middle" stroke="#000" stroke-opacity=".35" stroke-width="3">${txt}</text>`;
const photoBg = (c = "#7d8a7a") => `<rect width="360" height="360" fill="${c}"/>${Array.from({ length: 9 }, (_, i) => { seed = i * 31 + 7; return `<circle cx="${rnd() * 360}" cy="${80 + rnd() * 120}" r="${40 + rnd() * 50}" fill="#4f5d4c" opacity=".7"/>`; }).join("")}<rect y="260" width="360" height="100" fill="#5d5444"/>`;
const people = (n, hatFirst = true, fadeK = 0) => photoBg() + Array.from({ length: n }, (_, i) => `<g opacity="${i === 0 ? 1 : 1 - fadeK}">${silhouette(180 + (i - (n - 1) / 2) * 100, 310, 1.05 - i * 0.08, hatFirst && i === 0, "#22222a")}</g>`).join("");
const bigZ = (t, k = 1) => `<g transform="translate(960 700) scale(${0.6 + 0.4 * backOut(at(t, 0.1, 0.6))})" opacity="${fade(t, 0.1, 0.25)}"><text x="0" y="230" ${SERIF} font-weight="bold" font-size="640" fill="${GRAYT}" text-anchor="middle" filter="url(#shadow)">Z</text></g>`;
const fawcettBig = (t, young = false, x = 960) => rise(t, `<g filter="url(#shadow)">${fawcettCut(x - 200, 400, 2, young)}</g>`, { dy: 700 });
const tiles = (t, which = "AB", d = 0) => [..."AB"].filter((L) => which.includes(L)).map((L) => { const i = L === "A" ? -1 : 1, k = backOut(at(t, d + (L === "B" && which === "AB" ? 0.25 : 0), d + 0.5 + (L === "B" && which === "AB" ? 0.25 : 0)));
  const x = which === "AB" ? 960 + i * 300 : 960;
  return `<g transform="translate(${x} 690) rotate(${i * 6}) scale(${k})" filter="url(#shadow)">${torn(-200, -200, 400, 400, L === "A" ? MUSTARD : REDB, i + 5)}<text x="0" y="110" ${HEAVY} font-size="320" fill="#f2efe6" text-anchor="middle">${L}</text></g>`; }).join("");
const silRow = (n, x0, gap, y, s, hat = true, fill = PAPER) => Array.from({ length: n }, (_, i) => silh(x0 + i * gap, y, s, hat && i === 0, fill)).join("");
const sheetCard = (title, sub, w = 640, h = 380) => card(960, 640, 1, -3, w, h, `<text x="${w / 2}" y="${h / 2 - 10}" ${SERIF} font-weight="bold" font-size="64" fill="#2a2a30" text-anchor="middle">${title}</text><text x="${w / 2}" y="${h / 2 + 60}" ${ITAL} font-size="36" fill="#3a3a44" text-anchor="middle">${sub}</text>`);
const tally = (t, n, d) => Array.from({ length: n }, (_, i) => { const k = at(t, 0.3 + (i * (d - 1.2)) / n, 0.5 + (i * (d - 1.2)) / n); return `<g opacity="${k}" transform="translate(${420 + i * 180} 640) rotate(${(i % 2 ? 4 : -4)})"><rect x="-70" y="-170" width="140" height="340" fill="${REDB}" opacity=".0"/>${card(0, 0, 0.9 * (0.6 + 0.4 * k), (i % 2 ? 4 : -4), 150, 200, `<text x="75" y="140" ${HEAVY} font-size="120" fill="#2a2a30" text-anchor="middle">${i + 1}</text>`)}</g>`; }).join("");
const MAPS = {
  bolivia: (k) => mapPiece(k, { border: true, pins: [[-63.2, -17.8, "Bolívia"]] }),
  cuiaba: (k) => mapPiece(k, { pins: [[-56.1, -15.6, "Cuiabá"]] }),
  route: (k) => mapPiece(k, { route: [[-56.1, -15.6], [-55.2, -14.4], [-54.2, -12.9], [-53.3, -11.7]], pins: [[-56.1, -15.6, "Cuiabá"], [-53.3, -11.7, "Cavalo Morto", "#2a2a30"]] }),
};

const BEATS = [
  // 0 · Abertura
  [["29 DE MAIO", "~de *1925*"], (t) => brush(960, 640, at(t, 0.1, 0.8), "29/05/1925", 760) + drop(t, PROPS.letter(), { d: 1.3, y: 760 }).replace('translate(960 640) rotate(-4) scale(1)', 'translate(960 820) rotate(-4) scale(.55)')],
  [["~no meio do *Mato Grosso*", "UMA CARTA", "~para a esposa"], (t) => drop(t, PROPS.letter()) + rise(t, `<g transform="translate(1400 460) rotate(10) scale(.6)">${polaroid(0, 0, 1, 0, people(1))}</g>`, { d: 1.2 })],
  [["~o filho e um amigo", "SEM MAPA"], (t) => push(t, mapPiece(1, { blank: true })) + `<g opacity="${fade(t, 1.6, 1.8)}"><text x="850" y="500" ${HEAVY} font-size="220" fill="${REDB}" text-anchor="middle">?</text></g>`],
  [["~a última frase", "*NENHUM FRACASSO*"], (t) => push(t, card(960, 640, 1.1, -2, 900, 360, `<text x="450" y="160" ${ITAL} font-size="54" fill="#3a2a20" text-anchor="middle">“Você não precisa temer</text><text x="450" y="240" ${ITAL} font-size="54" fill="#3a2a20" text-anchor="middle">nenhum fracasso.”</text>`) + `<rect x="${560}" y="${590}" width="${820 * at(t, 1.2, 2.2)}" height="120" fill="url(#hl)" opacity=".5" transform="rotate(-2 960 640)"/>`)],
  [["NINGUÉM", "~nunca mais teve *notícia*"], (t) => drop(t, polaroid(960, 640, 1.2, 3, people(3), "1925", at(t, 1.2, 1.6) > 0))],
  [["~uma cidade perdida chamada", "Z"].slice(0, 1), (t) => bigZ(t) + `<g opacity="${fade(t, 0.6, 1.2)}" filter="url(#soft)">${PROPS.arches().replace('translate(960 640) rotate(-3) scale(1)', 'translate(1560 820) rotate(8) scale(.5)')}</g>`],
  [["CORONEL", "*PERCY FAWCETT*"], (t) => fawcettBig(t)],
  [["~quem decide é", "VOCÊ"], (t) => tiles(t, "AB", 0.3)],
  // 1 · Quem era Fawcett
  [["~Torquay, Inglaterra", "*1867*"], (t) => brush(960, 900, at(t, 0.1, 0.8), "1867", 420) + drop(t, polaroid(960, 560, 1, -3, photoBg("#8f8a80") + `<g transform="translate(90 40) scale(1.4)">${fawcett(0, 0, 0.9, true)}</g>`, "Torquay"), { y: 560 })],
  [["ARTILHARIA REAL", "~aos *18 anos* · Ceilão · Nina"], (t) => drop(t, polaroid(760, 640, 1, -6, photoBg("#9a8f7a") + `<g transform="translate(90 40) scale(1.4)">${fawcett(0, 0, 0.9, true)}</g>`, "Ceilão")) + rise(t, PROPS.medal().replace('<g filter="url(#shadow)">', '<g filter="url(#shadow)" transform="translate(500 0) scale(.8) translate(240 160)">'), { d: 1.5 })],
  [["~o que o movia eram os", "*MAPAS*"], (t) => push(t, mapPiece(1, { rot: 3 })) + drop(t, PROPS.compass().replace('<g filter="url(#shadow)">', '<g filter="url(#shadow)" transform="translate(1340 820) scale(.5) translate(-960 -650)">'), { d: 1, x: 1340, y: 820 })],
  [["*1901*", "~Royal Geographical Society"], (t) => drop(t, sheetCard("ROYAL GEOGRAPHICAL", "Society · Londres · 1901", 860, 380)) + `<g opacity="${fade(t, 2, 2.4)}">${PROPS.compass().replace('<g filter="url(#shadow)">', '<g filter="url(#shadow)" transform="translate(1500 860) scale(.45) translate(-960 -650)">')}</g>`],
  [["~serviço secreto · Norte da África", "*CONAN DOYLE*", "~Rider Haggard"], (t) => drop(t, PROPS.books()) + stamp(t, 1.6, "CONFIDENCIAL", 1380, 450, 12, 52)],
  [["~pedaços do planeta", "EM BRANCO"], (t) => push(t, mapPiece(1, { blank: true, rot: -2 }))],
  [["~o maior deles:", "*AMÉRICA DO SUL*"], (t) => push(t, mapPiece(1, { blank: true, rot: -2 }) + `<g opacity="${fade(t, 0.4, 1)}"><path d="M760 300 Q880 260 940 360 Q1000 470 940 560 Q880 640 760 600 Q680 480 760 300 Z" fill="${MUSTARD}" opacity=".55" transform="rotate(-2 960 560)"/></g>`, 0.12, 860, 470)],
  // 2 · O explorador
  [["*1906*", "~fronteira Brasil · Bolívia"], (t) => MAPS.bolivia(at(t, 0.3, 4)) + brush(1400, 880, at(t, 0.1, 0.7), "1906", 380)],
  [["~era para ser", "UM TRABALHO TÉCNICO"], (t) => drop(t, PROPS.compass())],
  [["VIROU", "_OBSESSÃO_"], (t) => push(t, `<g filter="url(#shadow)">${fawcettCut(1180, 460, 1.7)}</g>` + `<g opacity=".6">${PROPS.compass().replace('<g filter="url(#shadow)">', '<g transform="translate(700 700) scale(.6) translate(-960 -650)">')}</g>`, 0.12)],
  [["*7* EXPEDIÇÕES", "~entre 1906 e 1924"], (t, d) => tally(t, 7, d)],
  [["*1908*", "~a nascente do Rio Verde"], (t) => mapPiece(at(t, 0, 1), { pins: [[-60.4, -13.6, "Rio Verde"]], rot: 2 })],
  [["*1911*", "~com Henry Costin"], (t) => drop(t, polaroid(960, 640, 1.2, -3, people(2), "1911"))],
  [["~uma sucuri de", "*19 METROS*?"], (t) => drop(t, newspaper(960, 640, 0.62, 3, "THE DAILY GLOBE", ["Cobra de 19", "metros?"], "cientistas riem do explorador", at(t, 1, 1.8), `<path d="M80 600 Q220 420 380 560 T700 520" stroke="#6a8a4a" stroke-width="40" fill="none" stroke-linecap="round"/>`)) + stamp(t, 3.2, "RISOS", 1300, 400, 10, 70)],
  [["~mapas precisos e", "*RESPEITO*", "~presentes e paciência"], (t) => drop(t, PROPS.gifts())],
  [["~crenças místicas", "PEDRA *VERDE*"], (t) => rise(t, PROPS.statuette(), { dy: 600 })],
  [["~inspirou Conan Doyle", "*O MUNDO PERDIDO*"], (t) => drop(t, card(960, 640, 1, 4, 480, 680, `<rect width="480" height="680" fill="#6a2a2a"/><text x="240" y="250" ${SERIF} font-weight="bold" font-size="64" fill="#f2d34a" text-anchor="middle">O MUNDO</text><text x="240" y="330" ${SERIF} font-weight="bold" font-size="64" fill="#f2d34a" text-anchor="middle">PERDIDO</text><text x="240" y="560" ${ITAL} font-size="30" fill="#f2d34a" text-anchor="middle">romance · 1912</text>`, "#6a2a2a"))],
  // 3 · A cidade Z
  [["*1914*", "~uma civilização na Amazônia"], (t) => brush(960, 900, at(t, 0.1, 0.7), "1914", 420) + drop(t, PROPS.arches().replace('translate(960 640) rotate(-3) scale(1)', 'translate(960 560) rotate(-3) scale(.9)'), { d: 1, y: 560 })],
  [["~ele deu um nome:"], (t) => bigZ(t)],
  [["MANUSCRITO 512", "~Biblioteca Nacional · *1753*"], (t) => drop(t, sc(PROPS.manuscript(), .78)) + brush(1450, 900, at(t, 3, 3.6), "1753", 380)],
  [["~arcos · estátua · templo"], (t) => drop(t, PROPS.arches())],
  [["~tudo em detalhes, menos", "_ONDE_"], (t) => push(t, mapPiece(1, { q: [[-56, -10], [-48, -15], [-60, -6]] }) + rise(t, PROPS.magnifier(), { d: 1.6, dx: 400, dy: 300 }))],
  // 4 · A guerra
  [["~a busca teve que", "ESPERAR"], (t) => drop(t, PROPS.hourglass())],
  [["*1914–1918*", "~Flandres · Bélgica"], (t) => brush(960, 880, at(t, 0.1, 0.8), "1914–1918", 700) + rise(t, `<g opacity=".95">${silRow(5, 560, 200, 720, 1.4, false, "#c9c2b0")}</g>`, { d: 0.8 })],
  [["~Ordem de Serviço Distinto", "*1917*"], (t) => drop(t, PROPS.medal())],
  [["~alvos de um tabuleiro", "*OUIJA*"], (t) => push(t, PROPS.ouija(at(t, 0, 7)))],
  [["~fim da guerra", "DE VOLTA AO *BRASIL*"], (t) => drop(t, PROPS.ticket())],
  [["*1920*", "~dois companheiros"], (t) => drop(t, polaroid(960, 640, 1.2, 2, people(3, true, at(t, 2.4, 3.6)), "1920"))],
  [["SOZINHO"], (t) => rise(t, silh(960, 820, 2.2, true), { dy: 500 })],
  [["~febre", "_DESISTIU_"], (t) => drop(t, PROPS.thermo()) + stamp(t, 2.2, "FEBRE", 1340, 420, 10, 66)],
  [["~na próxima vez", "ATÉ O *FIM*"], (t) => push(t, `<g filter="url(#shadow)">${fawcettCut(760, 400, 2)}</g>`, 0.08)],
  // 5 · A última expedição
  [["*20/04/1925*", "~partida de Cuiabá"], (t) => MAPS.cuiaba(at(t, 0, 1)) + brush(1400, 900, at(t, 0.2, 0.8), "20/04/1925", 600)],
  [["~Jack, o filho · Raleigh Rimmel", "SÓ *TRÊS*"], (t) => drop(t, polaroid(960, 640, 1.25, -3, people(3), "Jack · Fawcett · Raleigh"))],
  [["~um grupo pequeno", "*MAIS LEVE*"], (t) => rise(t, silRow(3, 760, 200, 800, 1.6, true), { dy: 500 })],
  [["~enlatados · armas · sextante", "*CRONÔMETRO*"], (t) => drop(t, PROPS.kit())],
  [["~2 trabalhadores · 2 cavalos", "*8 MULAS* · 2 CÃES"], (t) => slideIn(t, PROPS.caravan(), 1)],
  [["~uma ordem estranha", "*NÃO NOS PROCUREM*"], (t) => push(t, PROPS.note() + `<rect x="580" y="520" width="${760 * at(t, 1.5, 3.5)}" height="230" fill="url(#hl)" opacity=".45" transform="rotate(-2 960 620)"/>`)],
  [["*29 DE MAIO*", "~Acampamento do Cavalo Morto"], (t) => MAPS.route(at(t, 0.2, 4.5))],
  [["~pronto para entrar no", "*DESCONHECIDO*"], (t) => push(t, `<g filter="url(#shadow)">${fawcettCut(760, 400, 2)}</g>`, 0.1)],
  [["E ENTROU."], (t) => `<g opacity="${1 - fade(t, 0.4, 2.2)}">${silh(960 + 120 * at(t, 0, 3), 820, 2.2, true)}</g>`],
  // 6 · O enigma
  [["~levada por um", "MENSAGEIRO"], (t) => slideIn(t, PROPS.letter(), -1)],
  [["UM *ENIGMA*"], (t) => drop(t, PROPS.magnifier())],
  [["~na carta:", "*11°43'* SUL"], (t) => push(t, PROPS.letter() + `<text x="960" y="700" ${HEAVY} font-size="120" fill="#3a2a20" text-anchor="middle" transform="rotate(-4 960 640)">11°43' S</text><rect x="700" y="600" width="${520 * at(t, 1.6, 2.6)}" height="130" fill="url(#hl)" opacity=".55" transform="rotate(-4 960 640)"/>`)],
  [["~na imprensa:", "_13°_"], (t) => drop(t, newspaper(960, 640, 0.62, -3, "THE EVENING POST", ["Fawcett a", "13° sul"], "relatório da expedição", at(t, 1, 2)))],
  [["*+200 KM*", "~de floresta"], (t) => mapPiece(at(t, 0, 1.5), { band: [-11.7, -13.7], pins: [[-53.3, -11.7, "11°43'"], [-53.3, -13.7, "13°", "#2a2a30"]] })],
  [["~um simples", "ERRO?"], (t) => drop(t, card(960, 640, 1, 3, 700, 260, `<text x="350" y="160" font-family="DejaVu Sans Mono, monospace" font-size="90" fill="#3a2a20" text-anchor="middle">11° <tspan fill="${REDB}">→</tspan> 13°</text>`))],
  [["~ou foi", "_DE PROPÓSITO_"], (t) => { const k = at(t, 1.5, 2.4); return `<g transform="translate(${-140 * k} 0) rotate(${-4 * k} 960 640)"><clipPath id="tl"><rect x="0" y="0" width="960" height="1080"/></clipPath><g clip-path="url(#tl)">${mapPiece(1, { rot: 0 })}</g></g><g transform="translate(${140 * k} 0) rotate(${4 * k} 960 640)"><clipPath id="tr"><rect x="960" y="0" width="960" height="1080"/></clipPath><g clip-path="url(#tr)">${mapPiece(1, { rot: 0 })}</g></g>`; }],
  // 7 · Silêncio e pistas falsas
  [["~os meses passaram", "SEM NOTÍCIAS"], (t, d) => drop(t, PROPS.calendar(at(t, 0.2, d)))],
  [["*1927*", "~declarados perdidos"], (t) => drop(t, newspaper(960, 640, 0.62, 2, "THE LONDON HERALD", ["DECLARADOS", "PERDIDOS"], "Royal Geographical Society", at(t, 1.4, 2.4))) + brush(1450, 880, at(t, 0.2, 0.8), "1927", 380)],
  [["~surgiram pistas", "TODAS *DESMORONARAM*"], (t) => drop(t, PROPS.papers3())],
  [["~placa · bússola", "_VIAGENS ANTERIORES_"], (t) => drop(t, PROPS.plaque()) + stamp(t, 3.4, "ANTIGAS", 960, 860, -8, 70)],
  [["~seguir o", "RASTRO"], (t) => mapPiece(1, { route: [[-56.1, -15.6], [-54.5, -13], [-53.3, -11.7]], q: [[-52, -10]] })],
  [["*GEORGE DYOTT*", "~1928 · provas da morte?"], (t) => drop(t, newspaper(960, 640, 0.62, -2, "THE MORNING STAR", ["Dyott diz ter", "achado provas"], "expedição americana", at(t, 1, 2))) + stamp(t, 3.4, "SEM PROVAS", 1330, 470, 10, 60)],
  [["~de hidroavião", "*ALOHA WANDERWELL*", "~seis semanas com os Bororo"], (t) => drop(t, polaroid(960, 640, 1.2, 4, photoBg("#9fb0b8") + `<g transform="translate(180 180)"><rect x="-120" y="-16" width="240" height="32" rx="14" fill="#2a2a30"/><rect x="-26" y="-60" width="52" height="120" rx="10" fill="#2a2a30" opacity=".0"/><rect x="-160" y="-30" width="320" height="14" rx="6" fill="#2a2a30"/><rect x="-100" y="34" width="70" height="10" fill="#2a2a30"/><rect x="30" y="34" width="70" height="10" fill="#2a2a30"/></g>`, "1930–31"))],
  [["*1951*", "~ossos que seriam do coronel"], (t) => drop(t, PROPS.bones()) + stamp(t, 5.5, "NÃO ERAM DELE", 1250, 430, 10, 56)],
  [["*1979*", "~o anel numa casa de penhores"], (t) => drop(t, PROPS.ring())],
  [["~o mito das", "*100 MORTES*"], (t) => push(t, BIGT("100", 800, 420), 0.06)],
  [["~o registro é de", "_UMA SÓ_"], (t) => { const k = at(t, 0.3, 0.9); return `<g opacity="${1 - k}">${BIGT("100", 800, 420)}</g><g opacity="${k}" transform="translate(960 680) scale(${0.6 + 0.4 * backOut(k)}) translate(-960 -680)">${BIGT("1", 800, 420, REDB)}</g>` + stamp(t, 1.2, "MITO", 1400, 420, 12, 80); }],
  // 8 · Os Kalapalo
  [["~os últimos a vê-lo:", "*KALAPALO*"], (t) => mapPiece(at(t, 0, 1), { pins: [[-53.4, -12.2, "Alto Xingu"]] })],
  [["~versões que se", "*CONTRADIZEM*"], (t) => drop(t, PROPS.papers3())],
  [["*2005*", "~David Grann ouve a memória"], (t) => drop(t, sc(PROPS.notebook(), .78)) + brush(1450, 900, at(t, 0.2, 0.8), "2005", 380)],
  [["~seguiram para o", "*LESTE*"], (t) => mapPiece(1, { route: [[-53.4, -12.2], [-52.6, -12.1], [-51.8, -11.9]], pins: [[-53.4, -12.2, "aldeia"]] })],
  [["*5 NOITES*", "~a fumaça das fogueiras"], (t, d) => drop(t, PROPS.matches(at(t, 0.4, d - 0.3)))],
  [["~na sexta noite", "_NÃO SUBIU MAIS_"], (t) => PROPS.matches(1) + `<rect width="${W}" height="${H}" fill="#000" opacity="${0.35 * at(t, 0.6, 2)}"/>`],
  // 9 · Z existiu?
  [["~tratado como", "_SONHADOR_"], (t) => drop(t, polaroid(960, 640, 1.15, -3, photoBg("#8f8a80") + `<g transform="translate(90 40) scale(1.4)">${fawcett(0, 0, 0.9)}</g>`)) + stamp(t, 1.4, "SONHADOR", 1240, 520, -10, 74)],
  [["~mas a arqueologia", "*MUDOU A HISTÓRIA*"], (t) => drop(t, PROPS.magnifier())],
  [["*KUHIKUGU*", "~cerca de 20 povoados · até 50 mil pessoas"], (t, d) => push(t, PROPS.aerial(at(t, 2, 6)), 0.08)],
  [["~não era uma cidade", "DE PEDRA"], (t) => drop(t, sc(PROPS.manuscript(), .78)) + stamp(t, 0.9, "NÃO", 1300, 430, 10, 90)],
  [["~valas · monumentos · praças de", "*150 METROS*"], (t) => push(t, PROPS.aerial(1), 0.14, 830, 560)],
  [["~a terra escura:", "*EGEPE*"], (t) => drop(t, PROPS.jar())],
  [["~as doenças chegaram antes", "_A FLORESTA ENGOLIU_"], (t) => PROPS.aerial(1) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#1f3d2a" opacity="${0.75 * at(t, 1, 4)}"/>`],
  [["*2022*", "~laser de avião · Bolívia"], (t) => drop(t, PROPS.laser(at(t, 0, 6))) + brush(1450, 900, at(t, 0.2, 0.8), "2022", 380)],
  [["~o que Fawcett", "*DEFENDIA*"], (t) => fawcettBig(t)],
  // 10 · Do mito ao cinema
  [["*2005*", "~The New Yorker"], (t) => drop(t, sc(PROPS.magazine(), .78))],
  [["*2009*", "~o livro"], (t) => drop(t, sc(PROPS.book(), .78))],
  [["*2016*", "~no cinema"], (t, d) => drop(t, PROPS.reel(at(t, 0, d)))],
  [["~de sonhador a", "*PERSONAGEM DE FILME*"], (t) => push(t, `<g filter="url(#shadow)">${fawcettCut(760, 400, 2)}</g>`, 0.08)],
  // 11 · A ou B
  [["~o que aconteceu com", "*FAWCETT*?"], (t) => drop(t, polaroid(960, 640, 1.2, 2, photoBg("#8f8a80") + `<g transform="translate(90 40) scale(1.4)">${fawcett(0, 0, 0.9)}</g>`)) + rise(t, PROPS.magnifier().replace('<g filter="url(#shadow)">', '<g filter="url(#shadow)" transform="translate(300 60)">'), { d: 1.2, dx: 500, dy: 200 })],
  [["*A* · MORREU NA SELVA", "~fome · doença · conflito"], (t) => tiles(t, "A")],
  [["_B_ · SUMIU DE PROPÓSITO", "~escondeu o caminho"], (t) => tiles(t, "B")],
  [["*2004*", "~uma comunidade na mata?"], (t) => drop(t, card(960, 640, 1, -3, 760, 420, `${scrawl(60, 110, 640, 7, 40, 31)}<text x="380" y="70" ${ITAL} font-size="34" fill="#3a2a20" text-anchor="middle">papéis pessoais · 2004</text>`, "#f2ecd8"))],
  [["OS FATOS", "~estão na *mesa*"], (t) => drop(t, PROPS.scattered())],
  [["~quem decide é", "*VOCÊ*"], (t) => tiles(t, "AB")],
  [["COMENTA", "*A* OU _B_"], (t) => tiles(t, "AB")],
];
