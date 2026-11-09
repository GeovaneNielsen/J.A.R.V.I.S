#!/usr/bin/env bash
# Recria os arquivos da voz neural do painel (Piper) em ./voz-build/voz.
# Os arquivos (~210 MB) não vão para o git; são publicados junto do artifact.
# Precisa de acesso a registry.npmjs.org, huggingface.co e us.aws.cdn.hf.co.
set -euo pipefail
OUT="${1:-voz-build}"
mkdir -p "$OUT/voz" "$OUT/tmp"
cd "$OUT/tmp"
npm pack onnxruntime-web@1.17.3 piper-tts-web@1.1.2 --silent >/dev/null
tar xzf onnxruntime-web-1.17.3.tgz --transform 's,^package,ort,'
tar xzf piper-tts-web-1.1.2.tgz --transform 's,^package,piper,'
cp ort/dist/ort-wasm-simd.wasm ../voz/
cp piper/dist/piper/piper_phonemize.wasm ../voz/
# O bundle termina com "export default wt();"; num worker clássico basta chamar wt().
sed '$d' piper/dist/worker/PhonemizeWebWorker.js > ../voz/phonemize-worker.js
echo "wt();" >> ../voz/phonemize-worker.js
# Pedaços binários levam extensão .wasm porque o artifact só serve tipos conhecidos.
split -b 9000000 -d -a 1 --additional-suffix=.wasm piper/dist/piper/piper_phonemize.data ../voz/piper_phonemize.data.
HF=https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR
for v in faber cadu jeff; do
  curl -sSL -o "$v.onnx" "$HF/$v/medium/pt_BR-$v-medium.onnx"
  curl -sSL -o "../voz/$v.onnx.json" "$HF/$v/medium/pt_BR-$v-medium.onnx.json"
  split -b 13000000 -d -a 1 --additional-suffix=.wasm "$v.onnx" "../voz/$v.onnx."
done
cd .. && rm -rf tmp
ls -la voz
