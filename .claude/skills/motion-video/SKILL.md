---
name: motion-video
description: Estúdio de vídeo animado do MotionLab Kit. Use para QUALQUER pedido de vídeo, animação, comercial, apresentação de app/produto, Reels/Shorts/TikTok, vídeo explicativo, troca de cores/textos de um vídeo, prévia ou exportação MP4. Cria e edita projetos em videos/<nome>/ a partir do template neon (Remotion), gera trilha e efeitos sonoros por código, narração opcional (voz gratuita ou Gemini) e exporta MP4.
---

# MotionLab Kit — fluxo de criação de vídeo

Você produz o vídeo inteiro por código, dentro desta pasta do kit. A pessoa que pede normalmente NÃO sabe programar:
fale em português simples, sem jargão, e mostre o resultado (imagens de prévia) em vez de descrever código.

## Regras fixas
- Trabalhe só em `videos/<nome>/`. Não altere `templates/`, `tools/`, `scripts/` nem os documentos do kit, a menos que a pessoa peça explicitamente.
- Nunca leia, mostre ou copie o conteúdo do arquivo `.env` nem chaves de API. Para saber se há chave: `npm run doctor`.
- Nunca use logos, fotos ou nomes de marcas de terceiros sem a pessoa fornecer. Escreva nomes em texto.
- Não invente números como se fossem reais: dados de exemplo levam "ilustrativo" no texto, ou peça os dados à pessoa.
- Animação só com `useCurrentFrame()`/`useT()` + `interpolate`/`io` (CSS transition/animation não renderiza).

## Comandos disponíveis (rode na raiz do kit)
| Comando | Faz |
|---|---|
| `npm run templates` | lista templates (hoje só `neon` está pronto) |
| `npm run novo -- <nome> [--formato 9:16] [--de exemplos/nexa-app]` | cria `videos/<nome>/` a partir do template |
| `npm run checar -- <nome>` | valida o `conteudo.json` e mostra a linha do tempo |
| `npm run previa -- <nome> --segundo 4.5` | gera `saida/quadro_4.5.jpg` (uma imagem daquele instante) |
| `npm run previa -- <nome>` | rascunho rápido `saida/previa.mp4` + folha de imagens `saida/previa.jpg` |
| `npm run preview -- <nome>` | abre o Remotion Studio no navegador da PESSOA (prévia ao vivo; o comando fica rodando até Ctrl+C) |
| `npm run narrar -- <nome> [--voz Fenrir\|gratis]` | `roteiro.txt` vira `audio/narr.wav` + `audio/palavras.json` (tempo de cada palavra) |
| `npm run render -- <nome> [--qualidade alta\|normal\|leve]` | MP4 final em `videos/<nome>/saida/<nome>.mp4` |
| `npm run demo` | recria e exporta o exemplo Nexa App |
| `npm run doctor` | diagnóstico da instalação |

Nome de vídeo: minúsculas, números e hífen (`lancamento-app`).

## Fluxo padrão (pedido de vídeo novo)
1. **Entender** (no máximo 1 pergunta, só se faltar algo essencial): o que é o produto/assunto, público, rede (Instagram/TikTok = `9:16`, YouTube = `16:9`, feed = `4:5` ou `1:1`), duração (padrão 30 s), cor de destaque, chamada final. Se a pessoa não souber, decida e diga o que decidiu.
2. **Roteiro em cenas** (mostre em lista curta antes de montar, sem pedir aprovação se a pessoa já foi clara): gancho nos 2 primeiros segundos, problema, solução, prova/benefício, chamada final. 6 a 9 cenas para 30 s. Frases curtas (até ~25 caracteres por linha de título).
3. **Criar**: `npm run novo -- <nome> --formato <f>` e reescreva `videos/<nome>/conteudo.json` (formato abaixo).
4. **Validar**: `npm run checar -- <nome>` até não ter erro.
5. **Revisar olhando**: `npm run previa -- <nome>` e LEIA `videos/<nome>/saida/previa.jpg` com a ferramenta de leitura de imagem. Confira: texto cortado ou estourando a largura, cena vazia, elementos pequenos demais, sobreposição, cor sem contraste. Corrija e repita (1 a 2 passadas).
6. **Entregar a prévia**: diga onde está `saida/previa.mp4` e ofereça `npm run preview -- <nome>` (abre no navegador) ou o render final.
7. **Exportar** quando a pessoa pedir ou aprovar: `npm run render -- <nome>`. Informe o caminho do MP4, duração e tamanho.

