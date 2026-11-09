const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/test.html');
  const L = [
    ['kaua_a', 'jeff-medium', 'Galera, isso aqui tá surreal!', 0.85],
    ['kaua_b', 'jeff-medium', 'Seu Valdir, tem um cara mordendo o retrovisor!', 0.85],
    ['valdir_a', 'faber-medium', 'Fora do ponto ninguém sobe.', 1.0],
    ['otavio_a', 'cadu-medium', 'Tecnicamente, aquilo lá fora são cadáveres andando.', 0.9],
    ['valdir_b', 'faber-medium', 'Cartão ou dinheiro?', 1.0],
    ['valdir_c', 'faber-medium', 'Aqui é linha, não é academia.', 1.0],
    ['kaua_c', 'jeff-medium', 'Desde quando ele tá aí?', 1.0],
    ['valdir_d', 'faber-medium', 'Temos diesel pra uma parada. Ou o posto, ou o terminal.', 1.0],
    ['kaua_d', 'jeff-medium', 'Tomada?!', 0.9],
    ['kaua_e', 'jeff-medium', 'Vocês decidem. Mas comenta baixo.', 1.05],
    ['rex', 'faber-medium', 'Au! Au!', 0.7],
    ['grunhido', 'faber-medium', 'Uuuuuuurrrrr.', 1.6],
  ];
  for (const [name, m, t, ls] of L) {
    const r = await p.evaluate(([m, t, ls]) => synthWav(m, t, ls), [m, t, ls]);
    fs.writeFileSync(process.env.S + `/ep1/raw_${name}.wav`, Buffer.from(r.b64, 'base64'));
  }
  await b.close(); console.log('piper ok');
})();
