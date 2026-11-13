import numpy as np, wave, json
SR=44100; TL=json.load(open('timeline.json')); DUR=TL['total']; N=int(SR*DUR); out=np.zeros(N); music=np.zeros(N); rng=np.random.default_rng(11)
def load(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float)/32768
    return x.reshape(-1,2).mean(1) if w.getnchannels()==2 else x
def put(buf,x,t,g=1.0):
    i=int(t*SR); x=x[:max(0,N-i)]; buf[i:i+len(x)]+=x*g
def env(n,a,r): t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/r)
def tone(f,d,a=0.01,r=0.5): n=int(d*SR); t=np.arange(n)/SR; return np.sin(2*np.pi*f*t)*env(n,a,r)
def fade(x,fi,fo):
    n=len(x); a=np.ones(n); i=int(fi*SR); o=int(fo*SR); a[:i]=np.linspace(0,1,i) if i else a[:0]; 
    if o: a[-o:]=np.linspace(1,0,o)
    return x*a
# ambient score: slow minor pads (A minor / F / C / G), a soft pulse and occasional plucks; changes colour per chapter
chords=[[110,130.8,164.8],[87.3,110,130.8],[130.8,164.8,196],[98,123.5,146.8]]
t=0; i=0
while t<DUR:
    ch=chords[i%4]; d=8.0; n=int(d*SR); tt=np.arange(n)/SR
    pad=sum(np.sin(2*np.pi*f*tt)+0.4*np.sin(2*np.pi*f*2.003*tt) for f in ch)*np.sin(np.pi*np.clip(tt/d,0,1))**0.6*0.05
    put(music,pad,t)
    for k in range(4): put(music,tone(ch[k%3]*4,1.6,0.005,0.6)*0.05,t+1+k*1.8)
    t+=d; i+=1
# low pulse under tense chapters (the war, the last expedition, the silence)
starts={b['b']:b['t0'] for b in TL['blocos'] if 'b' in b}
for b,e in [(4,5),(5,6),(7,8)]:
    t0=starts[b]; t1=starts[e]
    for c in np.arange(t0,t1,1.2): put(music,tone(55,0.6,0.005,0.2)*0.12,c)
# title card hit and end chime
tc=[b for b in TL['blocos'] if 'title_card' in b][0]['title_card']
put(music,tone(55,3,0.01,1.2)*0.3,tc); 
for k,f in enumerate([523.3,659.3,784,1046.5]): put(music,tone(f,1.4,0.005,0.6)*0.1,DUR-4+k*0.1)
# narration
for f in TL['frases']: put(out,load(f"vo2/v_{f['i']:02d}.wav"),f['t0'],1.0)
# duck the music under the voice
voice_env=np.convolve(np.abs(out),np.ones(4410)/4410,'same'); duck=1-0.55*np.clip(voice_env*12,0,1)
mix=out+music*duck
mix[-int(1.0*SR):]*=np.linspace(1,0,int(1.0*SR))
mix/=np.abs(mix).max()/0.89
pcm=(np.repeat(mix[:,None],2,1)*32767).astype(np.int16)
w=wave.open('trilha.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('ok', DUR)
