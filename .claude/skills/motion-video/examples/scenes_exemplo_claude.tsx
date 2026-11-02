// EXEMPLO DE REFERÊNCIA (vídeo de 52s, 16:9). Foi escrito com Panel/CodeBlock locais; no template eles já estão em fx.tsx.
// Tempos = segundos da narração daquele vídeo. Use como catálogo de padrões de cena, não copie os tempos.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, MONO, inOut, io, outBack } from "./brand";
import { Camera, Chip, KT, Strike, glitchAmt, useT } from "./fx";

type SP = { a: number; b: number };
const col = (gap = 30, st: React.CSSProperties = {}): React.CSSProperties => ({ display: "flex", flexDirection: "column", alignItems: "center", gap, ...st });
const fade = (t: number, a: number, b: number) => 1 - io(t, a, b);

// RGB split em texto de impacto durante glitch
const rgb = (t: number, base = 0): React.CSSProperties => {
  const g = Math.max(glitchAmt(t), base);
  if (g <= 0) return {};
  const d = 10 * g;
  return { textShadow: `${d}px 0 0 ${C.red}cc, ${-d}px 0 0 ${C.cyan}aa` };
};

// ======================= S1 GANCHO =======================
export const S1: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  return (
    <Camera a={a} b={b} cam={{ z: [1.0, 1.08], ry: [-6, 3] }}>
      <div style={col(34)}>
        <KT at={0.0} mode="type" text="E se eu te dissesse..." size={70} weight={700} style={{ color: C.gray, textTransform: "none", letterSpacing: "-0.01em" }} />
        <div style={{ transform: `scale(${1 + io(t, 1.26, 3, 0, 0.06)})` }}>
          <KT at={1.26} mode="expand" text="*MOTION GRAPHICS*" size={165} stagger={0.12} />
        </div>
        <KT at={1.94} mode="up" text="PROFISSIONAIS" size={96} weight={800} style={{ color: C.white, letterSpacing: "0.12em" }} />
      </div>
    </Camera>
  );
};

// ======================= S2 SEM AFTER EFFECTS =======================
export const S2: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  return (
    <Camera a={a} b={b} cam={{ z: [1.05, 0.98], rx: [4, -2] }} enter="down">
      <div style={col(46)}>
        <KT at={2.94} mode="up" text="SEM ABRIR O" size={78} weight={800} style={{ color: C.gray }} />
        <div style={{ position: "relative", ...rgb(t) }}>
          <KT at={3.44} mode="pop" text="AFTER EFFECTS" size={190} stagger={0.08} />
          <Strike at={3.95} thick={20} />
        </div>
        <div style={{ display: "flex", gap: 36, marginTop: 30 }}>
          <Chip at={4.4} strike={4.85}>TIMELINE</Chip>
          <Chip at={5.16} strike={5.6}>◆ KEYFRAME</Chip>
          <Chip at={5.9} strike={6.25}>PLUGIN</Chip>
        </div>
      </div>
    </Camera>
  );
};

// ======================= S3 E NÃO =======================
const TemplateIcon = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gap: 10 }}>
    {new Array(6).fill(0).map((_, i) => (
      <div key={i} style={{ height: 50, borderRadius: 8, background: i === 1 ? C.gray2 : C.panel2, border: `1.5px solid ${C.line}` }} />
    ))}
  </div>
);
const GenIcon: React.FC = () => {
  const t = useT();
  const j = t > 9.62 && t < 10.3 ? Math.sin(t * 90) * 6 : 0;
  return (
    <div style={{ width: 230, height: 110, borderRadius: 10, background: C.panel2, border: `1.5px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateX(${j}px)`, color: C.gray, fontFamily: MONO, fontSize: 44 }}>
      ▶ ???
    </div>
  );
};
export const S3: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const up = io(t, 7.45, 7.8);
  return (
    <Camera a={a} b={b} cam={{ z: [1.0, 1.06], ry: [5, -5] }} enter="right">
      <div style={{ position: "absolute", top: interpolate(up, [0, 1], [380, 170]), width: "100%", transform: `scale(${1 - up * 0.55})`, transformOrigin: "center top" }}>
        <KT at={6.62} mode="slam" text="E *NÃO.*" size={260} stagger={0.06} />
      </div>
      <div style={{ display: "flex", gap: 60, marginTop: 160 }}>
        <Chip at={7.55} strike={8.4} from="left" style={col(26, { padding: "40px 56px", fontSize: 52 })}>
          <TemplateIcon />
          TEMPLATE PRONTO
        </Chip>
        <Chip at={8.8} strike={10.0} from="right" style={col(26, { padding: "40px 56px", fontSize: 52 })}>
          <GenIcon />
          GERADOR DE VÍDEO
        </Chip>
      </div>
    </Camera>
  );
};

