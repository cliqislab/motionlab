"""Masteriza a voz (EQ, compressão, volume padrão). Substitui o antigo master_voice.sh (funciona no Windows).
uso: python master_voice.py entrada.wav saida.wav [atempo=1.0]
Não acelere a voz (atempo) a menos que a pessoa peça."""
import sys, subprocess

src, out = sys.argv[1], sys.argv[2]
at = sys.argv[3] if len(sys.argv) > 3 else "1.0"
af = (f"atempo={at},highpass=f=70,equalizer=f=140:t=q:w=1:g=3,equalizer=f=320:t=q:w=1:g=-2,"
      "equalizer=f=3200:t=q:w=1:g=-2.5,equalizer=f=8000:t=q:w=1:g=-2,acompressor=threshold=-20dB:ratio=3.5:makeup=3,"
      "aecho=0.85:0.9:28:0.08,loudnorm=I=-14:TP=-1.3")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", "48000", "-ac", "2", out], check=True)
print("ok:", out)
