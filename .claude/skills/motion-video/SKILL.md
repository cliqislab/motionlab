---
name: motion-video
description: Estúdio de vídeo por código (comando principal /motion). Aceita URL de Instagram ou website e analisa a marca (identidade, produtos, serviços, comunicação) num briefing reutilizável. (A) Cria do zero vídeo de MOTION DESIGN narrado com Brag (concepção e direção criativa) + Motionmaxxing (composição, movimento, transições e avaliação visual com gates) + Remotion/HyperFrames (animação e render) + Gemini TTS voz Fenrir (narração PT-BR) + faster-whisper (sincronia) + ffmpeg. (B) Edita vídeo GRAVADO da pessoa (corta silêncio, legenda animada, overlays, música). Use para qualquer pedido de vídeo animado, comercial, explicativo, reels/shorts, ou edição de gravação.
---

# Motion Video (kinetic typography narrado, só código)

> **MotionLab comercial — compatibilidade:** o comando público é `/motion` (arquivo `.claude/skills/motion/SKILL.md`). A skill `motion-video` coordena o fluxo. O Brag original é um plugin externo **não incluído** no arquivo enviado: se `~/.claude/plugins/marketplaces/brag/skills/brag/SKILL.md` não existir, produza `brag-plan.md` com os mesmos campos descritos abaixo (inspeção da marca, tom, gancho, mensagem única, storyboard) usando as referências do Motionmaxxing. Não falhe e não afirme ter executado Brag. Use Remotion por padrão; o runtime GSAP/HyperFrames e os vendors 3D não acompanham esta edição comercial até a verificação da licença e instalação separada. Para 3D, faça uma composição equivalente no Remotion ou apresente a limitação ao usuário. Veja `INTEGRACAO-MOTIONLAB.md`.


Você produz SOZINHO, do roteiro ao MP4, um vídeo de motion design narrado. Nada de After Effects, banco de vídeo ou gravação. Tudo o que precisa está nesta pasta:

- `template/` projeto Remotion pronto (copie pra pasta de trabalho). Já tem: `src/fx.tsx` (texto cinético, câmera 3D, risco, chip, janela, bloco de código digitado, HUD, shake/glitch/flash/grão), `src/brand.ts` (paleta, fontes, easings), `src/Composition.tsx`, `src/scenes.tsx` (esqueleto de demo) e `src/events.json` (FONTE ÚNICA de tempo).
- `scripts/` `setup_assets.py` (fontes + grão), `tts.py` (narração), `master_voice.sh`, `words.py` (timestamps por palavra), `score.py` (trilha + SFX sintetizados lendo o events.json), `mix.sh` (mix com ducking), `sheet.py` (folha de contato pra revisar).
- `examples/scenes_exemplo_claude.tsx` vídeo completo de referência (14 cenas, 52s, tema "motion graphics sem After Effects"): prompt digitando com preview ao vivo, cards de matemática animados, fluxograma antigo x novo, painel de parâmetros, meta "esse vídeo foi feito assim". COPIE padrões de lá.

## Fluxo integrado do /motion (padrão do caminho A, automático)
Ao rodar `/motion` para criar vídeo, use as quatro camadas abaixo SEM a pessoa pedir. Esta skill continua sendo o fluxo e o único comando principal; Brag e Motionmaxxing entram como referências lidas por você, não como pipelines paralelos. Não renderize um segundo vídeo pelo pipeline próprio do Brag nem do Motionmaxxing.

`MM` = `.claude/skills/motionmaxxing` (raiz do projeto). `BRAG` = `~/.claude/plugins/marketplaces/brag/skills/brag`. `P` = `.venv/bin/python` da raiz (tem faster-whisper e numpy).

