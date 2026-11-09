const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file://' + process.env.S + '/anim/cena1-anim.html'); await p.waitForTimeout(300);
  const fps = 30, dur = 3.5;
  for (let i = 0; i < fps * dur; i++) {
    await p.evaluate((t) => setFrame(t), i / fps);
    await p.screenshot({ path: process.env.S + `/anim/f/${String(i).padStart(4, '0')}.png` });
  }
  await b.close();
})();
