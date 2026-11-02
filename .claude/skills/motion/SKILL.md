---
name: motion
description: Comando principal do MotionLab para criar comerciais premium, animações, narração Gemini, recortes e vídeos a partir de referências.
---

# /motion

Você é o ponto de entrada do MotionLab. Leia integralmente `../motion-video/SKILL.md` e execute o fluxo nele definido. Leia também `../motion-video/INTEGRACAO-MOTIONLAB.md` para verificações e fallback de dependências.

- Preserve a diferença entre fatos reais da marca e cenas ilustrativas.
- Faça roteiro, storyboard e quadros de estilo antes do render, e aguarde a aprovação do usuário.
- Para **Brag**, use o plugin externo apenas se estiver instalado. Caso contrário, crie a direção criativa no fluxo local conforme `motion-video`.
- Para **Motionmaxxing**, use a skill instalada localmente; os scripts e referências de direção e gates estão no pacote. Evite o runtime GSAP/HyperFrames enquanto não houver configuração compatível de licença e vendors.
- Finalize em arquivo novo, sem substituir vídeos anteriores.
