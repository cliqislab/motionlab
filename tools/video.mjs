// Preparação de um vídeo antes da prévia/render: valida o conteudo.json, prepara fontes e gera o áudio.
import fs from "node:fs";
import path from "node:path";
import { RAIZ, aviso, falha, linhaDoTempo, lerJson, ok, prepararPublic, python, pythonTemModulo, pythonVenv, temFfmpeg, wavSilencioso } from "./lib.mjs";

export const DICA_RENDER = [
  "Como recuperar:",
  "  1. Leia a primeira linha vermelha acima: ela diz o motivo.",
  "  2. Rode  npm run doctor -- --completo  (confere o navegador de render).",
  "  3. Pouco espaço em disco ou memória também derrubam o render: feche programas e libere espaço.",
  "  4. Mais casos em ERROS-COMUNS.md (seção Prévia e render).",
].join("\n");

const OBRIGATORIOS = {
  titulo: ["linhas"],
  chips: ["itens"],
  app: [],
  grafico: ["barras"],
  numero: ["ate"],
  codigo: ["linhas"],
  comparacao: ["antes", "depois"],
  imagem: ["arquivo"],
  cta: ["texto"],
  custom: ["componente"],
};

// devolve { erros, avisos }
export function validar(dir) {
  const c = lerJson(path.join(dir, "conteudo.json"));
  const erros = [];
  const avisos = [];
  const formatos = ["16:9", "9:16", "1:1", "4:5"];
  if (c.formato && !formatos.includes(c.formato)) erros.push(`"formato" deve ser um de: ${formatos.join(", ")} (está "${c.formato}")`);
  if (c.cores?.destaque && !/^#[0-9a-fA-F]{6}$/.test(c.cores.destaque)) erros.push(`"cores.destaque" deve ser uma cor no formato #RRGGBB (está "${c.cores.destaque}")`);
  if (!Array.isArray(c.cenas) || !c.cenas.length) erros.push(`"cenas" precisa ter pelo menos uma cena`);
  (c.cenas || []).forEach((cena, i) => {
    const n = `cena ${i + 1}`;
    if (!OBRIGATORIOS[cena.tipo]) {
      erros.push(`${n}: tipo "${cena.tipo}" não existe. Tipos: ${Object.keys(OBRIGATORIOS).join(", ")}`);
      return;
    }
    for (const campo of OBRIGATORIOS[cena.tipo]) {
      if (cena[campo] === undefined || (Array.isArray(cena[campo]) && !cena[campo].length)) erros.push(`${n} (${cena.tipo}): falta o campo "${campo}"`);
    }
    if (cena.tipo === "imagem" && cena.arquivo && !fs.existsSync(path.join(dir, "public", "imagens", cena.arquivo))) {
      erros.push(`${n}: imagem "${cena.arquivo}" não encontrada em ${path.relative(RAIZ, path.join(dir, "public", "imagens"))}`);
    }
    if (typeof cena.duracao === "number" && cena.duracao < 1) avisos.push(`${n}: duração ${cena.duracao}s é curta demais para ler`);
    if (cena.tipo === "titulo") {
      for (const l of cena.linhas || []) if (String(l.texto || "").length > 40) avisos.push(`${n}: linha longa ("${String(l.texto).slice(0, 30)}..."). Textos curtos ficam melhores.`);
    }
  });
  if (c.narracao?.ativa && !fs.existsSync(path.join(dir, "audio", "narr.wav"))) {
    avisos.push(`narração ativa, mas audio/narr.wav não existe. Rode: npm run narrar -- ${path.basename(dir)}`);
  }
  return { erros, avisos, conteudo: c };
}

export async function prepararVideo(dir, { silencioso = false } = {}) {
  const { erros, avisos } = validar(dir);
  avisos.forEach((a) => aviso(a));
  if (erros.length) {
    erros.forEach((e) => falha(e));
    console.log("\nCorrija o conteudo.json e tente de novo. Guia: PERSONALIZACAO.md\n");
    process.exit(1);
  }
  prepararPublic(dir);
  const tl = await linhaDoTempo(dir);
  const audioDir = path.join(dir, "audio");
  fs.mkdirSync(audioDir, { recursive: true });
  fs.mkdirSync(path.join(dir, "saida"), { recursive: true });
  const ev = { ...tl.eventos, width: tl.width, height: tl.height };
  const evPath = path.join(audioDir, "events.json");
  fs.writeFileSync(evPath, JSON.stringify(ev, null, 2));
  const mixed = path.join(dir, "public", "mixed.wav");

  if (!tl.audio) {
    if (!silencioso) ok(`áudio desligado no conteudo.json ("audio": false)`);
    return tl;
  }
  if (!temFfmpeg()) {
    aviso("FFmpeg não encontrado: o vídeo vai sair SEM trilha e efeitos sonoros. Instale o FFmpeg (INSTALACAO.md, passo 1) e rode de novo.");
    wavSilencioso(mixed, tl.duracaoTotal);
    return tl;
  }
  const podePython = pythonVenv() && pythonTemModulo("numpy");
  if (!podePython) {
    aviso("Python do kit não encontrado: o vídeo vai sair SEM trilha e efeitos sonoros. Rode npm run setup para corrigir.");
    wavSilencioso(mixed, tl.duracaoTotal);
    return tl;
  }
  const quieto = { stdio: silencioso ? "ignore" : ["ignore", "ignore", "inherit"] };
  if (!python("score.py", [evPath, audioDir], quieto)) {
    aviso("Falha ao gerar a trilha. Seguindo sem som.");
    wavSilencioso(mixed, tl.duracaoTotal);
    return tl;
  }
  const narr = path.join(audioDir, "narr.wav");
  const args = ["--music", path.join(audioDir, "music_raw.wav"), "--sfx", path.join(audioDir, "sfx.wav"), "--out", mixed, "--dur", String(tl.duracaoTotal)];
  const conteudo = lerJson(path.join(dir, "conteudo.json"));
  if (conteudo.narracao?.ativa && fs.existsSync(narr)) args.push("--narr", narr, "--vo", String(tl.vo));
  if (conteudo.musica?.ativa === false) args.push("--sem-musica");
  if (!python("mix.py", args, quieto)) {
    aviso("Falha na mixagem (FFmpeg instalado?). Seguindo sem som.");
    wavSilencioso(mixed, tl.duracaoTotal);
    return tl;
  }
  if (!silencioso) ok(`trilha e efeitos sonoros gerados (${tl.duracaoTotal}s)`);
  return tl;
}

export function argsEntrada(dir) {
  return [path.relative(RAIZ, path.join(dir, "src", "index.ts")), `--public-dir=${path.relative(RAIZ, path.join(dir, "public"))}`];
}