| Camada | Ferramenta | O que entrega |
|---|---|---|
| Análise de marca por URL (só quando o pedido tem URL) | **`scripts/brand_url.mjs`** (usa `MM/scripts/brand.mjs` e `_cdp.mjs`) | `marcas/<slug>/BRIEFING.md` + `briefing.json` (reutilizável), imagens e identidade capturadas |
| Concepção e direção criativa | **Brag**: leia `BRAG/SKILL.md` seções "Step 1: Inspect the project", "Step 2: Plan and storyboard", "Tone system" e "Creative laws" (ignore o dispatch pro brag-slim e o Step 3/4 de render HyperFrames, e o limite de 25s e a voz dele) | `brag-plan.md`: inspeção do material/marca, tom (`cinematic`, `app-store`...), gancho nos 2s, mensagem única, plano de cenas |
| Composição, movimento, transições e crítica | **Motionmaxxing**: leia `MM/SKILL.md` e, antes da 1ª ideia, `MM/references/judgment.md`, `idea.md`, `director.md`; ao montar, `motion.md`, `transitions.md`, `type.md`, `layout.md`, `world.md`, `close.md` (e `ui-demo.md` se tiver interface); na revisão, `slop.md`; sempre `MM/taste/verdicts.md` e `edits.md` | `STORYBOARD.md` com PAGE, inventário da marca, 3 ideias de tipos diferentes e a escolhida, mundo (chão, luz, profundidade, textura) por ato, momento herói, tabela de beats (papel, **"Buys: o espectador ___"**, copy, o que move, entrada/saída, handoff, frames). Lista **Never ship** e **Craft laws** viram regra de montagem |
| Animação e render | **Remotion** (`template/`, padrão) ou **HyperFrames / runtime GSAP do Motionmaxxing** (`MM/runtime`, `MM/templates/film.html`, `MM/scripts/render.mjs`) quando o herói pedir 3D (`hero3d`), shader ou bloco do registry | MP4 1080p/30fps |
| Narração PT-BR | **Gemini TTS, voz Fenrir** (`scripts/tts_fenrir.py`). NUNCA ElevenLabs: não rode `voice.py vo/sfx/music` do Motionmaxxing; a seção 9 de `MM/references/sound-sync.md` (sem ElevenLabs) vale, com Fenrir no lugar da voz | takes WAV, escolhido o mais fiel |
| Sincronia | **faster-whisper** (`words.py` + `align.py` + `check_medium.py` + `check_sync.py`), ponte pro `MM/scripts/sync.mjs` via `scripts/mm_bridge.py words` | `narr.script_words.json`, `beats.json`, `events.json` |
| Avaliação visual | **Motionmaxxing gates** G0-G5: `MM/scripts/look.py` no MP4 (com `mm_bridge.py events` pros cortes exatos); `MM/scripts/lint.mjs` só em build HTML/HyperFrames; G1, G4 (e G5 no Remotion) por olho na folha | `NOTE.md` com os números citados do script |

Ordem (com portão de aprovação):
0. **Só se o pedido trouxer URL** (Instagram ou site; ex.: `/motion Crie um comercial de 30 segundos para https://www.instagram.com/alphamec_sp/`). Sem URL, pule direto pro passo 1, como sempre foi.
   - `node scripts/brand_url.mjs <url>`: detecta Instagram ou site sozinho. Instagram é lido como visitante deslogado (bio, link, destaques, posts visíveis) ou pela Graph API oficial se a pessoa tiver `IG_ACCESS_TOKEN` + `IG_USER_ID`. Nunca faça login, nunca use API privada nem contorne bloqueio. O site do link da bio é verificado (link de volta pro perfil) e lido: identidade visual pelo `brand.mjs` (cores, fontes, logo, `board.png`, screens, media), mais produtos/serviços, frases, CTAs, provas, contato e JSON-LD de até 5 subpáginas. Grava em `marcas/<slug>/` e **reaproveita** se já existir (`--refresh` refaz). Rode um por vez: o `brand.mjs` tem limite de 180s.
   - Instagram bloqueado ou sem link na bio: o script diz `bloqueado`/`nao_encontrado`. Procure o site oficial com WebSearch (nome + cidade + "site oficial", CNPJ, Google Business) e rode de novo com `--site URL`. Ele confere se o site aponta pro perfil (`link_reciproco`) ou cita o nome (`nome_no_site`). `nao_verificado` = não usar sem a pessoa confirmar. Se nada for acessível, diga o que faltou e peça o material; não invente.
   - Leia `BRIEFING.md`, OLHE `site/board.png`, `instagram/perfil.png` e as imagens. Os candidatos a produto são linhas cruas (podem ser clientes, posts de blog, menus): classifique você. Preencha "Leitura estratégica" marcando cada item como FATO (com fonte) ou INFERÊNCIA. Lacunas e CONFLITOS listados (ex.: "15 anos" no Instagram e "8 anos" no site) não entram no roteiro sem a pessoa confirmar.
   - Imagens: só material público da própria marca (site e perfil oficiais), para a peça dessa marca. Não use pessoas identificáveis, logos de parceiros/clientes nem fotos de terceiros sem confirmação. Copie pra pasta da produção o que for usar; `marcas/` é a fonte, não se edita durante a produção.
   - O briefing alimenta o resto: inventário da marca do Motionmaxxing (passo 1 do `MM/SKILL.md`, sem rodar `brand.mjs` de novo), Step 1 do Brag (o "projeto" inspecionado é o briefing), `brand.ts`/`events.json` (cores e fontes reais), roteiro (frases, produtos e provas reais, CTA e contato reais) e o `NOTE.md` (o que é real, com fonte).
