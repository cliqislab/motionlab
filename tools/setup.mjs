// npm run setup [-- --sim] [-- --sem-voz]
// Prepara o MotionLab Kit neste computador. Só instala coisas DENTRO da pasta do kit
// (node_modules, .venv e o navegador de render do Remotion). Não instala programas no sistema,
// não pede senha de administrador e não baixa scripts para executar.
import fs from "node:fs";
import path from "node:path";
import {
  ENV, MAC, RAIZ, VIDEOS, WIN, aviso, capturar, capturarCli, confirmar, falha, negrito, ok, opcao, pythonSistema,
  pythonTemModulo, pythonVenv, remotion, rodar, titulo, verde,
} from "./lib.mjs";
import { diagnosticar, imprimir } from "./doctor.mjs";
import { configurarChave } from "./chave.mjs";

const SIM = Boolean(opcao("sim"));
const pergunta = (msg, padrao = true) => (SIM ? Promise.resolve(padrao) : confirmar(msg, padrao));
const manual = [];

console.log(negrito("\n=== MotionLab Kit — instalação ===\n"));
console.log("Tudo será instalado só dentro desta pasta:");
console.log(`  ${RAIZ}`);
console.log("Nenhum programa será instalado no sistema e nenhuma senha será pedida.");
console.log("Tempo estimado: 5 a 15 minutos, conforme a internet. Pode rodar de novo quantas vezes precisar: nada é perdido.\n");

// 1. sistema
titulo("1/9  Sistema operacional");
const so = WIN ? "Windows" : MAC ? "macOS" : "Linux";
ok(`${so} (${process.arch})`);
if (!WIN && !MAC) aviso("Linux não é oficialmente suportado. Deve funcionar, mas não foi testado.");

// 2. node e npm
titulo("2/9  Node.js e npm");
const [maj, min] = process.versions.node.split(".").map(Number);
if (maj < 18 || (maj === 18 && min < 18)) {
  falha(`Node.js v${process.versions.node} é antigo. Instale a versão LTS em https://nodejs.org e rode npm run setup de novo.`);
  process.exit(1);
}
ok(`Node.js v${process.versions.node}`);
const npm = capturarCli("npm", ["-v"]);
npm.ok ? ok(`npm ${npm.out}`) : (falha("npm não encontrado"), process.exit(1));

// 3. claude code
titulo("3/9  Claude Code");
const cl = capturarCli("claude", ["--version"]);
if (cl.ok) ok(`Claude Code ${cl.out.split("\n")[0]}`);
else {
  aviso("Claude Code não encontrado neste terminal.");
  manual.push("Instalar o Claude Code: https://docs.claude.com/en/docs/claude-code/setup (o kit funciona sem ele, mas é com ele que você conversa para criar vídeos)");
}

// 4. python e ffmpeg (programas do sistema: só verificamos)
titulo("4/9  Python e FFmpeg");
const py = pythonSistema();
if (py?.suportado) ok(`Python ${py.versao}`);
else {
  falha(py ? `Python ${py.versao} é antigo (precisa 3.9+)` : "Python não encontrado");
  manual.push(WIN ? "Instalar Python 3: https://www.python.org/downloads/ (marque 'Add python.exe to PATH') e rodar npm run setup de novo" : "Instalar Python 3: https://www.python.org/downloads/ (ou brew install python) e rodar npm run setup de novo");
  if (MAC) console.log("   Se apareceu uma janela pedindo para instalar as 'ferramentas de linha de comando', pode aceitar (é da Apple) ou instalar o Python pelo site acima.");
}
const ff = capturar("ffmpeg", ["-version"]);
if (ff.ok) ok(ff.out.split("\n")[0].replace(/Copyright.*/, "").trim());
else {
  falha("FFmpeg não encontrado");
  manual.push(WIN ? "Instalar FFmpeg: no PowerShell rode  winget install --id Gyan.FFmpeg -e  e abra um terminal novo" : "Instalar FFmpeg: brew install ffmpeg  (Homebrew: https://brew.sh)");
}

// 5. dependências do projeto
titulo("5/9  Dependências do projeto (npm install)");
const temLock = fs.existsSync(path.join(RAIZ, "package-lock.json"));
if (!rodar("npm", [temLock ? "ci" : "install", "--no-audit", "--no-fund"], { shell: WIN })) {
  falha("A instalação das dependências (npm ci) falhou.");
  console.log("   Como recuperar:");
  console.log("   1. Confira a internet (redes de empresa podem bloquear o npm) e rode npm run setup de novo.");
  console.log("   2. Se repetir, apague a pasta node_modules do kit e rode npm run setup de novo.");
  console.log("   3. Mais casos em ERROS-COMUNS.md (seção Instalação).");
  process.exit(1);
}
ok("dependências instaladas em node_modules/");
console.log("   Baixando o navegador de render do Remotion (Chrome Headless Shell, ~100 MB, fica dentro do kit)...");
remotion(["browser", "ensure"]) ? ok("navegador de render pronto") : aviso("não consegui baixar agora; ele será baixado no primeiro render");

