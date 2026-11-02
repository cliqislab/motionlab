# Trilha eletrônica/cyberpunk + kit de SFX, 100% sintetizados (numpy), sincronizados pelo events.json.
# uso: python3 score.py <projeto>/src/events.json <pasta_saida>   -> music_raw.wav + sfx.wav
# events.json["music"]: bpm, drop (entra beat cheio), lift (pad abre), silences (buracos de ~0.4s ANTES do tempo),
#                       braams (impactos graves com riser antes), final (impacto final + acorde com cauda)
# events.json["sfx"]: [{t, type: whoosh|impact|blip|type|zip|glitch|ding, dur?, f?}]
# cuts -> whoosh automático; shake -> impacto automático; glitch -> glitch sonoro automático.
import numpy as np, wave, json, sys, os
EV = json.load(open(sys.argv[1])); OUTD = sys.argv[2] if len(sys.argv) > 2 else "."
SR = 48000; VO = EV["vo"]; DUR = EV["duration"]; N = int(SR * DUR)
rng = np.random.default_rng(7)
V = lambda s: s + VO
MU = EV.get("music", {})
def place(buf, sig, ts, g=1.0):
    i = int(ts * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i >= N: return
    sig = sig[:N - i]; buf[i:i + len(sig)] += sig * g
def env_adsr(L, a, d, s, r):
    e = np.ones(L) * s; ai, di, ri = int(a*SR), int(d*SR), int(r*SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if di: e[ai:ai+di] = np.linspace(1, s, min(di, L-ai))[:len(e[ai:ai+di])]
    if ri and ri < L: e[-ri:] *= np.linspace(1, 0, ri)
    return e
def saw(f, L, det=0.0):
    ph = (np.arange(L) * f / SR) % 1.0
    x = 2 * ph - 1
    if det:
        ph2 = (np.arange(L) * f * (1 + det) / SR) % 1.0; x = 0.5 * x + 0.5 * (2 * ph2 - 1)
    return x
def lp(x, a):  # one-pole lowpass (a = 0..1, menor = mais escuro)
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y
def lp_fast(x, cutoff):
    # lowpass via FFT (rápido p/ sinais longos)
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1/SR)
    X *= 1 / np.sqrt(1 + (fr / cutoff) ** 4); return np.fft.irfft(X, len(x))
def hp_fast(x, cutoff):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1/SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(fr, 1)) ** 4); return np.fft.irfft(X, len(x))
def sine(f, L): return np.sin(2*np.pi*f*np.arange(L)/SR)

# ------------------------------------------------ MÚSICA
BPM = MU.get('bpm', 128); spb = 60 / BPM; s16 = spb / 4; bar = 4 * spb
DROP = V(MU["drop"]) if MU.get("drop") is not None else V(0)
NEW = V(MU["lift"]) if MU.get("lift") is not None else 1e9
FIN = V(MU["final"]) if MU.get("final") is not None else None
SIL = [V(x) for x in MU.get("silences", [])] + ([FIN] if FIN else [])
END_MUSIC = DUR - 0.2
prog = [(110.0, [220, 261.6, 329.6]), (87.31, [174.6, 220, 261.6]), (130.8, [261.6, 329.6, 392]), (98.0, [196, 246.9, 293.7])]  # Am F C G

drums = np.zeros(N); bass = np.zeros(N); pad = np.zeros(N); arp = np.zeros(N); fx = np.zeros(N)
def kick():
    L = int(0.32*SR); n = np.arange(L)/SR; f = 140*np.exp(-n/0.025)+45
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-n/0.16) + np.exp(-n/0.003)*0.5)
def snare():
    L = int(0.22*SR); n = np.arange(L)/SR
    return hp_fast(rng.standard_normal(L), 1500)*np.exp(-n/0.06)*0.55 + sine(190, L)*np.exp(-n/0.04)*0.4
def hat(op=False):
    L = int((0.12 if op else 0.035)*SR); n = np.arange(L)/SR
    return hp_fast(rng.standard_normal(L), 7000)*np.exp(-n/(0.05 if op else 0.012))*0.35