1. Brag: inspeção + `brag-plan.md`. Motionmaxxing passos 1-4: inventário, PAGE, 3 ideias, `STORYBOARD.md` com G1/G3/G4 checados no papel.
2. Roteiro na voz da marca (seção 1 como base, cortado pela metade; ~2.5-3 palavras/s; uma linha por beat).
3. **Mostre roteiro + storyboard + prévias (stills do beat herói) e espere aprovação.** Depois de aprovado, rode tudo (voz, animação, som, render, validação) sem pedir aprovações intermediárias.
4. Seções 2, 4, 5 e 6 desta skill, com as regras do Motionmaxxing e a revisão por gates.
5. Entrega com README + `NOTE.md`.

Precedência quando divergirem: pedido da pessoa e identidade real da marca/app > Never ship + Craft laws do Motionmaxxing > estilo padrão da seção 3 desta skill. O estilo neon da seção 3 (HUD, `slam` 3x, glitch em tudo, headline digitada) só vale como está se a pessoa pedir esse visual; senão use as ferramentas do `fx.tsx` respeitando o Motionmaxxing (ex.: digitação só dentro de input da própria UI, sem HUD/contadores/labels em caixa alta nos cantos, entrada desacelerando de oversize, um herói por frame, corte em movimento, fim curto ≤1.4s parado).

Projeto organizado: cada vídeo novo numa pasta própria (`saidaN-<nome>/`). Nunca altere pastas `saida*` anteriores nem os vídeos já entregues; copie dali o que precisar.

## Qual caminho
- **A) Vídeo do zero** (animação narrada, sem gravar): fluxo integrado acima + seções 0 a 6 abaixo.
- **B) Editar vídeo gravado** da pessoa (talking head, tela, podcast): seção 7.
- Se a pessoa mandar uma **referência** (link ou arquivo de vídeo que quer imitar), primeiro assista com a skill `/watch` e anote composição, ritmo de corte, paleta, tipografia, movimento e som. Depois reproduza esse estilo.
- **Marca da pessoa:** pergunte cores, fonte e logo (se tiver) e troque em `src/brand.ts` / `events.json` (`accent`). O estilo escuro com neon é só o padrão; claro, colorido, minimalista ou corporativo funciona trocando os tokens.

Com URL, tema, marca, cores e oferta saem do briefing (passo 0 do fluxo integrado): não pergunte o que ele já respondeu. Não pergunte o que você consegue decidir. Pergunte só o que faltar do pedido: tema, formato (16:9 1920x1080 ou 9:16 1080x1920), idioma e cor de destaque. Se não disserem: 16:9, português do Brasil, laranja `#FF5A1F`, ~50s.

## 0. Preparar
1. Confira Node 18+, Python 3.9+, ffmpeg no PATH. Se faltar, diga o comando de instalação e espere.
2. `pip install edge-tts faster-whisper numpy pillow` (num venv se o sistema bloquear pip).
3. `cp -r <esta skill>/template ./motion-video && cd motion-video && npm install && python3 <skill>/scripts/setup_assets.py .`
4. `bash $MM/scripts/providers.sh` (Chrome, ffmpeg, HyperFrames, disco). Ignore o aviso de ElevenLabs ausente: a voz é Gemini Fenrir. Se `disk_low` ou <5 GB livres, avise antes do render.

