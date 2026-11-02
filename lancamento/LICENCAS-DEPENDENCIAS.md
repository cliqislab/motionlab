# Revisão de licenças das dependências (interno, não vai no ZIP)

Levantamento feito em 2026-11-02 a partir do `package-lock.json` (263 pacotes npm) e do `.venv` (pacotes Python instalados
pelo `npm run setup`). **Não é parecer jurídico.** Os itens marcados como "confirmar" precisam de validação de advogado
ou do titular antes da venda.

## O que vai dentro do ZIP

Só código e documentos próprios (85 arquivos, ~0,3 MB): `tools/`, `scripts/`, `templates/`, `exemplos/`, `docs/img/`
(imagens geradas pelo próprio kit a partir do exemplo fictício e uma captura de tela do Remotion Studio), documentos e a skill.
**Nenhuma biblioteca de terceiros, fonte, modelo, binário ou mídia de cliente é redistribuída.** O comprador baixa as
dependências das fontes oficiais (npm, PyPI, Hugging Face, servidores do Remotion) ao rodar o `npm run setup`.

Pontos sobre o conteúdo próprio:
- `templates/neon/src/fx.tsx` e `scripts/*.py` vieram da skill `motion-video`, que o vendedor declarou ter criado com um prompt. **Confirmar:** a titularidade desse código e se algum trecho foi copiado de terceiros (ex.: exemplos de documentação).
- `docs/img/remotion-studio.jpg` é uma captura de tela da interface do Remotion Studio. Uso ilustrativo em tutorial costuma ser aceitável, mas **confirmar** que isso não conflita com os termos da Remotion.

## npm (baixado pelo comprador)

| Licença | Pacotes | Situação |
|---|---|---|
| MIT, ISC, BSD-2/3, Apache-2.0, 0BSD | ~240 | permissivas, sem pendência |
| **Remotion License** | `remotion`, `@remotion/cli`, `@remotion/bundler`, `@remotion/renderer`, `@remotion/player`, `@remotion/web-renderer`, `@remotion/canvas`, `@remotion/studio-protocol`, `@remotion/media-parser` | **confirmar** (ver abaixo) |
| sem campo de licença no pacote | `@remotion/media`, `@remotion/compositor-*` (binários de render, incluem bibliotecas do FFmpeg) | parte do Remotion; **confirmar** que seguem a Remotion License e a licença do FFmpeg embutido |
| MPL-2.0 | `mediabunny`, `@mediabunny/aac-encoder`, `@mediabunny/flac-encoder`, `@mediabunny/mp3-encoder` | copyleft fraco por arquivo; sem obrigação enquanto não modificar e redistribuir esses arquivos |
| OFL-1.1 | `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` | livre, inclusive em vídeos comerciais |
| CC-BY-4.0 | `caniuse-lite` (dados de navegador, só na hora de empacotar) | sem impacto no produto |
| Unlicense / Python-2.0 | `memfs`, `fs-monkey`, `argparse` | permissivas |

### Remotion: o ponto principal

- A Remotion License é gratuita para pessoa física e empresas com até 3 pessoas; acima disso exige a Company License (https://www.remotion.dev/docs/license).
- **Confirmar com a Remotion ou um advogado:**
  1. Se vender um kit/template que depende do Remotion exige alguma licença do **vendedor**. Se a empresa vendedora tem 4 ou mais pessoas, ela mesma precisa da Company License para desenvolver e testar o kit.
  2. Se a forma como o kit avisa o comprador (REQUISITOS.md e LICENCAS.md) basta.
  3. Telemetria: versões recentes do Remotion podem reportar uso de render para licenciamento (https://www.remotion.dev/docs/telemetry). Descrever isso na política de privacidade do produto, se houver.

## Python (baixado pelo comprador)

| Licença | Pacotes | Situação |
|---|---|---|
| MIT, BSD, Apache-2.0, PSF, ISC | numpy, faster-whisper, ctranslate2, onnxruntime, av, tokenizers, huggingface_hub e outros | permissivas |
| MIT-CMU (HPND) | pillow | permissiva |
| MPL-2.0 | certifi, tqdm (parte) | sem obrigação sem modificar e redistribuir |
| **LGPL-3.0** | edge-tts | biblioteca usada sem modificação e instalada pelo próprio comprador: ok. **O problema não é a licença do código, é o serviço** (ver abaixo) |

Modelos Whisper (`Systran/faster-whisper-small`/`medium`, baixados do Hugging Face na primeira narração): MIT.

## Serviços e programas externos

| Item | Pendência |
|---|---|
| **edge-tts (voz gratuita)** | usa o serviço de leitura em voz alta do Microsoft Edge por um caminho não oficial. **Não há autorização para uso comercial do áudio.** O kit apresenta essa voz como "teste/rascunho". **Decisão do vendedor:** manter assim, remover do produto ou trocar por outra opção gratuita com licença clara |
| Gemini TTS | termos do Google; no nível gratuito o conteúdo pode ser usado pelo Google para melhorar produtos (já avisado em CONFIGURAR-GEMINI.md). **Confirmar** as regras atuais sobre uso comercial do áudio gerado nos termos da Gemini API |
| FFmpeg (instalado pelo comprador) | builds do Homebrew e do Gyan podem incluir componentes GPL. O kit só executa o programa, não redistribui: sem pendência para o vendedor |
| Claude Code | exige assinatura paga; produto independente da Anthropic. "Claude" é marca da Anthropic: o nome "MotionLab Kit" evita a marca. **Confirmar** que o material de venda não sugere parceria e não usa logo da Anthropic |
| Nome "MotionLab" e "Nexa" | **confirmar** busca de marca no INPI antes de investir em anúncios. "Nexa" é usado só como exemplo fictício |

## Texto da licença do comprador (LICENCAS.md, seção 1)

Rascunho escrito sem revisão jurídica. **Bloqueio de lançamento:** advogado revisar, incluir titular (CNPJ/CPF), contato
de suporte, política de reembolso compatível com o CDC (direito de arrependimento de 7 dias para compra online) e
termos da plataforma de venda (Hotmart/Kiwify).
