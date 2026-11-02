# Exemplo: Nexa App (aplicativo fictício)

Vídeo vertical (9:16, ~33 s) que apresenta um aplicativo de tarefas **que não existe**.
Serve para mostrar o que o template Neon faz: texto animado, chips riscados, tela de app
com contador e lista, gráfico de barras, número que conta, comparação antes x depois e chamada final.

Todos os números são ilustrativos. "Nexa" é um nome inventado para demonstração; se você for usar
este vídeo publicamente, troque o nome e os dados pelos do seu produto.

Gerar o vídeo:

```
npm run demo            # cria videos/nexa-app-demo e exporta o MP4
npm run demo -- --previa  # versão rápida em baixa resolução
```

Depois, edite `videos/nexa-app-demo/conteudo.json` e rode `npm run render -- nexa-app-demo`.
