"""Leitura segura da chave Gemini.
Ordem: variável de ambiente GEMINI_API_KEY; depois o arquivo .env na raiz do MotionLab Kit.
A chave nunca é impressa. Use ocultar() em qualquer mensagem de erro que possa conter a chave."""
import os

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def ler_chave():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    env = os.path.join(RAIZ, ".env")
    if os.path.exists(env):
        with open(env, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    return None


def ocultar(texto, key):
    texto = str(texto)
    return texto.replace(key, "***") if key else texto
