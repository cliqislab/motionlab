// npm run pacote — gera dist/MotionLab-Kit-v<versão>.zip para vender (roda a verificação antes)
import fs from "node:fs";
import path from "node:path";
import { RAIZ, WIN, falha, ok, rodar, sair } from "./lib.mjs";
import { arquivosDoPacote } from "./arquivos.mjs";

if (!rodar(process.execPath, [path.join(RAIZ, "tools", "verificar-pacote.mjs")])) sair("Pacote não gerado: a verificação encontrou problemas.");
const versao = JSON.parse(fs.readFileSync(path.join(RAIZ, "package.json"), "utf8")).version;
const dist = path.join(RAIZ, "dist");
const nome = `MotionLab-Kit-v${versao}`;
const stage = path.join(dist, nome);
fs.rmSync(stage, { recursive: true, force: true });
for (const rel of arquivosDoPacote()) {
  const dst = path.join(stage, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(RAIZ, rel), dst);
}
const zip = path.join(dist, `${nome}.zip`);
fs.rmSync(zip, { force: true });
const feito = WIN
  ? rodar("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${stage}' -DestinationPath '${zip}'`])
  : rodar("zip", ["-rq", `${nome}.zip`, nome], { cwd: dist });
if (!feito) {
  falha("não consegui compactar. A pasta pronta está em " + path.relative(RAIZ, stage));
  process.exit(1);
}
ok(`pacote pronto: ${path.relative(RAIZ, zip)} (${(fs.statSync(zip).size / 1e6).toFixed(2)} MB)`);
