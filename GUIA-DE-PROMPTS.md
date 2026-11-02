# Guia de prompts

Copie, troque o que está entre [colchetes] e cole no Claude Code (aberto na pasta do kit com `claude`).

**Dica de ouro:** diga sempre 4 coisas: **o que é**, **para quem**, **onde vai postar** e **o que a pessoa deve fazer no final**.

---

## Vídeos novos

**Apresentação de aplicativo**
```
Crie um vídeo de apresentação do aplicativo [nome], que [o que ele faz].
Formato vertical para Instagram, 30 segundos. Mostre a tela do app com [3 funções],
um gráfico de [métrica] (dados ilustrativos) e termine com "[chamada final]". Cor de destaque [cor].
```

**Animação para Instagram (Reels)**
```
Faça uma animação de 20 segundos para Reels sobre [assunto], com gancho forte nos 2 primeiros segundos.
Tom: [divertido / sério / premium]. Cor de destaque [cor]. Final: "[siga / comente / link na bio]".
```

**Produto explicado em 30 segundos**
```
Crie um vídeo de 30 segundos explicando o produto [nome]: [descrição em 1 frase].
Estrutura: problema que ele resolve, como funciona em 3 passos, um benefício com número e chamada final "[texto do botão]".
Formato [9:16 / 16:9].
```

**Anúncio de oferta**
```
Crie um anúncio vertical de 15 segundos para a oferta "[oferta]" válida até [data].
Mostre o preço de [de] por [por] com um número animado, 3 vantagens e o botão "[Comprar agora]". Cor [cor].
```

**Serviço local**
```
Vídeo de 25 segundos para [tipo de negócio] em [cidade]. Mostre 3 serviços em etiquetas,
um "antes x depois" com [o que muda] e termine com "[Agende pelo WhatsApp]". Formato 4:5 para o feed.
```

**Vídeo para YouTube (horizontal)**
```
Crie uma abertura de 10 segundos para o meu canal [nome] sobre [tema], formato 16:9, com o nome do canal entrando com impacto.
```

**Tutorial com código**
```
Crie um vídeo de 30 segundos mostrando como [fazer algo] em [linguagem], com uma cena de código sendo digitado
e uma comparação "jeito antigo x jeito novo". Formato 16:9.
```

**A partir do exemplo**
```
Use o exemplo Nexa App como base e adapte para o meu app [nome], que [descrição]. Mantenha a estrutura de cenas.
```

---

## Ajustes

| Quero... | Peça |
|---|---|
| usar o template | "Utilize o template neon." |
| outra cor | "Troque a cor de destaque para [cor ou código #RRGGBB]." |
| mudar textos | "Na cena [n], troque [texto antigo] por [texto novo]." |
| mais rápido | "Deixe o vídeo com [n] segundos, cortando as cenas menos importantes." |
| mais impacto | "Coloque efeito de impacto na cena da revelação." |
| sem música | "Desligue a trilha e deixe só os efeitos sonoros." |
| outro formato | "Faça uma versão 16:9 deste vídeo para o YouTube." |
| minha imagem | "Coloque a imagem [arquivo] (está em [pasta]) depois da cena [n], com a legenda [texto]." |
| cena nova | "Crie uma cena personalizada com [descrição] entre as cenas [n] e [n+1]." |
| narração | "Escreva um roteiro de narração de 30 segundos, gere a voz e sincronize as cenas com a fala." |

## Prévia e exportação

| Quero... | Peça |
|---|---|
| ver rápido | "Gere uma prévia." (o Claude cria um rascunho e uma folha de imagens) |
| ver em movimento | "Abra a prévia no navegador." |
| conferir uma cena | "Me mostre como fica o segundo [n]." |
| exportar | "Exporte o vídeo final." |
| arquivo menor | "Exporte em qualidade leve." |

---

## O que funciona hoje e o que não funciona

| Pedido | Status |
|---|---|
| criar vídeo novo com o template neon (16:9, 9:16, 1:1, 4:5) | funciona |
| trocar cores, textos, duração, formato | funciona |
| usar imagens suas (PNG/JPG) | funciona |
| gráfico, número animado, tela de app, comparação, código | funciona |
| cena personalizada criada pelo Claude | funciona (o Claude escreve o código; qualidade varia com o pedido) |
| narração com voz gratuita ou Gemini + sincronia | funciona (voz Gemini precisa de chave) |
| prévia (rascunho, imagem de um instante, navegador) | funciona |
| exportar MP4 | funciona |
| outros templates/estilos ("clean", "corporativo"...) | **ainda não**: o Claude adapta o neon ou cria cenas personalizadas |
| editar vídeo gravado (cortar silêncio, legenda) | **não tem comando simples** (scripts avançados existem em `scripts/`) |
| baixar música, fotos ou ícones da internet | **não** |
| analisar site ou Instagram automaticamente | **não** |
| logo de outras marcas | **não**: forneça seus arquivos |
