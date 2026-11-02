// npm run chave            — informa/troca a chave Gemini (digitação oculta) e testa
// npm run chave -- --testar  — só testa a chave atual
// npm run chave -- --remover — apaga a chave do .env local
import fs from "node:fs";
import { ENV, RAIZ, WIN, aviso, chaveGemini, falha, gravarEnv, negrito, ok, opcao, perguntarOculto, testarChave } from "./lib.mjs";

export async function configurarChave({ perguntarSeJaTem = true } = {}) {
  const atual = chaveGemini();
  if (atual && !perguntarSeJaTem) return true;
  if (!process.stdin.isTTY) {
    aviso("Terminal não interativo: não dá para pedir a chave agora. Rode depois: npm run chave");
    return false;
  }
  console.log("\nCole a chave Gemini e aperte Enter. Por segurança, nada vai aparecer na tela enquanto você cola.");
  console.log("Para pular, só aperte Enter. Como conseguir a chave: CONFIGURAR-GEMINI.md\n");
  const k = await perguntarOculto("Chave Gemini: ");
  if (!k) {
    aviso("Nenhuma chave informada. Tudo funciona, só a narração Gemini fica desligada.");
    return false;
  }
  if (/\s/.test(k) || k.length < 20) {
    falha("Isso não parece uma chave válida (curta ou com espaços). Nada foi salvo.");
    return false;
  }
  if (!fs.existsSync(ENV) && fs.existsSync(`${RAIZ}/.env.example`)) fs.copyFileSync(`${RAIZ}/.env.example`, ENV);
  gravarEnv("GEMINI_API_KEY", k);
  ok(`chave salva no arquivo .env deste kit${WIN ? "" : " (permissão restrita: só o seu usuário lê)"}`);
  const t = await testarChave(k);
  (t.ok ? ok : falha)(t.msg);
  return t.ok;
}

if (process.argv[1]?.endsWith("chave.mjs")) {
  if (opcao("remover")) {
    if (fs.existsSync(ENV)) gravarEnv("GEMINI_API_KEY", "");
    ok("chave removida do .env. Lembre de revogar a chave no Google AI Studio se ela vazou (CONFIGURAR-GEMINI.md).");
  } else if (opcao("testar")) {
    const k = chaveGemini();
    if (!k) {
      aviso("Nenhuma chave configurada. Rode: npm run chave");
      process.exit(1);
    }
    console.log(negrito("\nTestando a chave Gemini (sem custo)..."));
    const t = await testarChave(k);
    (t.ok ? ok : falha)(t.msg);
    process.exit(t.ok ? 0 : 1);
  } else {
    await configurarChave();
  }
}
