const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/test.html');
  const lines = [
    ['radio', 'cadu-medium', 'Atenção. Evitem sair de casa. Repito, evitem.', 0.9],
    ['valdir', 'faber-medium', 'Ninguém desce fora do ponto.', 1.0],
    ['otavio', 'cadu-medium', 'Tecnicamente, isso é uma péssima ideia.', 0.9],
    ['kaua1', 'jeff-medium', 'Galera, isso aqui tá surreal!', 0.85],
    ['rex', 'faber-medium', 'Au! Au!', 0.7],
    ['kaua2', 'jeff-medium', 'E quem decide o que acontece... são vocês.', 1.05],
  ];
  for (const [name, m, t, ls] of lines) {
    const r = await p.evaluate(([m, t, ls]) => synthWav(m, t, ls), [m, t, ls]);
    fs.writeFileSync(process.env.S + `/trailer/${name}.wav`, Buffer.from(r.b64, 'base64'));
    console.log(name, r.secs);
  }
  await b.close();
})();