// ======================= S4 CLAUDE =======================
const Spark: React.FC<{ size: number; rot: number; color: string }> = ({ size, rot, color }) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ transform: `rotate(${rot}deg)` }}>
    {new Array(10).fill(0).map((_, i) => (
      <rect key={i} x={-7} y={-96} width={14} height={70} rx={7} fill={color} transform={`rotate(${i * 36})`} />
    ))}
  </svg>
);
export const S4: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const p = io(t, 11.12, 11.4, 0, 1, outBack);
  return (
    <Camera a={a} b={b} cam={{ z: [1.0, 1.12] }}>
      <div style={{ position: "absolute", opacity: io(t, 11.1, 11.3) * 0.9, transform: `scale(${0.4 + p * 0.9})` }}>
        <div style={{ position: "absolute", inset: -300, background: `radial-gradient(circle, ${C.orange}55 0%, transparent 60%)` }} />
      </div>
      <div style={col(20)}>
        <KT at={10.62} mode="up" text="TÔ FALANDO DO" size={76} weight={800} style={{ color: C.gray }} />
        <div style={{ display: "flex", alignItems: "center", gap: 50, ...rgb(t) }}>
          <div style={{ opacity: io(t, 11.12, 11.3), transform: `scale(${p})` }}>
            <Spark size={230} rot={t * 60} color={C.orange} />
          </div>
          <KT at={11.1} mode="slam" text="*CLAUDE*" size={300} />
        </div>
      </div>
    </Camera>
  );
};

