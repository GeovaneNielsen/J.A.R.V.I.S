const { chromium } = require('playwright'); const fs = require('fs');
const PRON = [[/Marie Celeste/g,'Marí Selést'],[/Mary Celeste/g,'Méri Selést'],[/Benjamin Briggs/g,'Bêndjamin Brigs'],[/Briggs/g,'Brigs'],[/Sarah/g,'Séra'],[/Sophia/g,'Sofia'],[/Arthur Conan Doyle/g,'Ártur Cônan Dóil'],[/Arthur/g,'Ártur'],[/Dei Gratia/g,'Dêi Grácia'],[/David Morehouse/g,'Dêivid Mórrauss'],[/Morehouse/g,'Mórrauss'],[/Oliver Deveau/g,'Óliver Devô'],[/Deveau/g,'Devô'],[/Frederick Solly-Flood/g,'Frédrik Sóli Flâd'],[/Flood/g,'Flâd'],[/Sherlock Holmes/g,'Xérloque Rôlmes'],[/Andrea Sella/g,'Andréa Séla'],[/Manchester/g,'Ménchester'],[/Gilman Parker/g,'Guílman Párker'],[/Parker/g,'Párker'],[/Clive Cussler/g,'Cláiv Câsler'],[/1\.701/g,'mil setecentos e um'],[/Amazon/g,'Ámazon']];
(async () => {
  const frases = JSON.parse(fs.readFileSync('frases.json'));
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/test.html');
  await p.evaluate(() => { window.eng = PiperVoice({ base: "voz/", modelParts: [0,1,2,3,4].map(i => `faber.onnx.${i}.wasm`), configFile: "faber.onnx.json", dataParts: ["piper_phonemize.data.0.wasm","piper_phonemize.data.1.wasm","piper_phonemize.data.2.wasm"], lengthScale: 1.0 }); });
  for (const [i, f] of frases.entries()) {
    let t = f.text; for (const [a, r] of PRON) t = t.replace(a, r);
    const b64 = await p.evaluate(async (t) => {
      const pcm = await eng.synth(t); const sr = eng.sampleRate, n = pcm.length, buf = new DataView(new ArrayBuffer(44 + n * 2));
      const w = (o, s) => { for (let i = 0; i < s.length; i++) buf.setUint8(o + i, s.charCodeAt(i)); };
      w(0, "RIFF"); buf.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); buf.setUint32(16, 16, true); buf.setUint16(20, 1, true); buf.setUint16(22, 1, true); buf.setUint32(24, sr, true); buf.setUint32(28, sr * 2, true); buf.setUint16(32, 2, true); buf.setUint16(34, 16, true); w(36, "data"); buf.setUint32(40, n * 2, true);
      for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, pcm[i])); buf.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
      let bin = ""; const u = new Uint8Array(buf.buffer); for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return btoa(bin);
    }, t);
    fs.writeFileSync(`vo2/raw_${String(i).padStart(2, '0')}.wav`, Buffer.from(b64, 'base64'));
  }
  await b.close(); console.log('ok', frases.length);
})();
