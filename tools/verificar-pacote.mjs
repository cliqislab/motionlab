// npm run verificar-pacote — confere se o pacote de venda está limpo:
// sem caminhos absolutos, dados pessoais, credenciais, vídeos de clientes ou arquivos pesados.
import fs from "node:fs";
import path from "node:path";
import { RAIZ, falha, negrito, ok, verde } from "./lib.mjs";
import { arquivosDoPacote } from "./arquivos.mjs";

// padrões montados em partes para este arquivo não acusar a si mesmo
const P = (...p) => new RegExp(p.join(""), "i");
const PROIBIDOS = [
  [P("/Us", "ers/"), "caminho absoluto de macOS"],
  [P("[A-Z]:\\\\{1,2}Us", "ers"), "caminho absoluto de Windows"],
  [P("thiago", "oliveira"), "nome do autor original"],
  [P("meia", "conta"), "marca de projeto anterior"],
  [P("bon", "gas"), "cliente anterior"],
  [P("cli", "qis"), "marca de projeto anterior"],
  [P("jr", "net"), "cliente anterior"],
  [P("cin", "tia"), "cliente anterior"],
  [P("seb", "rae"), "projeto anterior"],
  [P("sai", "da7"), "caminho antigo da chave"],
  [P("lu", "ian"), "cliente anterior"],
  [P("vie", "ri"), "perfil pessoal do vendedor"],
  [P("cliqis", "lab"), "e-mail/marca pessoal"],
  [P("[A-Za-z0-9._%+-]+", "@", "(gmail|hotmail|outlook|yahoo|icloud|uol|bol)\\.(com|br)"), "e-mail pessoal"],
  [P("\\(?\\b\\d{2}\\)?\\s?9\\d{4}[- ]?\\d{4}\\b"), "telefone"],
];
const SEGREDOS = [
  [new RegExp("AI" + "za[0-9A-Za-z_-]{30,}"), "chave Google/Gemini"],
  [new RegExp("A" + "Q\\.[0-9A-Za-z_-]{30,}"), "chave Google/Gemini"],
  [new RegExp("sk-" + "ant-[0-9A-Za-z_-]{20,}"), "chave Anthropic"],
  [new RegExp("sk-" + "[0-9A-Za-z]{32,}"), "chave de API"],
  [new RegExp("GEMINI_API_KEY=" + "[\"']?[A-Za-z0-9_.-]{30,}"), "chave preenchida"],
];
const MIDIA = /\.(mp4|mov|mkv|webm|wav|mp3|m4a|aac|flac)$/i;
// tudo o que pode existir na raiz do pacote; qualquer outra coisa é suspeita
const RAIZ_PERMITIDA = new Set([
  ".claude", ".env.example", ".gitignore", "CLAUDE.md", "package.json", "package-lock.json", "tsconfig.json", "remotion.config.ts",
  "requirements.txt", "requirements-voz.txt", "exemplos", "scripts", "templates", "tools", "videos", "docs",
  "README.md", "INSTALACAO.md", "CONFIGURAR-GEMINI.md", "PRIMEIRO-VIDEO.md", "SEU-PRIMEIRO-VIDEO.md", "GUIA-DE-PROMPTS.md",
  "PERSONALIZACAO.md", "EXPORTACAO.md", "ERROS-COMUNS.md", "REQUISITOS.md", "LICENCAS.md", "INSTALADOR-GRAFICO.md",
]);
const TEXTO = /\.(md|mjs|js|ts|tsx|json|py|txt|example|gitignore|ps1|sh)$|^\.[a-z]+$/i;

const arquivos = arquivosDoPacote();
const problemas = [];
let bytes = 0;
for (const rel of arquivos) {
  const p = path.join(RAIZ, rel);
  const st = fs.lstatSync(p);
  if (!RAIZ_PERMITIDA.has(rel.split("/")[0])) problemas.push(`${rel}: arquivo fora da lista do pacote`);
  if (rel.startsWith(".claude/") && rel !== ".claude/skills/motion-video/SKILL.md") problemas.push(`${rel}: só a skill do kit pode ir em .claude/`);
  if (st.isSymbolicLink()) problemas.push(`${rel}: atalho (symlink) não pode ir no pacote`);
  if (/\.(pem|key|p12|pfx|sqlite|db)$/i.test(rel)) problemas.push(`${rel}: tipo de arquivo sensível`);
  bytes += st.size;
  if (MIDIA.test(rel)) problemas.push(`${rel}: arquivo de mídia não deve ir no pacote`);
  if (st.size > 5e6) problemas.push(`${rel}: arquivo grande (${(st.size / 1e6).toFixed(1)} MB)`);
  if (rel === "tools/verificar-pacote.mjs") continue;
  if (!TEXTO.test(path.basename(rel))) continue;
  const txt = fs.readFileSync(p, "utf8");
  for (const [re, oque] of [...PROIBIDOS, ...SEGREDOS]) {
    const m = txt.match(re);
    if (m) {
      const linha = txt.slice(0, m.index).split("\n").length;
      problemas.push(`${rel}:${linha}: ${oque}`);
    }
  }
}

// dependências npm: só do registro oficial e com hash de integridade
const lock = JSON.parse(fs.readFileSync(path.join(RAIZ, "package-lock.json"), "utf8"));
for (const [nome, d] of Object.entries(lock.packages || {})) {
  if (!nome) continue;
  if (d.resolved && !d.resolved.startsWith("https://registry.npmjs.org/")) problemas.push(`package-lock.json: ${nome} vem de fonte não oficial (${d.resolved})`);
  if (!d.link && !d.integrity) problemas.push(`package-lock.json: ${nome} sem hash de integridade`);
}

console.log(negrito(`\nVerificação do pacote: ${arquivos.length} arquivos, ${(bytes / 1e6).toFixed(2)} MB\n`));
if (problemas.length) {
  problemas.forEach((x) => falha(x));
  console.log(`\n${problemas.length} problema(s). Corrija antes de vender.\n`);
  process.exit(1);
}
ok("sem caminhos absolutos, dados pessoais, marcas de projetos anteriores ou credenciais");
ok("sem vídeos, áudios ou arquivos pesados");
ok("só arquivos da lista do pacote; dependências npm do registro oficial com hash de integridade");
ok(".env, node_modules, .venv e videos/ ficam fora do pacote");
console.log(verde("\nPacote limpo.\n"));
