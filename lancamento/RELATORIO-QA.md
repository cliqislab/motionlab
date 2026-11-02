# Relatório de QA — rodada final v1.0.0 (2026-11-02)

Ambiente de todos os testes executados: **macOS 15 (Darwin 24.6), Apple Silicon (arm64), Node 23.11.1, npm 11.6.2,
Python 3.9.6 (do sistema), FFmpeg 9.0.2, Claude Code 2.1.316.** Nenhum teste foi feito em Windows, macOS Intel ou
outras versões de Node/Python.

"Aprovado" = executado e conferido. "Analisado" = revisão do código/documento sem execução.

## Aprovado (executado)

| # | Teste | Evidência |
|---|---|---|
| 1 | Instalação a partir do ZIP em **conta simulada limpa** (HOME vazio: sem cache npm/pip, sem modelos, sem config do Claude) e pasta com acento e espaço (`Área de Trabalho`) | setup 9/9; doctor sem ✘; npm, pip e modelo Whisper (464 MB) baixados do zero |
| 2 | `npm run demo` na instalação limpa | MP4 1080×1920, 32,8 s, 14,2 MB, 2,0 min |
| 3 | Vídeo novo + narração gratuita + marcação de palavras + render na instalação limpa | MP4 15 s, −15,6 LUFS (voz presente) |
| 4 | Skill isolada (`claude -p --setting-sources project`, só `npm run`/Read/Write/Edit permitidos) | usou só a skill `motion-video`; criou, revisou a prévia e exportou `trigo-bom.mp4`; conteúdo visual conferido |
| 5 | O kit funciona sem acesso ao projeto original | testes 1–4 rodaram fora da pasta original; busca no código sem referências ao projeto original nem à pasta pessoal |
| 6 | `verificar-pacote` | 85 arquivos limpos; detectou corretamente e-mail, telefone, perfil pessoal, arquivo fora da lista e symlink plantados de propósito |
| 7 | Conteúdo do ZIP | sem `lancamento/`, `.env`, `node_modules`, `.venv`, vídeos ou áudios |
| 8 | Dependências npm | todas do registro oficial, com hash de integridade |
| 9 | Chave falsa: `chave --testar`, `tts_gemini.py`, `procurar-chave` | chave nunca aparece na saída; vazamento plantado num log foi detectado |
| 10 | Mensagens de erro de iniciante (12 casos: nome inválido, duplicado, template inexistente, vídeo inexistente, JSON com aspas curvas, vírgula sobrando, cor inválida, imagem faltando, tipo inválido, narrar sem roteiro, segundo inválido, qualidade inválida) | todas claras; JSON mostra linha, coluna e dica |
| 11 | `conteudo.json` com BOM (Bloco de Notas) | lido e renderizado sem erro (no macOS) |
| 12 | Remotion Studio (`npm run preview`) | servidor respondeu HTTP 200; captura de tela usada no tutorial |
| 13 | TypeScript, sintaxe dos 18 arquivos Node e dos 13 scripts Python | sem erros |
| 14 | Links e imagens dos documentos | nenhum link quebrado |

## Reprovado e corrigido nesta rodada

| Problema encontrado | Correção |
|---|---|
| Um atalho (symlink) quebrado no kit derrubava o `verificar-pacote` | listador usa `lstat`; symlinks são recusados no pacote |
| Erro de JSON sem linha quando faltava a posição na mensagem do Node (aspas curvas, vírgula sobrando) | linha, coluna e trecho localizados por busca |
| Exceções inesperadas mostravam rastro técnico | mensagem curta com 3 passos de recuperação (detalhes com `MOTIONLAB_DEBUG=1`) |
| Sem FFmpeg, o aviso era vago ("FFmpeg instalado?") | detecção explícita: "vídeo vai sair SEM trilha, instale o FFmpeg" |
| Falha de render só dizia "veja ERROS-COMUNS.md" | passos de recuperação na própria mensagem; aviso de pouco disco antes do render |
| Windows em ARM não era mencionado (Remotion só tem render para Windows x64) | REQUISITOS.md e `doctor` avisam |

## Não testado

| Item | Motivo / plano |
|---|---|
| Windows 11 | sem máquina Windows; seguir `TESTE-WINDOWS11.md` |
| Narração Gemini com chave real | proibido usar a chave antiga; seguir `TESTE-GEMINI-CHAVE-REAL.md` com chave nova |
| macOS Intel | sem máquina |
| Node 18/20 e Python 3.11–3.13 | só as versões instaladas nesta máquina |
| Mac realmente novo (sem Homebrew/FFmpeg/Python preinstalados, janela das "ferramentas de linha de comando") | o HOME limpo não remove programas do sistema |
| Primeira execução do Claude Code (login) | conta já autenticada |
| Máquina com 8 GB de RAM | tempo de render informado em REQUISITOS.md é estimativa |
| Uso por pessoa leiga real | precisa de 2–3 voluntários |

## Analisado (sem execução)

- Instalador e comandos no Windows: chamadas com shell para `npm`/`claude`, caminhos via `path.join`, Python do `.venv\Scripts`, scripts `.sh` substituídos por Python, lista de concat do FFmpeg com barras normais.
- Entrada oculta da chave no PowerShell/cmd (`setRawMode`).
- Permissão do `.env` no Windows (o kit não aplica ACL; herda a pasta do usuário).
