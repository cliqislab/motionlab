// npm run novo -- <nome> [--template neon] [--formato 9:16] [--de exemplos/nexa-app] [--forcar]
import fs from "node:fs";
import path from "node:path";
import { RAIZ, TEMPLATES, VIDEOS, copiarPasta, negrito, ok, opcao, prepararPublic, sair } from "./lib.mjs";
import { lerTemplates } from "./templates.mjs";

export function criarVideo(nome, { template = "neon", formato, de, forcar = false } = {}) {
  if (!nome || !/^_?[a-z0-9][a-z0-9-]*$/.test(nome)) sair("Dê um nome simples ao vídeo, só letras minúsculas, números e hífen. Exemplo: npm run novo -- lancamento-app");
  const t = lerTemplates().find((x) => x.id === template);
  if (!t) sair(`Template "${template}" não existe. Veja a lista com: npm run templates`);
  if (t.status !== "pronto") sair(`O template "${template}" ainda está em desenvolvimento e não pode ser usado.`);
  const dir = path.join(VIDEOS, nome);
  if (fs.existsSync(dir)) {
    if (!forcar) sair(`Já existe um vídeo chamado "${nome}" em videos/. Escolha outro nome (nada foi apagado).`);
    // --forcar: recria só o código (src) e o conteúdo; mantém imagens e saídas
    fs.rmSync(path.join(dir, "src"), { recursive: true, force: true });
  }
  const tdir = path.join(TEMPLATES, template);
  copiarPasta(path.join(tdir, "src"), path.join(dir, "src"));
  let conteudoSrc = path.join(tdir, "conteudo.json");
  if (de) {
    const ex = path.resolve(RAIZ, de);
    conteudoSrc = path.join(ex, "conteudo.json");
    if (!fs.existsSync(conteudoSrc)) sair(`Exemplo não encontrado: ${de}`);
    const imgs = path.join(ex, "imagens");
    if (fs.existsSync(imgs)) copiarPasta(imgs, path.join(dir, "public", "imagens"));
    const rot = path.join(ex, "roteiro.txt");
    if (fs.existsSync(rot)) fs.copyFileSync(rot, path.join(dir, "roteiro.txt"));
  }
  const conteudo = JSON.parse(fs.readFileSync(conteudoSrc, "utf8"));
  conteudo.template = template;
  if (formato) conteudo.formato = formato;
  fs.writeFileSync(path.join(dir, "conteudo.json"), JSON.stringify(conteudo, null, 2) + "\n");
  for (const p of ["audio", "saida"]) fs.mkdirSync(path.join(dir, p), { recursive: true });
  if (!fs.existsSync(path.join(dir, "roteiro.txt"))) {
    fs.writeFileSync(path.join(dir, "roteiro.txt"), "Escreva aqui o texto da narração (opcional). Depois rode: npm run narrar -- " + nome + "\n");
  }
  prepararPublic(dir);
  return dir;
}

if (process.argv[1]?.endsWith("novo.mjs")) {
  const argv = process.argv.slice(2);
  const nome = argv[0] && !argv[0].startsWith("-") ? argv[0] : undefined;
  const dir = criarVideo(nome, {
    template: opcao("template", "neon"),
    formato: opcao("formato"),
    de: opcao("de"),
    forcar: Boolean(opcao("forcar", false)),
  });
  ok(`vídeo criado em ${path.relative(RAIZ, dir)}`);
  console.log(`\n${negrito("Próximos passos")}`);
  console.log(`  1. Edite os textos em ${path.relative(RAIZ, path.join(dir, "conteudo.json"))} (ou peça ao Claude Code)`);
  console.log(`  2. Veja a prévia:        npm run preview -- ${nome}`);
  console.log(`  3. Exporte o MP4:        npm run render -- ${nome}\n`);
}
