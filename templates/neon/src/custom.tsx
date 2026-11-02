// Cenas personalizadas. Use no conteudo.json: { "tipo": "custom", "componente": "NomeDaCena", ... }
// O Claude Code cria componentes aqui quando você pede algo que os tipos prontos não fazem.
// Cada componente recebe { c } com c.inicio, c.fim, c.beats (segundos) e c.dados (o objeto da cena).
import React from "react";
import { CenaTL, S } from "./brand";
import { KT, col } from "./fx";

const Exemplo: React.FC<{ c: CenaTL }> = ({ c }) => (
  <div style={col(30 * S)}>
    <KT at={c.inicio + 0.2} mode="pop" text={c.dados.texto || "*CENA* PERSONALIZADA"} size={120 * S} />
  </div>
);

export const CUSTOM: Record<string, React.FC<{ c: CenaTL }>> = {
  Exemplo,
};
