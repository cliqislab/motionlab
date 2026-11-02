# MotionLab Kit

**Crie vídeos animados profissionais conversando com o Claude Code. Sem After Effects, sem editor de vídeo, sem saber programar.**

Você descreve o vídeo em português ("crie um vídeo de 30 segundos para Instagram apresentando meu app"),
o Claude monta as cenas, anima os textos, gera trilha e efeitos sonoros, mostra a prévia e exporta o MP4.

## O que vem no kit

- **Template Neon Tech** pronto: tipografia cinética, câmera 3D, glitch, brilho, em 16:9, 9:16, 1:1 e 4:5.
- **10 tipos de cena**: título animado, etiquetas riscadas, tela de aplicativo, gráfico de barras, número que conta,
  código digitado, antes x depois, imagem, chamada final e cena personalizada.
- **Trilha e efeitos sonoros gerados por código**: sem música de banco, sem risco de direito autoral.
- **Narração opcional**: voz gratuita para testes ou voz Gemini (Fenrir) com sua chave.
- **Instalador** (`npm run setup`) e **diagnóstico** (`npm run doctor`) que dizem exatamente o que falta.
- **Vídeo de demonstração** (`npm run demo`): "Nexa App", um aplicativo fictício.
- **Skill para o Claude Code** + guia de prompts prontos.

## Comece aqui

1. [REQUISITOS.md](REQUISITOS.md): o que você precisa ter (e quanto custa).
2. [INSTALACAO.md](INSTALACAO.md): instalação passo a passo no macOS e no Windows.
3. [SEU-PRIMEIRO-VIDEO.md](SEU-PRIMEIRO-VIDEO.md): seu primeiro vídeo, passo a passo e com imagens.
4. [PRIMEIRO-VIDEO.md](PRIMEIRO-VIDEO.md): versão resumida, com o caminho sem Claude (editando o arquivo).

Depois:

- [GUIA-DE-PROMPTS.md](GUIA-DE-PROMPTS.md): pedidos prontos para copiar e colar.
- [PERSONALIZACAO.md](PERSONALIZACAO.md): cores, textos, imagens e cenas.
- [EXPORTACAO.md](EXPORTACAO.md): prévia, MP4 final e configurações por rede social.
- [CONFIGURAR-GEMINI.md](CONFIGURAR-GEMINI.md): narração com voz do Google (opcional).
- [ERROS-COMUNS.md](ERROS-COMUNS.md): quando algo não funciona.
- [LICENCAS.md](LICENCAS.md): licenças e o que você pode fazer com os vídeos.

## Comandos

| Comando | Para quê |
|---|---|
| `npm run setup` | instala e prepara tudo (rode uma vez) |
| `npm run doctor` | verifica a instalação |
| `npm run demo` | gera o vídeo de demonstração |
| `npm run novo -- meu-video` | cria um vídeo novo |
| `npm run preview -- meu-video` | prévia no navegador |
| `npm run render -- meu-video` | exporta o MP4 |

## O que o kit faz hoje (e o que não faz)

**Funciona e foi testado no macOS:** instalação, diagnóstico, template Neon nos 4 formatos, demo, prévia, exportação MP4,
trilha e efeitos sonoros, narração com voz gratuita, validação do conteúdo.

**Ainda não incluso:** outros templates além do Neon; edição de vídeo gravado por comando simples;
análise automática de site/Instagram; banco de músicas ou imagens. Windows: o código foi escrito para funcionar,
mas a instalação no Windows ainda não foi testada em uma máquina real (veja INSTALACAO.md).

Versão 1.0.0