def silent(ts):  # buracos dramáticos antes dos impactos + fim
    return any(s - 0.42 <= ts < s for s in SIL) or (FIN is not None and ts >= END_MUSIC - 2.6 and ts > FIN + 1)

nb = int(DUR / bar) + 1
for b in range(nb):
    t0 = b * bar; root, ch = prog[b % 4]
    for st in range(16):
        ts = t0 + st * s16
        if ts >= DUR or silent(ts): continue
        full = ts >= DROP
        # kick 4/4 (no intro só em compassos alternados, metade)
        if st % 4 == 0 and (full or (ts > V(2.5) and st == 0)):
            place(drums, kick(), ts, 0.9 if full else 0.6)
        if full and st in (4, 12): place(drums, snare(), ts, 0.8)
        if st % 2 == 1: place(drums, hat(st == 14 and full), ts, 0.7 if full else 0.45)
        # baixo saw 16ths (offbeat pump) — sidechain fake: off nas batidas
        if (full or ts > DROP - 5) and st % 4 != 0:
            L = int(s16*0.9*SR); f = root if st % 8 != 6 else root*2
            sig = lp_fast(saw(f, L, 0.006), 600 if full else 300) * env_adsr(L, 0.004, 0.05, 0.6, 0.02)
            place(bass, sig, ts, 0.55)
        # arp 16ths
        notes = [ch[0]*2, ch[1]*2, ch[2]*2, ch[1]*2]
        L = int(s16*0.8*SR)
        sig = (saw(notes[st % 4], L) * 0.6 + sine(notes[st % 4]*2, L)*0.3) * np.exp(-np.arange(L)/SR/0.05)
        place(arp, sig, ts, 0.10 if not full else 0.13)
    # pad do drop em diante
    if t0 + bar > DROP:
        L = int(bar*SR); sig = np.zeros(L)
        for f in ch: sig += saw(f, L, 0.007)
        sig = lp_fast(sig, 1400 if t0 >= NEW else 900) * env_adsr(L, 0.15, 0.1, 0.9, 0.15)
        place(pad, sig, t0, 0.06)

def riser(ts, length, amp=0.5):
    L = int(length*SR); e = (np.arange(L)/L)**2.2; p = 200+(np.arange(L)/L)*2200
    s = (0.55*hp_fast(rng.standard_normal(L), 800)+0.45*np.sin(2*np.pi*np.cumsum(p)/SR))*e
    place(fx, s, ts - length, amp)
def braam(ts, length=2.0, amp=0.8, base=55):
    L = int(length*SR); n = np.arange(L)/SR; s = np.zeros(L)
    for f, g in [(base, 1), (base*1.5, .5), (base*2, .45), (base*2.01, .3), (base*3, .2)]: s += g*saw(f, L)*0.5
    s = lp_fast(s, 900)*np.exp(-n/0.8) + rng.standard_normal(L)*np.exp(-n/0.08)*0.3
    place(fx, s, ts, amp)

if MU.get("drop") is not None: riser(DROP, 2.2, 0.45); braam(DROP, 2.2, 0.75)
for b_ in MU.get("braams", []):
    if b_ != MU.get("drop"): riser(V(b_), 1.2, 0.35); braam(V(b_), 1.7, 0.7, 52)
if NEW < 1e8: braam(NEW, 1.5, 0.45, 58)
if FIN:
    riser(FIN, 2.2, 0.5); braam(FIN, 3.6, 0.95, 55)
    L = int(3.6*SR); n = np.arange(L)/SR; s = np.zeros(L)
    for f in [110, 220, 261.6, 329.6, 440]: s += saw(f, L, 0.006)
    place(pad, lp_fast(s, 1600)*np.exp(-n/1.4), FIN, 0.09)

mus = drums*0.85 + bass*0.9 + pad + arp + fx*0.8
fi = int(0.15*SR); fo = int(1.2*SR)
mus[:fi] *= np.linspace(0, 1, fi); mus[-fo:] *= np.linspace(1, 0, fo)
mus /= np.max(np.abs(mus)) + 1e-9; mus *= 0.9

