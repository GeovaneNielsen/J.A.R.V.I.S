const { chromium } = require('playwright'); const D = process.env.D;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file://' + D + '/mc.html'); await p.waitForTimeout(400);
  await p.evaluate(() => {
    const ph = polaroid(560, 560, 1.8, -5, photoBg("#8f9aa0") + `<rect y="230" width="360" height="130" fill="#2f5d78"/><g transform="translate(175 255) scale(.45)">${ship(0, 0, 1, { torn: true, boat: false, sea: false, rock: 0.6 })}</g>`, "04/12/1872", true);
    const s = `${DEFS}${logbook(1).replace('translate(960 640) rotate(-3) scale(1)', 'translate(1500 330) rotate(8) scale(.62)')}${ph}${yawl(1450, 640, 0.7, -10)}
      <text x="1450" y="560" ${HEAVY} font-size="200" fill="${REDB}" text-anchor="middle" stroke="#0a0f0c" stroke-width="12" paint-order="stroke">?</text>
      ${brush(1360, 790, 1, "NINGUÉM A BORDO", 960)}
      <text x="1360" y="980" ${HEAVY} font-size="104" fill="${MUSTARD}" text-anchor="middle" stroke="#0a0f0c" stroke-width="14" paint-order="stroke">MARY CELESTE</text>`;
    document.getElementById('stage').innerHTML = `<svg viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
    document.getElementById('cam').style.transform = 'none'; document.getElementById('persiana').style.opacity = '0.32'; document.getElementById('sun').style.opacity = '0.6';
  });
  await p.screenshot({ path: D + '/thumb.png' }); await b.close(); })();
