"""Corta os silêncios de um vídeo GRAVADO (talking head, tela, podcast) usando VAD Silero.
uso: python3 cut_silence.py entrada.mp4 saida.mp4 [min_silencio_ms=180] [margem_ms=60]
Por que VAD e não silencedetect: com ruído de fundo/música o silencedetect erra; e os tempos
do Whisper costumam dizer que a fala começa em 0.00 quando começa depois. Requer faster-whisper e ffmpeg."""
import sys, os, subprocess, tempfile
import numpy as np
from faster_whisper.audio import decode_audio
from faster_whisper.vad import VadOptions, get_speech_timestamps
src, out = sys.argv[1], sys.argv[2]
min_sil = int(sys.argv[3]) if len(sys.argv) > 3 else 180
pad = int(sys.argv[4]) if len(sys.argv) > 4 else 60
SR = 16000
audio = decode_audio(src, sampling_rate=SR)
segs = get_speech_timestamps(audio, VadOptions(min_silence_duration_ms=min_sil, speech_pad_ms=pad))
if not segs: sys.exit("nenhuma fala detectada")
# junta trechos colados
spans = []
for s in segs:
    a, b = s["start"] / SR, s["end"] / SR
    if spans and a - spans[-1][1] < 0.05: spans[-1][1] = b
    else: spans.append([a, b])
tmp = tempfile.mkdtemp(); lista = os.path.join(tmp, "lista.txt")
with open(lista, "w", encoding="utf-8") as L:
    for i, (a, b) in enumerate(spans):
        p = os.path.join(tmp, f"p{i:04d}.mp4")
        # re-encoda cada pedaço (corte exato no frame, sem tranco de keyframe)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src,
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", p], check=True)
        L.write("file '" + p.replace("\\", "/") + "'\n")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", out], check=True)
tot = sum(b - a for a, b in spans)
print(f"ok: {out} | {len(spans)} trechos de fala | {tot:.1f}s mantidos de {len(audio)/SR:.1f}s")
print("PRÓXIMO PASSO: retranscreva o vídeo CORTADO (words.py) e use esses tempos pra legenda e overlays.")
