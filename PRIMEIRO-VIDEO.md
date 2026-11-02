# Seu primeiro vídeo (versão resumida)

> Primeira vez? Prefira o tutorial ilustrado [SEU-PRIMEIRO-VIDEO.md](SEU-PRIMEIRO-VIDEO.md).

Antes: termine a [instalação](INSTALACAO.md) e confira com `npm run doctor`.

Há dois caminhos. O **Caminho A** (conversando com o Claude) é o principal. O **Caminho B** (editando um arquivo)
funciona até sem o Claude Code e ajuda a entender o que acontece por trás.

---

## Aquecimento: veja o que o kit faz (3 minutos)

No terminal, dentro da pasta do kit:

```
npm run demo
```

Ele cria o projeto `videos/nexa-app-demo` (um aplicativo fictício) e exporta o MP4.
Ao terminar, abra o arquivo:

```
videos/nexa-app-demo/saida/nexa-app-demo.mp4
```

Vídeo vertical de ~33 segundos com título animado, etiquetas riscadas, tela de app, gráfico, contador, comparação e chamada final.

---

## Caminho A — conversando com o Claude Code

### 1. Abra o Claude Code na pasta do kit

```
claude
```

O Claude lê o arquivo `CLAUDE.md` do kit e já sabe usar os comandos.

### 2. Peça o vídeo

Copie e adapte:

```
Crie um vídeo de 30 segundos para Instagram (vertical) apresentando a "Doce Lar Confeitaria".
Público: pessoas que encomendam bolos para festas. Mensagem: bolos personalizados com entrega no mesmo dia.
Cor de destaque: rosa. Chamada final: "Peça pelo WhatsApp".
```

O Claude vai:
1. propor as cenas (gancho, problema, solução, benefícios, chamada final);
2. criar a pasta `videos/<nome>/` e escrever o `conteudo.json`;
3. gerar uma prévia rápida e **olhar as imagens** para corrigir textos estourados ou pequenos;
4. dizer onde está a prévia.

Na primeira vez, o Claude Code pede permissão para rodar comandos (`npm run ...`). Leia e aprove.

### 3. Veja a prévia em movimento

Peça: **"abra a prévia"**, ou rode você mesmo em outro terminal:

```
npm run preview -- nome-do-video
```

Abre o **Remotion Studio** no navegador. Aperte **espaço** para tocar. Mantenha o terminal aberto enquanto usa;
para fechar, volte ao terminal e aperte **Ctrl + C**.

### 4. Ajuste conversando

Exemplos:
- "Troque a cor de destaque para verde-limão."
- "Na cena 3, escreva 'Entrega hoje' em vez de 'Entrega rápida'."
- "Deixe o vídeo mais rápido, com 20 segundos."
- "Adicione um gráfico mostrando 50, 120 e 300 pedidos por mês (dados ilustrativos)."

Com o Studio aberto, as mudanças aparecem sozinhas no navegador.

### 5. Exporte o MP4

Peça **"exporte o vídeo final"** ou rode:

```
npm run render -- nome-do-video
```

O arquivo fica em `videos/nome-do-video/saida/nome-do-video.mp4`. Pronto para postar.

---

## Caminho B — editando o conteudo.json (sem Claude)

### 1. Crie o vídeo

```
npm run novo -- meu-video --formato 9:16
```

Formatos: `9:16` (Reels/TikTok/Shorts), `16:9` (YouTube), `1:1` e `4:5` (feed).

### 2. Edite os textos

Abra `videos/meu-video/conteudo.json` em um editor de texto (VS Code, TextEdit em modo texto puro ou Bloco de Notas).
Troque os textos entre aspas. Palavras entre `*asteriscos*` ficam na cor de destaque.

```json
{ "texto": "que dá pra fazer *MOTION*", "modo": "expand" }
```

Cuidado com vírgulas e aspas. Para conferir se está tudo certo:

```
npm run checar -- meu-video
```

Todos os campos estão explicados em [PERSONALIZACAO.md](PERSONALIZACAO.md).

### 3. Veja e exporte

```
npm run preview -- meu-video
npm run render -- meu-video
```

---

## Próximos passos

- Copie pedidos prontos do [GUIA-DE-PROMPTS.md](GUIA-DE-PROMPTS.md).
- Coloque narração: escreva o texto em `videos/meu-video/roteiro.txt` e peça ao Claude
  "gere a narração e sincronize com as cenas" (ou rode `npm run narrar -- meu-video`).
- Use suas imagens: [PERSONALIZACAO.md](PERSONALIZACAO.md#imagens).
