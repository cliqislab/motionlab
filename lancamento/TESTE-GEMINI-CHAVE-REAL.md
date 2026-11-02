# Roteiro de teste: narração Gemini com chave real (interno)

Status: **NÃO EXECUTADO.** Até agora só foram testados os caminhos de erro (chave falsa recusada, chave não aparece nas
mensagens). A geração de voz real com `gemini-3.8-flash-tts` nunca rodou no kit.

## Regras de segurança do teste

- Use uma chave **nova, criada só para este teste**, num projeto do Google Cloud de teste. **Nunca** a chave antiga de projetos anteriores.
- A chave é digitada **só** no `npm run chave` (entrada oculta). Não cole em chat, e-mail, documento, issue nem neste arquivo.
- Não rode com `MOTIONLAB_DEBUG=1` durante o teste (o modo de depuração imprime erros completos).
- Não grave a tela enquanto a chave estiver visível no Google AI Studio.
- Ao terminar: revogue a chave no AI Studio e rode `npm run chave -- --remover`.

## Passos

1. **Criar a chave** em https://aistudio.google.com/apikey (projeto de teste, nível gratuito).
2. **Guardar no kit**, no terminal da pasta do kit:
   ```
   npm run chave
   ```
   Esperado: nada aparece enquanto você cola; depois `✔ chave salva...` e `✔ chave aceita pela API Gemini`.
3. **Testar sem custo:**
   ```
   npm run chave -- --testar
   ```
4. **Criar um vídeo de teste e o roteiro:**
   ```
   npm run novo -- teste-gemini --formato 9:16
   ```
   Escreva em `videos/teste-gemini/roteiro.txt`:
   `Este é um teste de narração com a voz Fenrir. O MotionLab Kit transforma texto em vídeo animado.`
5. **Gerar a narração, guardando o log do terminal:**
   - macOS: `npm run narrar -- teste-gemini --voz Fenrir --takes 2 2>&1 | tee lancamento/log-gemini.txt`
   - Windows (PowerShell): `npm run narrar -- teste-gemini --voz Fenrir --takes 2 2>&1 | Tee-Object lancamento\log-gemini.txt`
6. **Conferir o resultado:**
   - [ ] a mensagem diz `modelo gemini-3.8-flash-tts, voz Fenrir` (se caiu para outro modelo, anote qual e o erro do primeiro);
   - [ ] `videos/teste-gemini/audio/narr_raw_a.wav` e `_b.wav` existem e tocam com a voz certa, **sem estalo ou ruído no início** (confirma que o WAV devolvido pelo 3.8 foi tratado como WAV e não como PCM cru);
   - [ ] a voz lê **só** o texto, sem ler instruções;
   - [ ] `audio/palavras.json` tem as palavras com tempos.
7. **Testar a voz com estilo (opcional):** `TTS_TAG="locutor animado"` só vale para modelos antigos; no 3.8 o kit ignora a tag de propósito. Confira que nada foi lido em voz alta.
8. **Render com voz:** peça ao Claude "sincronize as cenas com a narração" ou rode `npm run render -- teste-gemini`. Ouça: a trilha abaixa quando a voz fala?
9. **Provar que a chave não vazou:**
   ```
   npm run procurar-chave -- lancamento/log-gemini.txt
   ```
   Esperado: `✔ a chave não aparece em nenhum arquivo além do .env`.
   Repita depois de um erro proposital (passo 10).
10. **Erro proposital:** com a internet desligada, rode o passo 5 de novo. Esperado: mensagens `falhou: ...` **sem** a chave; `procurar-chave` continua limpo.
11. **Limite gratuito:** se aparecer `HTTP 429`, anote quantas narrações foram feitas até o limite (informação útil para REQUISITOS.md).
12. **Limpeza:**
    ```
    npm run chave -- --remover
    ```
    Revogue a chave no AI Studio. Apague `lancamento/log-gemini.txt` e a pasta `videos/teste-gemini` (não vão para o ZIP, mas não precisam ficar).

## Registro (preencha sem nenhum dado da chave)

| Item | Resultado |
|---|---|
| Data / sistema | |
| Modelo usado | |
| Tempo para gerar 2 takes | |
| Qualidade da voz (1-5) | |
| Estalo no início do WAV? | |
| procurar-chave limpo? | |
| Custo observado no console (se pago) | |
