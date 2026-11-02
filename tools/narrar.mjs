// npm run narrar -- <video> [--voz Fenrir|Puck|Kore|gratis] [--takes 1]
// Lê videos/<video>/roteiro.txt, gera a narração, masteriza e acha o tempo de cada palavra.
import fs from "node:fs";
import path from "node:path";
import { RAIZ, aviso, chaveGemini, lerJson, negrito, ok, opcao, python, pythonTemModulo, resolverVideo, sair } from "./lib.mjs";

const { nome, dir } = resolverVideo();
const roteiro = path.join(dir, "roteiro.txt");
if (!fs.existsSync(roteiro) || fs.readFileSync(roteiro, "utf8").trim().length < 10 || fs.readFileSync(roteiro, "utf8").startsWith("Escreva aqui")) {
  sair(`Escreva o texto da narração em ${path.relative(RAIZ, roteiro)} primeiro.`);
}
const audio = path.join(dir, "audio");
fs.mkdirSync(audio, { recursive: true });
const raw = path.join(audio, "narr_raw.wav");
let voz = opcao("voz", chaveGemini() ? "Fenrir" : "gratis");
if (voz !== "gratis" && !chaveGemini()) {
  aviso("Sem chave Gemini: usando a voz gratuita. Para a voz Fenrir, veja CONFIGURAR-GEMINI.md");
  voz = "gratis";
}
console.log(negrito(`\nGerando narração (${voz === "gratis" ? "voz gratuita de teste" : `Gemini, voz ${voz}`})...`));
let gerou;
if (voz === "gratis") {
  if (!pythonTemModulo("edge_tts")) sair("edge-tts não instalado. Rode: npm run setup");
  gerou = python("tts.py", [roteiro, raw]);
} else {
  gerou = python("tts_gemini.py", [roteiro, raw, "--voice", voz, "--takes", String(opcao("takes", "1"))]);
  const a = path.join(audio, "narr_raw_a.wav");
  if (gerou && !fs.existsSync(raw) && fs.existsSync(a)) {
    aviso("Vários takes gerados (narr_raw_a/b/c.wav). Usando o take A; ouça os outros e troque se preferir.");
    fs.copyFileSync(a, raw);
  }
}
if (!gerou || !fs.existsSync(raw)) sair("Não consegui gerar a narração. Veja ERROS-COMUNS.md (seção Narração).");
const narr = path.join(audio, "narr.wav");
if (!python("master_voice.py", [raw, narr])) sair("Falha ao tratar o áudio da voz. Confira se o FFmpeg está instalado com  npm run doctor  (INSTALACAO.md, passo 1).");
ok(`narração em ${path.relative(RAIZ, narr)}`);

if (pythonTemModulo("faster_whisper")) {
  console.log(negrito("\nMarcando o tempo de cada palavra (a primeira vez baixa o modelo de transcrição, ~500 MB)..."));
  if (python("words.py", [narr, ""]) && python("align.py", [roteiro, narr, path.join(audio, "narr.words.json"), path.join(audio, "palavras.json")])) {
    ok(`tempos de cada palavra em ${path.relative(RAIZ, path.join(audio, "palavras.json"))}`);
  } else aviso("Não consegui marcar os tempos das palavras. O vídeo funciona, mas a sincronia fica manual.");
} else {
  aviso("faster-whisper não instalado: sem marcação automática de palavras. Rode npm run setup.");
}

const conteudoPath = path.join(dir, "conteudo.json");
const c = lerJson(conteudoPath);
c.narracao = { ...(c.narracao || {}), ativa: true };
fs.writeFileSync(conteudoPath, JSON.stringify(c, null, 2) + "\n");
ok(`narração ativada no conteudo.json`);
console.log(`\nAgora peça ao Claude Code: "sincronize as cenas do vídeo ${nome} com a narração".`);
console.log(`Ou veja como ficou: npm run preview -- ${nome}\n`);
