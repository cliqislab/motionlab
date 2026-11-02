"""Confere a sincronia do MP4 final: transcreve o áudio final e compara as âncoras de events.json["k"] (+vo).
uso: python3 check_sync.py final.mp4|final.wav events.json ["termos, do, tema"]
Cada chave de "k" é a palavra-âncora (sem acento, minúscula) e o valor é o tempo na narração."""
import sys, json, re, unicodedata
from faster_whisper import WhisperModel

ev = json.load(open(sys.argv[2]))
prompt = sys.argv[3] if len(sys.argv) > 3 else ""


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)


K, vo = ev.get("k", {}), ev.get("vo", 0)
if not K:
    sys.exit('events.json sem "k" (âncoras palavra -> tempo).')
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(sys.argv[1], language="pt", word_timestamps=True, initial_prompt=prompt)
W = [(w.start, norm(w.word)) for s in segs for w in s.words]
print("TEXTO:", " ".join(w for _, w in W))
diffs = []
for key, t in K.items():
    tok, exp = norm(key), t + vo
    hits = [(abs(ts - exp), ts) for ts, w in W if w == tok]
    if not hits:
        print(f"{key:14s} esperado {exp:6.2f}s  NÃO OUVIDO")
        continue
    c = min(hits)
    diffs.append(c[1] - exp)
    print(f"{key:14s} esperado {exp:6.2f}s  no MP4 {c[1]:6.2f}s  delta {c[1]-exp:+.2f}s")
if diffs:
    print(f"delta máximo {max(map(abs, diffs)):.2f}s em {len(diffs)}/{len(K)} âncoras")
