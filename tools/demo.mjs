// npm run demo [-- --previa] — cria o vídeo de demonstração "Nexa App" (aplicativo fictício) e exporta o MP4
import path from "node:path";
import { RAIZ, VIDEOS, negrito, ok, opcao, rodar } from "./lib.mjs";
import { criarVideo } from "./novo.mjs";

const nome = "nexa-app-demo";
console.log(negrito("\nMotionLab Kit — vídeo de demonstração (Nexa App, aplicativo fictício)\n"));
criarVideo(nome, { template: "neon", de: "exemplos/nexa-app", forcar: true });
ok(`projeto criado em ${path.relative(RAIZ, path.join(VIDEOS, nome))}`);
const script = opcao("previa") ? "previa.mjs" : "render.mjs";
const passou = rodar(process.execPath, [path.join(RAIZ, "tools", script), nome]);
process.exit(passou ? 0 : 1);
