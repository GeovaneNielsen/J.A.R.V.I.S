const { chromium } = require('playwright'); const fs = require('fs'); const D = process.env.D;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file://' + D + '/mesa.html'); await p.waitForTimeout(500);
  const fps = 15, total = JSON.parse(fs.readFileSync(D + '/timeline.json')).total, n = Math.ceil(total * fps);
  for (let i = 0; i < n; i++) { const f = D + `/quadros_mesa/${String(i).padStart(5, '0')}.jpg`; if (fs.existsSync(f)) continue;
    await p.evaluate((t) => setFrame(t), i / fps); await p.screenshot({ path: f, type: 'jpeg', quality: 88 }); if (i % 500 === 0) console.log('frame', i, '/', n); }
  await b.close(); console.log('done', n); })();
