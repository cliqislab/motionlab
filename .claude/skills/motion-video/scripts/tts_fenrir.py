"""Narração PT-BR com Gemini TTS, voz Fenrir (padrão do /motion). Gera 1 ou vários takes em paralelo.
uso: python3 tts_fenrir.py roteiro.txt saida.wav [--takes 3] [--model gemini-3.8-flash-tts] [--voice Fenrir]
- --takes N > 1 grava saida_a.wav, saida_b.wav, ... (compare com check_medium.py e escolha um).
- Tag de direção curta via TTS_TAG (direção longa é lida em voz alta). Pedir ritmo na tag é o jeito
  certo de ajustar duração; NUNCA acelere a voz com atempo depois.
- Às vezes o modelo lê a tag em voz alta no início: corte com os tempos do words.py.
Chave (só leitura, nunca copiada): GEMINI_API_KEY no ambiente, ou linha GEMINI_API_KEY=... num .env
da pasta atual ou de uma pasta acima, ou em <raiz do projeto>/saida7-bongas/.env."""
import sys, os, json, base64, subprocess, urllib.request, argparse, string
from concurrent.futures import ThreadPoolExecutor

ap = argparse.ArgumentParser()
ap.add_argument("roteiro")
ap.add_argument("saida")
ap.add_argument("--takes", type=int, default=1)
ap.add_argument("--model", default=None)
ap.add_argument("--voice", default="Fenrir")
a = ap.parse_args()

models = [a.model] if a.model else ["gemini-3.8-flash-tts", "gemini-2.5-pro-preview-tts", "gemini-2.5-flash-preview-tts"]
TXT = open(a.roteiro, encoding="utf-8").read().strip()
TAG = os.environ.get("TTS_TAG", "locutor comercial brasileiro, voz masculina segura, natural e persuasiva")
PROMPT = f"[{TAG}] " + " ".join(TXT.split())


def find_key():
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.abspath(os.path.join(here, "..", "..", "..", ".."))  # <raiz>/.claude/skills/motion-video/scripts
    cands, d = [], os.getcwd()
    while True:
        cands.append(os.path.join(d, ".env"))
        if os.path.dirname(d) == d:
            break
        d = os.path.dirname(d)
    cands.append(os.path.join(root, "saida7-bongas", ".env"))
    for envf in cands:
        if os.path.exists(envf):
            for line in open(envf):
                if line.strip().startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


key = find_key()
if not key:
    sys.exit("GEMINI_API_KEY ausente. Peça a chave à pessoa (não procure arquivos de credencial).")
body = {
    "contents": [{"parts": [{"text": PROMPT}]}],
    "generationConfig": {
        "responseModalities": ["AUDIO"],
        "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voice}}},
    },
}


def take(out):
    r = None
    for model in models:
        try:
            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                data=json.dumps(body).encode(),
                headers={"Content-Type": "application/json", "x-goog-api-key": key},
            )
            r = json.load(urllib.request.urlopen(req, timeout=300))
            break
        except Exception as e:
            print(f"{out}: {model} falhou: {e}")
    if r is None:
        return f"{out}: Gemini TTS indisponível"
    part = r["candidates"][0]["content"]["parts"][0]["inlineData"]
    rate = 24000
    mime = part.get("mimeType", "")
    if "rate=" in mime:
        rate = int(mime.split("rate=")[1].split(";")[0])
    open(out + ".pcm", "wb").write(base64.b64decode(part["data"]))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", out + ".pcm", out], check=True)
    os.remove(out + ".pcm")
    return f"ok: {out} (modelo {model}, voz {a.voice})"


if a.takes <= 1:
    outs = [a.saida]
else:
    stem, ext = os.path.splitext(a.saida)
    outs = [f"{stem}_{string.ascii_lowercase[i]}{ext or '.wav'}" for i in range(a.takes)]
with ThreadPoolExecutor(len(outs)) as ex:
    res = list(ex.map(take, outs))
print("\n".join(res))
if not any(r.startswith("ok") for r in res):
    sys.exit(1)
