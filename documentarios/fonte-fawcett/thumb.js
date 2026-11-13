const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file://' + process.env.S + '/doc.html'); await p.waitForTimeout(300);
  await p.evaluate(() => {
    document.getElementById('ov').style.display = 'none';
    document.getElementById('stage').style.opacity = '1';
    document.getElementById('stage').innerHTML = `<svg viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      ${jungleBg(true)}<rect width="1920" height="1080" fill="#000" opacity=".25"/>
      <text x="1500" y="900" ${SERIF} font-size="900" fill="#ffe08a" text-anchor="middle" opacity=".9">Z</text>
      ${fawcett(120, 170, 3.6)}
      ${bigText("SUMIU NA", 1180, 260, 150, "#fff")}${bigText("AMAZÔNIA", 1180, 420, 150, "#ffd34d")}
      <g transform="translate(860 560)"><rect x="0" y="0" width="300" height="200" rx="30" fill="#f2c230" stroke="#1b1b22" stroke-width="10"/><text x="150" y="150" ${FONT} font-size="150" fill="#1b1b22" text-anchor="middle">A</text></g>
      <g transform="translate(1210 560)"><rect x="0" y="0" width="300" height="200" rx="30" fill="#e8453c" stroke="#1b1b22" stroke-width="10"/><text x="150" y="150" ${FONT} font-size="150" fill="#fff" text-anchor="middle">B</text></g>
      ${bigText("1925", 1180, 950, 110, "#fff")}</svg>`;
  });
  await p.screenshot({ path: '/home/user/J.A.R.V.I.S/documentarios/fawcett-miniatura.jpg', type: 'jpeg', quality: 90 }); await b.close(); })();
