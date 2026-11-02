# Configurar a chave Gemini (opcional)

> **Você não precisa disso para começar.** Sem a chave, o kit cria e exporta vídeos completos com trilha e efeitos sonoros.
> A chave só serve para a **narração com voz do Google** (vozes como Fenrir, Puck e Kore), mais natural que a voz gratuita de teste.

## 1. O que é o Google AI Studio

É o site do Google para usar os modelos de inteligência artificial **Gemini**. Lá você cria uma **chave de API**:
um código secreto que permite que o kit peça ao Google para transformar o texto da narração em voz.

## 2. Por que a API Gemini pode ser necessária

O kit tem duas formas de narrar:

| Voz | Precisa de chave? | Qualidade | Uso comercial |
|---|---|---|---|
| Gratuita de teste (edge-tts) | não | boa | não garantido (use para rascunho) |
| Gemini TTS (Fenrir e outras) | **sim** | muito natural | permitido pelos termos do Google |

## 3. Como acessar o Google AI Studio

1. Abra https://aistudio.google.com
2. Entre com sua conta Google (Gmail).
3. Aceite os termos de uso na primeira vez.

## 4. Criar ou selecionar um projeto

Toda chave pertence a um **projeto** do Google Cloud (é ele que guarda limites e cobrança).

- **Conta nova:** o AI Studio cria um projeto padrão e, em geral, uma chave automaticamente quando você aceita os termos.
- **Já usa Google Cloud:** você precisa importar um projeto existente na tela **Projects** do AI Studio.

Se aparecer *"You do not have permission to create a key in this project"*, a sua conta não tem permissão naquele
projeto (comum em contas de empresa). Crie um projeto novo que não esteja ligado a uma organização ou peça ao administrador.

## 5. Gerar a chave

1. Abra https://aistudio.google.com/apikey
2. Clique em **Create API key** (Criar chave de API).
3. Escolha o projeto.
4. Copie a chave mostrada. **Trate como uma senha:** não envie por WhatsApp, e-mail ou print, e não publique.

## 6. Informar a chave no kit

No terminal, dentro da pasta do kit:

```
npm run chave
```

Cole a chave e aperte Enter. **Nada aparece na tela enquanto você cola**: é proposital, para ninguém ver.
O kit salva a chave no arquivo `.env` da pasta do kit (no macOS, com permissão só para o seu usuário)
e já testa se ela funciona.

O `npm run setup` também oferece essa etapa.

**Alternativa (avançada):** criar a variável de ambiente `GEMINI_API_KEY` no sistema. O kit usa a variável se ela existir.

- macOS: adicione `export GEMINI_API_KEY="sua-chave"` ao arquivo `~/.zshrc` e abra um terminal novo.
- Windows: Pesquisar → "Variáveis de ambiente" → **Variáveis de usuário** → Novo → nome `GEMINI_API_KEY`, valor = sua chave. Abra um terminal novo.

## 7. Verificar se está funcionando

```
npm run chave -- --testar
```

- **"chave aceita pela API Gemini"**: pronto.
- **"chave recusada (HTTP 400/403)"**: chave copiada incompleta ou revogada. Gere outra.
- **"limite de uso foi atingido (HTTP 429)"**: a chave funciona, mas você usou o limite do momento. Espere e tente de novo.

O teste só lista os modelos disponíveis: **não gera custo**.

Para testar a voz de verdade, crie um vídeo, escreva o `roteiro.txt` e rode `npm run narrar -- nome-do-video`.

## 8. Custos e limites

Valores da documentação oficial em outubro de 2026 (confira sempre a página de preços):

- **Nível gratuito:** projetos sem cobrança ativada usam o Gemini 3.8 Flash TTS sem custo, com limites de uso
  (pedidos por minuto e por dia, que mudam com o tempo). No nível gratuito, o Google pode usar o conteúdo enviado
  para melhorar os produtos dele. **Não envie roteiros confidenciais pelo nível gratuito.**
- **Nível pago:** ao ligar a cobrança no projeto, o Gemini 3.8 Flash TTS custa cerca de **US$ 0,004 a cada 10 segundos
  de áudio** até 31/12/2026 e cerca de US$ 0,008 a partir de 01/01/2027. Uma narração de 30 s com 3 tentativas
  sai por centavos de dólar.
- O Google aplica limites de gasto por nível de conta. Configure alertas de orçamento no Google Cloud se ligar a cobrança.

Links oficiais:
- Preços: https://ai.google.dev/gemini-api/docs/pricing
- Limites de uso: https://ai.google.dev/gemini-api/docs/rate-limits
- Cobrança: https://ai.google.dev/gemini-api/docs/billing
- Voz (TTS): https://ai.google.dev/gemini-api/docs/speech-generation

## 9. Se a chave vazar: substituir ou revogar

Sinais de vazamento: você mandou a chave para alguém, publicou um print, enviou a pasta com o `.env` ou vê
uso que não reconhece.

1. Abra https://aistudio.google.com/apikey
2. Encontre a chave e **apague/revogue** (ícone de lixeira ou menu da chave). Ela para de funcionar na hora.
3. Crie uma chave nova (passo 5).
4. No kit: `npm run chave` e cole a nova.
5. Para só apagar a chave do kit: `npm run chave -- --remover`.

## Conferir se a chave vazou

```
npm run procurar-chave
```

Procura a chave em todos os arquivos do kit e dos seus vídeos (menos o próprio `.env`) e mostra **só o nome dos arquivos**
onde ela aparece, nunca a chave. Para incluir um arquivo de log: `npm run procurar-chave -- caminho/do/log.txt`.

## Segurança: o que o kit faz com a sua chave

- Guarda só no arquivo `.env` da pasta do kit (que **nunca** entra no GitHub: está no `.gitignore`).
- Nunca mostra a chave em mensagens, erros ou relatórios.
- Envia a chave apenas para `generativelanguage.googleapis.com` (servidor oficial do Google), no cabeçalho da requisição.
- Se você compartilhar a pasta do kit com alguém, **apague o `.env` antes** (ou rode `npm run chave -- --remover`).

Documentação oficial sobre chaves: https://ai.google.dev/gemini-api/docs/api-key
