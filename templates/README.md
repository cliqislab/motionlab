# Templates

Cada pasta aqui é um template. Liste os disponíveis com `npm run templates`.

| id | nome | status |
|---|---|---|
| `neon` | Neon Tech | pronto |

Só aparecem como recurso do produto os templates com `"status": "pronto"`.
O comando `npm run novo` recusa templates com outro status.

## Como adicionar um template novo

1. Copie a pasta `neon/` com outro nome, por exemplo `clean/`.
2. Edite `template.json`:
   - `id` igual ao nome da pasta;
   - `nome`, `descricao`, `resolucoes`, `duracao`, `parametros`, `exemplo`;
   - `status`: use `"em-desenvolvimento"` enquanto não estiver testado.
3. Mude o visual em `src/brand.ts` (cores, fontes), `src/fx.tsx` (efeitos) e `src/cenas.tsx` (tipos de cena).
   Mantenha `src/timeline.mjs` compatível: ele é lido pelo vídeo e pelo gerador de áudio.
4. Ajuste o `conteudo.json` padrão do template.
5. Teste: `npm run novo -- teste-clean --template clean` (precisa de `"status": "pronto"`),
   `npm run checar -- teste-clean`, `npm run previa -- teste-clean` e `npm run render -- teste-clean`
   nos formatos 16:9 e 9:16.
6. Só então troque o status para `"pronto"`.

Estrutura obrigatória de um template:

```
templates/<id>/
  template.json      metadados (lidos por npm run templates e npm run novo)
  conteudo.json      conteúdo inicial de um vídeo novo
  src/index.ts       entrada do Remotion (registerRoot)
  src/Root.tsx       composição "MotionVideo"
  src/timeline.mjs   conteudo.json -> tempos de cenas e eventos de som
```
