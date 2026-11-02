"""Timestamps POR PALAVRA (faster-whisper, local, grátis). pip install faster-whisper
uso: python3 words.py narr.wav "termos, técnicos, do, tema"
Gera narr.words.json ([inicio, fim, palavra]) e imprime 'tempo:palavra' pra você cravar as cenas."""
import sys, json
from faster_whisper import WhisperModel
wav = sys.argv[1]; prompt = sys.argv[2] if len(sys.argv) > 2 else ""
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(wav, language="pt", word_timestamps=True, initial_prompt=prompt)
W = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in segs for w in s.words]
json.dump(W, open(wav.rsplit(".", 1)[0] + ".words.json", "w"), ensure_ascii=False)
print("TEXTO:", " ".join(w[2] for w in W))
print("DURAÇÃO DA FALA:", W[-1][1] if W else 0, "s")
print(" ".join(f"{w[0]}:{w[2]}" for w in W))
