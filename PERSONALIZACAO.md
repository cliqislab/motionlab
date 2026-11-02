# Personalização

Tudo o que muda no vídeo fica em **um arquivo**: `videos/<nome-do-video>/conteudo.json`.
Você pode pedir as mudanças ao Claude Code ou editar o arquivo direto. Depois de editar, confira:

```
npm run checar -- nome-do-video
```

> **Regras do arquivo (formato JSON):** textos entre aspas `"..."`; itens separados por vírgula;
> **sem vírgula depois do último item** de uma lista `[...]` ou bloco `{...}`. Se errar, o `checar` avisa a linha.

---

## Formato

```json
"formato": "9:16"
```

| Valor | Tamanho | Onde usar |
|---|---|---|
| `9:16` | 1080×1920 | Reels, TikTok, Shorts, Stories |
| `16:9` | 1920×1080 | YouTube, apresentações |
| `1:1` | 1080×1080 | feed quadrado |
| `4:5` | 1080×1350 | feed do Instagram (ocupa mais tela) |

## Cores

```json
"cores": { "destaque": "#7C5CFF", "fundo": "#09090A", "texto": "#F4F4F1" }
```

- **destaque**: palavras entre `*asteriscos*`, botões, barras em destaque, brilhos.
- **fundo** e **texto**: opcionais. O template foi feito para fundo escuro; fundos claros diminuem o efeito neon.
- Código de cor: formato `#RRGGBB`. Pegue a cor da sua marca em sites como o seletor de cores do Google
  (pesquise "color picker").

Sugestões: laranja `#FF5A1F` · roxo `#7C5CFF` · verde-limão `#C6FF3D` · rosa `#FF3DA5` · azul `#3DA5FF` · amarelo `#FFC83D`.

## Textos e destaque

Em qualquer texto, `*palavra*` fica na cor de destaque. Vale para várias palavras: `*dois cliques*`.
Textos curtos funcionam melhor: até ~25 caracteres por linha de título.

## Música e efeitos

```json
"musica": { "ativa": true, "bpm": 124 },
"efeitosSonoros": true
```

- `"ativa": false` desliga a trilha. `bpm` muda a velocidade (100 = mais calma, 140 = mais agitada).
- `"efeitosSonoros": false` desliga whoosh, blip, digitação e impacto.
- `"audio": false` (na raiz do arquivo) deixa o vídeo totalmente mudo.

## Efeitos visuais

```json
"efeitos": { "hud": false, "grao": true, "grade": true }
```

`grao` = textura de filme · `grade` = quadriculado no fundo · `hud` = cantos e contador estilo interface.

---

## Cenas

`"cenas"` é a lista do que aparece, em ordem. Cada cena tem um `"tipo"`. Campos comuns a todas:

- `"duracao"`: segundos na tela (opcional; cada tipo tem um padrão).
- `"impacto": true`: tremida + glitch + flash + som grave. Use em 1 a 3 cenas (revelação, número forte, final).

### titulo
```json
{ "tipo": "titulo", "linhas": [
  { "texto": "Sua semana parece assim?", "modo": "type", "tamanho": "p", "cor": "cinza" },
  { "texto": "*47* tarefas", "modo": "pop" },
  { "texto": "e nenhuma pronta", "tamanho": "m" }
] }
```
- `modo`: `up` (sobe, padrão) · `type` (digitando) · `expand` (abre e desfoca) · `pop` (salta) · `slam` (bate na tela).
- `tamanho`: `g` grande (padrão na 1ª linha) · `m` médio · `p` pequeno. `cor: "cinza"` deixa a linha discreta e em minúsculas.

### chips (etiquetas)
```json
{ "tipo": "chips", "titulo": "Chega de", "itens": ["Post-its", "5 apps", "Planilha"], "riscar": [0, 1, 2] }
```
`riscar` = posições das etiquetas que levam risco vermelho (a primeira é 0).

### app (tela de celular)
```json
{ "tipo": "app", "nome": "Nexa", "titulo": "Seu dia em *1 tela*", "legenda": "texto menor opcional",
  "valor": { "rotulo": "Concluídas hoje", "numero": 12, "prefixo": "", "sufixo": "/14", "casas": 0 },
  "itens": [ { "texto": "Enviar proposta", "detalhe": "09:00 · Trabalho", "feito": true } ],
  "grafico": [4, 6, 5, 8, 7, 9, 12] }
```
Até 4 itens cabem bem. `feito: true` marca o item com a cor de destaque.

### grafico (barras)
```json
{ "tipo": "grafico", "titulo": "Vendas", "barras": [ { "rotulo": "JAN", "valor": 18 }, { "rotulo": "FEV", "valor": 26 } ],
  "destaque": 1, "prefixo": "R$ ", "sufixo": "k", "casas": 0 }
```
3 a 6 barras. `destaque` = posição da barra colorida (padrão: a última).

### numero (contador)
```json
{ "tipo": "numero", "de": 0, "ate": 97, "prefixo": "", "sufixo": "%", "casas": 0, "legenda": "dos clientes recomendam" }
```

### codigo
```json
{ "tipo": "codigo", "titulo": "Só isso", "arquivo": "app.js", "linhas": ["const total = 10;", "console.log(total);"] }
```

### comparacao (antes x depois)
```json
{ "tipo": "comparacao", "titulo": "Antes x *Depois*", "antes": ["Planilha manual"], "depois": ["Tudo automático"],
  "rotuloAntes": "ANTES", "rotuloDepois": "DEPOIS" }
```

### imagem
```json
{ "tipo": "imagem", "arquivo": "produto.png", "legenda": "Novo *sabor*", "ajuste": "conter" }
```
Veja [Imagens](#imagens). `ajuste: "conter"` mostra a imagem inteira; sem ele, a imagem preenche o quadro (pode cortar bordas).

### cta (chamada final)
```json
{ "tipo": "cta", "texto": "Baixe *agora*", "subtexto": "Disponível para iPhone e Android", "botao": "Baixar grátis" }
```

### custom (cena personalizada)
```json
{ "tipo": "custom", "componente": "Exemplo", "texto": "*CENA* PERSONALIZADA" }
```
O componente fica em `videos/<nome>/src/custom.tsx`. Peça ao Claude: "crie uma cena personalizada com ...".

---

## Imagens

1. Copie a imagem (PNG ou JPG) para `videos/<nome-do-video>/public/imagens/`.
2. Use uma cena `imagem` com o nome exato do arquivo (com extensão, respeitando maiúsculas).
3. Prefira imagens com pelo menos 1080 px de largura. Logo com fundo transparente: PNG + `"ajuste": "conter"`.

Use só imagens que você tem direito de usar (suas fotos, sua marca, bancos com licença comercial).

## Duração e ritmo

- Duração total = soma das cenas + ~1 s no final (`"cauda": 1.0` muda isso).
- Para um vídeo mais rápido, reduza `duracao` das cenas ou remova cenas.
- Elementos de uma cena entram em sequência; `"intervalo": 0.3` (segundos) muda o espaço entre eles.

## Avançado: sincronizar com narração

Depois de `npm run narrar -- nome`, o arquivo `audio/palavras.json` tem o tempo de cada palavra. Em cada cena:

- `"inicio": 4.2` faz a cena começar no segundo 4,2 da narração;
- `"tempos": [4.3, 4.9, 5.6]` faz cada elemento (linha, etiqueta, barra...) entrar no segundo indicado.

É mais fácil pedir ao Claude: "sincronize as cenas com a narração".
