"""Conferência de texto sem viés (faster-whisper medium, sem initial_prompt).
uso: python3 check_medium.py take.wav [take2.wav ...]"""
import sys
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    segs, _ = m.transcribe(f, language="pt", word_timestamps=True, beam_size=5)
    W = [w for s in segs for w in s.words]
    print(f"== {f}  fala {W[0].start:.2f}-{W[-1].end:.2f}s")
    print(" ".join(w.word.strip() for w in W))
    low = [f"{w.start:.2f}:{w.word.strip()}({w.probability:.2f})" for w in W if w.probability < 0.6]
    print("   baixa confiança:", " ".join(low) or "-")
