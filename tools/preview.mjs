// npm run preview -- <video> — abre o Remotion Studio no navegador (prévia ao vivo, atualiza quando você salva)
import { negrito, remotion, resolverVideo } from "./lib.mjs";
import { argsEntrada, prepararVideo } from "./video.mjs";

const { dir } = resolverVideo();
await prepararVideo(dir);
console.log(negrito("\nAbrindo a prévia no navegador (Remotion Studio)."));
console.log("Aperte espaço para tocar. Para fechar, volte aqui e aperte Ctrl+C.\n");
remotion(["studio", ...argsEntrada(dir)]);
