// npm run templates — lista os templates disponíveis
import fs from "node:fs";
import path from "node:path";
import { TEMPLATES, negrito, cinza, verde, amarelo } from "./lib.mjs";

export function lerTemplates() {
  return fs
    .readdirSync(TEMPLATES)
    .filter((n) => fs.existsSync(path.join(TEMPLATES, n, "template.json")))
    .map((n) => JSON.parse(fs.readFileSync(path.join(TEMPLATES, n, "template.json"), "utf8")));
}

if (process.argv[1]?.endsWith("templates.mjs")) {
  console.log(negrito("\nTemplates do MotionLab Kit\n"));
  for (const t of lerTemplates()) {
    const st = t.status === "pronto" ? verde("PRONTO") : amarelo(t.status.toUpperCase());
    console.log(`${negrito(t.id)}  ${t.nome}  [${st}]`);
    console.log(`   ${t.descricao}`);
    console.log(cinza(`   formatos: ${Object.keys(t.resolucoes).join(", ")} | duração: ${t.duracao.minima}-${t.duracao.maxima}s (padrão ${t.duracao.padrao}s)`));
    console.log(cinza(`   exemplo: ${t.exemplo}\n`));
  }
}