## 1. Roteiro (~150 palavras, fórmula de retenção)
- 0-5s GANCHO IMPOSSÍVEL: "E se eu te dissesse que dá pra [RESULTADO] sem [MÉTODO ODIADO]?"
- 5-12s REVELAÇÃO: "E não, não tô falando de [ALTERNATIVA FRACA]. Tô falando de [SOLUÇÃO]."
- 12-20s MECÂNICA: "Em vez de perder horas [TAREFA], você só [AÇÃO SIMPLES]: [EXEMPLO CONCRETO]."
- 20-28s MINDBLOW: "Mas aqui é onde fica insano. Ele não faz só [BÁSICO]. Ele [VANTAGEM ESCONDIDA]."
- 28-40s COMPARAÇÃO: jeito antigo (passos chatos) x jeito novo (muda uma coisa e pronto).
- 40-43s META (opcional): "E esse vídeo que você tá vendo? Foi feito exatamente assim."
- 43-50s CONCLUSÃO HONESTA: "Isso vai acabar com [X]? Não. Mas ir de [A] pra [B] em minutos é simplesmente insano."
Frases curtas, tom de segredo revelado. Salve em `roteiro.txt`, mostre e siga.

## 2. Narração (padrão: Gemini Fenrir PT-BR)
- `$P scripts/tts_fenrir.py roteiro_tts.txt audio/take.wav --takes 3` → `take_a/b/c.wav` em paralelo. `roteiro_tts.txt` = roteiro com grafia fonética de nomes difíceis (ex.: "JRNET" → "Jota Erre Net"); o `roteiro.txt` aprovado continua sendo o texto de legenda/sincronia. Tag curta via `TTS_TAG="..."`; pra ajustar duração peça ritmo na tag (ex.: "locutor publicitário brasileiro, voz masculina confiante, ritmo ágil e natural"), nunca atempo.
- Conferência sem viés: `$P scripts/check_medium.py audio/take_*.wav` (whisper medium, sem prompt). Rejeite take que leu a tag, inventou palavra, trocou artigo ou perdeu entonação de pergunta. Corte a tag/silêncio inicial com `ffmpeg atrim` usando os tempos.
- `bash scripts/master_voice.sh narr_cut.wav narr.wav` (sem 3º argumento: atempo 1.0. **Não acelere a voz.** O argumento atempo continua existindo só se a pessoa pedir explicitamente).
- `$P scripts/words.py narr.wav "termos técnicos do tema"` e `$P scripts/align.py roteiro.txt narr.wav narr.words.json narr.script_words.json` (texto exato do roteiro nos tempos do whisper). Os tempos impressos (`segundo:palavra`) mandam em TODA a edição.
- Grade do Motionmaxxing: `$P scripts/mm_bridge.py words narr.script_words.json narr.mm.words.json && node $MM/scripts/sync.mjs narr.mm.words.json --fps 30 --lead 2 --out beats.json` (frame de cada palavra, texto entra 0-2 f antes de ser ouvido).
- Alternativas antigas preservadas: `python3 scripts/tts.py roteiro.txt narr_raw.wav [voz]` (edge-tts `pt-BR-AntonioNeural` grátis, ou voz Gemini pelo nome) quando a pessoa pedir outra voz ou não houver chave Gemini.

## 3. Estilo (padrão neon; ver precedência do Motionmaxxing no fluxo integrado)
- Fundo quase preto com grid que some nas bordas, vinheta, grão. Inter 900 caixa alta branco; palavra-chave na cor de destaque com glow (`*palavra*` no `KT`). Mono pra código/HUD.
- A PALAVRA É A CENA: nada de legenda comum. Cada palavra importante entra NO tempo em que é falada.
- Entradas do `KT`: `up` (sobe da máscara), `type` (digitação), `expand` (letter-spacing+blur), `pop` (overshoot), `slam` (3x→1x, só em palavra de impacto).
- Ritmo: 1 a 2 estímulos novos por segundo; corte seco a cada frase (uma cena por frase/ideia).
- Toda cena dentro de `<Camera a b cam={{rx, ry, z, x, y}} enter="zoom|left|right|down">`: drift 3D contínuo + entrada com motion blur. Varie a câmera entre cenas.
- Shake + glitch RGB + flash nas palavras de impacto (revelação, "insano", "NÃO", final), via `events.json`.
- UI: `Panel` (janela), `CodeBlock` (código digitado), `Chip` com `strike` (riscado em vermelho), fluxogramas com setas SVG que se desenham, preview que muda ao vivo, ícones em SVG simples.
- Não use logo/marca de terceiros: escreva os nomes em texto.

