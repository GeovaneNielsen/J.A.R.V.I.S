import numpy as np, soundfile as sf, os
from kokoro_onnx import Kokoro
os.chdir(os.path.dirname(os.path.abspath(__file__)))
K = '../kokoro/'
k = Kokoro(K + 'model.onnx', K + 'voices.npz')
L = {'cida_a': ('Boa noite, motorista. Aceita um bolinho?', 0.85), 'cida_b': ('Come que passa.', 0.85),
     'je_a': ('Cinco estrelas pra mim, hein?', 1.1), 'je_b': ('No posto tem tomada.', 1.1)}
for n, (t, sp) in L.items():
    a, sr = k.create(t, voice='pf_dora', speed=sp, lang='pt-br'); sf.write(f'raw_{n}.wav', a, sr)
print('kokoro ok')