// ======================= S5 HORAS → ESCREVE =======================
const Clock: React.FC = () => {
  const t = useT();
  return (
    <svg width={170} height={170} viewBox="-50 -50 100 100">
      <circle r={44} fill="none" stroke={C.orange} strokeWidth={6} />
      <line x1={0} y1={0} x2={0} y2={-30} stroke={C.white} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 900})`} />
      <line x1={0} y1={0} x2={0} y2={-20} stroke={C.white} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 75})`} />
    </svg>
  );
};
const Timeline: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const p = io(t, at, at + 0.35);
  const rows = [0, 1, 2];
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 60}px)`, width: 1100, background: C.panel, border: `2px solid ${C.line}`, borderRadius: 20, padding: 26, position: "relative" }}>
      {rows.map((r) => (
        <div key={r} style={{ position: "relative", height: 54, borderBottom: r < 2 ? `1px solid ${C.line}` : "none" }}>
          <div style={{ position: "absolute", left: 0, top: 14, fontFamily: MONO, fontSize: 22, color: C.gray }}>{["position", "scale", "opacity"][r]}</div>
          {[0, 1, 2, 3].map((k) => {
            const drag = r === 1 && k === 2 ? Math.sin((t - at) * 7) * 90 : 0;
            return <div key={k} style={{ position: "absolute", left: 200 + k * 220 + r * 40 + drag, top: 14, width: 24, height: 24, background: r === 1 && k === 2 ? C.orange : C.gray, transform: "rotate(45deg)" }} />;
          })}
        </div>
      ))}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 220 + ((t - at) * 260) % 860, width: 3, background: C.red }} />
    </div>
  );
};
export const S5: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const A = fade(t, 13.6, 13.8);
  const B = io(t, 13.65, 13.85);
  return (
    <Camera a={a} b={b} cam={{ z: [1.0, 1.05], ry: [-4, 4], rx: [3, 0] }} enter="left">
      <div style={{ ...col(34), position: "absolute", opacity: A, transform: `scale(${1 + (1 - A) * 0.2})` }}>
        <KT at={11.84} mode="up" text="EM VEZ DE PERDER" size={72} weight={800} style={{ color: C.gray }} />
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ opacity: io(t, 12.36, 12.5), transform: `scale(${io(t, 12.36, 12.6, 0.5, 1, outBack)})` }}>
            <Clock />
          </div>
          <KT at={12.36} mode="pop" text="*HORAS*" size={190} />
        </div>
        <Timeline at={12.72} />
        <KT at={12.72} mode="up" text="ARRASTANDO KEYFRAME" size={50} weight={700} style={{ color: C.gray, letterSpacing: "0.1em" }} />
      </div>
      <div style={{ ...col(10), position: "absolute", opacity: B }}>
        <KT at={13.72} mode="up" text="VOCÊ LITERALMENTE SÓ" size={80} weight={800} style={{ color: C.gray }} />
        <KT at={14.6} mode="type" text="*ESCREVE.*" size={230} />
      </div>
    </Camera>
  );
};

// ======================= S6 PROMPT → PREVIEW =======================
const Panel: React.FC<{ title: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, children, style }) => (
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
const typed = (t: number, at: number, s: string, cps = 45) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));
export const S6: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const lines: [number, string][] = [
    [15.32, "título grande,"],
    [16.1, "fundo escuro com grid,"],
    [17.1, "palavra-chave em laranja,"],
    [18.02, "entrando com impacto."],
  ];
  const dark = io(t, 16.2, 16.6);
  const bgc = interpolate(dark, [0, 1], [225, 12]);
  const txt = interpolate(dark, [0, 1], [20, 244]);
  const orange = io(t, 17.6, 17.8);
  const imp = t >= 18.6 ? io(t, 18.6, 18.8, 0, 1, inOut) : 0;
  const punch = t >= 18.6 ? 2.2 - 1.2 * imp : 1;
  const titleIn = io(t, 15.6, 15.9, 0, 1, outBack);
  const done = io(t, 19.28, 19.5, 0, 1, outBack);
  return (
    <Camera a={a} b={b} cam={{ ry: [10, -6], z: [0.98, 1.04], rx: [2, -1] }} enter="right">
      <div style={{ display: "flex", gap: 50, alignItems: "stretch", opacity: 1 - done * 0.65, filter: `blur(${done * 6}px)` }}>
        <Panel title="PROMPT" style={{ width: 720, height: 560 }}>
          <div style={{ padding: 40, fontFamily: MONO, fontSize: 40, lineHeight: 1.55, color: C.white }}>
            <div style={{ color: C.orange, fontSize: 30, marginBottom: 14 }}>&gt; claude</div>
            {lines.map(([at, s], i) => (
              <div key={i} style={{ opacity: t >= at ? 1 : 0 }}>
                {typed(t, at, s)}
                {t >= at && (i === lines.length - 1 || t < lines[i + 1][0]) && Math.floor(t * 3) % 2 === 0 ? <span style={{ color: C.orange }}>▍</span> : null}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="PREVIEW" style={{ width: 860, height: 560 }}>
          <div style={{ position: "relative", height: 506, background: `rgb(${bgc},${bgc},${bgc + 2})`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, opacity: dark, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "44px 44px" }} />
            <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 120, letterSpacing: "-0.04em", lineHeight: 1, textAlign: "center", color: `rgb(${txt},${txt},${txt})`, transform: `scale(${titleIn * punch})`, opacity: titleIn }}>
              SEU
              <br />
              <span style={{ color: orange > 0 ? `rgba(255,90,31,${orange})` : undefined, textShadow: orange > 0 ? `0 0 40px rgba(255,90,31,${orange * 0.6})` : undefined }}>TÍTULO</span>
            </div>
          </div>
        </Panel>
      </div>
      <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 36, opacity: io(t, 19.28, 19.4), transform: `scale(${done})` }}>
        <svg width={170} height={170} viewBox="-50 -50 100 100">
          <circle r={46} fill={C.orange} />
          <path d="M -22 2 L -6 18 L 24 -16" fill="none" stroke={C.bg} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - io(t, 19.35, 19.6))} />
        </svg>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 210, color: C.white, letterSpacing: "-0.04em" }}>PRONTO.</div>
      </div>
    </Camera>
  );
};

// ======================= S7 INSANO =======================
export const S7: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  return (
    <Camera a={a} b={b} cam={{ z: [1.0, 1.1] }} enter="down">
      <div style={col(10)}>
        <KT at={20.1} mode="up" text="MAS AQUI É ONDE FICA" size={84} weight={800} style={{ color: C.gray }} />
        <div style={rgb(t)}>
          <KT at={21.1} mode="slam" text="*INSANO*" size={330} />
        </div>
      </div>
    </Camera>
  );
};

// ======================= S8 NÃO É MP4, É CÓDIGO =======================
const CODE = [
  ["const ", "t", " = frame / fps;"],
  ["const ", "y", " = interpolate(t, [0, 0.4], [80, 0]);"],
  ["const ", "s", " = spring({ frame, fps });"],
  ["return ", "<Title", " y={y} scale={s} />;"],
];
export const CodeBlock: React.FC<{ at: number; lines?: string[][]; size?: number; cps?: number; width?: number }> = ({ at, lines = CODE, size = 38, cps = 70, width = 1240 }) => {
  const t = useT();
  let start = at;
  return (
    <Panel title="motion.tsx" style={{ width }}>
      <div style={{ padding: "30px 40px", fontFamily: MONO, fontSize: size, lineHeight: 1.7 }}>
        {lines.map((l, i) => {
          const s0 = start;
          const full = l.join("");
          start += full.length / cps + 0.05;
          const n = Math.max(0, Math.floor((t - s0) * cps));
          let k = 0;
          return (
            <div key={i} style={{ display: "flex", whiteSpace: "pre" }}>
              <span style={{ color: C.gray2, width: 60 }}>{i + 1}</span>
              {l.map((seg, j) => {
                const vis = seg.slice(0, Math.max(0, n - k));
                k += seg.length;
                const color = j === 0 ? C.cyan : j === 1 ? C.orange : C.white;
                return <span key={j} style={{ color }}>{vis}</span>;
              })}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};
export const S8: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const A = fade(t, 23.45, 23.65);
  const B = io(t, 23.5, 23.75);
  const x = io(t, 22.54, 22.75, 0, 1, outBack);
  return (
    <Camera a={a} b={b} cam={{ ry: [-8, 6], z: [1.0, 1.04] }}>
      <div style={{ ...col(50), position: "absolute", opacity: A }}>
        <KT at={21.88} mode="up" text="ELE NÃO EXPORTA UM" size={80} weight={800} style={{ color: C.gray }} />
        <div style={{ position: "relative", opacity: io(t, 22.3, 22.45), transform: `scale(${io(t, 22.3, 22.55, 0.6, 1, outBack)})` }}>
          <div style={{ width: 300, height: 380, background: C.panel, border: `3px solid ${C.line}`, borderRadius: 24, clipPath: "polygon(0 0, 72% 0, 100% 20%, 100% 100%, 0 100%)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 50 }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: C.white }}>MP4</div>
          </div>
          <svg width={420} height={420} viewBox="-50 -50 100 100" style={{ position: "absolute", left: -60, top: -20, opacity: x, transform: `scale(${x})` }}>
            <path d="M -38 -38 L 38 38 M 38 -38 L -38 38" stroke={C.red} strokeWidth={10} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${C.red})` }} />
          </svg>
        </div>
      </div>
      <div style={{ ...col(46), position: "absolute", opacity: B, transform: `translateY(${(1 - B) * 80}px)` }}>
        <KT at={23.55} mode="up" text="ELE ESCREVE O *CÓDIGO*" size={110} />
        <CodeBlock at={24.0} />
      </div>
    </Camera>
  );
};

