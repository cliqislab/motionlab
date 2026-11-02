// npm run render -- <video> [--qualidade alta|normal|leve] — exporta o MP4 final em saida/<video>.mp4
import fs from "node:fs";
import path from "node:path";
import { RAIZ, aviso, capturar, negrito, ok, opcao, remotion, resolverVideo, sair } from "./lib.mjs";
import { DICA_RENDER, argsEntrada, prepararVideo } from "./video.mjs";

const CRF = { alta: 16, normal: 18, leve: 23 };
const { nome, dir } = resolverVideo();
const q = opcao("qualidade", "normal");
if (!CRF[q]) sair("--qualidade deve ser alta, normal ou leve");
const tl = await prepararVideo(dir);
try {
  const st = fs.statfsSync(dir);
  const gb = (st.bavail * st.bsize) / 1e9;
  if (gb < 1) aviso(`Pouco espaço em disco (${gb.toFixed(1)} GB livres). O render pode falhar no meio: libere espaço antes.`);
} catch {
  /* statfs indisponível */
}
const out = path.join(dir, "saida", `${nome}.mp4`);
console.log(negrito(`\nRenderizando ${tl.width}x${tl.height}, ${tl.duracaoTotal}s. Isso leva alguns minutos...\n`));
const inicio = Date.now();
const okRender = remotion([
  "render",
  ...argsEntrada(dir),
  "MotionVideo",
  path.relative(RAIZ, out),
  "--codec=h264",
  `--crf=${CRF[q]}`,
  "--color-space=bt709",
  "--audio-codec=aac",
]);
if (!okRender) sair(`O render falhou.\n${DICA_RENDER}`);
const min = ((Date.now() - inicio) / 60000).toFixed(1);
const probe = capturar("ffprobe", ["-v", "error", "-show_entries", "format=duration,size", "-of", "default=nw=1", out]);
ok(`MP4 pronto em ${min} min: ${path.relative(RAIZ, out)}`);
if (probe.ok) console.log(`   ${probe.out.replace(/\n/g, " | ")}`);
console.log("\nPronto para postar. Dicas de exportação para cada rede: EXPORTACAO.md\n");
