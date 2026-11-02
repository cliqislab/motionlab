# Requisitos e custos

## Computador

| Item | Mínimo | Recomendado |
|---|---|---|
| Sistema | macOS 13 ou Windows 10 (versão 1809+) **x64** | macOS 14+ ou Windows 11 x64 |
| Memória (RAM) | 8 GB | 16 GB |
| Espaço livre | 3 GB | 10 GB (cada vídeo exportado ocupa de 10 a 60 MB, e os rascunhos mais um pouco) |
| Internet | necessária na instalação e para narração | — |

Status atual: testado em macOS (Apple Silicon). Windows: suportado no código, **ainda não testado em máquina real**.
Windows em processador ARM (Snapdragon, Surface Pro X) **não é suportado**: o motor de render do Remotion só existe para Windows x64.

## Programas que você instala (uma vez)

| Programa | Para quê | Obrigatório? | Onde baixar |
|---|---|---|---|
| Node.js 18.18+ (LTS) | roda o kit e a animação | sim | https://nodejs.org |
| Python 3.9+ | trilha, efeitos sonoros e narração | sim | https://www.python.org/downloads/ |
| FFmpeg | junta áudio e vídeo | sim | macOS: `brew install ffmpeg` · Windows: `winget install --id Gyan.FFmpeg -e` |
| Claude Code | criar vídeos conversando | recomendado | https://docs.claude.com/en/docs/claude-code/setup |

O `npm run setup` instala o resto **dentro da pasta do kit** (bibliotecas de animação, navegador de render
do Remotion de ~100 MB e o ambiente Python `.venv`).

## Custos externos

| Serviço | Custo | Observação |
|---|---|---|
| MotionLab Kit | o valor que você pagou | pagamento único |
| Claude Code | **exige assinatura paga** do Claude (Pro, Max, Team, Enterprise) ou conta de API (Console) | o plano gratuito do claude.ai não inclui o Claude Code. Preços em https://www.anthropic.com/pricing |
| Remotion (motor de animação) | **gratuito** para pessoa física e empresas com até 3 pessoas | empresas com 4 ou mais pessoas precisam comprar a Company License: https://www.remotion.dev/docs/license |
| Gemini TTS (voz Fenrir) | opcional. Há um nível gratuito com limites; no pago, cerca de US$ 0,004 a cada 10 s de áudio no Gemini 3.8 Flash TTS (preço válido até 31/12/2026; dobra a partir de 01/01/2027) | preços atualizados: https://ai.google.dev/gemini-api/docs/pricing |
| Voz gratuita de teste (edge-tts) | grátis | uso comercial não garantido (veja LICENCAS.md) |
| Trilha e efeitos sonoros | grátis | gerados por código no seu computador |

Sem chave Gemini e sem gastar nada além do Claude Code, você cria e exporta vídeos completos com trilha e efeitos.

## Tempo de render (referência)

Vídeo vertical de 33 s (1080×1920): cerca de **2,5 minutos** em um Mac com Apple Silicon.
Computadores mais simples podem levar de 5 a 15 minutos.
