// npm run checar -- <video> — confere o conteudo.json e mostra a linha do tempo (quando cada cena entra)
import path from "node:path";
import { RAIZ, aviso, falha, linhaDoTempo, negrito, ok, resolverVideo } from "./lib.mjs";
import { validar } from "./video.mjs";

const { nome, dir } = resolverVideo();
const { erros, avisos } = validar(dir);
console.log(negrito(`\nConferindo ${path.relative(RAIZ, dir)}\n`));
avisos.forEach((a) => aviso(a));
erros.forEach((e) => falha(e));
if (erros.length) process.exit(1);
const tl = await linhaDoTempo(dir);
ok(`conteúdo válido: ${tl.cenas.length} cenas, formato ${tl.formato} (${tl.width}x${tl.height}), ${tl.duracaoTotal}s`);
console.log("");
for (const c of tl.cenas) {
  const resumo = c.dados.linhas?.[0]?.texto || c.dados.titulo || c.dados.texto || c.dados.nome || "";
  console.log(`  ${String(c.i + 1).padStart(2)}. ${c.inicio.toFixed(2).padStart(6)}s - ${c.fim.toFixed(2).padStart(6)}s  ${c.tipo.padEnd(11)} ${c.impacto ? "[impacto] " : ""}${String(resumo).slice(0, 48)}`);
}
console.log(`\nPrévia: npm run preview -- ${nome}\n`);
