# Instalação

Leva de 10 a 20 minutos. Você só faz isso uma vez.

> **O que é o "terminal"?** É uma janela onde você digita comandos.
> No macOS: abra o app **Terminal** (Spotlight: Cmd + Espaço, digite "Terminal").
> No Windows: abra o **PowerShell** (menu Iniciar, digite "PowerShell").
> Para rodar um comando: copie, cole na janela e aperte Enter.

---

## macOS

### 1. Instale os programas básicos

1. **Node.js**: baixe a versão **LTS** em https://nodejs.org e instale (avançar, avançar, concluir).
2. **Python**: baixe em https://www.python.org/downloads/ e instale.
3. **FFmpeg**: o jeito mais fácil é pelo Homebrew.
   - Se ainda não tem o Homebrew, siga as instruções oficiais em https://brew.sh
     (ele pede sua senha do Mac, porque instala no sistema; isso é normal e é feito por você, não pelo kit).
   - Depois rode: `brew install ffmpeg`
4. **Claude Code**: siga https://docs.claude.com/en/docs/claude-code/setup e depois rode `claude` uma vez para entrar na sua conta.

Feche o Terminal e abra de novo para ele reconhecer os programas novos.

### 2. Coloque o kit em uma pasta

Descompacte o arquivo `MotionLab-Kit-v1.0.0.zip`, por exemplo em `Documentos`.
Pode ser qualquer pasta, **de preferência com um nome sem espaços nem acentos**.

### 3. Rode o instalador

No Terminal, entre na pasta do kit. Dica: digite `cd ` (com espaço), **arraste a pasta do kit para a janela** e aperte Enter.

```
npm run setup
```

O instalador:

1. identifica o sistema;
2. confere Node.js e npm;
3. confere o Claude Code;
4. confere Python e FFmpeg;
5. instala as dependências do kit (dentro da pasta);
6. baixa o navegador de render do Remotion (~100 MB, dentro da pasta);
7. cria o ambiente Python do kit (`.venv`) e pergunta se quer instalar narração e sincronia (~250 MB);
8. cria o arquivo `.env` e pergunta se quer configurar a chave Gemini (pode pular);
9. faz um diagnóstico com um render de teste e mostra o resumo.

No final aparece **"Instalação concluída"** e os próximos passos.
Se faltar algo, ele mostra uma lista **"Faça isto manualmente"**: resolva e rode `npm run setup` de novo.

---

## Windows

> **Status:** os comandos do kit foram escritos para Windows, mas a instalação no Windows **ainda não foi testada
> em uma máquina real**. Se algo falhar, veja ERROS-COMUNS.md e nos envie a mensagem de erro.

### 1. Instale os programas básicos

1. **Node.js**: baixe a versão **LTS** em https://nodejs.org e instale.
2. **Python**: baixe em https://www.python.org/downloads/. Na primeira tela do instalador, **marque "Add python.exe to PATH"**.
3. **FFmpeg**: no PowerShell, rode:
   ```
   winget install --id Gyan.FFmpeg -e
   ```
   (o `winget` já vem no Windows 10/11 atualizado).
4. **Claude Code**: siga https://docs.claude.com/en/docs/claude-code/setup e rode `claude` uma vez para entrar na sua conta.

**Feche e abra o PowerShell de novo** depois de instalar.

### 2. Coloque o kit em uma pasta

Descompacte o ZIP em uma pasta **sem espaços e sem acentos**, por exemplo `C:\MotionLab`.
Evite pastas sincronizadas pelo OneDrive (podem travar arquivos durante o render).

### 3. Rode o instalador

```
cd C:\MotionLab\MotionLab-Kit-v1.0.0
npm run setup
```

Se aparecer erro de "execução de scripts desabilitada" ao rodar `npm`, veja ERROS-COMUNS.md.

---

## Conferir a instalação a qualquer momento

```
npm run doctor
```

Itens com ✔ estão ok. Itens com **!** são opcionais. Itens com ✘ são obrigatórios e vêm com "como resolver".
Para um teste completo (gera uma imagem com o template): `npm run doctor -- --completo`.

## O que o instalador NÃO faz

- Não instala programas no sistema (Node, Python, FFmpeg, Claude Code são instalados por você).
- Não pede senha de administrador.
- Não baixa e executa scripts da internet.
- Não envia seus dados para lugar nenhum. A única chamada externa opcional é o teste da chave Gemini.

## Desinstalar

Apague a pasta do kit. Nada fica espalhado pelo computador, exceto o cache de modelos de transcrição
(se você usou narração), em `~/.cache/huggingface` (macOS) ou `%USERPROFILE%\.cache\huggingface` (Windows).
