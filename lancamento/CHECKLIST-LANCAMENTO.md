# Checklist de lançamento — MotionLab Kit v1.0.0 (interno, não vai no ZIP)

Legenda: [x] feito e verificado · [ ] pendente · **BLOQUEIO** = impede a venda.
Resultados detalhados dos testes: `lancamento/RELATORIO-QA.md`.

## 1. Segurança

- [ ] **BLOQUEIO** Revogar no Google AI Studio a chave Gemini antiga do projeto original (`saida7-bongas/.env`). Ela apareceu em log de sessão durante a auditoria. Não usar essa chave em nenhum teste.
- [x] Pacote sem credenciais, `.env`, caminhos absolutos, nomes de clientes, e-mail ou telefone pessoal (`npm run verificar-pacote`).
- [x] Chave Gemini nunca impressa: testado com chave falsa (`chave --testar`, `tts_gemini.py`, `procurar-chave`).
- [x] `.env` com permissão 600 no macOS; `.env` no `.gitignore`.
- [x] Dependências npm só do registro oficial e com hash de integridade (verificado no `package-lock.json`).
- [ ] Teste com chave real seguindo `TESTE-GEMINI-CHAVE-REAL.md` (inclui `procurar-chave` no log).
- [ ] Confirmar permissões do `.env` no Windows (checklist Windows).

## 2. Funcionamento

- [x] macOS arm64: instalação a partir do ZIP, demo com som, novo vídeo, narração gratuita, render, prévias, Studio.
- [x] Instalação em conta "limpa" simulada (HOME vazio, pasta com acento e espaço), demo, narração gratuita, render e skill isolada — ver RELATORIO-QA.md.
- [ ] **BLOQUEIO** Windows 11 x64: executar `TESTE-WINDOWS11.md` inteiro. Até lá, vender só para macOS **ou** manter o aviso "Windows não testado" na página de vendas.
- [ ] **BLOQUEIO** Narração Gemini com chave real (`TESTE-GEMINI-CHAVE-REAL.md`). Alternativa: anunciar a narração Gemini como "beta".
- [ ] macOS Intel (x64): não testado.
- [ ] Node 18 e 20 (testado só com 23) e Python 3.11–3.13 (testado só com 3.9): testar ao menos Node 20 LTS + Python 3.12, a combinação que um iniciante instala hoje.
- [ ] Máquina modesta (8 GB RAM): medir o tempo de render do demo e atualizar REQUISITOS.md.
- [ ] Teste com 2 a 3 pessoas leigas seguindo só o SEU-PRIMEIRO-VIDEO.md; anotar onde travam.

## 3. Licenças e jurídico

- [ ] **BLOQUEIO** Advogado revisar `LICENCAS.md` (licença do comprador) e incluir titular, CNPJ/CPF, contato de suporte e política de reembolso (CDC, 7 dias).
- [ ] **BLOQUEIO** Confirmar a titularidade do código da skill `motion-video` (declarada como criada pelo vendedor via prompt).
- [ ] Confirmar com a Remotion se a venda do kit exige licença do vendedor (obrigatória se a empresa vendedora tiver 4+ pessoas) e se o aviso ao comprador basta. Ver `LICENCAS-DEPENDENCIAS.md`.
- [ ] Decidir sobre a voz gratuita edge-tts (serviço não oficial, sem autorização para uso comercial): manter como "rascunho", remover ou substituir.
- [ ] Confirmar nos termos da Gemini API as regras de uso comercial do áudio gerado.
- [ ] Busca de marca "MotionLab" no INPI.
- [ ] Material de venda sem logo da Anthropic/Google/Remotion e sem sugerir parceria.

## 4. Conteúdo do pacote

- [x] Só arquivos da lista do pacote (verificação automática com lista fechada).
- [x] Nenhum vídeo, áudio, fonte, binário ou dependência de terceiros dentro do ZIP.
- [x] Nenhum arquivo do projeto original; o kit funciona sem acesso a ele (teste em HOME limpo, fora da pasta original).
- [x] Pasta `lancamento/` (documentos internos) fica fora do ZIP.
- [x] Exemplo fictício (Nexa App) com aviso de dados ilustrativos.
- [ ] Revisar com olhos humanos as imagens de `docs/img/` antes de publicar.

## 5. Experiência do comprador

- [x] `npm run setup` informa cada etapa, o que fazer manualmente e os próximos passos.
- [x] `npm run doctor` com "como resolver" em cada item.
- [x] Mensagens de erro com caminho de recuperação (JSON com linha e dica, render, FFmpeg ausente, erro inesperado).
- [x] Tutorial ilustrado `SEU-PRIMEIRO-VIDEO.md`.
- [ ] Gravar vídeo-aula curta (instalação macOS, instalação Windows, primeiro vídeo) para a área de membros.
- [ ] Definir canal de suporte e colocar em README.md e ERROS-COMUNS.md.

## 6. Venda

- [ ] Página de vendas com: requisitos reais (assinatura paga do Claude, macOS/Windows x64), o que **não** faz, custos externos.
- [ ] Vídeo de vitrine feito com o próprio kit (pode usar o Nexa App ou um novo fictício). Não usar vídeos de clientes.
- [ ] Gerar o ZIP final com `npm run pacote` **depois** de todos os bloqueios resolvidos; conferir o hash do arquivo e guardar uma cópia.
- [ ] Subir na plataforma (Hotmart/Kiwify) somente após o item acima.
- [ ] Versionar em repositório **privado** (não publicar).

## Situação atual

**NÃO PRONTO PARA VENDA.** Bloqueios abertos: chave antiga não revogada, Windows não testado, narração Gemini real não
testada, revisão jurídica da licença e confirmação de titularidade do código.