## conteudo.json (template neon)
```json
{
  "titulo": "Nome interno",
  "template": "neon",
  "formato": "9:16",
  "cores": { "destaque": "#7C5CFF", "fundo": "#09090A", "texto": "#F4F4F1" },
  "narracao": { "ativa": false },
  "musica": { "ativa": true, "bpm": 124 },
  "efeitos": { "hud": false, "grao": true, "grade": true },
  "cenas": [ ... ]
}
```
Texto entre `*asteriscos*` fica na cor de destaque (vale em qualquer texto de cena). Cada cena aceita `duracao` (s) e `impacto: true` (tremida + glitch + flash + som grave; use em 1 a 3 cenas no máximo).

| tipo | campos |
|---|---|
| `titulo` | `linhas: [{texto, modo?: up\|type\|expand\|pop\|slam, tamanho?: g\|m\|p, cor?: "cinza"}]` (1 a 4 linhas) |
| `chips` | `titulo?`, `itens: [texto]`, `riscar?: [índices]` |
| `app` | `nome`, `titulo?`, `legenda?`, `valor?: {rotulo, numero, prefixo?, sufixo?, casas?}`, `itens?: [{texto, detalhe?, feito?}]` (até 4), `grafico?: [números]` |
| `grafico` | `titulo?`, `barras: [{rotulo, valor}]` (3 a 6), `destaque?: índice`, `prefixo?`, `sufixo?`, `casas?` |
| `numero` | `de?`, `ate`, `prefixo?`, `sufixo?`, `casas?`, `legenda?` |
| `codigo` | `titulo?`, `arquivo?`, `linhas: [texto]` ou `[[azul, destaque, branco]]` |
| `comparacao` | `titulo?`, `antes: [texto]`, `depois: [texto]`, `rotuloAntes?`, `rotuloDepois?` |
| `imagem` | `arquivo` (em `videos/<nome>/public/imagens/`), `legenda?`, `ajuste?: "conter"` |
| `cta` | `texto`, `subtexto?`, `botao?` |
| `custom` | `componente` (nome registrado em `src/custom.tsx`) + campos livres |

Durações padrão: titulo 3, chips 3.6, app 5.5, grafico 4.5, numero 3.4, codigo 4.5, comparacao 5.5, imagem 3.5, cta 4. O vídeo termina ~1 s depois da última cena (`"cauda"` muda isso).

## Pedidos comuns
- **"Use o template neon"**: é o único pronto; diga isso se pedirem outro e ofereça adaptar cores do neon.
- **"Altere as cores"**: `cores.destaque` (e `fundo`/`texto` se pedirem). Prefira cores saturadas sobre fundo escuro.
- **"Altere os textos"**: edite os campos das cenas; rode `checar` e uma `previa --segundo` da cena mudada.
- **"Use minha imagem/logo"**: peça o arquivo, copie para `videos/<nome>/public/imagens/` e use uma cena `imagem`.
- **"Gere uma prévia"**: `npm run previa -- <nome>` (e leia o JPG). Para a pessoa ver em movimento: `npm run preview -- <nome>`.
- **"Exporte"**: `npm run render -- <nome>`; para arquivo menor `--qualidade leve`.
- **Algo que os tipos não fazem** (ex.: mapa, linha do tempo, logo animado): crie um componente em `videos/<nome>/src/custom.tsx`, registre em `CUSTOM` e use `{"tipo": "custom", "componente": "Nome"}`. Use os utilitários de `src/fx.tsx` (`KT`, `Chip`, `Panel`, `CodeBlock`, `useT`, `io`) e as cores `C` de `src/brand.ts`. Rode `npx tsc --noEmit -p .` até zerar erro.

## Narração (opcional)
1. Escreva o texto em `videos/<nome>/roteiro.txt` (~75 palavras para 30 s). Mostre à pessoa.
2. `npm run narrar -- <nome>` (usa Gemini Fenrir se houver chave; senão a voz gratuita de teste). A primeira vez baixa o modelo de transcrição.
3. Leia `videos/<nome>/audio/palavras.json` (`[início, fim, palavra]` em segundos).
4. Sincronize: em cada cena ponha `"inicio"` = tempo da primeira palavra da frase dela (a 1ª cena começa em 0) e, se quiser que cada elemento entre na palavra falada, `"tempos": [s1, s2, ...]` (um por elemento: linha, chip, barra, item...). A última cena deve ter `duracao` que cubra a última palavra + 0.8 s.
5. `npm run checar`, `npm run previa`, `npm run render`. A trilha abaixa sozinha quando a voz fala.

## Limites atuais (diga com honestidade se pedirem)
- Só o template `neon` está pronto. Outros estilos exigem `custom` ou um template novo.
- Não edita vídeo gravado pelo kit (corte de silêncio e legenda existem como scripts avançados em `scripts/cut_silence.py` e `scripts/captions_ass.py`, sem comando npm nem tutorial).
- Não baixa música, fotos ou ícones da internet; trilha e efeitos são gerados por código.
- Não analisa sites/Instagram automaticamente.
