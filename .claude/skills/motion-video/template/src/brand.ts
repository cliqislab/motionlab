import { Easing, interpolate, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import EV from "./events.json";

export const FONT = "InterV";
export const MONO = "MonoV";
loadFont({ family: FONT, url: staticFile("inter.woff2"), weight: "100 900" });
loadFont({ family: MONO, url: staticFile("mono.woff2"), weight: "100 800" });

export const C = {
  bg: "#09090A",
  panel: "#131315",
  panel2: "#1B1B1E",
  line: "#2A2A2F",
  white: "#F4F4F1",
  gray: "#7C7C84",
  gray2: "#4A4A50",
  orange: EV.accent, // cor de destaque (troque no events.json)
  orange2: "#FF8A3D",
  red: "#FF2E3A",
  green: "#3DFFA0",
  cyan: "#3DE1FF",
};

export const FPS = 30;
export const W = EV.width;
export const H = EV.height;
export const VO = EV.vo; // narração começa em VO segundos
export const TOTAL_S = EV.duration;

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const outBack = Easing.bezier(0.34, 1.56, 0.64, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const inExpo = Easing.bezier(0.7, 0, 0.84, 0);

// interpolação em SEGUNDOS da narração, com clamp
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
