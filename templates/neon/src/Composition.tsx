import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, FPS, TL, VO } from "./brand";
import { Flash, GlitchBars, Grain, HUD, Vignette, glitchAmt, useShake } from "./fx";
import { CENAS } from "./cenas";

export const MotionVideo: React.FC = () => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = fr / FPS - VO;
  const shake = useShake();
  const g = glitchAmt(t);
  const ultima = TL.cenas.length - 1;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: shake, filter: g > 0 ? `drop-shadow(${12 * g}px 0 0 ${C.red}aa) drop-shadow(${-12 * g}px 0 0 ${C.cyan}88)` : undefined }}>
        {TL.cenas.map((c, i) => {
          const visivel = (t >= c.inicio || i === 0) && (t < c.fim || i === ultima);
          const Cena = CENAS[c.tipo];
          return visivel && Cena ? <Cena key={i} c={c} /> : null;
        })}
      </AbsoluteFill>
      <GlitchBars />
      <Flash />
      {TL.efeitos.hud ? <HUD /> : null}
      <Vignette />
      {TL.efeitos.grao ? <Grain /> : null}
      {TL.audio ? <Audio src={staticFile("mixed.wav")} premountFor={fps} /> : null}
    </AbsoluteFill>
  );
};
