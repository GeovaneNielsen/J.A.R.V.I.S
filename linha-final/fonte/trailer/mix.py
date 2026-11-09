import numpy as np, wave
SR=44100; DUR=25.0; N=int(SR*DUR)
out=np.zeros(N)
rng=np.random.default_rng(3)
def load(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float)/32768
    if w.getnchannels()==2: x=x.reshape(-1,2).mean(1)
    return x
def put(x,t,g=1.0):
    i=int(t*SR); x=x[:max(0,N-i)]; out[i:i+len(x)]+=x*g
def env(n,a=0.005,r=0.2):
    t=np.arange(n)/SR; e=np.minimum(1,t/a)*np.exp(-t/r); return e
def tone(f,d,a=0.005,r=0.2,kind='sine'):
    n=int(d*SR); t=np.arange(n)/SR
    w=np.sin(2*np.pi*f*t) if kind=='sine' else 2*np.abs(2*((f*t)%1)-1)-1
    return w*env(n,a,r)
def noise(d,color='white'):
    n=int(d*SR); x=rng.standard_normal(n)
    if color=='brown': x=np.cumsum(x); x-=np.convolve(x,np.ones(2000)/2000,'same'); x/=np.abs(x).max()+1e-9
    return x
def lowpass(x,k=40): return np.convolve(x,np.ones(k)/k,'same')
def fade(x,fi=0.02,fo=0.05):
    n=len(x); a=np.ones(n); i=int(fi*SR); o=int(fo*SR)
    if i: a[:i]=np.linspace(0,1,i)
    if o: a[-o:]=np.linspace(1,0,o)
    return x*a
# A: radio static + voice, cut at 2.0
st=noise(2.0)*0.05*(0.6+0.4*np.sin(np.arange(int(2*SR))/SR*37)); put(fade(st,0.05,0.08),0)
for k in range(14): put(noise(0.01)*0.25,rng.uniform(0,1.9))
r=load('p_radio_f.wav')[:int(1.75*SR)]; put(fade(r,0.01,0.12),0.15,0.9)
# drone 0-6
n=int(6*SR); t=np.arange(n)/SR
dr=(np.sin(2*np.pi*55*t)+0.6*np.sin(2*np.pi*82.4*t)+0.3*np.sin(2*np.pi*110.5*t))*np.minimum(1,t/1.5)*0.07
put(fade(dr,0.3,0.4),0)
# engine 2-4
eng=lowpass(noise(2.0,'brown'),200)*0.5*(1+0.3*np.sin(np.arange(int(2*SR))/SR*2*np.pi*9)); put(fade(eng,0.2,0.3),2.0)
# thud + groan
def thud(t,g=0.8):
    put(tone(70,0.5,0.002,0.12)*g,t); put(lowpass(noise(0.15),6)*env(int(0.15*SR),0.001,0.04)*g*0.8,t)
thud(4.47); put(load('p_grunh.wav'),4.55,1.0)
# music 6-15 (120 bpm arpeggio + kick), 18-21 faster
def music(t0,t1,bpm,g):
    beat=60/bpm; prog=[[220,261.6,329.6,440],[174.6,220,261.6,349.2],[196,246.9,293.7,392],[164.8,207.7,246.9,329.6]]
    t=t0; i=0
    while t<t1-0.05:
        chord=prog[(i//8)%4]; f=chord[i%4]*(2 if (i%8)>=4 else 1)
        put(tone(f,beat*0.9,0.003,0.12,'tri')*g,t)
        if i%2==0: put((tone(110,0.25,0.001,0.05)+tone(55,0.25,0.001,0.1))*g*1.3,t)
        if i%4==2: put(noise(0.05)*env(int(0.05*SR),0.001,0.015)*g*0.6,t)
        t+=beat/2; i+=1
music(6.0,15.0,120,0.16)
music(18.0,21.0,150,0.2)
# voices and cues on cards
put(load('p_valdir.wav'),6.1,1.0)
ding=tone(1318.5,0.18,0.002,0.1)+np.concatenate([np.zeros(int(0.12*SR)),tone(1760,0.3,0.002,0.15)])[:int(0.18*SR)] if False else None
put(load('p_je.wav'),7.6,1.0)
put(load('p_otavio.wav'),9.2,1.0)
put(load('p_cida.wav'),11.03,1.0)
put(load('p_kaua1h.wav'),12.45,1.0)
put(load('p_rexh.wav'),14.05,1.0)
# E: lamp buzz, flicker clicks, sting
n=int(3*SR); t=np.arange(n)/SR
buzz=np.sign(np.sin(2*np.pi*120*t))*0.02; put(fade(buzz,0.05,0.3),15.0)
for c in np.arange(15.0,16.1,0.21): put(noise(0.012)*0.3,c)
sting=np.sin(2*np.pi*41*np.arange(int(1.6*SR))/SR)*np.linspace(0,1,int(1.6*SR))**2*0.25; put(fade(sting,0.01,0.2),16.3)
put(tone(880,1.2,0.01,0.6)*0.08,16.3); put(tone(932,1.2,0.01,0.6)*0.08,16.3)
# F: spray, crac, thud
sp=noise(0.75); sp=sp-lowpass(sp,8); put(fade(sp*0.25,0.02,0.2),18.05)
put(noise(0.04)*0.6,19.45); put(noise(0.03)*0.4,19.52)
thud(20.42,0.9)
# G: boom, sign buzz, whisper, final chime
put(tone(50,1.4,0.002,0.5)*0.7,21.0); put(lowpass(noise(0.4),10)*env(int(0.4*SR),0.001,0.12)*0.5,21.0)
put(fade(np.sign(np.sin(2*np.pi*100*np.arange(int(0.25*SR))/SR))*0.04,0.01,0.02),21.0)
put(load('p_kaua2h.wav'),21.7,1.0)
for k,f in enumerate([523.3,659.3,784,1046.5]): put(tone(f,1.0,0.003,0.5)*0.12,23.6+k*0.09)
out[-int(0.4*SR):]*=np.linspace(1,0,int(0.4*SR))
out/=np.abs(out).max()/0.89
pcm=(np.repeat(out[:,None],2,1)*32767).astype(np.int16)
w=wave.open('trilha.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('ok')
