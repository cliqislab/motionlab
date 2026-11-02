# Licenças e atribuições

## 1. Licença de uso do MotionLab Kit

Ao comprar o MotionLab Kit você recebe uma licença **pessoal, não exclusiva e intransferível** para:

- usar o kit em quantos computadores seus quiser;
- criar quantos vídeos quiser, para você ou para clientes, inclusive com fins comerciais;
- modificar o código para uso próprio.

Não é permitido:

- revender, redistribuir, compartilhar ou publicar o kit (ou partes dele, modificadas ou não) como produto,
  template, curso ou repositório público;
- remover este arquivo ou as atribuições abaixo.

**Os vídeos que você cria são seus.** As animações, trilhas e efeitos sonoros gerados pelo kit podem ser usados
comercialmente sem pagar nada ao autor do kit. Você é responsável pelos textos, imagens, marcas e dados que
colocar nos vídeos.

O kit é fornecido "como está", sem garantia de funcionamento em todos os computadores.

> Nota ao vendedor: revise este texto com um advogado antes da venda e inclua o nome do titular e o contato de suporte.

## 2. Componentes de terceiros

O pacote do kit contém **apenas código próprio**. As bibliotecas abaixo **não vêm dentro do ZIP**: o `npm run setup`
baixa cada uma da fonte oficial (npm e PyPI) no seu computador, e cada uma tem a sua licença.

### Motor de animação

| Componente | Licença | O que significa para você |
|---|---|---|
| Remotion (`remotion`, `@remotion/cli`, `@remotion/media`) | **Remotion License** | Gratuito para pessoa física e empresas com **até 3 pessoas**, inclusive uso comercial. Empresas com 4 ou mais pessoas precisam comprar a Company License. https://www.remotion.dev/docs/license |
| `@remotion/noise`, `@remotion/fonts` | MIT | livre |
| React, React DOM | MIT | livre |
| TypeScript | Apache-2.0 | livre |
| Chrome Headless Shell (baixado pelo Remotion para renderizar) | licenças do projeto Chromium (BSD e outras) | livre para este uso |

### Fontes

| Fonte | Licença |
|---|---|
| Inter (`@fontsource-variable/inter`) | SIL Open Font License 1.1 |
| JetBrains Mono (`@fontsource-variable/jetbrains-mono`) | SIL Open Font License 1.1 |

As fontes OFL podem ser usadas em vídeos comerciais sem atribuição no vídeo.

### Áudio e narração (Python)

| Componente | Licença | Observação |
|---|---|---|
| numpy | BSD-3-Clause | trilha e efeitos sintetizados |
| Pillow | MIT-CMU (HPND) | imagens de revisão |
| faster-whisper, CTranslate2, onnxruntime | MIT | sincronia de palavras |
| Modelos Whisper (baixados na 1ª narração) | MIT | transcrição local |
| PyAV, tokenizers, huggingface_hub e dependências | BSD/Apache-2.0/MIT | instaladas automaticamente |
| edge-tts | LGPL-3.0 | ver aviso abaixo |
| FFmpeg (você instala) | LGPL/GPL conforme a sua instalação | o kit chama o programa, não o redistribui |

### Trilha sonora e efeitos sonoros

São **gerados por código** (`scripts/score.py`) no seu computador. Não há música de banco ou amostras gravadas:
não existe direito autoral de terceiros sobre eles.

## 3. Serviços externos

| Serviço | Termos | Observação |
|---|---|---|
| Claude Code (Anthropic) | https://www.anthropic.com/legal | exige assinatura paga ou conta de API |
| Gemini API (Google) | https://ai.google.dev/gemini-api/terms | narração Fenrir; no nível gratuito, o Google pode usar o conteúdo enviado para melhorar os produtos |
| Voz gratuita (edge-tts) | sem termos oficiais para este uso | ver aviso |

**Aviso sobre a voz gratuita (edge-tts):** ela usa o serviço de leitura em voz alta do navegador Microsoft Edge por um
caminho **não oficial**. Não há uma licença clara para uso comercial do áudio gerado e o serviço pode parar de funcionar
a qualquer momento. Use para rascunhos e testes. Para vídeos comerciais, use a narração Gemini ou grave sua voz.

## 4. Marcas

"Claude" e "Claude Code" são marcas da Anthropic. "Gemini" e "Google AI Studio" são marcas do Google.
"Remotion" é marca da Remotion AG. O MotionLab Kit é um produto independente e **não é afiliado, patrocinado ou
endossado** por essas empresas.

O exemplo "Nexa App" é fictício. Qualquer semelhança com produtos reais é coincidência; troque o nome antes de
publicar um vídeo baseado nele.

## 5. O que não está incluído (e por quê)

- **GSAP**: não faz parte do kit. A licença gratuita do GSAP proíbe o uso em ferramentas de criação visual de
  animação que concorram com o Webflow. O kit usa somente Remotion.
- **Skills de terceiros** (Brag, Motionmaxxing, skills oficiais do Remotion/HyperFrames): não são distribuídas.
  Se quiser usá-las, instale pelos repositórios oficiais, respeitando as licenças de cada uma.
