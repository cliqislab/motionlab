// npm run procurar-chave [-- arquivo-de-log ...]
// Confere se a chave Gemini configurada vazou para algum arquivo do kit, vídeo ou log.
// Nunca mostra a chave: imprime só o nome do arquivo e quantas vezes ela aparece.
import fs from "node:fs";
import path from "node:path";
import { RAIZ, aviso, chaveGemini, falha, negrito, ok } from "./lib.mjs";

const chave = chaveGemini();
if (!chave) {
  aviso("Nenhuma chave configurada: nada para procurar.");
  process.exit(0);
}

const PULAR = new Set(["node_modules", ".venv", ".git"]);
const alvos = [];
function varrer(dir) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    const st = fs.lstatSync(p);
    if (st.isDirectory()) {
      if (!PULAR.has(n)) varrer(p);
    } else if (st.isFile() && p !== path.join(RAIZ, ".env") && st.size < 50e6) alvos.push(p);
  }
}
varrer(RAIZ);
for (const extra of process.argv.slice(2)) if (fs.existsSync(extra)) alvos.push(path.resolve(extra));

// procura nos bytes (pega texto, JSON, logs e até binários)
const agulha = Buffer.from(chave);
let achados = 0;
for (const p of alvos) {
  const buf = fs.readFileSync(p);
  let n = 0;
  for (let i = buf.indexOf(agulha); i >= 0; i = buf.indexOf(agulha, i + 1)) n++;
  if (n) {
    achados += n;
    falha(`${path.relative(RAIZ, p) || p}: a chave aparece ${n} vez(es)`);
  }
}
console.log(negrito(`\n${alvos.length} arquivos verificados (o próprio .env é ignorado).`));
if (achados) {
  falha("A chave vazou. Apague esses arquivos, revogue a chave no Google AI Studio e gere outra (CONFIGURAR-GEMINI.md, passo 9).");
  process.exit(1);
}
ok("a chave não aparece em nenhum arquivo além do .env");