// ======================= S9 MATEMÁTICA PURA =======================
const MathCard: React.FC<{ at: number; label: string; kind: "pos" | "scale" | "time" | "curve" }> = ({ at, label, kind }) => {
  const t = useT();
  const p = io(t, at, at + 0.3, 0, 1, outBack);
  const lt = Math.max(0, t - at);
  const loop = (lt * 1.6) % 1;
  const ease = 1 - Math.pow(1 - loop, 3);
  let vis: React.ReactNode = null;
  let val = "";
  if (kind === "pos") {
    vis = <div style={{ position: "absolute", left: 30 + ease * 250, top: 80, width: 44, height: 44, borderRadius: 22, background: C.orange, boxShadow: `0 0 30px ${C.orange}` }} />;
    val = `x = ${Math.round(ease * 250)}`;
  } else if (kind === "scale") {
    const s = 0.4 + 0.6 * Math.abs(Math.sin(lt * 4));
    vis = <div style={{ position: "absolute", left: 105, top: 50, width: 110, height: 110, border: `5px solid ${C.orange}`, borderRadius: 14, transform: `scale(${s})` }} />;
    val = `s = ${s.toFixed(2)}`;
  } else if (kind === "time") {
    vis = (
      <div style={{ position: "absolute", left: 30, right: 30, top: 95, height: 14, borderRadius: 7, background: C.panel2 }}>
        <div style={{ width: `${loop * 100}%`, height: "100%", borderRadius: 7, background: C.orange }} />
      </div>
    );
    val = `t = ${(loop * 1.0).toFixed(2)}s`;
  } else {
    const d = io(t, at, at + 0.5);
    vis = (
      <svg width={320} height={170} viewBox="0 0 320 170" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M 30 150 C 120 150, 140 20, 290 20" fill="none" stroke={C.orange} strokeWidth={6} strokeDasharray={330} strokeDashoffset={330 * (1 - d)} strokeLinecap="round" />
        <circle cx={30} cy={150} r={7} fill={C.white} />
        <circle cx={290} cy={20} r={7} fill={C.white} />
      </svg>
    );
    val = "bezier(.16,1,.3,1)";
  }
  return (
    <div style={{ opacity: io(t, at, at + 0.12), transform: `translateY(${(1 - p) * 80}px) scale(${0.85 + 0.15 * p})`, width: 330, background: C.panel, border: `2px solid ${t > at && t < at + 0.6 ? C.orange : C.line}`, borderRadius: 22, overflow: "hidden" }}>
      <div style={{ position: "relative", height: 190 }}>{vis}</div>
      <div style={{ borderTop: `2px solid ${C.line}`, padding: "16px 24px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.white }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.orange }}>{val}</div>
      </div>
    </div>
  );
};
export const S9: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  return (
    <Camera a={a} b={b} cam={{ rx: [8, 0], z: [0.96, 1.03] }} enter="down">
      <div style={{ position: "absolute", top: 120, fontFamily: MONO, fontSize: 30, color: C.gray2, opacity: io(t, 26.1, 26.5) }}>f(t) = 1 − (1 − t)³</div>
      <div style={col(46)}>
        <div style={col(6)}>
          <KT at={25.34} mode="up" text="CADA MOVIMENTO É" size={70} weight={800} style={{ color: C.gray }} />
          <KT at={26.0} mode="expand" text="*MATEMÁTICA PURA*" size={150} stagger={0.1} />
        </div>
        <div style={{ display: "flex", gap: 34 }}>
          <MathCard at={26.86} label="POSIÇÃO" kind="pos" />
          <MathCard at={27.44} label="ESCALA" kind="scale" />
          <MathCard at={28.0} label="TEMPO" kind="time" />
          <MathCard at={28.46} label="CURVA" kind="curve" />
        </div>
      </div>
    </Camera>
  );
};

// ======================= S10 JEITO ANTIGO =======================
const Node: React.FC<{ at: number; label: string; children?: React.ReactNode }> = ({ at, label, children }) => {
  const t = useT();
  const p = io(t, at, at + 0.3, 0, 1, outBack);
  return (
    <div style={{ opacity: io(t, at, at + 0.1), transform: `scale(${0.7 + 0.3 * p})`, width: 300, height: 200, background: C.panel, border: `2px solid ${t >= at && t < at + 0.5 ? C.red : C.line}`, borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.white, textAlign: "center", lineHeight: 1.1, padding: 20 }}>
      {label}
      {children}
    </div>
  );
};
const Arrow: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const p = io(t, at, at + 0.25);
  return (
    <svg width={70} height={40} viewBox="0 0 70 40">
      <path d={`M 4 20 L ${4 + 56 * p} 20`} stroke={C.gray} strokeWidth={5} strokeLinecap="round" />
      {p > 0.9 && <path d="M 50 8 L 64 20 L 50 32" stroke={C.gray} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};
export const S10: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const prog = io(t, 32.86, 34.2, 0, 0.27, (n) => n);
  const loop = io(t, 33.5, 33.85);
  return (
    <Camera a={a} b={b} cam={{ ry: [-12, -4], z: [1.0, 0.97], x: [80, -40] }} enter="left">
      <div style={col(60)}>
        <div style={col(14)}>
          <KT at={28.76} mode="up" text="JEITO *ANTIGO*" size={120} hiColor={C.red} />
          <KT at={29.9} mode="type" text="pra mudar UMA cor:" size={44} weight={600} style={{ color: C.gray, textTransform: "none", fontFamily: MONO }} />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
          <Node at={30.5} label="ABRIR PROJETO" />
          <Arrow at={31.0} />
          <Node at={31.15} label="ACHAR CAMADA" />
          <Arrow at={31.8} />
          <Node at={31.95} label="REFAZER KEYFRAME" />
          <Arrow at={32.65} />
          <Node at={32.8} label="RENDERIZAR TUDO">
            <div style={{ width: 220, height: 12, borderRadius: 6, background: C.panel2 }}>
              <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 6, background: C.red }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: C.gray }}>{Math.round(prog * 100)}% · 47min</div>
          </Node>
          <svg width={1400} height={160} viewBox="0 0 1400 160" style={{ position: "absolute", left: 0, top: 200, overflow: "visible" }}>
            <path d="M 1210 0 C 1210 140, 150 140, 150 10" fill="none" stroke={C.red} strokeWidth={6} strokeDasharray={1500} strokeDashoffset={1500 * (1 - loop)} strokeLinecap="round" />
            {loop > 0.95 && <path d="M 132 30 L 150 6 L 168 30" fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" />}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 340, display: "flex", justifyContent: "center", opacity: io(t, 33.56, 33.66) }}>
            <KT at={33.56} mode="pop" text="↻ *DE NOVO*" size={70} hiColor={C.red} />
          </div>
        </div>
      </div>
    </Camera>
  );
};

