import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { arquivosDoPacote } from '../tools/arquivos.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const stage = path.join(here, 'stage', 'kit');
fs.rmSync(stage, { recursive: true, force: true });
for (const rel of arquivosDoPacote()) {
  if (rel.startsWith('installer/') || rel.startsWith('.github/')) continue;
  const dest = path.join(stage, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, rel), dest);
}
console.log(`Kit preparado: ${stage}`);
