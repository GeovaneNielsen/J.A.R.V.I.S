import soundfile as sf, os
from kokoro_onnx import Kokoro
os.chdir(os.path.dirname(os.path.abspath(__file__)))
k = Kokoro('../kokoro/model.onnx', '../kokoro/voices.npz')
L = {'je_a': ('Então fala menos, professor.', 1.1), 'je_b': ('Bip de novo não...', 1.0), 'je_c': ('Isso... funcionou?', 1.0),
     'cida_a': ('Moço! Tem troco pra cinquenta?', 0.95), 'cida_b': ('Licença, licença!', 0.95)}
for n, (t, sp) in L.items():
    a, sr = k.create(t, voice='pf_dora', speed=sp, lang='pt-br'); sf.write(f'raw_{n}.wav', a, sr)
print('kokoro ok')
