# Checklist de validação no Windows 11 (interno)

Status: **NÃO EXECUTADO.** Nenhum teste foi rodado em Windows até agora. O código foi escrito para funcionar
(sem scripts `.sh`, caminhos com `path.join`, `npm`/`claude` chamados com shell no Windows, Python do `.venv\Scripts`),
mas isso é análise, não teste.

## Máquina de teste

- [ ] Windows 11 23H2 ou mais novo, **x64** (Intel/AMD). Anote: edição, build, CPU, RAM.
- [ ] **Não usar** Windows em processador ARM (Snapdragon/Surface Pro X): o Remotion só publica o compositor `win32-x64`. Se o vendedor quiser suportar ARM, testar à parte; até lá, REQUISITOS.md precisa dizer "Windows x64".
- [ ] Conta de usuário **nova** (sem Node, Python, FFmpeg, Claude instalados).
- [ ] Antivírus padrão (Defender) ligado. Opcional: repetir com um antivírus de terceiros.
- [ ] Grave a tela do teste inteiro (Xbox Game Bar, Win+G) para usar em tutorial e suporte.

## 1. Pré-requisitos (seguindo SÓ o INSTALACAO.md)

- [ ] Node.js LTS pelo instalador do site. `node -v` e `npm -v` funcionam num PowerShell novo.
- [ ] Python pelo site, com **"Add python.exe to PATH"** marcado. `py -3 --version` e `python --version` funcionam.
- [ ] Repetir num segundo teste **sem** marcar o PATH: o `npm run setup` acha o Python pelo `py`? Anote.
- [ ] `winget install --id Gyan.FFmpeg -e` funciona; `ffmpeg -version` funciona num terminal **novo**.
- [ ] Claude Code instalado pelo guia oficial; `claude --version` funciona.
- [ ] Anote cada passo em que um iniciante travaria.

## 2. Pasta do kit

- [ ] Descompactar em `C:\MotionLab`. Rodar tudo.
- [ ] Repetir em `C:\Users\<nome>\OneDrive\Área de Trabalho\MotionLab Kit` (espaço + acento + OneDrive).
- [ ] Repetir com nome de usuário do Windows com acento (ex.: `C:\Users\João`), se possível.

## 3. Instalador

Em **PowerShell** e depois em **cmd**:

- [ ] `npm run setup`: as 9 etapas aparecem com ✔ e as cores legíveis.
- [ ] PowerShell com scripts bloqueados: a mensagem de erro do npm é a descrita em ERROS-COMUNS.md? A solução funciona?
- [ ] O `npm ci` passa (antivírus pode travar arquivos em `node_modules`).
- [ ] "navegador de render pronto" (Chrome Headless Shell baixado para `node_modules\.remotion`).
- [ ] `.venv\Scripts\python.exe` criado; numpy/pillow instalados.
- [ ] Pergunta da narração aparece; faster-whisper e edge-tts instalam (anote o tempo e o tamanho).
- [ ] `.env` criado. Confira as permissões do arquivo (Propriedades > Segurança): só o seu usuário e administradores.
- [ ] Pergunta "configurar a chave agora?" aparece. Responder **n**.
- [ ] Diagnóstico final: "Teste de render: imagem de teste gerada".
- [ ] Rodar `npm run setup` uma **segunda vez**: não quebra nada, não apaga `videos/`.

## 4. Comandos

- [ ] `npm run doctor` e `npm run doctor -- --completo`
- [ ] `npm run demo`: MP4 em `videos\nexa-app-demo\saida\`. Abrir no app Filmes e TV: imagem e **som**. Anote o tempo de render.
- [ ] `npm run novo -- teste-win --formato 9:16`
- [ ] `npm run checar -- teste-win`
- [ ] `npm run previa -- teste-win` e `npm run previa -- teste-win --segundo 3`
- [ ] `npm run preview -- teste-win`: o navegador abre; espaço toca com som; Ctrl+C fecha sem deixar processo preso (Gerenciador de Tarefas).
- [ ] Editar o `conteudo.json` no Bloco de Notas, salvar (UTF-8), `npm run checar`: acentos corretos no vídeo?
- [ ] Salvar o `conteudo.json` em "UTF-8 com BOM": o kit lê sem erro?
- [ ] Colocar uma aspa curva de propósito: a mensagem mostra a linha e a dica?
- [ ] Cena `imagem` com um PNG em `public\imagens\`.
- [ ] `npm run render -- teste-win --qualidade leve`
- [ ] `npm run templates`
- [ ] `npm run narrar -- teste-win --voz gratis` (com `roteiro.txt` preenchido): voz gerada, palavras marcadas, render com voz.
- [ ] `npm run chave` (digitação oculta funciona no PowerShell e no cmd? colar com botão direito funciona?) — usar uma chave **de teste**, nunca uma chave de produção compartilhada.
- [ ] `npm run chave -- --testar` e `npm run chave -- --remover`
- [ ] `npm run procurar-chave`

## 5. Claude Code no Windows

- [ ] `claude` aberto na pasta do kit reconhece o `CLAUDE.md` e a skill (pergunte "quais comandos do kit existem?").
- [ ] Pedido do SEU-PRIMEIRO-VIDEO.md (cafeteria fictícia): cria, faz prévia, olha a imagem, ajusta.
- [ ] "Exporte o vídeo final" gera o MP4.

## 6. Critério de aprovação

Aprovado somente se: setup sem erro nos dois caminhos de pasta; demo com som; render de um vídeo novo; prévia no navegador;
narração gratuita; mensagens de erro compreensíveis. Registre resultados e prints em `lancamento/RELATORIO-QA.md`.
Ao aprovar, troque em README.md, REQUISITOS.md e INSTALACAO.md o aviso "ainda não testado" pelo resultado real.
