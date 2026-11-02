// npm run doctor [-- --completo] [-- --testar-gemini]
// Verifica se tudo o que o kit precisa está instalado e diz exatamente o que falta.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  ENV, MAC, RAIZ, VIDEOS, WIN, amarelo, capturar, capturarCli, chaveGemini, cinza, falha, negrito, ok, aviso, opcao,
  pythonSistema, pythonTemModulo, pythonVenv, remotion, testarChave, titulo, verde, vermelho,
} from "./lib.mjs";

const COMO = {
  node: WIN ? "baixe o instalador LTS em https://nodejs.org" : MAC ? "baixe o instalador LTS em https://nodejs.org (ou: brew install node)" : "https://nodejs.org",
  python: WIN ? "baixe em https://www.python.org/downloads/ e marque 'Add python.exe to PATH'" : MAC ? "baixe em https://www.python.org/downloads/ (ou: brew install python)" : "sudo apt install python3 python3-venv",
  ffmpeg: WIN ? "rode no PowerShell: winget install --id Gyan.FFmpeg -e  (depois feche e abra o terminal)" : MAC ? "rode: brew install ffmpeg  (precisa do Homebrew: https://brew.sh)" : "sudo apt install ffmpeg",
  claude: "veja https://docs.claude.com/en/docs/claude-code/setup",
};

