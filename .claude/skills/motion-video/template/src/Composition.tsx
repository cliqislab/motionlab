import React from "react";
import { AbsoluteFill, Composition, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, FPS, H, TOTAL_S, VO, W } from "./brand";
import { Flash, GlitchBars, Grain, HUD, Vignette, glitchAmt, useShake } from "./fx";
import { SCENES } from "./scenes";
import EV from "./events.json";

// HUD (cantos, timecode) só no estilo neon clássico: o Motionmaxxing proíbe chrome de página por padrão.
const SHOW_HUD = (EV as { hud?: boolean }).hud === true;

export const MotionVideo: React.FC = () => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = fr / FPS - VO;
  const shake = useShake();
  const g = glitchAmt(t);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: shake, filter: g > 0 ? `drop-shadow(${12 * g}px 0 0 ${C.red}aa) drop-shadow(${-12 * g}px 0 0 ${C.cyan}88)` : undefined }}>
        {SCENES.map(([a, b, S], i) => (t >= a && t < b ? <S key={i} a={a} b={b} /> : null))}
      </AbsoluteFill>
      <GlitchBars />
      <Flash />
      {SHOW_HUD ? <HUD /> : null}
      <Vignette />
      <Grain />
      <Audio src={staticFile("mixed.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <Composition id="MotionVideo" component={MotionVideo} durationInFrames={Math.round(TOTAL_S * FPS)} fps={FPS} width={W} height={H} />
);