// ======================= S11 JEITO NOVO =======================
const Param: React.FC<{ at: number; label: string; children: React.ReactNode }> = ({ at, label, children }) => {
  const t = useT();
  const p = io(t, at, at + 0.3);
  return (
    <div style={{ opacity: p, transform: `translateX(${(1 - p) * -60}px)`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 30px", borderTop: `2px solid ${C.line}`, background: t >= at && t < at + 0.5 ? `${C.orange}18` : "transparent" }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.white }}>{label}</div>
      {children}
    </div>
  );
};
const SWATCH = [C.white, C.orange, C.cyan, C.green, C.red];
export const S11: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const swapped = t >= 35.7;
  const sel = io(t, 35.5, 35.65);
  const colorIdx = t < 36.58 ? (swapped ? 1 : 0) : 1 + (Math.floor((t - 36.58) * 4) % 4);
  const tc = SWATCH[colorIdx];
  const speed = 1 + io(t, 37.04, 37.6);
  const fontMono = t >= 37.84 && Math.floor((t - 37.84) * 3) % 2 === 0;
  const dur = 3 + 3 * io(t, 38.32, 38.9);
  const bounce = Math.abs(Math.sin(t * 3 * speed)) * 40;
  const big = io(t, 39.05, 39.3);
  const dim = 1 - big * 0.8;
  const rowVal: React.CSSProperties = { fontFamily: MONO, fontSize: 30, color: C.orange };
  return (
    <Camera a={a} b={b} cam={{ ry: [10, 2], z: [0.98, 1.03], x: [-60, 30] }} enter="right">
      <div style={{ position: "absolute", top: 120, opacity: dim }}>
        <KT at={34.28} mode="up" text="JEITO *NOVO*" size={110} />
      </div>
      <div style={{ display: "flex", gap: 50, marginTop: 120, opacity: dim, filter: `blur(${big * 8}px)` }}>
        <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 26 }}>
          <Panel title="motion.tsx" style={{ opacity: io(t, 34.7, 35.0) }}>
            <div style={{ padding: "26px 36px", fontFamily: MONO, fontSize: 40, whiteSpace: "pre" }}>
              <span style={{ color: C.cyan }}>color</span>
              <span style={{ color: C.white }}>: </span>
              <span style={{ color: swapped ? C.orange : C.white, background: !swapped && sel > 0 ? `rgba(61,225,255,${0.35 * sel})` : "transparent", borderRadius: 6 }}>{swapped ? typed(t, 35.7, '"#FF5A1F"', 40) : '"#FFFFFF"'}</span>
              <span style={{ color: C.white }}>,</span>
            </div>
          </Panel>
          <Panel title="PARÂMETROS" style={{ opacity: io(t, 36.3, 36.6) }}>
            <Param at={36.58} label="COR">
              <div style={{ display: "flex", gap: 10 }}>
                {SWATCH.slice(1).map((c, i) => (
                  <div key={i} style={{ width: 40, height: 40, borderRadius: 10, background: c, outline: c === tc ? `4px solid ${C.white}` : "none" }} />
                ))}
              </div>
            </Param>
            <Param at={37.04} label="VELOCIDADE">
              <div style={rowVal}>{speed.toFixed(1)}x</div>
            </Param>
            <Param at={37.84} label="FONTE">
              <div style={{ ...rowVal, fontFamily: fontMono ? MONO : FONT, fontWeight: 900 }}>{fontMono ? "Mono" : "Inter Black"}</div>
            </Param>
            <Param at={38.32} label="DURAÇÃO">
              <div style={rowVal}>{dur.toFixed(1)}s</div>
            </Param>
          </Panel>
        </div>
        <Panel title="PREVIEW" style={{ width: 640, opacity: io(t, 34.7, 35.0) }}>
          <div style={{ height: 560, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0f" }}>
            <div style={{ fontFamily: fontMono ? MONO : FONT, fontWeight: 900, fontSize: 120, color: tc, letterSpacing: "-0.03em", transform: `translateY(${-bounce}px)`, textShadow: tc !== C.white ? `0 0 40px ${tc}88` : undefined }}>MOTION</div>
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, height: 10, borderRadius: 5, background: C.panel2 }}>
              <div style={{ width: `${(((t * speed) % dur) / dur) * 100}%`, height: "100%", borderRadius: 5, background: tc }} />
            </div>
          </div>
        </Panel>
      </div>
      <div style={{ position: "absolute", opacity: big }}>
        <div style={col(0)}>
          <KT at={39.05} mode="up" text="TUDO VIRA" size={110} weight={800} style={{ color: C.gray }} />
          <KT at={39.3} mode="slam" text="*PARÂMETRO*" size={250} />
        </div>
      </div>
    </Camera>
  );
};

