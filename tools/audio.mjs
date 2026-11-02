// npm run audio -- <video> — gera trilha + efeitos sonoros (e mixa a narração, se houver)
import { resolverVideo } from "./lib.mjs";
import { prepararVideo } from "./video.mjs";

const { dir } = resolverVideo();
await prepararVideo(dir);
