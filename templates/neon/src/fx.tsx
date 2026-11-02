import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C, FONT, FPS, H, MONO, TL, VO, W, inExpo, io, outBack, outExpo } from "./brand";

const EV = TL.eventos;

// tempo atual em segundos (descontado o atraso da narração)
export const useT = () => useCurrentFrame() / FPS - VO;

// ---------- texto com *destaque* na cor de destaque ----------
type Tok = { w: string; hi: boolean };
const parse = (s: string): Tok[] => {
  const out: Tok[] = [];
  let hi = false;
  for (const raw of s.split(" ")) {
    let w = raw;
    const open = w.startsWith("*");
    if (open) { hi = true; w = w.slice(1); }
    const close = w.endsWith("*");
    if (close) w = w.slice(0, -1);
    out.push({ w, hi });
    if (close) hi = false;
  }
  return out;
};

// Kinetic typography: a palavra é a cena
export const KT: React.FC<{
  at: number;
  text: string;
  size?: number;
  mode?: "up" | "type" | "expand" | "pop" | "slam";
  weight?: number;
  color?: string;
  hiColor?: string;
  stagger?: number;
  align?: "center" | "left";
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({ at, text, size = 120, mode = "up", weight = 900, color = C.white, hiColor = C.orange, stagger = 0.06, align = "center", glow = true, style }) => {
  const t = useT();
  const toks = parse(text);
  const base: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1.0,
    letterSpacing: "-0.035em",
    color,
    textAlign: align,
    textTransform: "uppercase",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: align === "center" ? "center" : "flex-start",
    gap: `0 ${size * 0.26}px`,
    ...style,
  };
  const hiStyle = (hi: boolean): React.CSSProperties =>
    hi ? { color: hiColor, textShadow: glow ? `0 0 ${size * 0.35}px ${hiColor}88` : undefined } : {};

  if (mode === "type") {
    const full = toks.map((x) => x.w).join(" ");
    const n = Math.floor(Math.max(0, t - at) / 0.022);
    let k = 0;
    const blink = Math.floor((t - at) * 3) % 2 === 0;
    return (
      <div style={base}>
        <span>
          {toks.map((x, i) => {
            const s = x.w.slice(0, Math.max(0, n - k));
            k += x.w.length + 1;
            return (
              <span key={i} style={hiStyle(x.hi)}>
                {s}
                {i < toks.length - 1 && n >= k ? " " : ""}
              </span>
            );
          })}
          <span style={{ color: C.orange, opacity: t >= at && (n < full.length || blink) ? 1 : 0 }}>▍</span>
        </span>
      </div>
    );
  }

  return (
    <div style={base}>
      {toks.map((x, i) => {
        const a = at + i * stagger;
        let st: React.CSSProperties = {};
        if (mode === "up") {
          const p = io(t, a, a + 0.28);
          st = { transform: `translateY(${(1 - p) * 105}%)`, opacity: p > 0 ? 1 : 0 };
          return (
            <span key={i} style={{ overflow: "hidden", display: "inline-block", paddingBottom: size * 0.08, marginBottom: -size * 0.08 }}>
              <span style={{ display: "inline-block", ...st, ...hiStyle(x.hi) }}>{x.w}</span>
            </span>
          );
        }
        if (mode === "expand") {
          const p = io(t, a, a + 0.45);
          st = { letterSpacing: `${(1 - p) * 0.5 - 0.035}em`, filter: `blur(${(1 - p) * 18}px)`, opacity: p };
        }
        if (mode === "pop") {
          const p = io(t, a, a + 0.3, 0, 1, outBack);
          const q = io(t, a, a + 0.18);
          st = { transform: `scale(${1.5 - 0.5 * p})`, filter: `blur(${(1 - q) * 14}px)`, opacity: q };
        }
        if (mode === "slam") {
          const p = io(t, a, a + 0.16, 0, 1, inExpo);
          st = { transform: `scale(${3.2 - 2.2 * p})`, opacity: io(t, a, a + 0.06), filter: `blur(${(1 - p) * 20}px)` };
        }
        return (
          <span key={i} style={{ display: "inline-block", ...st, ...hiStyle(x.hi) }}>
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

// risco vermelho que atravessa (strike)
export const Strike: React.FC<{ at: number; color?: string; thick?: number; angle?: number }> = ({ at, color = C.red, thick = 12, angle = -4 }) => {
  const t = useT();
  const p = io(t, at, at + 0.2);
  return (
    <div
      style={{
        position: "absolute",
        left: "-4%",
        top: "50%",
        height: thick,
        width: `${108 * p}%`,
        background: color,
        boxShadow: `0 0 24px ${color}`,
        transform: `translateY(-50%) rotate(${angle}deg)`,
        transformOrigin: "left center",
        borderRadius: thick,
      }}
    />
  );
};

// pílula/caixa estilo UI
export const Chip: React.FC<{ at: number; children: React.ReactNode; strike?: number; w?: number; style?: React.CSSProperties; from?: "left" | "right" | "up" }> = ({ at, children, strike, w, style, from = "up" }) => {
  const t = useT();
  const p = io(t, at, at + 0.35);
  const dx = from === "left" ? -120 : from === "right" ? 120 : 0;
  const dy = from === "up" ? 60 : 0;
  const dead = strike !== undefined && t >= strike;
  return (
    <div
      style={{
        position: "relative",
        opacity: p * (dead ? 0.55 + 0.45 * (1 - io(t, strike!, strike! + 0.4)) : 1),
        transform: `translate(${dx * (1 - p)}px, ${dy * (1 - p)}px) scale(${0.9 + 0.1 * p})`,
        filter: `blur(${(1 - p) * 10}px)`,
        background: C.panel,
        border: `2px solid ${dead ? C.red : C.line}`,
        borderRadius: 22,
        padding: "26px 44px",
        width: w,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 58,
        letterSpacing: "-0.02em",
        color: C.white,
        textTransform: "uppercase",
        boxShadow: "0 30px 80px rgba(0,0,0,.6)",
        ...style,
      }}
    >
      {children}
      {strike !== undefined && <Strike at={strike} />}
    </div>
  );
};

// grade de fundo (vai dentro da câmera, então "anda" junto)
export const Grid: React.FC<{ size?: number; opacity?: number }> = ({ size = 80, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      inset: "-60%",
      opacity,
      backgroundImage: `linear-gradient(${C.line}66 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.line}66 1.5px, transparent 1.5px)`,
      backgroundSize: `${size}px ${size}px`,
      maskImage: "radial-gradient(ellipse at center, #000 20%, transparent 62%)",
      WebkitMaskImage: "radial-gradient(ellipse at center, #000 20%, transparent 62%)",
    }}
  />
);

// câmera 3D virtual: drift contínuo de rotação/zoom + entrada com motion blur
export type Cam = { rx?: [number, number]; ry?: [number, number]; z?: [number, number]; x?: [number, number]; y?: [number, number] };
export const Camera: React.FC<{ a: number; b: number; cam?: Cam; children: React.ReactNode; enter?: "zoom" | "left" | "right" | "down" }> = ({ a, b, cam = {}, children, enter = "zoom" }) => {
  const t = useT();
  const p = io(t, a, b, 0, 1, (n) => n);
  const L = (r: [number, number] | undefined, d: number) => (r ? r[0] + (r[1] - r[0]) * p : d);
  const e = io(t, a, a + 0.32);
  const ex = enter === "left" ? -300 : enter === "right" ? 300 : 0;
  const ey = enter === "down" ? -260 : 0;
  const es = enter === "zoom" ? 1.35 - 0.35 * e : 1;
  // saída: puxa um pouco e borra (vira o whoosh)
  const o = io(t, b - 0.12, b, 0, 1, inExpo);
  return (
    <AbsoluteFill style={{ perspective: 1600, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${L(cam.x, 0) + ex * (1 - e)}px, ${L(cam.y, 0) + ey * (1 - e)}px) scale(${L(cam.z, 1) * es * (1 + o * 0.25)}) rotateX(${L(cam.rx, 0)}deg) rotateY(${L(cam.ry, 0)}deg)`,
          filter: `blur(${(1 - e) * 16 + o * 14}px)`,
          opacity: Math.min(1, e * 1.6) * (1 - o * 0.6),
          transformStyle: "preserve-3d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {TL.efeitos.grade ? <Grid /> : null}
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- efeitos globais ----------
export const useShake = () => {
  const t = useT();
  let x = 0, y = 0, r = 0;
  for (const [at, amp] of EV.shake as [number, number][]) {
    const d = t - at;
    if (d < 0 || d > 0.45) continue;
    const k = amp * Math.exp(-d / 0.11);
    x += noise2D("sx" + at, d * 40, 0) * 34 * k;
    y += noise2D("sy" + at, d * 40, 1) * 24 * k;
    r += noise2D("sr" + at, d * 30, 2) * 1.2 * k;
  }
  return `translate(${x}px, ${y}px) rotate(${r}deg)`;
};

export const glitchAmt = (t: number) => {
  for (const [at, d] of EV.glitch as [number, number][]) {
    if (t >= at && t <= at + d) return 1 - (t - at) / d;
  }
  return 0;
};

export const GlitchBars: React.FC = () => {
  const t = useT();
  const fr = useCurrentFrame();
  const g = glitchAmt(t);
  if (g <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {new Array(7).fill(0).map((_, i) => {
        const y = random(`gy${fr}${i}`) * H;
        const h = 4 + random(`gh${fr}${i}`) * 40;
        const x = (random(`gx${fr}${i}`) - 0.5) * 300;
        const col = [C.orange, C.cyan, C.white, C.red][i % 4];
        return <div key={i} style={{ position: "absolute", top: y, left: x, width: "100%", height: h, background: col, opacity: 0.18 * g + 0.1 }} />;
      })}
    </AbsoluteFill>
  );
};

export const Flash: React.FC = () => {
  const t = useT();
  let o = 0;
  for (const [at, m] of EV.flash as [number, number][]) {
    o = Math.max(o, m * io(t, at, at + 0.05) * (1 - io(t, at + 0.05, at + 0.35)));
  }
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none", mixBlendMode: "overlay" }} />;
};

// grão barato: PNG estático deslocado por frame (feTurbulence é gargalo)
export const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  const x = Math.floor(random(`nx${fr}`) * 200);
  const y = Math.floor(random(`ny${fr}`) * 200);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", opacity: 0.07, mixBlendMode: "overlay" }}>
      <Img src={staticFile("noise.png")} style={{ position: "absolute", left: -x, top: -y, width: 2400, height: 1400 }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,.78) 100%)", pointerEvents: "none" }} />
);

// HUD de interface: cantos, timecode, arquivo
export const HUD: React.FC = () => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  const tc = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}:${String(fr % FPS).padStart(2, "0")}`;
  const corner = (st: React.CSSProperties) => <div style={{ position: "absolute", width: 44, height: 44, borderColor: C.gray2, borderStyle: "solid", borderWidth: 0, ...st }} />;
  const txt: React.CSSProperties = { position: "absolute", fontFamily: MONO, fontSize: 22, color: C.gray, letterSpacing: "0.08em" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {corner({ left: 48, top: 48, borderLeftWidth: 3, borderTopWidth: 3 })}
      {corner({ right: 48, top: 48, borderRightWidth: 3, borderTopWidth: 3 })}
      {corner({ left: 48, bottom: 48, borderLeftWidth: 3, borderBottomWidth: 3 })}
      {corner({ right: 48, bottom: 48, borderRightWidth: 3, borderBottomWidth: 3 })}
      <div style={{ ...txt, left: 112, top: 58 }}>
        <span style={{ color: C.orange }}>●</span> MOTIONLAB
      </div>
      <div style={{ ...txt, right: 112, top: 58 }}>{W}×{H} · 30FPS</div>
      <div style={{ ...txt, left: 112, bottom: 58 }}>RENDER: CÓDIGO</div>
      <div style={{ ...txt, right: 112, bottom: 58, color: C.white }}>{tc}</div>
    </AbsoluteFill>
  );
};

export { outExpo };

// ---------- janela de interface (3 bolinhas + título) ----------
export const Panel: React.FC<{ title: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, children, style }) => (
  <div style={{ background: C.panel, border: `2px solid ${C.line}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,.7)", ...style }}>
    <div style={{ height: 54, borderBottom: `2px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
      {[C.red, C.orange2, C.gray2].map((c, i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
      ))}
      <div style={{ marginLeft: 16, fontFamily: MONO, fontSize: 22, color: C.gray, letterSpacing: "0.1em" }}>{title}</div>
    </div>
    {children}
  </div>
);

// texto digitado (cps = caracteres por segundo)
export const typed = (t: number, at: number, s: string, cps = 45) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));

// bloco de código digitado com syntax highlight: cada linha = [palavra-chave, destaque, resto]
export const CodeBlock: React.FC<{ at: number; lines: string[][]; title?: string; size?: number; cps?: number; width?: number }> = ({ at, lines, title = "motion.tsx", size = 38, cps = 70, width = 1240 }) => {
  const t = useT();
  let start = at;
  return (
    <Panel title={title} style={{ width }}>
      <div style={{ padding: "30px 40px", fontFamily: MONO, fontSize: size, lineHeight: 1.7 }}>
        {lines.map((l, i) => {
          const s0 = start;
          start += l.join("").length / cps + 0.05;
          const n = Math.max(0, Math.floor((t - s0) * cps));
          let k = 0;
          return (
            <div key={i} style={{ display: "flex", whiteSpace: "pre" }}>
              <span style={{ color: C.gray2, width: 60, flexShrink: 0 }}>{i + 1}</span>
              {l.map((seg, j) => {
                const vis = seg.slice(0, Math.max(0, n - k));
                k += seg.length;
                return <span key={j} style={{ color: j === 0 ? C.cyan : j === 1 ? C.orange : C.white }}>{vis}</span>;
              })}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// RGB split em texto de impacto durante glitch
export const rgb = (t: number): React.CSSProperties => {
  const g = glitchAmt(t);
  if (g <= 0) return {};
  const d = 10 * g;
  return { textShadow: `${d}px 0 0 ${C.red}cc, ${-d}px 0 0 ${C.cyan}aa` };
};
export const col = (gap = 30, st: React.CSSProperties = {}): React.CSSProperties => ({ display: "flex", flexDirection: "column", alignItems: "center", gap, ...st });
export const fade = (t: number, a: number, b: number) => 1 - io(t, a, b);