// ======================= S12 META: ESTE VÍDEO =======================
const META_CODE = [
  ["<KT ", "at={1.26}", ' text="*MOTION GRAPHICS*" />'],
  ["<KT ", "at={11.1}", ' mode="slam" text="*CLAUDE*" />'],
  ["<KT ", "at={21.1}", ' mode="slam" text="*INSANO*" />'],
  ["<Camera ", "ry={[10, -6]}", " enter=\"right\" />"],
];
export const S12: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const w = io(t, 41.0, 41.4);
  return (
    <Camera a={a} b={b} cam={{ ry: [16, -8], rx: [6, 0], z: [0.95, 1.02] }}>
      <div style={col(40)}>
        <KT at={40.28} mode="up" text="E ESSE VÍDEO QUE VOCÊ TÁ VENDO?" size={84} weight={900} stagger={0.04} />
        <div style={{ display: "flex", gap: 30, opacity: w, transform: `translateY(${(1 - w) * 100}px) scale(${0.9 + 0.1 * w})` }}>
          <CodeBlock at={41.1} lines={META_CODE} size={30} cps={120} width={980} />
          <Panel title="PREVIEW" style={{ width: 560 }}>
            <div style={{ height: 270, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "30px 30px" }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.orange, letterSpacing: "-0.03em", transform: `scale(${1 + Math.sin(t * 6) * 0.04})`, textShadow: `0 0 30px ${C.orange}88` }}>MOTION GRAPHICS</div>
            </div>
          </Panel>
        </div>
        <KT at={41.56} mode="up" text="FEITO *EXATAMENTE ASSIM.*" size={96} />
      </div>
    </Camera>
  );
};

