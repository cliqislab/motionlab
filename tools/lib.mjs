// Funções compartilhadas pelos comandos npm run ... do MotionLab Kit.
// Tudo é relativo à pasta do kit, então funciona em qualquer caminho onde o comprador clonar/descompactar.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import readline from "node:readline";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const WIN = process.platform === "win32";
export const MAC = process.platform === "darwin";
export const VIDEOS = path.join(RAIZ, "videos");
export const TEMPLATES = path.join(RAIZ, "templates");

// ------------------------------------------------------------ mensagens
const cor = (n) => (s) => (process.stdout.isTTY ? `\x1b[${n}m${s}\x1b[0m` : s);
export const verde = cor(32);
export const amarelo = cor(33);
export const vermelho = cor(31);
export const negrito = cor(1);
export const cinza = cor(90);
export const ok = (s) => console.log(`${verde("  ✔")} ${s}`);
export const aviso = (s) => console.log(`${amarelo("  !")} ${s}`);
export const falha = (s) => console.log(`${vermelho("  ✘")} ${s}`);
export const titulo = (s) => console.log(`\n${negrito(s)}`);

export function sair(msg, codigo = 1) {
  console.error(`\n${vermelho("Erro:")} ${msg}\n`);
  process.exit(codigo);
}

// erro inesperado: mensagem curta e o caminho de recuperação, sem despejar o rastro técnico inteiro
function erroInesperado(e) {
  const msg = String((e && e.message) || e).split("\n")[0];
  console.error(`\n${vermelho("Erro inesperado:")} ${msg}`);
  console.error("Como recuperar:");
  console.error("  1. Rode  npm run doctor  e resolva os itens marcados com ✘");
  console.error("  2. Se o erro for em um vídeo, rode  npm run checar -- <nome-do-video>");
  console.error("  3. Procure a mensagem acima em ERROS-COMUNS.md");
  if (process.env.MOTIONLAB_DEBUG) console.error(e);
  else console.error(cinza("  (detalhes técnicos: rode de novo com a variável MOTIONLAB_DEBUG=1)"));
  process.exit(1);
}
process.on("uncaughtException", erroInesperado);
process.on("unhandledRejection", erroInesperado);

// ------------------------------------------------------------ processos
export function rodar(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: RAIZ, ...opts });
  return r.status === 0;
}

export function capturar(cmd, args, opts = {}) {
  try {
    const r = spawnSync(cmd, args, { encoding: "utf8", cwd: RAIZ, timeout: 30000, ...opts });
    return { ok: r.status === 0, out: `${r.stdout || ""}${r.stderr || ""}`.trim() };
  } catch {
    return { ok: false, out: "" };
  }
}

// npm/npx/claude no Windows são arquivos .cmd: precisam de shell
export function capturarCli(cmd, args) {
  return capturar(cmd, args, { shell: WIN });
}

// Remotion CLI local (node_modules), sem npx e sem shell: igual em Mac e Windows
export function remotion(args, opts = {}) {
  const cli = path.join(RAIZ, "node_modules", "@remotion", "cli", "remotion-cli.js");
  if (!fs.existsSync(cli)) sair("Dependências não instaladas. Rode: npm run setup");
  return rodar(process.execPath, [cli, ...args], opts);
}

// ------------------------------------------------------------ python
export function pythonVenv() {
  const p = WIN ? path.join(RAIZ, ".venv", "Scripts", "python.exe") : path.join(RAIZ, ".venv", "bin", "python");
  return fs.existsSync(p) ? p : null;
}

export function pythonSistema() {
  const candidatos = WIN ? [["py", ["-3"]], ["python", []], ["python3", []]] : [["python3", []], ["python", []]];
  for (const [cmd, pre] of candidatos) {
    const r = capturar(cmd, [...pre, "-c", "import sys;print('%d.%d.%d'%sys.version_info[:3])"]);
    if (r.ok && /^3\.(\d+)/.test(r.out)) {
      const menor = Number(r.out.split(".")[1]);
      return { cmd, pre, versao: r.out, suportado: menor >= 9 };
    }
  }
  return null;
}

export function python(script, args, opts = {}) {
  const py = pythonVenv();
  if (!py) return false;
  return rodar(py, [path.join(RAIZ, "scripts", script), ...args], opts);
}

export function pythonTemModulo(mod) {
  const py = pythonVenv();
  if (!py) return false;
  return capturar(py, ["-c", `import ${mod}`]).ok;
}