export async function diagnosticar({ completo = false, testarGemini = false, silencioso = false } = {}) {
  const r = [];
  const add = (nivel, item, msg, correcao) => r.push({ nivel, item, msg, correcao });

  // sistema
  const so = WIN ? "Windows" : MAC ? "macOS" : process.platform;
  add("ok", "Sistema", `${so} ${os.release()} (${process.arch})`);
  if (!WIN && !MAC) add("aviso", "Sistema", "Linux não é oficialmente suportado, mas deve funcionar.");
  if (WIN && process.arch === "arm64") add("aviso", "Sistema", "Windows em processador ARM não é suportado: o render do Remotion só existe para Windows x64.", "use um computador Windows x64 ou um Mac");

  // node / npm
  const [maj, min] = process.versions.node.split(".").map(Number);
  if (maj > 18 || (maj === 18 && min >= 18)) add("ok", "Node.js", `v${process.versions.node}`);
  else add("erro", "Node.js", `v${process.versions.node} é antigo (precisa 18.18 ou mais novo)`, COMO.node);
  const npm = capturarCli("npm", ["-v"]);
  npm.ok ? add("ok", "npm", npm.out) : add("erro", "npm", "não encontrado", COMO.node);

  // claude code
  const cl = capturarCli("claude", ["--version"]);
  cl.ok ? add("ok", "Claude Code", cl.out.split("\n")[0]) : add("aviso", "Claude Code", "não encontrado no terminal (necessário para criar vídeos conversando)", COMO.claude);

  // ffmpeg
  const ff = capturar("ffmpeg", ["-version"]);
  ff.ok ? add("ok", "FFmpeg", ff.out.split("\n")[0].replace(/Copyright.*/, "").trim()) : add("erro", "FFmpeg", "não encontrado (necessário para áudio e vídeo)", COMO.ffmpeg);
  const fp = capturar("ffprobe", ["-version"]);
  if (!fp.ok && ff.ok) add("aviso", "FFprobe", "não encontrado (vem junto com o FFmpeg)", COMO.ffmpeg);

  // python
  const py = pythonSistema();
  if (!py) add("erro", "Python", "não encontrado", COMO.python);
  else if (!py.suportado) add("erro", "Python", `${py.versao} é antigo (precisa 3.9 ou mais novo)`, COMO.python);
  else add("ok", "Python", py.versao);
  if (pythonVenv()) {
    add("ok", "Ambiente Python do kit", ".venv criado");
    pythonTemModulo("numpy") && pythonTemModulo("PIL")
      ? add("ok", "Trilha e efeitos sonoros", "numpy + pillow instalados")
      : add("erro", "Trilha e efeitos sonoros", "numpy/pillow faltando", "rode: npm run setup");
    pythonTemModulo("edge_tts") ? add("ok", "Voz gratuita (teste)", "edge-tts instalado") : add("aviso", "Voz gratuita (teste)", "edge-tts não instalado", "rode: npm run setup");
    pythonTemModulo("faster_whisper") ? add("ok", "Sincronia com a fala", "faster-whisper instalado") : add("aviso", "Sincronia com a fala", "faster-whisper não instalado", "rode: npm run setup");
  } else {
    add("erro", "Ambiente Python do kit", ".venv não existe", "rode: npm run setup");
  }

  // dependências do projeto
  const rpkg = path.join(RAIZ, "node_modules", "remotion", "package.json");
  if (fs.existsSync(rpkg)) add("ok", "Remotion (animação)", `v${JSON.parse(fs.readFileSync(rpkg, "utf8")).version}`);
  else add("erro", "Remotion (animação)", "dependências não instaladas", "rode: npm run setup");

  // chave gemini
  const gi = fs.existsSync(path.join(RAIZ, ".gitignore")) ? fs.readFileSync(path.join(RAIZ, ".gitignore"), "utf8") : "";
  if (!/^\.env$/m.test(gi)) add("erro", "Segurança", ".env não está no .gitignore", "restaure o .gitignore original do kit");
  fs.existsSync(ENV) ? add("ok", "Arquivo .env", "existe") : add("aviso", "Arquivo .env", "não existe", "rode: npm run setup");
  const k = chaveGemini();
  if (!k) add("aviso", "Chave Gemini (opcional)", "não configurada: narração Gemini desligada, o resto funciona", "veja CONFIGURAR-GEMINI.md e rode: npm run chave");
  else if (testarGemini) {
    const t = await testarChave(k);
    add(t.ok ? "ok" : "erro", "Chave Gemini (opcional)", t.msg, t.ok ? undefined : "rode: npm run chave");
  } else add("ok", "Chave Gemini (opcional)", "configurada (teste com: npm run chave -- --testar)");

  // disco
  try {
    const st = fs.statfsSync(RAIZ);
    const gb = (st.bavail * st.bsize) / 1e9;
    gb >= 3 ? add("ok", "Espaço em disco", `${gb.toFixed(1)} GB livres`) : add("aviso", "Espaço em disco", `${gb.toFixed(1)} GB livres (recomendado: 3 GB)`);
  } catch {
    /* statfs indisponível: ignora */
  }

  // teste real: gera uma imagem com o template
  if (completo && fs.existsSync(rpkg)) {
    const nome = "_diagnostico";
    const dir = path.join(VIDEOS, nome);
    try {
      const { criarVideo } = await import("./novo.mjs");
      fs.rmSync(dir, { recursive: true, force: true });
      criarVideo(nome, { template: "neon", forcar: true });
      const { prepararVideo, argsEntrada } = await import("./video.mjs");
      await prepararVideo(dir, { silencioso: true });
      const out = path.join(dir, "saida", "teste.jpg");
      const passou = remotion(["still", ...argsEntrada(dir), "MotionVideo", path.relative(RAIZ, out), "--frame=60", "--scale=0.25", "--log=error"], { stdio: silencioso ? "ignore" : "inherit" });
      passou && fs.existsSync(out)
        ? add("ok", "Teste de render", "imagem de teste gerada com o template neon")
        : add("erro", "Teste de render", "falhou ao gerar a imagem de teste", "veja ERROS-COMUNS.md (seção Render)");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  return r;
}

export function imprimir(r) {
  titulo("Diagnóstico do MotionLab Kit");
  for (const x of r) {
    const f = x.nivel === "ok" ? ok : x.nivel === "aviso" ? aviso : falha;
    f(`${x.item}: ${x.msg}`);
    if (x.correcao) console.log(cinza(`      como resolver: ${x.correcao}`));
  }
  const erros = r.filter((x) => x.nivel === "erro").length;
  const avisos = r.filter((x) => x.nivel === "aviso").length;
  console.log("");
  if (!erros) console.log(verde(negrito(`Tudo pronto para criar vídeos.${avisos ? ` (${avisos} item(ns) opcional(is) acima)` : ""}`)));
  else console.log(vermelho(negrito(`${erros} item(ns) obrigatório(s) faltando.`)) + amarelo(" Resolva os itens marcados com ✘ e rode npm run doctor de novo."));
  return erros;
}

if (process.argv[1]?.endsWith("doctor.mjs")) {
  const r = await diagnosticar({ completo: Boolean(opcao("completo")), testarGemini: Boolean(opcao("testar-gemini")) });
  process.exit(imprimir(r) ? 1 : 0);
}