# ------------------------------------------------ SFX
sfx = np.zeros(N)
def whoosh(dur=0.45, amp=0.5):
    L = int(dur*SR); x = rng.standard_normal(L); e = np.hanning(L)**1.5
    # sweep de filtro: mistura de 3 bandas que cruzam
    lo = lp_fast(x, 700); hi = hp_fast(x, 2500); k = np.linspace(0, 1, L)
    return (lo*(1-k) + hi*k*0.7)*e*amp*2.2
def impact(amp=0.8, base=58, dur=0.7):
    L = int(dur*SR); n = np.arange(L)/SR; f = base*2.2*np.exp(-n/0.05)+base*0.6
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-n/0.25) + lp_fast(rng.standard_normal(L), 2500)*np.exp(-n/0.04)*0.5)*amp
def blip(f=1200, dur=0.08, amp=0.3):
    L = int(dur*SR); n = np.arange(L)/SR
    return (sine(f, L) + 0.3*sine(f*2, L))*np.exp(-n/0.025)*amp
def key(amp=0.18):
    L = int(0.025*SR); n = np.arange(L)/SR
    return hp_fast(rng.standard_normal(L), 3000)*np.exp(-n/0.004)*amp + sine(1800+rng.random()*600, L)*np.exp(-n/0.006)*amp*0.4
def zip_(amp=0.35):  # strike/risco
    L = int(0.18*SR); n = np.arange(L)/SR; p = 900+np.linspace(0, 2600, L)
    return (np.sin(2*np.pi*np.cumsum(p)/SR)*0.3 + hp_fast(rng.standard_normal(L), 3000)*0.7)*np.exp(-n/0.07)*amp
def glitch(dur=0.25, amp=0.3):
    L = int(dur*SR); x = np.sign(np.sin(2*np.pi*np.cumsum(rng.choice([80, 160, 400, 1200], L//400+1).repeat(400)[:L])/SR))
    x = x*(rng.random(L//600+1).repeat(600)[:L] > 0.35)
    return x*np.linspace(1, 0.2, L)*amp
def ding(amp=0.35):
    L = int(0.6*SR); n = np.arange(L)/SR
    return (sine(1320, L)+0.5*sine(1980, L)+0.25*sine(2640, L))*np.exp(-n/0.18)*amp

def typing(a, b, rate=16, amp=0.16):
    t = a
    while t < b:
        place(sfx, key(amp), V(t)); t += 1/rate * (0.7 + 0.6*rng.random())

for c in EV['cuts']: place(sfx, whoosh(0.42, 0.45), V(c) - 0.25)
for at, amp in EV['shake']: place(sfx, impact(0.75*amp+0.2), V(at))
for at, d in EV['glitch']: place(sfx, glitch(min(d+0.05, 0.4), 0.18), V(at))
KIT = {
    "whoosh": lambda e: whoosh(e.get("dur", 0.42), e.get("amp", 0.45)),
    "impact": lambda e: impact(e.get("amp", 0.8)),
    "blip": lambda e: blip(e.get("f", 1000), 0.08, e.get("amp", 0.28)),
    "zip": lambda e: zip_(e.get("amp", 0.32)),
    "glitch": lambda e: glitch(e.get("dur", 0.25), e.get("amp", 0.18)),
    "ding": lambda e: ding(e.get("amp", 0.35)),
}
for e in EV.get("sfx", []):
    if e["type"] == "type": typing(e["t"], e["t"] + e.get("dur", 0.6), e.get("rate", 22), e.get("amp", 0.15))
    elif e["type"] == "whoosh": place(sfx, KIT["whoosh"](e), V(e["t"]) - 0.1)
    else: place(sfx, KIT[e["type"]](e), V(e["t"]))
sfx /= max(1.0, np.max(np.abs(sfx)) / 0.95)

def save(name, x):
    pcm = (np.clip(x, -1, 1)*32767).astype('<i2')
    w = wave.open(name, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
save(os.path.join(OUTD, 'music_raw.wav'), mus); save(os.path.join(OUTD, 'sfx.wav'), sfx)
print('ok', DUR)
