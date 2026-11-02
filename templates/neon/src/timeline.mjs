// Linha do tempo do template Neon.
// Lê o conteudo.json e calcula, em SEGUNDOS, quando cada cena e cada elemento entra.
// É usada pelo vídeo (React/Remotion) e pelo gerador de áudio (tools/audio.mjs),
// então imagem e som sempre ficam sincronizados.

export const FPS = 30;

export const FORMATOS = {
  "16:9": [1920, 1080],
  "9:16": [1080, 1920],
  "1:1": [1080, 1080],
  "4:5": [1080, 1350],
};

export const TIPOS = ["titulo", "chips", "app", "grafico", "numero", "codigo", "comparacao", "imagem", "cta", "custom"];

const DURACAO_PADRAO = {
  titulo: 3,
  chips: 3.6,
  app: 5.5,
  grafico: 4.5,
  numero: 3.4,
  codigo: 4.5,
  comparacao: 5.5,
  imagem: 3.5,
  cta: 4,
  custom: 4,
};

// intervalo entre elementos que entram em sequência dentro da cena
const INTERVALO = {
  titulo: 0.55,
  chips: 0.32,
  app: 0.45,
  grafico: 0.22,
  numero: 0,
  codigo: 0.8,
  comparacao: 0.4,
  imagem: 0,
  cta: 0.6,
  custom: 0.4,
};

const lista = (x) => (Array.isArray(x) ? x : []);

// quantos elementos animados cada tipo de cena tem (cada um ganha um "beat")
export function quantosElementos(c) {
  switch (c.tipo) {
    case "titulo":
      return Math.max(1, lista(c.linhas).length);
    case "chips":
      return lista(c.itens).length;
    case "app":
      return 1 + lista(c.itens).length;
    case "grafico":
      return lista(c.barras).length;
    case "codigo":
      return lista(c.linhas).length;
    case "comparacao":
      return lista(c.antes).length + lista(c.depois).length;
    case "cta":
      return 3;
    default:
      return 1;
  }
}

/**
 * @param {any} conteudo  objeto lido do conteudo.json
 */
export function montarLinhaDoTempo(conteudo) {
  const formato = FORMATOS[conteudo.formato] ? conteudo.formato : "16:9";
  const [width, height] = FORMATOS[formato];
  const narracao = conteudo.narracao || {};
  const temNarracao = Boolean(narracao.ativa);
  const vo = typeof narracao.atraso === "number" ? narracao.atraso : temNarracao ? 0.4 : 0;
  const cenasIn = lista(conteudo.cenas);

  let t = 0;
  const cenas = cenasIn.map((c, i) => {
    const inicio = typeof c.inicio === "number" ? c.inicio : t;
    const dur = typeof c.duracao === "number" ? c.duracao : DURACAO_PADRAO[c.tipo] ?? 3.5;
    const prox = cenasIn[i + 1];
    const fim = prox && typeof prox.inicio === "number" ? prox.inicio : inicio + dur;
    t = fim;
    const n = quantosElementos(c);
    const passo = typeof c.intervalo === "number" ? c.intervalo : INTERVALO[c.tipo] ?? 0.4;
    // "tempos": lista opcional com o segundo exato de cada elemento (usado com narração)
    const beats = Array.isArray(c.tempos) && c.tempos.length
      ? c.tempos.slice(0, Math.max(n, c.tempos.length))
      : Array.from({ length: n }, (_, k) => inicio + 0.25 + k * passo);
    while (beats.length < n) beats.push(beats[beats.length - 1] + passo);
    // código: cada linha começa quando a anterior termina de ser digitada (70 caracteres/s, igual ao CodeBlock)
    if (c.tipo === "codigo" && !(Array.isArray(c.tempos) && c.tempos.length)) {
      let s = inicio + 0.25;
      lista(c.linhas).forEach((l, k) => {
        beats[k] = s;
        s += (Array.isArray(l) ? l.join("") : String(l)).length / 70 + 0.05;
      });
    }
    return { i, tipo: c.tipo, inicio, fim, beats, dados: c, impacto: Boolean(c.impacto) };
  });

  const ultimoFim = cenas.length ? cenas[cenas.length - 1].fim : 3;
  const cauda = typeof conteudo.cauda === "number" ? conteudo.cauda : 1.0;
  const duracaoTotal = Math.round((vo + ultimoFim + cauda) * 100) / 100;

  const eventos = gerarEventos(conteudo, cenas, { vo, duracaoTotal });
  // a última cena fica na tela até o fim do vídeo (sem a saída com desfoque)
  if (cenas.length) cenas[cenas.length - 1].fim = ultimoFim + cauda + 1;

  return {
    formato,
    width,
    height,
    fps: FPS,
    vo,
    duracaoTotal,
    cenas,
    eventos,
    cores: {
      destaque: conteudo.cores?.destaque || "#FF5A1F",
      fundo: conteudo.cores?.fundo || "#09090A",
      texto: conteudo.cores?.texto || "#F4F4F1",
    },
    efeitos: {
      hud: Boolean(conteudo.efeitos?.hud),
      grao: conteudo.efeitos?.grao !== false,
      grade: conteudo.efeitos?.grade !== false,
    },
    audio: conteudo.audio !== false,
  };
}