// ------------------------------------------------------------ .env (chave Gemini)
export const ENV = path.join(RAIZ, ".env");

export function lerEnv() {
  const out = {};
  if (!fs.existsSync(ENV)) return out;
  for (const linha of fs.readFileSync(ENV, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

export function chaveGemini() {
  return (process.env.GEMINI_API_KEY || lerEnv().GEMINI_API_KEY || "").trim();
}

export function gravarEnv(chave, valor) {
  let linhas = fs.existsSync(ENV) ? fs.readFileSync(ENV, "utf8").split(/\r?\n/) : [];
  let achou = false;
  linhas = linhas.map((l) => {
    if (l.startsWith(`${chave}=`)) {
      achou = true;
      return `${chave}=${valor}`;
    }
    return l;
  });
  if (!achou) linhas.push(`${chave}=${valor}`);
  fs.writeFileSync(ENV, linhas.join("\n").replace(/\n*$/, "\n"), { mode: 0o600 });
  if (!WIN) fs.chmodSync(ENV, 0o600);
}

// Testa a chave listando modelos (não gera custo). Nunca imprime a chave.
export async function testarChave(chave) {
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {
      headers: { "x-goog-api-key": chave },
      signal: AbortSignal.timeout(20000),
    });
    if (r.ok) return { ok: true, msg: "chave aceita pela API Gemini" };
    if (r.status === 400 || r.status === 401 || r.status === 403) return { ok: false, msg: `chave recusada (HTTP ${r.status}). Confira se copiou inteira ou gere outra.` };
    if (r.status === 429) return { ok: true, msg: "chave válida, mas o limite de uso foi atingido agora (HTTP 429)" };
    return { ok: false, msg: `resposta inesperada da API (HTTP ${r.status})` };
  } catch (e) {
    return { ok: false, msg: `sem conexão com a API Gemini (${String(e.message || e).replace(chave, "***")})` };
  }
}

// ------------------------------------------------------------ perguntas no terminal
export function perguntar(msg) {
  if (!process.stdin.isTTY) return Promise.resolve("");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(msg, (r) => (rl.close(), res(r.trim()))));
}

export async function confirmar(msg, padrao = true) {
  if (!process.stdin.isTTY) return padrao;
  const r = (await perguntar(`${msg} ${padrao ? "[S/n]" : "[s/N]"} `)).toLowerCase();
  if (!r) return padrao;
  return r.startsWith("s") || r.startsWith("y");
}

// leitura sem eco: nada do que é digitado/colado aparece na tela
export function perguntarOculto(msg) {
  const stdin = process.stdin;
  if (!stdin.isTTY) return Promise.resolve("");
  process.stdout.write(msg);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  let valor = "";
  return new Promise((res) => {
    const aoDigitar = (txt) => {
      for (const ch of txt) {
        if (ch === "\r" || ch === "\n" || ch === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", aoDigitar);
          process.stdout.write("\n");
          res(valor.trim());
          return;
        }
        if (ch === "\u0003") {
          stdin.setRawMode(false);
          process.stdout.write("\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") valor = valor.slice(0, -1);
        else valor += ch;
      }
    };
    stdin.on("data", aoDigitar);
  });
}

// ------------------------------------------------------------ vídeos
export function listarVideos() {
  if (!fs.existsSync(VIDEOS)) return [];
  return fs
    .readdirSync(VIDEOS)
    .filter((n) => fs.existsSync(path.join(VIDEOS, n, "conteudo.json")))
    .sort();
}

// primeiro argumento = nome do vídeo; sem argumento, usa o único vídeo existente
export function resolverVideo(argv = process.argv.slice(2)) {
  const nome = argv[0] && !argv[0].startsWith("-") ? argv[0] : undefined;
  const vs = listarVideos();
  if (nome) {
    const dir = path.join(VIDEOS, nome);
    if (!fs.existsSync(path.join(dir, "conteudo.json"))) {
      sair(`Vídeo "${nome}" não encontrado em videos/.${vs.length ? ` Vídeos existentes: ${vs.join(", ")}` : " Crie um com: npm run novo -- meu-video"}`);
    }
    return { nome, dir };
  }
  if (vs.length === 1) return { nome: vs[0], dir: path.join(VIDEOS, vs[0]) };
  if (!vs.length) sair("Nenhum vídeo criado ainda. Crie um com: npm run novo -- meu-video   (ou rode npm run demo)");
  sair(`Diga qual vídeo usar. Exemplo: npm run preview -- ${vs[0]}\nVídeos existentes: ${vs.join(", ")}`);
}

export function opcao(nome, padrao = undefined, argv = process.argv.slice(2)) {
  const i = argv.indexOf(`--${nome}`);
  if (i < 0) return padrao;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

export function lerJson(p) {
  const rel = path.relative(RAIZ, p);
  if (!fs.existsSync(p)) sair(`Arquivo não encontrado: ${rel}`);
  const txt = fs.readFileSync(p, "utf8").replace(/^﻿/, "");
  try {
    return JSON.parse(txt);
  } catch (e) {
    // posição do erro -> linha e coluna (o Node 18 só informa a posição)
    const m = String(e.message).match(/position (\d+)/);
    const suspeitos = [txt.search(/[“”]/), txt.search(/,\s*[\]}]/), txt.search(/}\s*{/)].filter((x) => x >= 0);
    const pos = m ? Number(m[1]) : suspeitos.length ? Math.min(...suspeitos) : -1;
    let onde = "";
    if (pos >= 0) {
      const antes = txt.slice(0, pos);
      const linha = antes.split("\n").length;
      const coluna = antes.length - antes.lastIndexOf("\n");
      onde = `\n  linha ${linha}, coluna ${coluna}:  ${(txt.split("\n")[linha - 1] || "").trim().slice(0, 90)}`;
    }
    const dicas = [];
    if (/[“”]/.test(txt)) dicas.push("há aspas curvas “ ” (coladas do Word/WhatsApp): troque por aspas retas \"");
    if (/,\s*[\]}]/.test(txt)) dicas.push("há uma vírgula sobrando antes de ] ou }");
    if (/}\s*{/.test(txt)) dicas.push("falta uma vírgula entre duas cenas: } {  deve ser  }, {");
    if (!dicas.length) dicas.push("confira vírgulas, aspas e chaves perto da linha indicada");
    sair(`O arquivo ${rel} tem um erro de digitação.${onde}\nDica: ${dicas.join("; ")}.\nGuia: ERROS-COMUNS.md (seção Conteúdo).`);
  }
}

