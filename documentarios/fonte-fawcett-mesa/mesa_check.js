const { chromium } = require('playwright'); const D = process.env.D;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('err', e.message)); p.on('console', m => { if (m.type()==='error') console.log('console', m.text()); });
  if (process.env.PREP) { await p.goto('file://' + D + '/mesa_prep.html');
    await p.evaluate(() => mk('bg')); await p.screenshot({ path: D + '/mesa_bg.png' });
    for (let g = 0; g < 3; g++) { await p.evaluate((g) => mk('ov', g), g); await p.screenshot({ path: D + `/mesa_ov${g}.png`, omitBackground: true }); }
    await p.setViewportSize({ width: 2600, height: 1800 }); await p.evaluate(() => mk('blinds')); await p.screenshot({ path: D + '/mesa_blinds.png', omitBackground: true });
    await b.close(); return; }
  await p.goto('file://' + D + '/mesa.html'); await p.waitForTimeout(400);
  const ts = process.env.TS.split(',').map(Number);
  for (const t of ts) { const t0 = Date.now(); await p.evaluate((t) => setFrame(t), t); await p.screenshot({ path: D + `/mk/k_${t}.jpg`, type: 'jpeg', quality: 80 }); console.log(t, Date.now() - t0, 'ms'); }
  await b.close(); })();