// Eventos de efeito (tremida, glitch, flash) e de som (trilha + SFX). Formato lido pelo scripts/score.py.
function gerarEventos(conteudo, cenas, { vo, duracaoTotal }) {
  const extra = conteudo.eventos || {};
  const cuts = cenas.slice(1).map((c) => c.inicio);
  const shake = [];
  const glitch = [];
  const flash = [];
  const sfx = [];
  const impactos = [];

  for (const c of cenas) {
    const d = c.dados;
    const b0 = c.beats[0] ?? c.inicio;
    if (c.impacto) {
      shake.push([b0, 0.8]);
      glitch.push([b0, 0.25]);
      flash.push([b0, 0.5]);
      impactos.push(b0);
    }
    switch (c.tipo) {
      case "titulo":
        lista(d.linhas).forEach((l, k) => {
          const modo = l.modo || "up";
          if (modo === "type") sfx.push({ t: c.beats[k], type: "type", dur: Math.min(1.2, String(l.texto || "").length * 0.022) });
          else if (!(c.impacto && k === 0)) sfx.push({ t: c.beats[k], type: "blip", f: 900 + k * 180 });
        });
        break;
      case "chips": {
        c.beats.forEach((bt, k) => sfx.push({ t: bt, type: "blip", f: 900 + k * 120 }));
        riscos(c).forEach((rt) => sfx.push({ t: rt, type: "zip" }));
        break;
      }
      case "app":
      case "grafico":
      case "comparacao":
        c.beats.forEach((bt, k) => sfx.push({ t: bt, type: "blip", f: 800 + (k % 6) * 140, amp: 0.22 }));
        if (c.tipo === "comparacao") lista(d.antes).forEach((_, k) => sfx.push({ t: c.beats[k] + 0.35, type: "zip", amp: 0.22 }));
        break;
      case "numero":
        sfx.push({ t: b0, type: "whoosh", dur: 0.5 });
        sfx.push({ t: b0 + 1.2, type: "ding" });
        break;
      case "codigo":
        lista(d.linhas).forEach((l, k) => {
          const txt = Array.isArray(l) ? l.join("") : String(l);
          sfx.push({ t: c.beats[k], type: "type", dur: Math.min(1.4, txt.length / 70) });
        });
        break;
      case "imagem":
        sfx.push({ t: b0, type: "whoosh", dur: 0.5 });
        break;
      case "cta":
        if (!c.impacto) sfx.push({ t: b0, type: "impact", amp: 0.6 });
        sfx.push({ t: c.beats[2] ?? b0 + 1, type: "ding" });
        break;
      default:
        break;
    }
  }

  const ultima = cenas[cenas.length - 1];
  const musica = conteudo.musica || {};
  const drop = typeof musica.drop === "number" ? musica.drop : impactos[0] ?? (cenas[1]?.inicio ?? 0);
  const final = ultima && ultima.tipo === "cta" ? ultima.beats[0] : null;
  const braams = impactos.filter((x) => x !== drop && x !== final);

  return {
    _doc: "Gerado automaticamente a partir do conteudo.json (tools/audio.mjs). Não edite: mude o conteudo.json.",
    vo,
    duration: duracaoTotal,
    cuts: [...cuts, ...lista(extra.cuts)],
    shake: [...shake, ...lista(extra.shake)],
    glitch: [...glitch, ...lista(extra.glitch)],
    flash: [...flash, ...lista(extra.flash)],
    k: extra.k || {},
    music: {
      ativa: musica.ativa !== false,
      bpm: musica.bpm || 124,
      drop,
      lift: typeof musica.lift === "number" ? musica.lift : null,
      silences: lista(musica.silencios),
      braams,
      final,
    },
    sfx: conteudo.efeitosSonoros === false ? [] : [...sfx, ...lista(extra.sfx)].sort((a, b) => a.t - b.t),
  };
}

// segundo em que cada chip marcado em "riscar" é riscado
export function riscos(c) {
  const idx = lista(c.dados.riscar);
  const ultimo = c.beats[c.beats.length - 1] ?? c.inicio;
  return idx.map((_, j) => ultimo + 0.5 + j * 0.25);
}
