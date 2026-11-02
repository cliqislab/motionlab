# Integração das skills originais ao MotionLab

Origem: arquivo `skills.zip` fornecido pelo proprietário do MotionLab em 02/11/2026.

## Comandos e execução

- `/motion`: atalho principal para `motion-video` (Remotion como motor principal).
- `motion-video`: direção/roteiro, produção do vídeo, Gemini TTS e edição de vídeos gravados; inclui seus próprios scripts e template original.
- `motionmaxxing`: critérios de direção, estética, movimento e revisão G0-G5; seus arquivos de referência e ferramentas estão em `.claude/skills/motionmaxxing`.
- `/brag`: **não está no ZIP**. A skill original aponta para `~/.claude/plugins/marketplaces/brag/skills/brag`. O instalador deve orientar a instalar esse plugin pela fonte oficial, mas não exigir sua presença para a criação de vídeos. Sem ele, fazer `brag-plan.md` com (1) material recebido, (2) conceito e promessa comprovada, (3) tom, (4) gancho inicial, (5) storyboard e CTA, adotando as leis de julgamento do Motionmaxxing.

## Limites desta distribuição

Os arquivos do Motionmaxxing são Apache 2.0 **na parte autoral**; `LICENSE` e `NOTICE` foram preservados. O ZIP contém também GSAP, Three.js, OpenType e fontes sob licenças próprias. O runtime vendorizado do GSAP e os grandes vendors/fonts da versão original **não foram inseridos** na distribuição comercial neste momento, em razão dos termos específicos do GSAP para produtos que permitam criar animações. Portanto:

1. A implementação padrão usa Remotion, existente no MotionLab. Não invoque automaticamente o renderizador HTML GSAP quando seus arquivos não estiverem presentes.
2. Use Motionmaxxing como referência de concepção/qualidade, e seus scripts de análise que forem executáveis no ambiente.
3. Se uma cena demandar `hero3d` ou HTML/HyperFrames, explique os requisitos e solicite autorização antes de instalar bibliotecas ou usar um runtime de licença ainda não revisada.
4. Não invente que os gates passaram: `look.py` pode verificar o MP4; `lint.mjs` é aplicável aos projetos HTML. Para Remotion, faça as avaliações visuais não automatizadas e registre-as no `NOTE.md`.
5. A biblioteca `moments.jsonl` e arquivos de demonstração grandes não foram redistribuídos aqui. Scripts que exijam esses materiais devem avisar e usar avaliação manual como fallback.

## Guia para o usuário

1. Abrir projeto no VS Code pelo instalador.
2. Em Terminal → Novo Terminal, iniciar `claude`.
3. Pedir `/motion` seguido de descrição do comercial. Para imagens, salvá-las em `videos/<projeto>/public/referencias/` e informar os caminhos ao Claude.
4. Conferir storyboard e styleframes, aprovar e só depois renderizar o MP4.
5. Para voz, configurar a chave Gemini no instalador; nunca inserir chaves nos prompts.

## Revisão comercial necessária

Antes de anunciar recursos HyperFrames/GSAP como inclusos, revisar a licença GSAP para o formato de produto low-ticket que permite ao cliente criar vídeos. Não apagar `NOTICE` ou textos de licença nas redistribuições.
