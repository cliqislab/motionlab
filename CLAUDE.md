# MotionLab Kit — instruções para o Claude Code

Este projeto é o MotionLab Kit: cria vídeos animados (motion design, tipografia cinética) por código com Remotion.
Quem usa normalmente não sabe programar. Responda em português do Brasil simples, explique o que fez em 1 a 3 frases
e mostre caminhos de arquivo que a pessoa possa abrir.

## Para qualquer pedido de vídeo, siga a skill `motion-video`
Ela está em `.claude/skills/motion-video/SKILL.md` e cobre: criar vídeo, mudar cores e textos, usar imagens,
narração, prévia e exportação. Pedidos como estes acionam a skill:
- "Crie um vídeo de apresentação de um aplicativo"
- "Faça uma animação para Instagram"
- "Crie um vídeo de 30 segundos explicando um produto"
- "Utilize o template neon"
- "Altere as cores e os textos"
- "Gere uma prévia"
- "Exporte o vídeo final"

## Mapa do projeto
- `videos/<nome>/conteudo.json` — o que a pessoa (ou você) edita: formato, cores, cenas e textos.
- `videos/<nome>/src/` — código do vídeo (copiado do template). `custom.tsx` é onde entram cenas novas.
- `templates/neon/` — template original. Não edite sem pedido explícito.
- `exemplos/nexa-app/` — exemplo fictício usado por `npm run demo`.
- `tools/` — comandos `npm run ...` (Node). `scripts/` — áudio e narração (Python no `.venv`).

## Comandos
`npm run doctor` · `npm run novo -- <nome>` · `npm run checar -- <nome>` · `npm run previa -- <nome> [--segundo N]` ·
`npm run preview -- <nome>` · `npm run narrar -- <nome>` · `npm run render -- <nome>` · `npm run demo`

## Segurança
- Nunca abra, imprima ou copie o `.env` ou qualquer chave. A chave Gemini é configurada pela própria pessoa com `npm run chave`.
- Não instale programas no sistema nem rode comandos com `sudo`/administrador. Se faltar algo, diga o que instalar e aponte `INSTALACAO.md`.
- `npm run preview` abre um servidor que fica rodando: rode em segundo plano ou peça à pessoa para rodar no terminal dela.

## Quando algo der errado
Rode `npm run doctor` e `npm run checar -- <nome>`, leia a mensagem e consulte `ERROS-COMUNS.md`.
