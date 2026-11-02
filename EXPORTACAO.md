# Prévia e exportação

## Três jeitos de ver antes de exportar

| Comando | O que gera | Quando usar |
|---|---|---|
| `npm run previa -- meu-video --segundo 5` | uma imagem do segundo 5 em `saida/quadro_5.jpg` | conferir uma cena em segundos |
| `npm run previa -- meu-video` | rascunho em meia resolução `saida/previa.mp4` + folha com várias imagens `saida/previa.jpg` | ver o vídeo inteiro rápido (1 a 2 min) |
| `npm run preview -- meu-video` | abre o Remotion Studio no navegador | ver em movimento e acompanhar as mudanças ao vivo |

No Studio: **espaço** toca/pausa, as setas andam quadro a quadro. Para fechar: volte ao terminal e aperte **Ctrl + C**.

## Exportar o MP4 final

```
npm run render -- meu-video
```

O arquivo fica em `videos/meu-video/saida/meu-video.mp4`.

| Opção | Efeito |
|---|---|
| `--qualidade alta` | arquivo maior, máxima nitidez (bom para YouTube) |
| `--qualidade normal` | padrão, equilíbrio ideal para redes sociais |
| `--qualidade leve` | arquivo menor (bom para WhatsApp e e-mail) |

Exemplo: `npm run render -- meu-video --qualidade leve`

### Configuração técnica do arquivo

- Vídeo H.264, 30 quadros por segundo, cores BT.709 (padrão de vídeo para web e celular).
- Áudio AAC 48 kHz, volume normalizado perto de −14 LUFS (o nível que as redes sociais usam), pico abaixo de −1 dB.
- Resolução de acordo com o formato escolhido.

## Qual formato para cada rede

| Rede | Formato no conteudo.json | Duração recomendada |
|---|---|---|
| Instagram Reels, TikTok, YouTube Shorts | `9:16` | 15 a 60 s |
| Stories | `9:16` | até 60 s por story |
| Feed do Instagram/Facebook | `4:5` (ou `1:1`) | 15 a 60 s |
| YouTube | `16:9` | qualquer |
| LinkedIn | `1:1` ou `16:9` | 30 a 90 s |
| WhatsApp | qualquer + `--qualidade leve` | até 3 min |

**Área segura no vertical:** nas redes, o topo e a parte de baixo da tela ficam cobertos por nome, legenda e botões.
O template centraliza o conteúdo, mas evite colocar informação importante bem nas bordas.

## Mais de uma versão do mesmo vídeo

Para ter vertical e horizontal, peça ao Claude: "faça uma versão 16:9 deste vídeo"
(ele cria outro projeto e ajusta o que for preciso), ou:

```
npm run novo -- meu-video-16x9 --formato 16:9
```

e copie as cenas do `conteudo.json` do original.

## Onde ficam os arquivos

```
videos/meu-video/saida/
  meu-video.mp4    vídeo final
  previa.mp4       rascunho
  previa.jpg       folha de imagens
  quadro_N.jpg     imagens de instantes
```

Exportar de novo **substitui** o MP4 anterior com o mesmo nome. Para guardar versões, renomeie o arquivo antes.
