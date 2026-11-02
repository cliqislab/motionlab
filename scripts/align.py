"""Alinha o TEXTO EXATO do roteiro aos tempos do whisper e corrige inícios que caem no silêncio.
uso: python3 align.py roteiro.txt narr.wav narr.words.json saida.script_words.json
- Os tempos vêm do whisper (narr.words.json), mas o texto de cada palavra é o do roteiro
  (o whisper escreve "um Instagram", "R$ 120"; a legenda precisa do texto aprovado).
- Palavra cujo início cai em silêncio (whisper costuma adiantar depois de pausa) é empurrada
  pro primeiro quadro com voz."""
import sys, json, re, unicodedata, difflib, subprocess
import numpy as np

rot, wav, wj, out = sys.argv[1:5]
script = open(rot, encoding="utf-8").read().split()
W = json.load(open(wj, encoding='utf-8'))


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)


a = [norm(w) for w in script]
b = [norm(w[2]) for w in W]
T = [None] * len(script)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            T[i1 + k] = [W[j1 + k][0], W[j1 + k][1]]
    elif tag == "replace":  # espalha o trecho do whisper pelas palavras do roteiro
        s0, s1 = W[j1][0], W[j2 - 1][1]
        n = i2 - i1
        for k in range(n):
            T[i1 + k] = [s0 + (s1 - s0) * k / n, s0 + (s1 - s0) * (k + 1) / n]
for i, t in enumerate(T):  # palavras sem par: entre vizinhos
    if t is None:
        p = T[i - 1][1] if i else 0.0
        nx = next((T[j][0] for j in range(i + 1, len(T)) if T[j]), p + 0.3)
        T[i] = [p, max(p + 0.05, nx)]

# energia em quadros de 10 ms
SR = 16000
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
hop = SR // 100
n = len(x) // hop
db = 20 * np.log10(np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9)
voiced = db > np.percentile(db, 95) - 32
fixed = 0
for i, (s, e) in enumerate(T):
    f = int(s * 100)
    if f < n and not voiced[f]:
        j = f
        while j < n and not voiced[j] and j < f + 80:
            j += 1
        if j < n and voiced[j] and j / 100 < e:
            T[i][0] = round(j / 100, 2)
            fixed += 1
res = [[round(s, 2), round(e, 2), w] for (s, e), w in zip(T, script)]
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"{len(res)} palavras do roteiro, {fixed} inícios ajustados pela energia")
print(" ".join(f"{s}:{w}" for s, e, w in res))
