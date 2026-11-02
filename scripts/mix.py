"""Mix final: narração (atrasada em VO s) + trilha com ducking + efeitos sonoros. Substitui o antigo mix.sh.
uso: python mix.py --music music_raw.wav --sfx sfx.wav --out mixed.wav --dur 30 [--narr narr.wav --vo 0.4] [--sem-musica]"""
import argparse, os, subprocess, tempfile

ap = argparse.ArgumentParser()
ap.add_argument("--narr")
ap.add_argument("--music", required=True)
ap.add_argument("--sfx", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--vo", type=float, default=0.4)
ap.add_argument("--dur", type=float, required=True)
ap.add_argument("--sem-musica", action="store_true")
a = ap.parse_args()

tmp = os.path.join(tempfile.mkdtemp(), "music_m.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a.music, "-af",
                "aecho=0.8:0.85:60|120:0.25|0.15,highpass=f=28,acompressor=threshold=-18dB:ratio=2.5,loudnorm=I=-18:TP=-1.5",
                "-ar", "48000", "-ac", "2", tmp], check=True)
music_vol = "0" if a.sem_musica else "0.62"
if a.narr:
    ms = int(a.vo * 1000)
    inputs = ["-i", a.narr, "-i", tmp, "-i", a.sfx]
    fc = (f"[0:a]aformat=channel_layouts=stereo,adelay={ms}|{ms},apad,asplit=2[vo][key];[1:a]volume={music_vol}[m];"
          "[m][key]sidechaincompress=threshold=0.06:ratio=7:release=320[md];[2:a]aformat=channel_layouts=stereo,volume=0.85[s];"
          "[vo][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.8,loudnorm=I=-14:TP=-1.5")
else:
    inputs = ["-i", tmp, "-i", a.sfx]
    fc = (f"[0:a]volume={'0' if a.sem_musica else '0.8'}[m];[1:a]aformat=channel_layouts=stereo,volume=0.9[s];"
          "[m][s]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.8,loudnorm=I=-14:TP=-1.5")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", fc, "-t", str(a.dur), "-ar", "48000", a.out], check=True)
os.remove(tmp)
print("ok:", a.out)