// 6. python do kit
titulo("6/9  Ambiente Python do kit (.venv)");
if (py?.suportado) {
  if (!pythonVenv()) {
    console.log("   Criando .venv (ambiente isolado, não mexe no Python do sistema)...");
    if (!rodar(py.cmd, [...py.pre, "-m", "venv", ".venv"])) {
      falha("não consegui criar o .venv");
      manual.push(MAC || WIN ? "Reinstalar o Python pelo site oficial e rodar npm run setup de novo" : "sudo apt install python3-venv e rodar npm run setup de novo");
    }
  }
  const venv = pythonVenv();
  if (venv) {
    rodar(venv, ["-m", "pip", "install", "--disable-pip-version-check", "-q", "--upgrade", "pip"]);
    if (rodar(venv, ["-m", "pip", "install", "--disable-pip-version-check", "-q", "-r", "requirements.txt"])) ok("trilha e efeitos sonoros (numpy, pillow)");
    else falha("falhou ao instalar numpy/pillow");
    if (opcao("sem-voz")) aviso("pulei narração/sincronia (--sem-voz)");
    else if (await pergunta("   Instalar narração e sincronia com a fala? (edge-tts + faster-whisper, ~250 MB)", true)) {
      rodar(venv, ["-m", "pip", "install", "--disable-pip-version-check", "-q", "-r", "requirements-voz.txt"])
        ? ok("narração e sincronia instaladas")
        : aviso("falhou: o kit funciona, mas sem narração automática. Rode npm run setup de novo depois.");
    }
  }
} else aviso("pulei: instale o Python primeiro");

// 7. pastas
titulo("7/9  Pastas de trabalho");
fs.mkdirSync(VIDEOS, { recursive: true });
ok("videos/ pronta (seus vídeos ficam aqui)");

// 8. .env e chave gemini
titulo("8/9  Configuração (.env) e chave Gemini");
if (!fs.existsSync(ENV)) {
  fs.copyFileSync(path.join(RAIZ, ".env.example"), ENV);
  if (!WIN) fs.chmodSync(ENV, 0o600);
  ok(".env criado a partir do .env.example");
} else ok(".env já existe (mantido)");
const temChave = (() => {
  const m = fs.readFileSync(ENV, "utf8").match(/^GEMINI_API_KEY=(.+)$/m);
  return Boolean(process.env.GEMINI_API_KEY || (m && m[1].trim()));
})();
if (temChave) ok("chave Gemini já configurada (teste com: npm run chave -- --testar)");
else {
  console.log("   A chave Gemini é OPCIONAL: só serve para a narração com voz do Google (Fenrir).");
  console.log("   Sem ela você cria e exporta vídeos normalmente. Guia: CONFIGURAR-GEMINI.md");
  if (!SIM && process.stdin.isTTY && (await confirmar("   Quer configurar a chave agora?", false))) await configurarChave();
  else aviso("chave não configurada (dá para fazer depois com: npm run chave)");
}

// 9. diagnóstico
titulo("9/9  Diagnóstico final (inclui um render de teste)");
const r = await diagnosticar({ completo: true, silencioso: true });
const erros = imprimir(r);

console.log(negrito("\n=== Resumo ==="));
if (manual.length) {
  console.log("\nFaça isto manualmente e depois rode npm run setup de novo:");
  manual.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
}
if (!erros) {
  console.log(verde(negrito("\nInstalação concluída. Para fazer seu primeiro vídeo:\n")));
  console.log("  Opção A (conversando, recomendado):");
  console.log("    1. Nesta pasta, rode:  claude");
  console.log('    2. Peça:  "Crie um vídeo de 30 segundos para Instagram apresentando meu app de receitas"');
  console.log("\n  Opção B (sem Claude, editando um arquivo):");
  console.log("    npm run demo                      gera o vídeo de demonstração Nexa App");
  console.log("    npm run novo -- meu-video         cria um vídeo a partir do template neon");
  console.log("    npm run preview -- meu-video      abre a prévia no navegador");
  console.log("    npm run render -- meu-video       exporta o MP4");
  console.log("\n  Tutorial completo: PRIMEIRO-VIDEO.md\n");
}
process.exit(erros ? 1 : 0);
