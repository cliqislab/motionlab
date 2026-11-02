// npm run previa -- <video> [--segundo 5] — prévia rápida SEM abrir navegador:
//   sem --segundo: rascunho em baixa resolução (saida/previa.mp4) + folha de imagens (saida/previa.jpg)
//   com --segundo N: só uma imagem daquele instante (saida/quadro_N.jpg)
import fs from "node:fs";
import path from "node:path";
import { RAIZ, aviso, ok, opcao, python, pythonTemModulo, remotion, resolverVideo, sair } from "./lib.mjs";
import { DICA_RENDER, argsEntrada, prepararVideo } from "./video.mjs";

const { dir } = resolverVideo();
const tl = await prepararVideo(dir);
const saida = path.join(dir, "saida");
const seg = opcao("segundo");
if (seg !== undefined) {
  const s = Number(seg);
  if (!Number.isFinite(s) || s < 0 || s > tl.duracaoTotal) sair(`--segundo deve ser um número entre 0 e ${tl.duracaoTotal}`);
  const out = path.join(saida, `quadro_${s}.jpg`);
  if (!remotion(["still", ...argsEntrada(dir), "MotionVideo", path.relative(RAIZ, out), `--frame=${Math.round(s * tl.fps)}`, "--scale=0.5"])) sair(`Falha ao gerar a imagem.\n${DICA_RENDER}`);
  ok(`imagem salva em ${path.relative(RAIZ, out)}`);
} else {
  const out = path.join(saida, "previa.mp4");
  if (!remotion(["render", ...argsEntrada(dir), "MotionVideo", path.relative(RAIZ, out), "--scale=0.5", "--crf=28", "--codec=h264"])) sair(`Falha na prévia.\n${DICA_RENDER}`);
  ok(`prévia salva em ${path.relative(RAIZ, out)}`);
  if (pythonTemModulo("PIL")) {
    const folha = path.join(saida, "previa.jpg");
    if (python("sheet.py", [out, folha, "1.5"], { stdio: "ignore" }) && fs.existsSync(folha)) ok(`folha de imagens em ${path.relative(RAIZ, folha)}`);
  } else aviso("Pillow não instalado: pulei a folha de imagens.");
}
