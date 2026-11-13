const { chromium } = require('playwright'); const fs = require('fs');
const PRON = [[/Royal Geographical Society/g, 'Róial Geográfical Sossáieti'], [/Torquay/g, 'Tórqui'], [/Percy/g, 'Pérsi'], [/Fawcett/g, 'Fóssit'],
  [/Jack/g, 'Djéque'], [/Raleigh Rimmel/g, 'Rêli Rímel'], [/Arthur Conan Doyle/g, 'Ártur Cônan Dóil'], [/Sherlock Holmes/g, 'Xérloque Rôlmes'],
  [/David Grann/g, 'Deivid Grân'], [/1\.500/g, 'mil e quinhentos'], [/Kuhikugu/g, 'Kuikúgu'], [/Villas-Bôas/g, 'Vilas Boas'], [/Z\b/g, 'Zê'], [/Henry Rider Haggard/g, 'Rênri Ráider Rágard'], [/Henry Costin/g, 'Rênri Cóstin'], [/George Miller Dyott/g, 'Djórdj Míler Dáiot'], [/Aloha Wanderwell/g, 'Alôha Uónderuel'], [/The New Yorker/g, 'Dâ Niu Iórquer'], [/James Gray/g, 'Djeims Grei'], [/Charlie Hunnam/g, 'Txárli Rânam'], [/Ouija/g, 'Uíja']];
(async () => {
  const frases = JSON.parse(fs.readFileSync('frases.json'));
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/test.html');
  await p.evaluate(() => { window.eng = PiperVoice({ base: "voz/", modelParts: [0,1,2,3,4].map(i => `faber.onnx.${i}.wasm`), configFile: "faber.onnx.json", dataParts: ["piper_phonemize.data.0.wasm","piper_phonemize.data.1.wasm","piper_phonemize.data.2.wasm"], lengthScale: 1.1 }); });
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
