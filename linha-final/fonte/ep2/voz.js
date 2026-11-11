const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/test.html');
  const L = [
    ['kaua_a', 'jeff-medium', 'Vocês escolheram o posto. Obrigado... eu acho.', 1.0],
    ['valdir_a', 'faber-medium', 'Motor desligado. Ninguém respira alto.', 1.0],
    ['otavio_a', 'cadu-medium', 'Eles reagem a qualquer som acima de um sussurro.', 0.9],
    ['kaua_b', 'jeff-medium', 'Quatro por cento... cinco por cento...', 0.95],
    ['otavio_b', 'cadu-medium', 'Tecnicamente, ritmo lento acalma o sistema nervoso. Ou o que sobrou dele.', 0.9],
    ['valdir_b', 'faber-medium', 'Todo mundo pra dentro!', 0.9],
    ['kaua_c', 'jeff-medium', 'Gente... cadê o cara do fundo?', 1.0],
    ['kaua_d', 'jeff-medium', 'Vocês decidem. E decide rápido.', 1.0],
  ];
  for (const [name, m, t, ls] of L) {
    const r = await p.evaluate(([m, t, ls]) => synthWav(m, t, ls), [m, t, ls]);
    fs.writeFileSync(process.env.S + `/ep2/raw_${name}.wav`, Buffer.from(r.b64, 'base64'));
  }
  await b.close(); console.log('piper ok');
})();
