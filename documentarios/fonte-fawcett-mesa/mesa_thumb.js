const { chromium } = require('playwright'); const D = process.env.D;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file://' + D + '/mesa.html'); await p.waitForTimeout(400);
  await p.evaluate(() => {
    const ph = polaroid(560, 590, 1.75, -5, photoBg("#8f8a80") + `<g transform="translate(90 40) scale(1.4)">${fawcett(0, 0, 0.9)}</g>`, "1925", true);
    const s = `${DEFS}${PROPS.letter().replace('translate(960 640) rotate(-4) scale(1)', 'translate(1420 820) rotate(7) scale(.7)')}${mapPiece(1,{q:[[-53,-12]]}).replace('translate(960 600) scale(.76)','translate(1500 420) scale(.5)')}${ph}
      <text x="1330" y="560" font-family="DejaVu Serif, serif" font-weight="bold" font-size="560" fill="${GRAYT}" text-anchor="middle" filter="url(#shadow)" stroke="#0a0f0c" stroke-width="10" paint-order="stroke">Z</text>
      ${brush(1350, 790, 1, "SUMIU EM 1925", 900)}
      <text x="1350" y="980" ${HEAVY} font-size="96" fill="${MUSTARD}" text-anchor="middle" stroke="#0a0f0c" stroke-width="14" paint-order="stroke">A CIDADE PERDIDA</text>`;
    document.getElementById('stage').innerHTML = `<svg viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  });
  await p.screenshot({ path: D + '/mesa_thumb.png' }); await b.close(); })();
