import json, subprocess, numpy as np, wave
fr=json.load(open('frases.json')); SR=44100
def rd(p):
    w=wave.open(p); return np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float)/32768
t=0.8; out=[]; blocos=[]; prev=None
for i,f in enumerate(fr):
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'vo2/raw_{i:02d}.wav','-ar',str(SR),'-ac','1',f'vo2/r44_{i:02d}.wav'],check=True)
    x=rd(f'vo2/r44_{i:02d}.wav'); a=np.abs(x)>0.012; idx=np.where(a)[0]
    s=max(0,idx[0]-int(0.04*SR)); e=min(len(x),idx[-1]+int(0.12*SR)); x=x[s:e]
    w=wave.open(f'vo2/v_{i:02d}.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
    if prev is not None and f['b']!=prev:
        t+=2.4
        if f['b']==1: blocos.append({'title_card':round(t-1.2,2)}); t+=3.3
    if f['b']!=prev: blocos.append({'b':f['b'],'t0':round(t,2)})
    d=len(x)/SR; out.append({**f,'i':i,'t0':round(t,2),'t1':round(t+d,2)}); t+=d+0.55; prev=f['b']
json.dump({'frases':out,'blocos':blocos,'total':round(t+4.5,2)},open('timeline.json','w'),ensure_ascii=False)
print(round(t+4.5,1), [ (b.get('b'),b.get('t0',b.get('title_card'))) for b in blocos])
