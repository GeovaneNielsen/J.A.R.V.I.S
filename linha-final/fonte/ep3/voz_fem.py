import soundfile as sf, os
from kokoro_onnx import Kokoro
os.chdir(os.path.dirname(os.path.abspath(__file__)))
k = Kokoro('../kokoro/model.onnx', '../kokoro/voices.npz')
L = {'je_a': ('Ele ainda tá trabalhando?', 1.05), 'je_b': ('Mais devagar que fila de banco.', 1.1),
     'cida_a': ('Deixa que a passagem de todo mundo eu pago.', 0.9), 'cida_b': ('Finalmente alguém com troco!', 0.9)}
for n, (t, sp) in L.items():
    a, sr = k.create(t, voice='pf_dora', speed=sp, lang='pt-br'); sf.write(f'raw_{n}.wav', a, sr)
print('kokoro ok')