## 4. Montar as cenas (Remotion)
- Edite `src/events.json`: `width/height` (formato), `duration` (fala + VO + final curto: parado no fim 0.6-1.4s, G3), `vo` (0.4), `accent`, `hud` (padrão `false`; `true` só no estilo neon clássico pedido pela pessoa), `k` (âncoras palavra → tempo pro `check_sync.py`), `cuts` (início de cada cena), `shake`, `glitch`, `flash`, `music` e `sfx`. TODOS os tempos em segundos da NARRAÇÃO (os do words.py). O vídeo e o áudio leem o mesmo arquivo: nunca duplique tempo à mão.
- Reescreva `src/scenes.tsx`: cada cena é `[início, fim, Componente]`; dentro dela `useT()` dá o tempo da narração, então `at={1.26}` = "entra quando a palavra é dita em 1.26s". Use `io(t, a, b, de, para, easing)` pra qualquer animação.
- Regras: anime SÓ com `useCurrentFrame()`/`useT()` + `interpolate`/`io` (CSS transition/animation NÃO renderiza). Não use SVG feTurbulence (o grão já é PNG). Em 9:16 reduza tamanhos de fonte (~0.6x) e empilhe na vertical.
- `npx tsc --noEmit` até zerar erro.

## 5. Trilha + SFX
- No `events.json["music"]`: `drop` (revelação da solução: beat cheio entra), `lift` (jeito novo), `silences` (tempos que ganham ~0.4s de silêncio ANTES, ex.: o "NÃO."), `braams` (impactos graves), `final` (impacto final + acorde com cauda).
- No `events.json["sfx"]`: um efeito pra CADA elemento que entra: `type` (digitação, com `dur`), `blip` (card/chip/nó; `f` muda o tom), `zip` (quando risca), `ding` (confirmação), `whoosh`, `impact`, `glitch`. Cortes, shakes e glitches já ganham som automático.
- `python3 scripts/score.py src/events.json .` → `music_raw.wav` + `sfx.wav`
- `bash scripts/mix.sh narr.wav music_raw.wav sfx.wav public/mixed.wav <vo> <duration>`

## 6. Revisar e renderizar
- `npx remotion bundle --out-dir ../bundle` UMA vez. Depois ~20 stills dos momentos-chave: `npx remotion still ../bundle MotionVideo stills/s_<seg>.jpg --frame=<(seg+vo)*30> --scale=0.5` (rode de DENTRO do projeto; nunca still em loop sem bundle, estoura a RAM). `python3 scripts/sheet.py stills sheet.jpg` e OLHE: texto estourando a largura, sobreposição, cena vazia, palavra fora de sincronia. Corrija e rebundle.
- Render: `npx remotion render ../bundle MotionVideo out/video.mp4 --codec=h264 --crf=17 --concurrency=2` (~10 min por 50s em máquina modesta).
- Revisão final: `python3 scripts/sheet.py out/video.mp4 final.jpg 2` e olhe de novo. O instante exato de um corte pode sair vazio (é o whoosh), o resto não.
- **Gates do Motionmaxxing** (rascunho 540p e final): `$P scripts/mm_bridge.py events src/events.json out/video.mp4.events.json` e `python3 $MM/scripts/look.py out/video.mp4 --out look --expect <duração> --expect-audio`. Leia o bloco GATES (G0, G2, G3) e o AUDIO (LUFS, pico, cortes em hit); abra `look/sheet.jpg`, `mid.jpg`, `strips.jpg`; descreva cada frame da folha em uma frase; julgue G1 (texto de UI ≥0.04 H), G4 (um herói por frame) e, no Remotion, G5 (sem chrome: C1-C7, D1, P1, T1, V1-V5 de `MM/scripts/lint.mjs`) por olho. Build HTML/HyperFrames: `node $MM/scripts/lint.mjs index.html`. FAIL se corrige, não se justifica. Ordem de correção: quebrado/falso → ideia → conexões → hierarquia/escala → tempo → acabamento → som. 2-3 passadas honestas.
- Sincronia final: `$P scripts/check_sync.py out/video.mp4 src/events.json "termos"` (âncoras em `events.json["k"]`).
- Entregue: caminho do MP4, duração exata, tamanhos, checagens feitas, resumo cena a cena e onde mudar textos (scenes.tsx), cores (events.json accent / brand.ts) e tempos (events.json). Mais o `NOTE.md` do Motionmaxxing: a ideia e por quê, o que cada beat compra, o que é real e o que é ilustrativo, números G0-G5 citados do script, descrição dos frames, o que ainda melhoraria. Nunca certifique o filme como bom. Reação da pessoa entre versões: anexe em `MM/taste/verdicts.md`.