export function temFfmpeg() {
  return capturar("ffmpeg", ["-version"]).ok;
}

export async function linhaDoTempo(dir) {
  const mod = await import(pathToFileURL(path.join(dir, "src", "timeline.mjs")).href + `?t=${Date.now()}`);
  return mod.montarLinhaDoTempo(lerJson(path.join(dir, "conteudo.json")));
}

// ------------------------------------------------------------ assets (fontes + grão)
export function prepararPublic(dir) {
  const pub = path.join(dir, "public");
  fs.mkdirSync(path.join(pub, "imagens"), { recursive: true });
  const fontes = [
    ["inter.woff2", "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"],
    ["mono.woff2", "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2"],
  ];
  for (const [nome, rel] of fontes) {
    const src = path.join(RAIZ, "node_modules", rel);
    const dst = path.join(pub, nome);
    if (!fs.existsSync(dst)) {
      if (!fs.existsSync(src)) sair("Fontes não encontradas em node_modules. Rode: npm run setup");
      fs.copyFileSync(src, dst);
    }
  }
  const ruido = path.join(pub, "noise.png");
  if (!fs.existsSync(ruido)) fs.writeFileSync(ruido, pngRuido(2400, 1400));
}

// PNG em tons de cinza com ruído aleatório (grão do filme), gerado sem bibliotecas externas
function pngRuido(w, h) {
  let s = 3;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) >> 16) & 0xff;
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w + 1)] = 0;
    for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = rnd();
  }
  const crcTab = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTab[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (tipo, dados) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(dados.length);
    const td = Buffer.concat([Buffer.from(tipo), dados]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 0; // tons de cinza
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// WAV silencioso: permite prévia/render mesmo sem Python (vídeo sai sem trilha)
export function wavSilencioso(arquivo, segundos) {
  const sr = 48000;
  const n = Math.ceil(sr * segundos) * 2 * 2;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + n, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(n, 40);
  fs.writeFileSync(arquivo, Buffer.concat([h, Buffer.alloc(n)]));
}

export function copiarPasta(src, dst, filtro = () => true) {
  fs.mkdirSync(dst, { recursive: true });
  for (const n of fs.readdirSync(src)) {
    const a = path.join(src, n);
    const b = path.join(dst, n);
    if (!filtro(a)) continue;
    if (fs.statSync(a).isDirectory()) copiarPasta(a, b, filtro);
    else fs.copyFileSync(a, b);
  }
}
