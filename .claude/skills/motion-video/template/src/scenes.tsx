// CENAS. Cada cena = [início, fim, componente] em segundos da NARRAÇÃO (timestamps do words.json).
// Este arquivo é um ESQUELETO de demonstração: substitua pelas cenas do seu roteiro.
// Exemplo completo de 14 cenas (52s) em ../examples/scenes_exemplo_claude.tsx (copie padrões de lá).
import React from "react";
import { C } from "./brand";
import { Camera, Chip, CodeBlock, KT, Strike, col, rgb, useT } from "./fx";

type SP = { a: number; b: number };

const Gancho: React.FC<SP> = ({ a, b }) => (
  <Camera a={a} b={b} cam={{ z: [1.0, 1.08], ry: [-6, 3] }}>
    <div style={col(34)}>
      <KT at={0.0} mode="type" text="E se eu te dissesse..." size={70} weight={700} style={{ color: C.gray, textTransform: "none" }} />
      <KT at={1.26} mode="expand" text="*MOTION GRAPHICS*" size={165} stagger={0.12} />
      <KT at={1.94} mode="up" text="PROFISSIONAIS" size={96} weight={800} style={{ letterSpacing: "0.12em" }} />
    </div>
  </Camera>
);

const Revelacao: React.FC<SP> = ({ a, b }) => {
  const t = useT();
  return (
    <Camera a={a} b={b} cam={{ z: [1.05, 0.98], rx: [4, -2] }} enter="down">
      <div style={col(46)}>
        <div style={{ position: "relative", ...rgb(t) }}>
          <KT at={3.44} mode="slam" text="*SEM SOFTWARE*" size={190} />
        </div>
        <div style={{ display: "flex", gap: 36 }}>
          <Chip at={4.0} strike={4.4}>TIMELINE</Chip>
          <Chip at={4.3}>◆ SÓ CÓDIGO</Chip>
        </div>
        <CodeBlock at={4.8} width={1000} lines={[["const ", "y", " = interpolate(t, [0, 0.4], [80, 0]);"]]} />
      </div>
    </Camera>
  );
};

export const SCENES: [number, number, React.FC<SP>][] = [
  [-0.4, 2.9, Gancho],
  [2.9, 52, Revelacao],
];

// silencia aviso de import não usado quando você apagar o demo
export const _keep = Strike;
