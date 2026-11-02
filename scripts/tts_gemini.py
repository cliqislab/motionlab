"""Narração com Gemini TTS (voz padrão Fenrir). Precisa de GEMINI_API_KEY (veja CONFIGURAR-GEMINI.md).
uso: python tts_gemini.py roteiro.txt saida.wav [--takes 3] [--model gemini-3.8-flash-tts] [--voice Fenrir]
- --takes N > 1 grava saida_a.wav, saida_b.wav, ... (compare com check_medium.py e escolha um).
- Os modelos Gemini 3.8 TTS leem o texto ao pé da letra: não coloque instruções de estilo no roteiro.
  Use TTS_TAG="..." só com modelos antigos (2.5/3.1), que aceitam direção entre colchetes.
- A chave nunca é exibida em mensagens. Custos: veja REQUISITOS.md."""
import sys, os, json, base64, subprocess, urllib.request, urllib.error, argparse, string
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _chave import ler_chave, ocultar

ap = argparse.ArgumentParser()
ap.add_argument("roteiro")
ap.add_argument("saida")
ap.add_argument("--takes", type=int, default=1)
ap.add_argument("--model", default=None)
ap.add_argument("--voice", default=os.environ.get("TTS_VOZ", "Fenrir"))
a = ap.parse_args()

models = [a.model] if a.model else ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts", "gemini-2.5-pro-preview-tts"]
TXT = " ".join(open(a.roteiro, encoding="utf-8").read().split())
TAG = os.environ.get("TTS_TAG", "").strip()

key = ler_chave()
if not key:
    sys.exit("GEMINI_API_KEY não configurada. Rode 'npm run chave' ou use a voz gratuita (tts.py). Veja CONFIGURAR-GEMINI.md.")


def corpo(model):
    texto = TXT if (not TAG or "3.8" in model) else f"[{TAG}] {TXT}"
    return {
        "contents": [{"parts": [{"text": texto}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voice}}},
        },
    }


def take(out):
    r, usado = None, None
    for model in models:
        try:
            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                data=json.dumps(corpo(model)).encode(),
                headers={"Content-Type": "application/json", "x-goog-api-key": key},
            )
            r = json.load(urllib.request.urlopen(req, timeout=300))
            usado = model
            break
        except urllib.error.HTTPError as e:
            detalhe = ""
            try:
                detalhe = json.load(e).get("error", {}).get("message", "")
            except Exception:
                pass
            print(ocultar(f"{out}: {model} falhou (HTTP {e.code}) {detalhe}", key))
        except Exception as e:
            print(ocultar(f"{out}: {model} falhou: {e}", key))
    if r is None:
        return f"{out}: Gemini TTS indisponível"
    part = r["candidates"][0]["content"]["parts"][0]["inlineData"]
    data = base64.b64decode(part["data"])
    mime = part.get("mimeType", "")
    if data[:4] == b"RIFF" or "wav" in mime:
        tmp = out + ".src.wav"
        open(tmp, "wb").write(data)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, out], check=True)
        os.remove(tmp)
    else:  # PCM cru (modelos antigos)
        rate = int(mime.split("rate=")[1].split(";")[0]) if "rate=" in mime else 24000
        open(out + ".pcm", "wb").write(data)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", out + ".pcm", out], check=True)
        os.remove(out + ".pcm")
    return f"ok: {out} (modelo {usado}, voz {a.voice})"


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
