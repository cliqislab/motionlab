"""Narração gratuita (edge-tts, voz neural da Microsoft, precisa de internet, sem chave).
uso: python tts.py roteiro.txt saida.wav [voz]
Vozes: pt-BR-AntonioNeural (padrão, masculina) ou pt-BR-FranciscaNeural (feminina).
Use como voz de rascunho/teste: o edge-tts não é um serviço oficial com licença comercial definida
(veja LICENCAS.md). Para voz de uso comercial, use tts_gemini.py.
SEMPRE transcreva o resultado depois (words.py) e confira com o roteiro."""
import sys, os, subprocess, asyncio

txt_path, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "pt-BR-AntonioNeural"
TXT = open(txt_path, encoding="utf-8").read()
try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts não instalado. Rode 'npm run setup' de novo.")
mp3 = out + ".mp3"
asyncio.run(edge_tts.Communicate(TXT, voice, rate="+8%").save(mp3))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, out], check=True)
os.remove(mp3)
print("ok:", out)