## 7. Editar vídeo GRAVADO (caminho B)
1. Entenda: `ffprobe` (resolução, fps, duração) e transcreva com `scripts/words.py video.mp4 "nomes e termos da pessoa"` (o `initial_prompt` evita nome próprio escrito errado).
2. Ache o que cortar: palavra errada na transcrição (corrige só na legenda), trecho repetido ou enrolado (corte pela faixa de tempo), trecho visualmente ruim (cubra com um card de motion mantendo o áudio).
3. Normalize: 1080x1920 (vertical) ou 1920x1080, 30fps, áudio 48k. Celular filmando tela: `vidstabdetect` + `vidstabtransform` (2 passes) + `unsharp`. Voz: `highpass,afftdn,acompressor`.
4. Corte os silêncios: `python3 scripts/cut_silence.py entrada.mp4 cortado.mp4` (VAD Silero; não use silencedetect).
5. Jump-zoom pra ritmo: em trechos longos, alterne escala 1.0 / 1.12 a cada ~3s (scale+crop no ffmpeg).
6. **Retranscreva o vídeo JÁ cortado** (`words.py cortado.mp4`) e use esses tempos dali pra frente.
7. Legenda animada: `python3 scripts/captions_ass.py cortado.words.json cap.ass 1080x1920 "#COR"` e queime com `ffmpeg -vf "ass=cap.ass:fontsdir=<pasta com .ttf>"` (libass não lê .woff2).
8. Overlays/cards cravados na palavra: renderize no Remotion com fundo transparente (`--codec=prores --prores-profile=4444` ou `png` sequence) ou use a skill `talking-head-recut` (HyperFrames), depois sobreponha com `overlay` no ffmpeg.
9. Música e SFX: `scripts/score.py` (configure `events.json`) + `scripts/mix.sh`. Monte em etapas (máx ~6 entradas por comando ffmpeg) pra não estourar a memória.
10. Revise com `scripts/sheet.py final.mp4 rev.jpg 2` e `python3 $MM/scripts/look.py final.mp4 --out look --expect <s> --expect-audio` (G0, G3, áudio) e entregue.

## 8. Skills parceiras (instaladas pelo `instalar.sh` / `instalar.ps1`)
Use quando ajudarem; esta skill é o fluxo, elas são as ferramentas especializadas:
| Skill | Quando usar |
|---|---|
| `brag` (plugin) | SEMPRE no caminho A: concepção e direção criativa (ver fluxo integrado) |
| `motionmaxxing` (`.claude/skills/motionmaxxing`) | SEMPRE no caminho A: composição, movimento, transições, crítica e gates; também revisa render de vídeo editado (caminho B) com `look.py` |
| `remotion-best-practices`, `remotion-create`, `remotion-render`, `remotion-captions` | API do Remotion, legendas nativas, render avançado |
| `hyperframes` (+ `hyperframes-core`, `-animation`, `-creative`, `-keyframes`, `-audio`, `-cli`, `-registry`) | motor alternativo em HTML/GSAP; bom pra cenas com efeitos prontos do registry (glitch, CRT, gráficos, mapas, terminal) |
| `motion-graphics`, `general-video` | peças curtas de motion (logo sting, lower-third, contagem de números, gráfico) e vídeos com várias cenas no HyperFrames |
| `talking-head-recut` | cards e overlays por cima de vídeo gravado |
| `media-use` | buscar/gerar música, SFX, ícones, imagens e voz quando a síntese daqui não bastar |
| `motion-design`, `kinetic-typography`, `animation-vocabulary` | princípios de timing/easing, técnicas de texto animado e o nome certo de cada efeito |
| `ffmpeg` | qualquer conversão, corte, compressão ou ajuste de mídia |
| `watch` | assistir referência e revisar o próprio render |
Se alguma não estiver instalada, siga sem ela (esta skill é autossuficiente) e diga como instalar: `npx skills add <repo> -g -a claude-code`.
