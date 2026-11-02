"""Baixa as fontes (Inter + JetBrains Mono) e gera o PNG de grão em <projeto>/public.
uso: python3 setup_assets.py <pasta_do_projeto>"""
import sys, os, urllib.request
import numpy as np
from PIL import Image
pub = os.path.join(sys.argv[1], "public"); os.makedirs(pub, exist_ok=True)
for name, url in [
    ("inter.woff2", "https://cdn.jsdelivr.net/npm/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"),
    ("mono.woff2", "https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2"),
]:
    p = os.path.join(pub, name)
    if not os.path.exists(p):
        open(p, "wb").write(urllib.request.urlopen(url, timeout=30).read()); print("fonte ok:", name)
r = np.random.default_rng(3).integers(0, 256, (1400, 2400), dtype=np.uint8)
Image.fromarray(r, "L").save(os.path.join(pub, "noise.png")); print("noise.png ok")
