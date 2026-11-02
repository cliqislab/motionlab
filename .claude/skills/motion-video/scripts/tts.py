"""Gera a narração a partir de um .txt.
uso: python3 tts.py roteiro.txt saida.wav [voz]
- Padrão (grátis, sem chave): edge-tts. Voz padrão pt-BR-AntonioNeural (alternativa pt-BR-FranciscaNeural).
- Se a variável GEMINI_API_KEY existir e a voz for de Gemini (ex.: Fenrir, Puck, Kore), usa Gemini TTS.
SEMPRE transcreva o resultado depois (words.py) e confira com o roteiro: TTS às vezes lê a direção ou repete trechos."""
import sys, os, json, base64, subprocess, urllib.request, asyncio
txt_path, out, voice = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else "pt-BR-AntonioNeural")
TXT = open(txt_path, encoding="utf-8").read()
GEMINI = {"Fenrir", "Puck", "Kore", "Charon", "Aoede", "Orus", "Zephyr", "Gacrux"}
if voice in GEMINI:
    key = os.environ["GEMINI_API_KEY"]
    direc = "[Estilo: criador de conteúdo tech enérgico revelando um segredo, rápido, sem pausas. Leia SOMENTE o texto abaixo.]\n\n"
    body = {"contents": [{"parts": [{"text": direc + TXT}]}], "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    for model in ["gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"]:
        try:
            req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=300)); break
        except Exception as e:
            print(model, "falhou:", e)
    else:
        sys.exit("Gemini TTS indisponível; rode sem voz Gemini pra usar edge-tts.")
    pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
    open(out + ".pcm", "wb").write(pcm)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", out + ".pcm", out], check=True)
    os.remove(out + ".pcm")
else:
    import edge_tts  # pip install edge-tts
    mp3 = out + ".mp3"
    asyncio.run(edge_tts.Communicate(TXT, voice, rate="+12%").save(mp3))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, out], check=True)
    os.remove(mp3)
print("ok:", out)
