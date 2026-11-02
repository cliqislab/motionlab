// Lista dos arquivos que vão para o pacote de venda (mesmas regras do .gitignore + segurança extra).
import fs from "node:fs";
import path from "node:path";
import { RAIZ } from "./lib.mjs";

// "lancamento" = documentos internos do vendedor (QA, checklists): não vão para o comprador
const IGNORAR_PASTAS = new Set(["node_modules", ".venv", "dist", "out", "__pycache__", ".git", "lancamento", "installer", ".github"]);
const IGNORAR_ARQ = new Set([".DS_Store", ".env"]);

export function arquivosDoPacote(dir = RAIZ, base = RAIZ, out = []) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    const rel = path.relative(base, p).split(path.sep).join("/");
    const st = fs.lstatSync(p);
    if (st.isDirectory()) {
      if (IGNORAR_PASTAS.has(n)) continue;
      if (rel === "videos") {
        if (fs.existsSync(path.join(p, "LEIA-ME.md"))) out.push("videos/LEIA-ME.md");
        continue;
      }
      if (rel === ".claude") {
        // só a skill do kit; configurações pessoais (settings.local.json etc.) ficam de fora
        if (fs.existsSync(path.join(p, "skills"))) arquivosDoPacote(path.join(p, "skills"), base, out);
        continue;
      }
      arquivosDoPacote(p, base, out);
    } else {
      if (IGNORAR_ARQ.has(n) || (n.startsWith(".env") && n !== ".env.example") || n.endsWith(".log")) continue;
      out.push(rel);
    }
  }
  return out.sort();
}
