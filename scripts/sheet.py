"""Folha de contato pra REVISAR olhando.
uso: python3 sheet.py video.mp4 saida.jpg [intervalo_s=2]   (frames do vídeo final)
     python3 sheet.py pasta_de_stills/ saida.jpg             (stills .jpg/.png)"""
import sys, os, glob, subprocess, tempfile
from PIL import Image
src, out = sys.argv[1], sys.argv[2]; step = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
if os.path.isdir(src):
    fs = sorted(glob.glob(os.path.join(src, "*.jpg")) + glob.glob(os.path.join(src, "*.png")))
else:
    d = tempfile.mkdtemp()
    subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-vf", f"fps=1/{step},scale=480:-1", os.path.join(d, "f_%03d.jpg")], check=True)
    fs = sorted(glob.glob(os.path.join(d, "f_*.jpg")))
ims = [Image.open(f).convert("RGB") for f in fs]
ims = [i.resize((480, int(480 * i.height / i.width))) for i in ims]
w, h = ims[0].size; cols = 4; rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (w * cols, h * rows))
for k, im in enumerate(ims): sheet.paste(im, ((k % cols) * w, (k // cols) * h))
sheet.save(out, quality=82); print("ok:", out, len(ims), "frames")
