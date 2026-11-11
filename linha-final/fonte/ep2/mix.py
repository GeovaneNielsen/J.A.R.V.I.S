import numpy as np, wave, json
SR=44100; DUR=60.0; N=int(SR*DUR); out=np.zeros(N); rng=np.random.default_rng(5)
def load(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float)/32768
    return x.reshape(-1,2).mean(1) if w.getnchannels()==2 else x
def put(x,t,g=1.0):
    i=int(t*SR); x=x[:max(0,N-i)]; out[i:i+len(x)]+=x*g
def env(n,a=0.005,r=0.2): t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/r)
def tone(f,d,a=0.005,r=0.2,kind='sine'):
    n=int(d*SR); t=np.arange(n)/SR
    w=np.sin(2*np.pi*f*t) if kind=='sine' else 2*np.abs(2*((f*t)%1)-1)-1
    return w*env(n,a,r)
def noise(d): return rng.standard_normal(int(d*SR))
def brown(d):
    x=np.cumsum(noise(d)); x-=np.convolve(x,np.ones(2000)/2000,'same'); return x/(np.abs(x).max()+1e-9)
lp=lambda x,k=40: np.convolve(x,np.ones(k)/k,'same')
def fade(x,fi=0.02,fo=0.05):
    n=len(x); a=np.ones(n); i=int(fi*SR); o=int(fo*SR)
    if i: a[:i]=np.linspace(0,1,i)
    if o: a[-o:]=np.linspace(1,0,o)
    return x*a
def thud(t,g=0.8): put(tone(70,0.5,0.002,0.12)*g,t); put(lp(noise(0.15),6)*env(int(0.15*SR),0.001,0.04)*g*0.8,t)
def hiss(t,d=0.6,g=0.25): x=noise(d); x=x-lp(x,6); put(fade(x*g,0.02,d*0.6),t)
def groan(t,g=1.0,rate=1.0):
    x=load('v_grunhido.wav'); idx=np.arange(0,len(x)-1,rate); put(np.interp(idx,np.arange(len(x)),x),t,g)
def engine(t0,t1,g=0.12):
    x=lp(brown(t1-t0),250)*(1+0.25*np.sin(np.arange(int((t1-t0)*SR))/SR*2*np.pi*7)); put(fade(x*g,0.3,0.3),t0)
def pad(t0,t1,g=0.035,root=110):
    n=int((t1-t0)*SR); t=np.arange(n)/SR
    x=(np.sin(2*np.pi*root*t)+0.7*np.sin(2*np.pi*root*1.2*t)+0.5*np.sin(2*np.pi*root*1.5*t))*(0.7+0.3*np.sin(2*np.pi*0.25*t))
    put(fade(x*g,1.0,1.0),t0)
def music(t0,t1,bpm,g):
    beat=60/bpm; prog=[[220,261.6,329.6,440],[174.6,220,261.6,349.2],[196,246.9,293.7,392],[164.8,207.7,246.9,329.6]]
    t=t0; i=0
    while t<t1-0.05:
        ch=prog[(i//8)%4]; put(tone(ch[i%4]*(2 if (i%8)>=4 else 1),beat*0.9,0.003,0.12,'tri')*g,t)
        if i%2==0: put((tone(110,0.25,0.001,0.05)+tone(55,0.25,0.001,0.1))*g*1.3,t)
        if i%4==2: put(noise(0.05)*env(int(0.05*SR),0.001,0.015)*g*0.6,t)
        t+=beat/2; i+=1

def pop(t0,t1,bpm,g):
    beat=60/bpm; mel=[523.3,659.3,784,659.3,587.3,698.5,880,698.5]; t=t0; i=0
    while t<t1-0.05:
        put(tone(mel[i%8],beat*0.45,0.002,0.08,'tri')*g,t)
        put((tone(90,0.2,0.001,0.06)+tone(45,0.2,0.001,0.1))*g*1.6,t) if i%2==0 else put(noise(0.04)*env(int(0.04*SR),0.001,0.01)*g,t)
        t+=beat/2; i+=1
def ballad(t0,t1,g):
    beat=60/70; chords=[[261.6,329.6,392],[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7]]; t=t0; i=0
    while t<t1-0.05:
        ch=chords[(i//4)%4]
        for f in ch: put(tone(f,beat*1.0,0.08,0.9)*g*0.5,t)
        put(tone(ch[i%3]*2,beat*0.9,0.01,0.5)*g,t+beat*0.5)
        t+=beat; i+=1
def crickets(t0,t1,g=0.02):
    t=t0
    while t<t1:
        for k in range(3): put(tone(4200,0.03,0.002,0.01)*g,t+k*0.05)
        t+=rng.uniform(0.6,1.4)
# 1: inside, engine idling low, night outside
engine(0,3,0.06); crickets(0,15)
# 2: coasting in silence (tyres on gravel), whispers
put(fade(lp(noise(2.4),12)*0.05,0.3,0.6),3.0)
# 3: the pump beeps, louder every liter
for k,c in enumerate(np.arange(10.4,15.0,1.1)): put(tone(1250,0.14,0.002,0.07)*(0.15+0.07*k),c)
# 4: loud pop music in the shop
pop(15.0,21.6,128,0.17)
# 5: palpite
sw=np.sin(2*np.pi*np.cumsum(np.linspace(900,120,int(0.35*SR)))/SR)*0.25; put(fade(sw,0.005,0.05),21.6)
for c in np.arange(21.8,24.9,0.5): put(tone(1800 if int((c-21.8)/0.5)%2 else 1400,0.05,0.001,0.02)*0.35,c)
# 6-7: slow love song, cut mid-phrase by Dona Cida
for k,f in enumerate([523.3,659.3,784]): put(tone(f,0.6,0.003,0.3)*0.1,25.3+k*0.06)
ballad(25.0,37.0,0.16)
for k in range(4): groan(39.2+k*0.08,0.6,0.8+k*0.12)
# 8: chase, cart hits, engine starts
music(41.0,47.0,160,0.18)
for h in [43.31,44.0,44.69]: thud(h,0.9)
for c in np.arange(41.1,45.5,0.19): thud(c,0.1)
put(fade(lp(brown(1.4),200)*np.linspace(0.2,1,int(1.4*SR))*0.25,0.05,0.2),45.6)
# 9: driving away, the empty seat
engine(47,60,0.08)
st=np.sin(2*np.pi*41*np.arange(int(1.8*SR))/SR)*np.linspace(0,1,int(1.8*SR))**2*0.22; put(fade(st,0.01,0.2),49.4)
for c in [47.6,48.0,48.4]: put(lp(noise(0.06),4)*env(int(0.06*SR),0.002,0.02)*0.15,c)
# 10: the vote
music(53.0,59.6,120,0.12)
for k,f in enumerate([523.3,659.3,784,1046.5]): put(tone(f,1.0,0.003,0.5)*0.12,58.6+k*0.09)
# voices
VOL={'kaua_a':0.8,'otavio_a':0.85,'je_a':0.9}
for s in json.load(open('speech.json')):
    put(load('v_'+s['file']+'.wav'),s['t0'],VOL.get(s['file'],1.0))
out[-int(0.5*SR):]*=np.linspace(1,0,int(0.5*SR))
out/=np.abs(out).max()/0.89
pcm=(np.repeat(out[:,None],2,1)*32767).astype(np.int16)
w=wave.open('trilha.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('ok')
