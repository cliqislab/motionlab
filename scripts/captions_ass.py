"""Legenda animada estilo Reels/TikTok (karaokê) a partir do words.json.
uso: python3 captions_ass.py palavras.words.json saida.ass [LxA=1080x1920] [cor_destaque=#FFB800] [fonte=Inter]
Queima no vídeo: ffmpeg -i video.mp4 -vf "ass=saida.ass:fontsdir=<pasta com a fonte .ttf/.otf>" -c:a copy final.mp4
(libass NÃO lê .woff2: use a fonte em .ttf/.otf, ex. Inter ou Poppins Bold do Google Fonts)
Regras: blocos de até 3 palavras / 14 caracteres, CAIXA ALTA, contorno grosso, palavra ativa na cor de destaque e
108%, pop 82→100% no início de cada bloco. Não coloque legenda por cima de card de tela cheia (corte o trecho do json)."""
import sys, json
W = json.load(open(sys.argv[1], encoding="utf-8")); out = sys.argv[2]
res = sys.argv[3] if len(sys.argv) > 3 else "1080x1920"; RW, RH = map(int, res.split("x"))
hexc = (sys.argv[4] if len(sys.argv) > 4 else "#FFB800").lstrip("#"); font = sys.argv[5] if len(sys.argv) > 5 else "Inter"
ass_col = f"&H00{hexc[4:6]}{hexc[2:4]}{hexc[0:2]}"  # ASS é BGR
vertical = RH > RW
size = int(RH * (0.044 if vertical else 0.06)); marginv = int(RH * (0.21 if vertical else 0.08))
def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"
# agrupa em blocos
blocks, cur = [], []
for w in W:
    txt = w[2].strip().upper()
    if not txt: continue
    fim_frase = cur and cur[-1][2][-1] in ".?!:;,"
    if cur and (fim_frase or len(cur) >= 3 or len(" ".join(x[2] for x in cur)) + len(txt) > 14 or w[0] - cur[-1][1] > 0.6):
        blocks.append(cur); cur = []
    cur.append([w[0], w[1], txt])
if cur: blocks.append(cur)
head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {RW}
PlayResY: {RH}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{font},{size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,{max(4,size//12)},2,2,60,60,{marginv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines = []
for bi, b in enumerate(blocks):
    end_block = blocks[bi + 1][0][0] if bi + 1 < len(blocks) else b[-1][1] + 0.4
    end_block = min(end_block, b[-1][1] + 0.8)
    for wi, w in enumerate(b):
        a = w[0]; e = b[wi + 1][0] if wi + 1 < len(b) else end_block
        parts = []
        for k, x in enumerate(b):
            if k == wi: parts.append(r"{\c" + ass_col + r"&\fscx108\fscy108}" + x[2] + r"{\c&H00FFFFFF&\fscx100\fscy100}")
            else: parts.append(x[2])
        pop = r"{\fscx82\fscy82\t(0,90,\fscx100\fscy100)}" if wi == 0 else ""
        lines.append(f"Dialogue: 0,{ts(a)},{ts(e)},Cap,,0,0,0,,{pop}{' '.join(parts)}")
open(out, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
print(f"ok: {out} | {len(blocks)} blocos | {len(lines)} eventos")