// ======================= S13 VAI ACABAR? NÃO. =======================
export const S13: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const q = fade(t, 44.4, 44.55);
  return (
    <Camera a={a} b={b} cam={{ z: [1.0, 1.06] }} enter="down">
      <div style={{ ...col(16), position: "absolute", opacity: q }}>
        <KT at={42.92} mode="up" text="ISSO VAI ACABAR COM O" size={80} weight={800} style={{ color: C.gray }} />
        <KT at={43.6} mode="pop" text="AFTER EFFECTS?" size={170} stagger={0.08} />
      </div>
      <div style={{ position: "absolute", ...rgb(t) }}>
        <KT at={44.5} mode="slam" text="NÃO." size={400} />
      </div>
    </Camera>
  );
};

// ======================= S14 FINAL =======================
export const S14: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  const A = fade(t, 47.6, 47.8);
  const B = io(t, 47.7, 47.9);
  const arrow = io(t, 45.95, 46.25);
  const out = io(t, b - 0.6, b);
  return (
    <Camera a={a} b={b} cam={{ z: [1.0, 1.1], ry: [-4, 2] }}>
      <div style={{ ...col(50), position: "absolute", opacity: A }}>
        <KT at={45.0} mode="up" text="SAIR DE UMA" size={70} weight={800} style={{ color: C.gray }} />
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Chip at={45.7} style={{ fontSize: 80, padding: "30px 60px" }}>💡 IDEIA</Chip>
          <svg width={220} height={60} viewBox="0 0 220 60">
            <path d={`M 10 30 L ${10 + 190 * arrow} 30`} stroke={C.orange} strokeWidth={8} strokeLinecap="round" />
            {arrow > 0.9 && <path d="M 180 10 L 204 30 L 180 50" stroke={C.orange} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          <Chip at={46.2} style={{ fontSize: 80, padding: "30px 60px", borderColor: C.orange }}>▶ ANIMAÇÃO PRONTA</Chip>
        </div>
        <KT at={46.95} mode="pop" text="EM *MINUTOS*" size={140} />
      </div>
      <div style={{ ...col(0), position: "absolute", opacity: B * (1 - out) }}>
        <KT at={47.76} mode="up" text="SIMPLESMENTE" size={100} weight={800} style={{ color: C.gray, letterSpacing: "0.08em" }} />
        <div style={rgb(t)}>
          <KT at={48.15} mode="slam" text="*INSANO.*" size={340} />
        </div>
        <div style={{ marginTop: 40, fontFamily: MONO, fontSize: 30, color: C.gray, opacity: io(t, 49.4, 49.9) }}>
          feito com Claude + código · zero After Effects
        </div>
      </div>
    </Camera>
  );
};

export const SCENES: [number, number, React.FC<SP>][] = [
  [-0.4, 2.9, S1],
  [2.9, 6.6, S2],
  [6.6, 10.6, S3],
  [10.6, 11.84, S4],
  [11.84, 15.25, S5],
  [15.25, 20.05, S6],
  [20.05, 21.85, S7],
  [21.85, 25.3, S8],
  [25.3, 28.76, S9],
  [28.76, 34.24, S10],
  [34.24, 40.24, S11],
  [40.24, 42.88, S12],
  [42.88, 45.0, S13],
  [45.0, 51.6, S14],
];
