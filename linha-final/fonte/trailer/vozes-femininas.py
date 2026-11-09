import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
v = {n: np.fromfile(n + '.bin', dtype=np.float32).reshape(510, 1, 256) for n in ['pf_dora', 'pm_alex']}
np.savez('voices.npz', **v)
k = Kokoro('model.onnx', 'voices.npz')
lines = {
  'je': ('Cinco estrelas pra mim, hein?', 1.1),
  'cida': ('Come que passa.', 0.85),
  'dora_amostra': ('Bom dia, senhor. Eu sou a Jé, e esta é a Dona Cida. Nós também queremos falar no trailer.', 1.0),
}
for name, (t, sp) in lines.items():
    a, sr = k.create(t, voice=v['pf_dora'][:, 0, :] if False else 'pf_dora', speed=sp, lang='pt-br')
    sf.write(name + '.wav', a, sr); print(name, sr, round(len(a) / sr, 2))
