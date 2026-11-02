# Erros comuns

Primeiro passo para qualquer problema:

```
npm run doctor
```

Ele diz o que está faltando e como resolver. Se o problema for em um vídeo específico:

```
npm run checar -- nome-do-video
```

---

## Instalação

**`npm: command not found` / `'npm' não é reconhecido`**
O Node.js não está instalado ou o terminal foi aberto antes da instalação. Instale a versão LTS em https://nodejs.org,
**feche e abra o terminal** e tente de novo.

**`Missing script: "setup"`**
Você não está dentro da pasta do kit. Entre nela com `cd` (no macOS, digite `cd ` e arraste a pasta para o Terminal).
A pasta certa tem os arquivos `package.json` e `README.md`.

**Windows: "a execução de scripts foi desabilitada neste sistema"**
O PowerShell está bloqueando o `npm`. Opção simples: use o **Prompt de Comando** (cmd) em vez do PowerShell.
Opção alternativa (só para o seu usuário): `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e confirme.

**macOS: apareceu uma janela pedindo para instalar as "ferramentas de linha de comando"**
O macOS mostra isso quando algo chama `python3` sem o Python instalado. Pode aceitar (é da Apple, leva alguns minutos)
ou instalar o Python pelo site oficial. Depois rode `npm run setup` de novo.

**`Python não encontrado` (Windows)**
Reinstale o Python marcando **"Add python.exe to PATH"** na primeira tela. Feche e abra o terminal.

**`FFmpeg não encontrado`**
macOS: `brew install ffmpeg`. Windows: `winget install --id Gyan.FFmpeg -e`. Feche e abra o terminal.

**`npm ci` falhou / erro de rede**
Confira a internet e rode `npm run setup` de novo. Em redes de empresa, proxy/firewall pode bloquear downloads.

**"não consegui criar o .venv"** (Linux)
`sudo apt install python3-venv` e rode o setup de novo.

**Instalação de narração (faster-whisper) falhou**
O kit funciona sem ela (só sem narração automática). Tente `npm run setup` de novo mais tarde.
Python muito novo às vezes ainda não tem pacotes prontos: o Python 3.11 ou 3.12 é o mais seguro.

---

## Conteúdo (conteudo.json)

**`Não consegui ler videos/.../conteudo.json: Unexpected token`**
Erro de digitação no JSON. Os mais comuns:
- vírgula sobrando depois do último item: `["a", "b",]` → `["a", "b"]`
- vírgula faltando entre itens: `{ ... } { ... }` → `{ ... }, { ... }`
- aspas curvas `“ ”` coladas do Word/WhatsApp → use aspas retas `" "`
- aspas dentro do texto: use `\"` ou troque por aspas simples `'`.

**`tipo "xxx" não existe`**
Use um destes: `titulo`, `chips`, `app`, `grafico`, `numero`, `codigo`, `comparacao`, `imagem`, `cta`, `custom`.

**`imagem "x.png" não encontrada`**
A imagem precisa estar em `videos/<nome>/public/imagens/` com o nome exatamente igual (maiúsculas e extensão contam).

**Texto saindo da tela ou cortado**
Encurte o texto ou use `"tamanho": "m"`/`"p"`. No vertical, linhas com mais de ~20 letras em tamanho grande ficam apertadas.

**Cena passa rápido demais**
Aumente `"duracao"` da cena (em segundos).

---

## Mensagem "Erro inesperado"

Algo saiu do previsto. A mensagem traz 3 passos de recuperação: siga na ordem.
Se precisar mandar para o suporte, rode o mesmo comando de novo com detalhes técnicos:

- macOS: `MOTIONLAB_DEBUG=1 npm run render -- nome-do-video`
- Windows (cmd): `set MOTIONLAB_DEBUG=1` e depois o comando

Antes de enviar, confira que a sua chave não está no texto (`npm run procurar-chave`).

---

## Prévia e render

**`FFmpeg não encontrado: o vídeo vai sair SEM trilha e efeitos sonoros`**
O vídeo é gerado, mas mudo. Instale o FFmpeg (INSTALACAO.md, passo 1), feche e abra o terminal e exporte de novo.

**`Pouco espaço em disco`**
O render precisa de espaço temporário. Libere pelo menos 2 GB e tente de novo.

**O vídeo saiu sem som**
Apareceu o aviso "Python do kit não encontrado" ou "Falha ao gerar a trilha". Rode `npm run doctor` e depois
`npm run setup`. Confira também se `"audio"` não está `false` e se `"musica": {"ativa": false}` foi intencional.

**`Dependências não instaladas. Rode: npm run setup`**
A pasta `node_modules` não existe ou foi apagada. Rode `npm run setup`.

**O render fica parado em "Getting composition" / erro com "browser" ou "Chrome"**
O navegador de render do Remotion não foi baixado. Rode `npm run setup` (ele baixa) ou confira a internet.
Antivírus corporativo às vezes bloqueia: libere a pasta do kit.

**Render muito lento ou o computador trava**
Feche outros programas. Use `npm run previa` enquanto ajusta e só faça o `render` no final.
Vídeos longos (mais de 60 s) em computadores com 8 GB de RAM podem levar 15 minutos ou mais.

**`npm run preview` não abre o navegador**
Abra manualmente o endereço que aparece no terminal (geralmente http://localhost:3000).
Se disser que a porta está em uso, feche o outro Studio aberto (Ctrl + C no terminal dele).

**Pouco espaço em disco**
Cada render ocupa de 10 a 60 MB; a pasta `videos/<nome>/audio` guarda arquivos de áudio intermediários.
Apague pastas de vídeos que você não usa mais em `videos/`.

**Windows: erro de arquivo em uso / acesso negado**
Pasta dentro do OneDrive ou antivírus examinando arquivos. Mova o kit para `C:\MotionLab`.

---

## Narração e chave Gemini

**`GEMINI_API_KEY não configurada`**
Rode `npm run chave` ou use a voz gratuita: `npm run narrar -- nome --voz gratis`. Guia: CONFIGURAR-GEMINI.md.

**`chave recusada (HTTP 400/403)`**
Chave errada, incompleta ou revogada. Gere outra no Google AI Studio e rode `npm run chave`.

**`HTTP 429` / limite atingido**
Você atingiu o limite gratuito por minuto ou por dia. Espere alguns minutos (o limite diário volta à meia-noite do horário do Pacífico)
ou ative a cobrança no projeto.

**A narração falou palavras erradas ou leu algo estranho**
Rode de novo (`npm run narrar -- nome --takes 3` gera 3 versões em `audio/`). Escreva números e siglas por extenso no
`roteiro.txt` ("dez por cento", "Jota Erre").

**A primeira narração demora muito**
Na primeira vez o kit baixa o modelo de transcrição (~500 MB). Depois fica rápido.

---

## Claude Code

**`claude: command not found`**
Instale pelo guia oficial: https://docs.claude.com/en/docs/claude-code/setup. Ele exige assinatura paga do Claude.

**O Claude não usa os comandos do kit**
Abra o Claude **dentro da pasta do kit** (é lá que estão `CLAUDE.md` e `.claude/skills`). Peça: "use a skill motion-video".

**O Claude pede permissão para tudo**
É o comportamento padrão de segurança. Você pode aprovar "sempre" para comandos `npm run` quando ele perguntar.

---

Não resolveu? Envie para o suporte: o comando que rodou, a mensagem de erro completa e o resultado de `npm run doctor`.
Antes de enviar, rode `npm run procurar-chave` para garantir que a sua chave Gemini não está em nenhum arquivo.
