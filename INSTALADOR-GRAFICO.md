# Assistente gráfico MotionLab — pré-lançamento

Esta pasta contém o **código-fonte** de um assistente em Electron.
O objetivo é gerar `MotionLab-Setup-Windows-1.1.0.exe` e `MotionLab-Setup-macOS-1.1.0.dmg`.
Esses executáveis **ainda não foram gerados nem testados nos dois sistemas**.

## Para gerar (desenvolvedor)

Em um computador com Node 22, abra a pasta `installer/`:

```bash
npm install
npm run prepare-kit
npm run start
```

Gere o `.exe` com `npm run dist:win` **no Windows x64**; gere o `.dmg`
com `npm run dist:mac` **no Mac**. Também há um workflow em
`.github/workflows/instaladores.yml` para compilação manual via GitHub Actions,
depois que o projeto for enviado para um repositório privado. Os artefatos
ficam na execução; nada é publicado automaticamente.

## Para o comprador

1. Abrir o instalador e verificar Node, npm, Python e FFmpeg.
2. Usar **Instalar dependências**, por `winget` no Windows e Homebrew no Mac.
3. Se necessário, fechar e abrir o instalador para reconhecer os comandos novos.
4. Clicar em **Preparar kit** para copiar para `Documentos/MotionLab Kit`.
5. Clicar em **Gerar vídeo de teste** para validar o MP4.
6. Instalar e autenticar **Claude Code** separadamente para usar a IA.

## Restrições e segurança

- Não funciona offline e não é 100% automático. No Mac, o Homebrew precisa ser
  instalado antes. Claude Code também exige instalação, autenticação e plano próprio.
- A instalação de dependências pode pedir confirmação do sistema.
- Instalação da demo usa centenas de MB, além de downloads adicionais.
- O pacote não inclui `.env`, `.venv`, `node_modules` nem vídeos pessoais.
- Sem certificado de assinatura, Windows SmartScreen e macOS Gatekeeper podem alertar.
  Para venda ampla, configure assinatura e notarização.
- **Obrigatório testar a jornada em Windows 11 x64 e Mac reais antes de vender.**
- A revisão jurídica e os direitos de terceiros continuam pendentes.
