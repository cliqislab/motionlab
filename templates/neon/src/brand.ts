import { Easing, interpolate, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import CONTEUDO from "../conteudo.json";
import { FPS as FPS_TL, montarLinhaDoTempo } from "./timeline.mjs";

// Tudo o que você personaliza fica no conteudo.json (cores, formato, textos, cenas).
// Este arquivo só transforma o conteudo.json em valores usados pela animação.
export const TL = montarLinhaDoTempo(CONTEUDO);
export type CenaTL = (typeof TL.cenas)[number];

export const FONT = "InterV";
export const MONO = "MonoV";
loadFont({ family: FONT, url: staticFile("inter.woff2"), weight: "100 900" });
loadFont({ family: MONO, url: staticFile("mono.woff2"), weight: "100 800" });

export const C = {
  bg: TL.cores.fundo,
  panel: "#131315",
  panel2: "#1B1B1E",
  line: "#2A2A2F",
  white: TL.cores.texto,
  gray: "#7C7C84",
  gray2: "#4A4A50",
  orange: TL.cores.destaque, // cor de destaque (troque em conteudo.json > cores > destaque)
  orange2: "#FF8A3D",
  red: "#FF2E3A",
  green: "#3DFFA0",
  cyan: "#3DE1FF",
};

export const FPS = FPS_TL;
export const W = TL.width;
export const H = TL.height;
export const VO = TL.vo; // a narração começa em VO segundos
export const TOTAL_S = TL.duracaoTotal;
export const VERTICAL = H > W;
// escala dos elementos: 1 no 16:9; no vertical e no quadrado a largura é 1080, então tudo encolhe um pouco
export const S = VERTICAL ? 0.9 : W === H ? 0.8 : Math.min(1, W / 1750);

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const outBack = Easing.bezier(0.34, 1.56, 0.64, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const inExpo = Easing.bezier(0.7, 0, 0.84, 0);

// interpolação em SEGUNDOS, com clamp
export const io = (
  t: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (n: number) => number = outExpo,
) =>
  interpolate(t, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
