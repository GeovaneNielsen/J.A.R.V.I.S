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

def plim(t,g=0.25): put((tone(2093,0.25,0.001,0.12)+0.6*tone(2637,0.25,0.001,0.1))*g,t)
def clac(t,g=0.5): put(lp(noise(0.05),3)*env(int(0.05*SR),0.001,0.015)*g,t); put(tone(180,0.08,0.001,0.03)*g*0.6,t)
def hum(t0,t1,g=0.012): n=int((t1-t0)*SR); put(fade(np.sign(np.sin(2*np.pi*120*np.arange(n)/SR))*g,0.3,0.3),t0)
# 1: inside the bus, engine low
engine(0,3,0.07)
# 2-8: the terminal hall: fluorescent hum, flickering lamp clicks, echoing pad
hum(3,49.3); pad(3,21,0.03,98)
for c in np.arange(3.3,9,0.62): put(noise(0.01)*0.12,c)
# 3: the Cobrador bangs the turnstile
for c in [9.3,9.9]: clac(c,0.7)
# 5: palpite
sw=np.sin(2*np.pi*np.cumsum(np.linspace(900,120,int(0.35*SR)))/SR)*0.25; put(fade(sw,0.005,0.05),21.6)
for c in np.arange(21.8,24.9,0.5): put(tone(1800 if int((c-21.8)/0.5)%2 else 1400,0.05,0.001,0.02)*0.35,c)
pad(21.5,25,0.05,82)
# 6: counting coins one by one, then the change
for k,f in enumerate([523.3,659.3,784]): put(tone(f,0.6,0.003,0.3)*0.1,25.4+k*0.06)
for i in range(8): plim(25.4+0.4*(i+1)+0.4,0.22)
for c in [28.4,28.6,28.75]: plim(c,0.3)
music(25.0,33.0,96,0.08)
# 7: one by one through the turnstile; Rex under it; the stamp
for i in range(5): clac(33.3+i*0.9,0.6)
thud(39.3,0.9)
music(33.0,41.0,120,0.1)
# 8: the clue
st=np.sin(2*np.pi*41*np.arange(int(2.4*SR))/SR)*np.linspace(0,1,int(2.4*SR))**2*0.22; put(fade(st,0.01,0.3),41.2)
for k,f in enumerate([220,261.6,311.1]): put(tone(f,2.5,0.3,1.2)*0.07,41.3+k*0.4)
# 9: power down, footsteps in the dark
sw=np.sin(2*np.pi*np.cumsum(np.linspace(400,40,int(0.8*SR)))/SR)*np.linspace(0.3,0,int(0.8*SR)); put(sw,49.3)
for i in range(6): thud(50.0+i*0.6,0.5+i*0.08)
# 10: the vote
music(53.0,59.6,120,0.12)
for k,f in enumerate([523.3,659.3,784,1046.5]): put(tone(f,1.0,0.003,0.5)*0.12,58.6+k*0.09)
# voices
VOL={'kaua_a':0.8,'kaua_d':0.7,'kaua_e':0.85,'cobrador':1.1}
for s in json.load(open('speech.json')):
    put(load('v_'+s['file']+'.wav'),s['t0'],VOL.get(s['file'],1.0))
out[-int(0.5*SR):]*=np.linspace(1,0,int(0.5*SR))
out/=np.abs(out).max()/0.89
pcm=(np.repeat(out[:,None],2,1)*32767).astype(np.int16)
w=wave.open('trilha.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('ok')
