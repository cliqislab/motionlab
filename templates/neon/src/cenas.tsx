// Tipos de cena do template Neon. Cada cena do conteudo.json vira um destes componentes.
// Para criar um tipo novo sem mexer aqui, use "tipo": "custom" e registre o componente em custom.tsx.
import React from "react";
import { Img, staticFile } from "remotion";
import { C, CenaTL, FONT, MONO, S, VERTICAL, W, H, io, outBack } from "./brand";
import { Cam, Camera, Chip, CodeBlock, KT, Panel, Strike, col, rgb, useT } from "./fx";
import { riscos } from "./timeline.mjs";
import { CUSTOM } from "./custom";

type P = { c: CenaTL };

const TAM: Record<string, number> = { g: 165, m: 110, p: 70 };
const CAMS: Cam[] = [
  { z: [1.0, 1.08], ry: [-6, 3] },
  { z: [1.05, 0.98], rx: [4, -2] },
  { z: [1.0, 1.06], ry: [5, -4] },
  { z: [1.06, 1.0], rx: [-3, 3] },
];
const ENTRADAS = ["zoom", "down", "left", "right"] as const;

const Palco: React.FC<{ c: CenaTL; children: React.ReactNode }> = ({ c, children }) => (
  <Camera a={c.inicio} b={c.fim} cam={CAMS[c.i % CAMS.length]} enter={c.i === 0 ? "zoom" : ENTRADAS[c.i % ENTRADAS.length]}>
    {children}
  </Camera>
);

