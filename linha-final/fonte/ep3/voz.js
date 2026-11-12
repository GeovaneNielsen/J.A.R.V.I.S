const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/test.html');
  const L = [
    ['kaua_a', 'jeff-medium', 'Vocês escolheram o terminal... e o terminal escolheu a gente.', 1.0],
    ['valdir_a', 'faber-medium', 'Trinta anos de linha e nunca vi o terminal tão vazio.', 1.0],
    ['otavio_a', 'cadu-medium', 'Tecnicamente, vazio é a melhor notícia da noite.', 0.9],
    ['cobrador', 'faber-medium', 'Paaas... saaa... geeem.', 1.7],
    ['valdir_b', 'faber-medium', 'Colega.', 1.1],
    ['kaua_b', 'jeff-medium', 'Eu tenho... cinco por cento.', 1.0],
    ['kaua_c', 'jeff-medium', 'Rex: passe livre.', 1.0],
    ['otavio_b', 'cadu-medium', 'Doutor Ivo Prates, Laboratório Municipal... Foi lá que tudo começou.', 0.95],
    ['kaua_d', 'jeff-medium', 'Vocês ouviram isso?', 1.0],
    ['kaua_e', 'jeff-medium', 'Vocês decidem. Mas decide antes da luz voltar.', 1.0],
  ];
  for (const [name, m, t, ls] of L) {
    const r = await p.evaluate(([m, t, ls]) => synthWav(m, t, ls), [m, t, ls]);
    fs.writeFileSync(process.env.S + `/ep3/raw_${name}.wav`, Buffer.from(r.b64, 'base64'));
  }
  await b.close(); console.log('piper ok');
})();
