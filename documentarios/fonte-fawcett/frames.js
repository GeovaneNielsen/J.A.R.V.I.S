const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file://' + process.env.S + '/doc.html'); await p.waitForTimeout(300);
  const fps = 24, total = JSON.parse(fs.readFileSync(process.env.S + '/timeline.json')).total;
  const n = Math.ceil(total * fps);
  for (let i = 0; i < n; i++) { await p.evaluate((t) => setFrame(t), i / fps); await p.screenshot({ path: process.env.S + `/quadros/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 90 }); if (i % 2000 === 0) console.log('frame', i, '/', n); }
  await b.close(); console.log('done', n); })();