const numeroBR = (n: number, casas = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

// ---------------------------------------------------------------- titulo
const Titulo: React.FC<P> = ({ c }) => {
  const t = useT();
  const linhas: { texto: string; modo?: string; tamanho?: string; cor?: string }[] = c.dados.linhas || [];
  return (
    <Palco c={c}>
      <div style={col(34 * S, { maxWidth: W * 0.9 })}>
        {linhas.map((l, k) => {
          const tam = (TAM[l.tamanho || ""] ?? (k === 0 ? TAM.g : TAM.m)) * S;
          const modo = (l.modo || (c.impacto && k === 0 ? "slam" : "up")) as "up" | "type" | "expand" | "pop" | "slam";
          const cinza = l.cor === "cinza";
          const el = (
            <KT
              key={k}
              at={c.beats[k]}
              mode={modo}
              text={l.texto}
              size={tam}
              weight={l.tamanho === "p" ? 700 : 900}
              style={cinza ? { color: C.gray, textTransform: "none" } : undefined}
            />
          );
          return c.impacto && k === 0 ? (
            <div key={k} style={{ position: "relative", ...rgb(t) }}>
              {el}
            </div>
          ) : (
            el
          );
        })}
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- chips
const Chips: React.FC<P> = ({ c }) => {
  const d = c.dados;
  const r = riscos(c);
  const idx: number[] = d.riscar || [];
  const k = VERTICAL ? 1.7 : 1;
  return (
    <Palco c={c}>
      <div style={col(48 * S)}>
        {d.titulo ? <KT at={c.inicio + 0.05} mode="up" text={d.titulo} size={84 * S} weight={800} /> : null}
        <div
          style={{
            display: "flex",
            flexDirection: VERTICAL ? "column" : "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 30 * S,
            maxWidth: W * 0.9,
          }}
        >
          {(d.itens || []).map((it: string, i: number) => {
            const j = idx.indexOf(i);
            return (
              <Chip key={i} at={c.beats[i]} strike={j >= 0 ? r[j] : undefined} style={{ fontSize: 58 * S * k, padding: `${26 * S * k}px ${44 * S * k}px` }}>
                {it}
              </Chip>
            );
          })}
        </div>
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- app (celular com interface)
const App: React.FC<P> = ({ c }) => {
  const t = useT();
  const d = c.dados;
  const phH = VERTICAL ? H * 0.6 : H * 0.84;
  const phW = phH * 0.49;
  const u = phW / 440;
  const b0 = c.beats[0];
  const ent = io(t, c.inicio, c.inicio + 0.6, 0, 1, outBack);
  const v = d.valor || {};
  const valorAtual = (v.numero || 0) * io(t, b0, b0 + 1.3);
  const itens: { texto: string; detalhe?: string; feito?: boolean }[] = d.itens || [];
  const graf: number[] = d.grafico || [];
  const gmax = Math.max(1, ...graf);

  const celular = (
    <div
      style={{
        width: phW,
        height: phH,
        borderRadius: 64 * u,
        background: C.panel,
        border: `${3 * u}px solid ${C.line}`,
        boxShadow: `0 60px 140px rgba(0,0,0,.7), 0 0 ${80 * u}px ${C.orange}22`,
        padding: `${28 * u}px ${26 * u}px`,
        display: "flex",
        flexDirection: "column",
        gap: 18 * u,
        overflow: "hidden",
        transform: `translateY(${(1 - ent) * 220}px) rotateY(${-10 + 6 * io(t, c.inicio, c.fim, 0, 1, (n) => n)}deg)`,
        opacity: Math.min(1, ent * 1.5),
        fontFamily: FONT,
        color: C.white,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 18 * u, color: C.gray }}>
        <span>9:41</span>
        <span>● ● ●</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 * u, fontWeight: 800, fontSize: 30 * u }}>
        <div style={{ width: 22 * u, height: 22 * u, borderRadius: 8 * u, background: C.orange, boxShadow: `0 0 ${18 * u}px ${C.orange}` }} />
        {d.nome || "App"}
      </div>
      <div style={{ background: C.panel2, borderRadius: 26 * u, padding: `${22 * u}px ${24 * u}px`, border: `${2 * u}px solid ${C.line}` }}>
        <div style={{ fontSize: 18 * u, color: C.gray, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO }}>{v.rotulo || ""}</div>
        <div style={{ fontSize: 64 * u, fontWeight: 900, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
          {v.prefixo || ""}
          {numeroBR(valorAtual, v.casas || 0)}
          <span style={{ color: C.orange }}>{v.sufixo || ""}</span>
        </div>
      </div>
      {itens.map((it, k) => {
        const bt = c.beats[k + 1];
        const p = io(t, bt, bt + 0.4);
        const chk = it.feito ? io(t, bt + 0.3, bt + 0.5, 0, 1, outBack) : 0;
        return (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16 * u,
              background: C.panel2,
              borderRadius: 20 * u,
              padding: `${16 * u}px ${18 * u}px`,
              border: `${2 * u}px solid ${chk > 0.5 ? C.orange + "66" : C.line}`,
              transform: `translateX(${(1 - p) * 160 * u}px)`,
              opacity: p,
            }}
          >
            <div
              style={{
                width: 30 * u,
                height: 30 * u,
                borderRadius: 15 * u,
                border: `${3 * u}px solid ${it.feito ? C.orange : C.gray2}`,
                background: it.feito ? `${C.orange}` : "transparent",
                transform: `scale(${it.feito ? 0.6 + 0.4 * chk : 1})`,
                opacity: it.feito ? 0.3 + 0.7 * chk : 1,
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24 * u, fontWeight: 700 }}>{it.texto}</span>
              {it.detalhe ? <span style={{ fontSize: 17 * u, color: C.gray, fontFamily: MONO }}>{it.detalhe}</span> : null}
            </div>
          </div>
        );
      })}
      {graf.length ? (
        <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 10 * u, height: 150 * u, padding: `0 ${6 * u}px` }}>
          {graf.map((g, k) => {
            const p = io(t, b0 + 0.4 + k * 0.08, b0 + 1.0 + k * 0.08);
            const ultimo = k === graf.length - 1;
            return (
              <div
                key={k}
                style={{
                  flex: 1,
                  height: `${(g / gmax) * 100 * p}%`,
                  borderRadius: 10 * u,
                  background: ultimo ? C.orange : C.gray2,
                  boxShadow: ultimo ? `0 0 ${24 * u}px ${C.orange}88` : undefined,
                }}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );

  const textos =
    d.titulo || d.legenda ? (
      <div style={col(26 * S, { alignItems: VERTICAL ? "center" : "flex-start", maxWidth: VERTICAL ? W * 0.9 : W * 0.4 })}>
        {d.titulo ? <KT at={c.inicio + 0.1} mode="up" text={d.titulo} size={(VERTICAL ? 120 : 104) * S} align={VERTICAL ? "center" : "left"} /> : null}
        {d.legenda ? (
          <KT at={c.inicio + 0.5} mode="up" text={d.legenda} size={(VERTICAL ? 66 : 50) * S} weight={600} align={VERTICAL ? "center" : "left"} style={{ color: C.gray, textTransform: "none", letterSpacing: "-0.01em" }} />
        ) : null}
      </div>
    ) : null;

  return (
    <Palco c={c}>
      <div style={{ display: "flex", flexDirection: VERTICAL ? "column" : "row", alignItems: "center", gap: (VERTICAL ? 60 : 120) * S, perspective: 1400 }}>
        {textos}
        {celular}
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- grafico de barras
const Grafico: React.FC<P> = ({ c }) => {
  const t = useT();
  const d = c.dados;
  const barras: { rotulo: string; valor: number }[] = d.barras || [];
  const max = Math.max(1, ...barras.map((b) => b.valor));
  const dest = typeof d.destaque === "number" ? d.destaque : barras.length - 1;
  const gw = VERTICAL ? W * 0.86 : W * 0.62;
  const gh = VERTICAL ? H * 0.4 : H * 0.48;
  const k = VERTICAL ? 1.3 : 1;
  return (
    <Palco c={c}>
      <div style={col(50 * S)}>
        {d.titulo ? <KT at={c.inicio + 0.05} mode="up" text={d.titulo} size={90 * S} weight={900} /> : null}
        <div style={{ width: gw, height: gh, display: "flex", alignItems: "flex-end", gap: 28 * S, borderBottom: `3px solid ${C.line}`, padding: `0 ${20 * S}px` }}>
          {barras.map((b, i) => {
            const bt = c.beats[i];
            const p = io(t, bt, bt + 0.7);
            const hi = i === dest;
            return (
              <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 14 * S }}>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46 * S * k, color: hi ? C.orange : C.white, opacity: p, fontVariantNumeric: "tabular-nums" }}>
                  {d.prefixo || ""}
                  {numeroBR(b.valor * p, d.casas || 0)}
                  {d.sufixo || ""}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: `${(b.valor / max) * 78 * p}%`,
                    borderRadius: `${16 * S}px ${16 * S}px 0 0`,
                    background: hi ? `linear-gradient(180deg, ${C.orange}, ${C.orange}99)` : `linear-gradient(180deg, ${C.gray2}, ${C.panel2})`,
                    boxShadow: hi ? `0 0 ${50 * S}px ${C.orange}77` : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ width: gw, display: "flex", gap: 28 * S, padding: `0 ${20 * S}px` }}>
          {barras.map((b, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 28 * S * k, color: C.gray, opacity: io(t, c.beats[i], c.beats[i] + 0.3) }}>
              {b.rotulo}
            </div>
          ))}
        </div>
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- numero grande (contador)
const Numero: React.FC<P> = ({ c }) => {
  const t = useT();
  const d = c.dados;
  const b0 = c.beats[0];
  const de = d.de || 0;
  const ate = d.ate ?? 100;
  const v = de + (ate - de) * io(t, b0, b0 + 1.2);
  const p = io(t, b0, b0 + 0.25);
  const k = VERTICAL ? 1.3 : 1;
  return (
    <Palco c={c}>
      <div style={col(30 * S)}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 300 * S * k,
            letterSpacing: "-0.05em",
            color: C.white,
            fontVariantNumeric: "tabular-nums",
            transform: `scale(${1.25 - 0.25 * p})`,
            filter: `blur(${(1 - p) * 16}px)`,
            opacity: p,
            ...rgb(t),
          }}
        >
          {d.prefixo || ""}
          <span style={{ color: C.orange, textShadow: `0 0 ${110 * S}px ${C.orange}88` }}>{numeroBR(v, d.casas || 0)}</span>
          {d.sufixo || ""}
        </div>
        {d.legenda ? (
          <KT at={b0 + 0.7} mode="up" text={d.legenda} size={64 * S * k} weight={700} style={{ color: C.gray, textTransform: "none", maxWidth: W * 0.85 }} />
        ) : null}
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- codigo digitado
const Codigo: React.FC<P> = ({ c }) => {
  const d = c.dados;
  const linhas: string[][] = (d.linhas || []).map((l: string | string[]) => (Array.isArray(l) ? l : ["", "", String(l)]));
  return (
    <Palco c={c}>
      <div style={col(40 * S)}>
        {d.titulo ? <KT at={c.inicio + 0.05} mode="up" text={d.titulo} size={80 * S} weight={800} /> : null}
        <CodeBlock at={c.beats[0]} lines={linhas} title={d.arquivo || "motion.tsx"} size={38 * S * (VERTICAL ? 1.25 : 1)} width={VERTICAL ? W * 0.92 : Math.min(1300, W * 0.75)} />
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- comparacao antes x depois
const Comparacao: React.FC<P> = ({ c }) => {
  const t = useT();
  const d = c.dados;
  const antes: string[] = d.antes || [];
  const depois: string[] = d.depois || [];
  const k = VERTICAL ? 1.3 : 1;
  const pw = VERTICAL ? W * 0.86 : W * 0.38;
  const item = (txt: string, bt: number, ruim: boolean, key: number) => {
    const p = io(t, bt, bt + 0.35);
    return (
      <div key={key} style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 * S, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
        <span style={{ color: ruim ? C.red : C.orange, fontSize: 44 * S * k, fontWeight: 900 }}>{ruim ? "×" : "✓"}</span>
        <span style={{ position: "relative", fontFamily: FONT, fontSize: 44 * S * k, fontWeight: 700, color: ruim ? C.gray : C.white }}>
          {txt}
          {ruim ? <Strike at={bt + 0.35} thick={6 * S * k} angle={0} /> : null}
        </span>
      </div>
    );
  };
  return (
    <Palco c={c}>
      <div style={col(40 * S)}>
        {d.titulo ? <KT at={c.inicio + 0.05} mode="up" text={d.titulo} size={84 * S} weight={900} /> : null}
        <div style={{ display: "flex", flexDirection: VERTICAL ? "column" : "row", gap: 40 * S }}>
          <Panel title={d.rotuloAntes || "ANTES"} style={{ width: pw, opacity: 0.85 }}>
            <div style={{ padding: `${30 * S}px ${40 * S}px`, display: "flex", flexDirection: "column", gap: 22 * S }}>
              {antes.map((x, i) => item(x, c.beats[i], true, i))}
            </div>
          </Panel>
          <Panel title={d.rotuloDepois || "DEPOIS"} style={{ width: pw, borderColor: `${C.orange}88`, boxShadow: `0 40px 120px rgba(0,0,0,.7), 0 0 ${60 * S}px ${C.orange}33` }}>
            <div style={{ padding: `${30 * S}px ${40 * S}px`, display: "flex", flexDirection: "column", gap: 22 * S }}>
              {depois.map((x, i) => item(x, c.beats[antes.length + i], false, i))}
            </div>
          </Panel>
        </div>
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- imagem (public/imagens/arquivo)
const Imagem: React.FC<P> = ({ c }) => {
  const t = useT();
  const d = c.dados;
  const p = io(t, c.inicio, c.inicio + 0.5);
  const z = 1 + 0.08 * io(t, c.inicio, c.fim, 0, 1, (n) => n);
  const fw = VERTICAL ? W * 0.86 : W * 0.6;
  const fh = VERTICAL ? H * 0.5 : H * 0.62;
  return (
    <Palco c={c}>
      <div style={col(40 * S)}>
        <div style={{ width: fw, height: fh, borderRadius: 32 * S, overflow: "hidden", border: `3px solid ${C.line}`, boxShadow: "0 50px 140px rgba(0,0,0,.7)", opacity: p }}>
          {d.arquivo ? (
            <Img src={staticFile(`imagens/${d.arquivo}`)} style={{ width: "100%", height: "100%", objectFit: d.ajuste === "conter" ? "contain" : "cover", transform: `scale(${z})` }} />
          ) : null}
        </div>
        {d.legenda ? <KT at={c.beats[0] + 0.3} mode="up" text={d.legenda} size={80 * S * (VERTICAL ? 1.2 : 1)} weight={800} /> : null}
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- chamada final (CTA)
const Cta: React.FC<P> = ({ c }) => {
  const t = useT();
  const d = c.dados;
  const [b0, b1, b2] = c.beats;
  const pb = io(t, b2, b2 + 0.35, 0, 1, outBack);
  const pulso = 1 + 0.03 * Math.sin(Math.max(0, t - b2 - 0.4) * 6);
  const k = VERTICAL ? 1.25 : 1;
  return (
    <Palco c={c}>
      <div style={col(46 * S, { maxWidth: W * 0.9 })}>
        <div style={{ position: "relative", ...rgb(t) }}>
          <KT at={b0} mode="slam" text={d.texto || ""} size={150 * S} />
        </div>
        {d.subtexto ? <KT at={b1} mode="up" text={d.subtexto} size={58 * S * k} weight={600} style={{ color: C.gray, textTransform: "none" }} /> : null}
        {d.botao ? (
          <div
            style={{
              marginTop: 20 * S,
              background: C.orange,
              color: "#0B0B0C",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 54 * S * k,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              padding: `${28 * S * k}px ${70 * S * k}px`,
              borderRadius: 999,
              boxShadow: `0 0 ${90 * S}px ${C.orange}88`,
              transform: `scale(${(0.6 + 0.4 * pb) * pulso})`,
              opacity: Math.min(1, pb * 2),
            }}
          >
            {d.botao}
          </div>
        ) : null}
      </div>
    </Palco>
  );
};

// ---------------------------------------------------------------- custom
const Custom: React.FC<P> = ({ c }) => {
  const Comp = CUSTOM[c.dados.componente as string];
  if (!Comp) {
    return (
      <Palco c={c}>
        <KT at={c.inicio} text={`Cena custom "${c.dados.componente}" não encontrada em custom.tsx`} size={50 * S} weight={700} style={{ textTransform: "none" }} />
      </Palco>
    );
  }
  return (
    <Palco c={c}>
      <Comp c={c} />
    </Palco>
  );
};

export const CENAS: Record<string, React.FC<P>> = {
  titulo: Titulo,
  chips: Chips,
  app: App,
  grafico: Grafico,
  numero: Numero,
  codigo: Codigo,
  comparacao: Comparacao,
  imagem: Imagem,
  cta: Cta,
  custom: Custom,
};
