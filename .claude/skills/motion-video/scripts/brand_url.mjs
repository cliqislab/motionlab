#!/usr/bin/env node
// brand_url.mjs - análise de marca a partir de uma URL (Instagram ou website) para o /motion.
//
// uso:  node brand_url.mjs <url> [--out DIR] [--site URL] [--refresh] [--no-capture] [--pages N]
//   <url>         https://www.instagram.com/<perfil>/  ou qualquer website (sem https:// também vale)
//   --out DIR     pasta do briefing (padrão: <raiz do projeto>/marcas/<slug>) - reutilizável entre produções
//   --site URL    site oficial achado por outra fonte (ex.: busca na web quando o Instagram bloqueia); é VERIFICADO
//   --refresh     refaz a análise mesmo se já existir briefing.json
//   --no-capture  não roda o brand.mjs do Motionmaxxing (sem screenshots, fontes, board.png): só texto e links
//   --pages N     subpáginas do site a ler (produtos, serviços, sobre, contato...), padrão 5
//
// Acesso: só leitura pública, sem login, sem API privada e sem burlar bloqueio. Instagram é lido como um visitante
// deslogado (Chrome headless); se pedir login, sair do ar ou não mostrar o perfil, o status vira "bloqueado" e nada é
// inventado. API oficial (Instagram Graph API business_discovery) é usada quando a pessoa fornece
// IG_ACCESS_TOKEN + IG_USER_ID no ambiente.
// Teste do caminho bloqueado: MOTION_IG_FORCE_BLOCK=1.
//
// Escreve em DIR:
//   briefing.json   dados estruturados; todo fato tem "fonte" (URL); "lacunas" lista o que não foi acessado
//   BRIEFING.md     resumo legível + seção "Leitura estratégica" para o Claude preencher (marcando o que é inferência)
//   fontes.json     evidência bruta (textos, links, JSON-LD) por página
//   instagram/      perfil.png (screenshot), avatar.jpg, posts/NN.jpg + legenda/alt de cada post visível
//   site/           saída do brand.mjs (board.png, BRAND.md, brand.json, logo/, fonts/, screens/, media/)
// Saída: 0 ok (mesmo com Instagram bloqueado, se algo foi lido), 1 nada acessível, 2 uso errado.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..', '..'); // <raiz>/.claude/skills/motion-video/scripts
const MM = path.join(ROOT, '.claude', 'skills', 'motionmaxxing', 'scripts');
const { launchChrome } = await import(path.join(MM, '_cdp.mjs'));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2), opt = { pages: 5 }, pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '-h' || a === '--help') { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(0); }
  else if (a === '--refresh' || a === '--no-capture') opt[a.slice(2)] = true;
  else if (['--out', '--site', '--pages'].includes(a)) opt[a.slice(2)] = argv[++i];
  else if (a.startsWith('--')) { console.error('opção desconhecida: ' + a); process.exit(2); }
  else pos.push(a);
}
if (!pos[0]) { console.error('uso: node brand_url.mjs <url do Instagram ou site> [--out DIR] [--site URL]'); process.exit(2); }

function normUrl(u) {
  u = u.trim().replace(/^[<"']+|[>"']+$/g, '');
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return new URL(u);
}
export function classify(raw) {
  const u = normUrl(raw), host = u.hostname.replace(/^www\.|^m\./, '');
  if (host === 'instagram.com' || host === 'instagr.am') {
    const seg = u.pathname.split('/').filter(Boolean);
    if (!seg.length || ['p', 'reel', 'reels', 'stories', 'explore', 'accounts'].includes(seg[0]))
      return { tipo: 'instagram', handle: null, url: u.href, aviso: 'URL do Instagram não é de perfil (post/reel): use o link do perfil' };
    return { tipo: 'instagram', handle: seg[0].toLowerCase(), url: `https://www.instagram.com/${seg[0]}/` };
  }
  return { tipo: 'website', url: u.origin + u.pathname, host };
}
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^www\./, '').replace(/\.(com|net|org)(\.br)?$|\.br$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const alvo = classify(pos[0]);
if (alvo.aviso) { console.error(alvo.aviso); process.exit(2); }
const slug = slugify(alvo.handle || alvo.host || 'marca');
const OUT = path.resolve(opt.out || path.join(ROOT, 'marcas', slug));
if (!opt.refresh && fs.existsSync(path.join(OUT, 'briefing.json'))) {
  console.log(`reutilizando briefing existente: ${OUT}/BRIEFING.md (use --refresh para refazer)`);
  process.exit(0);
}
fs.mkdirSync(OUT, { recursive: true });
const agora = new Date().toISOString();
const B = {
  gerado_em: agora, entrada: pos[0], tipo: alvo.tipo, pasta: OUT,
  marca: { nome: null, handle: alvo.handle || null, site: null, site_verificacao: null },
  acesso: { instagram: alvo.tipo === 'instagram' ? 'pendente' : 'nao_aplicavel', site: 'pendente' },
  identidade: { cores: [], fontes: [], logo: null, tema: null, board: null, fonte: null },
  oferta: { candidatos: [] },             // linhas de produto/serviço achadas, cada uma com fonte (o Claude classifica)
  comunicacao: { bio: null, frases: [], ctas: [], destaques: [], posts: [] },
  contato: { whatsapp: [], telefones: [], emails: [], endereco: [], redes: [] },
  provas: [],                              // credenciais e números DITOS pela marca (anos, certificações), com fonte
  imagens: [],
  lacunas: [],
};
const fontes = { paginas: [] };
const uniq = (a) => [...new Set(a.filter(Boolean).map((s) => s.trim()).filter(Boolean))];
const GENERIC = /^(navega[cç][aã]o|contato|contact|menu|home|in[ií]cio|ficha t[eé]cnica|acesse nosso site.*|saiba mais|ver mais|blog|links? [uú]teis|redes sociais|institucional|outros modelos.*|equipamentos|produtos|servi[cç]os)$/i;
const addCand = (texto, fonte, origem) => { texto = texto.replace(/\s+/g, ' ').trim(); if (GENERIC.test(texto.replace(/[^\p{L}\s&]/gu, '').trim())) return; if (texto.length >= 3 && texto.length <= 140 && !B.oferta.candidatos.some((c) => c.texto === texto)) B.oferta.candidatos.push({ texto, origem, fonte }); };
const PROVA = /(\d+\s*(anos|mil|\+)|desde\s+\d{4}|credenciad|certificad|homologad|autorizad|garantia|premi|iso\s*\d)/i;
const KEYPAGE = /(produt|servi|solu|sobre|quem-somos|empresa|about|loja|shop|catalog|planos|contato|contact|assistencia|manutenc)/i;

async function download(url, file) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA } });
    if (!r.ok) return false;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    return true;
  } catch { return false; }
}

// ---------------------------------------------------------------- Instagram
async function instagramOficial(handle) {
  const { IG_ACCESS_TOKEN: tok, IG_USER_ID: uid } = process.env;
  if (!tok || !uid) return null;
  const f = `business_discovery.username(${handle}){name,username,biography,website,followers_count,media_count,profile_picture_url,media.limit(12){caption,media_type,media_url,permalink,timestamp}}`;
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${uid}?fields=${encodeURIComponent(f)}&access_token=${tok}`);
    const j = await r.json();
    return j.business_discovery ? { via: 'graph_api', ...j.business_discovery } : { erro: j.error?.message || 'sem dados' };
  } catch (e) { return { erro: e.message }; }
}

async function instagram(br, handle) {
  const dir = path.join(OUT, 'instagram');
  const oficial = await instagramOficial(handle);
  if (oficial && !oficial.erro) {
    B.acesso.instagram = 'ok_api_oficial';
    const fonte = `graph_api:business_discovery/${handle}`;
    B.marca.nome = oficial.name || B.marca.nome;
    B.comunicacao.bio = { texto: oficial.biography, fonte };
    if (oficial.website) B.marca.site = oficial.website;
    (oficial.media?.data || []).forEach((m, i) => B.comunicacao.posts.push({ legenda: m.caption || null, tipo: m.media_type, link: m.permalink, data: m.timestamp, fonte }));
    fontes.instagram = oficial;
    return;
  }
  if (oficial?.erro) B.lacunas.push(`Instagram Graph API falhou: ${oficial.erro}`);
  if (process.env.MOTION_IG_FORCE_BLOCK === '1') {
    B.acesso.instagram = 'bloqueado';
    B.lacunas.push('Instagram: leitura bloqueada (simulada por MOTION_IG_FORCE_BLOCK=1); nada do perfil foi usado');
    return;
  }
  const page = await br.newPage({ width: 1280, height: 1000 });
  const url = `https://www.instagram.com/${handle}/`;
  try { await page.goto(url, { timeout: 30000 }); } catch (e) { B.acesso.instagram = 'bloqueado'; B.lacunas.push(`Instagram: falha ao abrir (${e.message})`); return; }
  let d = null;
  for (let i = 0; i < 12; i++) {
    await sleep(1000);
    d = await page.eval(`(() => {
      const meta = (k) => document.querySelector('meta[property="'+k+'"],meta[name="'+k+'"]')?.content || null;
      const hdr = document.querySelector('header');
      const more = hdr && [...hdr.querySelectorAll('span,div,button')].find((e) => /^(mais|more)$/i.test(e.innerText?.trim()));
      if (more) more.click();
      return { url: location.href, title: document.title, desc: meta('description'), ogTitle: meta('og:title'), ogImage: meta('og:image'),
        header: hdr ? hdr.innerText : null, body: document.body.innerText.slice(0, 1500),
        links: hdr ? [...hdr.querySelectorAll('a[href]')].map((a) => ({ t: a.innerText.trim(), h: a.href })) : [],
        posts: [...document.querySelectorAll('main a[href*="/p/"], main a[href*="/reel/"]')].slice(0, 12).map((a) => {
          const img = a.querySelector('img'); return { link: a.href, img: img?.src || null, alt: img?.alt || null }; }) };
    })()`).catch(() => null);
    if (d && (d.header || /login|não está disponível|isn.t available/i.test(d.url + d.body))) { if (d.posts?.length || i > 4) break; }
  }
  const blocked = !d || /accounts\/login|challenge/.test(d.url) || /não está disponível|isn.t available|page isn.t available/i.test(d.body) || !d.header;
  if (blocked) {
    B.acesso.instagram = 'bloqueado';
    B.lacunas.push(`Instagram @${handle}: perfil não acessível sem login ou indisponível (${d ? d.title : 'sem resposta'}); nada do perfil foi usado`);
    fontes.instagram = d;
    await page.close();
    return;
  }
  B.acesso.instagram = 'ok_publico';
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'perfil.png'), await page.shot({ format: 'png' }));
  fontes.instagram = d;
  const nome = (d.ogTitle || d.title || '').replace(/\s*\(@.*$/, '').trim();
  if (nome) B.marca.nome = nome;
  // bio: o meta description traz a bio entre aspas depois de "no Instagram:"; o header traz a versão expandida
  const bioMeta = /Instagram:\s*"([\s\S]*)"?\s*$/.exec(d.desc || '')?.[1]?.replace(/"$/, '');
  const lines = (d.header || '').split('\n').map((s) => s.trim()).filter(Boolean)
    .filter((l) => !/^(seguir|enviar mensagem|follow|message|mais|more|\.\.\.)$/i.test(l) && !/seguidores|seguindo|followers|following|publica|posts$/i.test(l) && l.toLowerCase() !== handle);
  const ext = d.links.filter((l) => l.h && !/instagram\.com|facebook\.com\/(sharer|privacy)/.test(l.h));
  const bioTxt = bioMeta && bioMeta.length > 20 ? bioMeta : lines.join('\n');
  B.comunicacao.bio = { texto: bioTxt, fonte: url };
  for (const l of bioTxt.split(/\n|[|•]/)) { if (PROVA.test(l)) B.provas.push({ texto: l.trim(), fonte: url }); addCand(l.replace(/^[^\p{L}\d]+/u, ''), url, 'bio do Instagram'); }
  const m = /([\d.,]+\s*(mil|mi|k|m)?)\s*seguidores/i.exec(d.header) || /([\d.,]+[KM]?)\s*seguidores/i.exec(d.desc || '');
  if (m) B.comunicacao.seguidores = { texto: m[1], fonte: url };
  // link da bio (o Instagram embrulha em l.instagram.com/?u=)
  for (const l of ext) {
    let h = l.h;
    try { const u = new URL(h); if (u.hostname.startsWith('l.instagram.com')) h = u.searchParams.get('u') || h; } catch {}
    if (/wa\.me|whatsapp/i.test(h)) B.contato.whatsapp.push({ texto: h, fonte: url });
    else if (!B.marca.site && /^https?:/.test(h)) { B.marca.site = h; B.marca.site_verificacao = 'link_da_bio'; }
  }
  if (!B.marca.site) { const dom = /\b([a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|br)(\.br)?)\b/i.exec(lines.join(' ')); if (dom) { B.marca.site = 'https://' + dom[1]; B.marca.site_verificacao = 'texto_da_bio'; } }
  // destaques: rótulos curtos depois do link, antes dos posts
  B.comunicacao.destaques = uniq(lines.filter((l) => l.length <= 24 && !bioTxt.includes(l) && l !== nome)).slice(0, 10);
  if (d.ogImage && await download(d.ogImage, path.join(dir, 'avatar.jpg'))) B.imagens.push({ arquivo: 'instagram/avatar.jpg', origem: d.ogImage, tipo: 'foto de perfil (provável logo)', fonte: url });
  let n = 0;
  for (const p of d.posts) {
    n++;
    const f = `instagram/posts/${String(n).padStart(2, '0')}.jpg`;
    const ok = p.img && await download(p.img, path.join(OUT, f));
    B.comunicacao.posts.push({ legenda_ou_alt: p.alt, link: p.link, imagem: ok ? f : null, fonte: p.link });
    if (ok) B.imagens.push({ arquivo: f, origem: p.link, tipo: 'post do Instagram', fonte: p.link });
  }
  if (!d.posts.length) B.lacunas.push('Instagram: grade de posts não carregou sem login (só bio, link e destaques foram lidos)');
  await page.close();
}

// ---------------------------------------------------------------- website
const PAGE_JS = `(() => {
  const txt = (e) => (e?.innerText || '').replace(/\\s+/g, ' ').trim();
  const meta = (k) => document.querySelector('meta[property="'+k+'"],meta[name="'+k+'"]')?.content || null;
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent); } catch { return null; } }).filter(Boolean);
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  return {
    url: location.href, title: document.title, desc: meta('description') || meta('og:description'), siteName: meta('og:site_name'), ogImage: meta('og:image'),
    h: [...document.querySelectorAll('h1,h2,h3')].filter(vis).map((e) => ({ tag: e.tagName, t: txt(e) })).filter((x) => x.t).slice(0, 60),
    nav: [...document.querySelectorAll('nav a, header a')].filter(vis).map((a) => ({ t: txt(a), h: a.href })).filter((x) => x.t && x.t.length < 40).slice(0, 40),
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ t: txt(a).slice(0, 60), h: a.href })).slice(0, 400),
    ctas: [...document.querySelectorAll('a,button')].filter(vis).map(txt).filter((t) => t && t.length < 32 && /(compr|or[cç]amento|fale|contato|whats|agend|saiba|conhe|solicit|assin|peça|pedir|ligue|cotação)/i.test(t)).slice(0, 15),
    cards: [...document.querySelectorAll('li h3, li h4, article h3, article h4, [class*=card] h3, [class*=card] h4, [class*=produto] h3, [class*=service] h3, [class*=servico] h3')].map(txt).filter(Boolean).slice(0, 40),
    paras: [...document.querySelectorAll('p')].filter(vis).map(txt).filter((t) => t.length > 40 && t.length < 400).slice(0, 25),
    ld,
  };
})()`;

async function website(br, siteUrl) {
  const page = await br.newPage({ width: 1440, height: 1000 });
  const lerPagina = async (u) => {
    try { await page.goto(u, { timeout: 30000 }); } catch (e) { return { erro: e.message, url: u }; }
    await sleep(2500);
    await page.eval('window.scrollTo(0, document.body.scrollHeight / 2)').catch(() => {});
    await sleep(800);
    return page.eval(PAGE_JS).catch((e) => ({ erro: e.message, url: u }));
  };
  const home = await lerPagina(siteUrl);
  if (home.erro || (!home.h?.length && !home.paras?.length && !home.title)) {
    B.acesso.site = 'falhou'; B.lacunas.push(`Site ${siteUrl}: não carregou (${home.erro || 'página vazia'})`); await page.close(); return false;
  }
  B.acesso.site = 'ok'; fontes.paginas.push(home);
  const origin = new URL(home.url).origin;
  const sub = uniq(home.links.filter((l) => { try { const u = new URL(l.h); return u.origin === origin && KEYPAGE.test(u.pathname + ' ' + l.t) && u.pathname.length > 1; } catch { return false; } })
    .map((l) => l.h.split('#')[0])).slice(0, +opt.pages);
  for (const u of sub) { const p = await lerPagina(u); if (!p.erro) fontes.paginas.push(p); }
  await page.close();
  for (const p of fontes.paginas) {
    const f = p.url;
    if (!B.marca.nome && (p.siteName || p.title)) B.marca.nome = (p.siteName || p.title.split(/[|\-–—]/)[0]).trim();
    if (p.desc) B.comunicacao.frases.push({ texto: p.desc, origem: 'meta description', fonte: f });
    for (const h of p.h) { if (h.tag !== 'H3') B.comunicacao.frases.push({ texto: h.t, origem: h.tag, fonte: f }); else addCand(h.t, f, 'subtítulo H3'); }
    for (const c of p.cards) addCand(c, f, 'card/lista');
    if (/produt|servi|solu|loja|shop|catalog|planos/i.test(new URL(f).pathname)) for (const h of p.h) addCand(h.t, f, `página ${new URL(f).pathname}`);
    for (const t of [...p.paras, ...p.h.map((h) => h.t)]) if (PROVA.test(t) && t.length < 200) B.provas.push({ texto: t, fonte: f });
    B.comunicacao.ctas.push(...p.ctas.map((t) => ({ texto: t, fonte: f })));
    for (const l of p.links) {
      if (/wa\.me|api\.whatsapp/i.test(l.h)) B.contato.whatsapp.push({ texto: l.h.split('?')[0], fonte: f });
      else if (/^tel:/i.test(l.h)) B.contato.telefones.push({ texto: l.h.slice(4), fonte: f });
      else if (/^mailto:/i.test(l.h)) B.contato.emails.push({ texto: l.h.slice(7).split('?')[0], fonte: f });
      else if (/(instagram|facebook|linkedin|youtube|tiktok)\.com\/[^/?#]+/i.test(l.h)) B.contato.redes.push({ texto: l.h, fonte: f });
    }
    for (const j of p.ld.flatMap((x) => (Array.isArray(x) ? x : x['@graph'] || [x]))) {
      const ty = [].concat(j['@type'] || []).join(',');
      if (/Product|Service|Offer/i.test(ty) && j.name) addCand(j.name, f, `JSON-LD ${ty}`);
      if (/Organization|LocalBusiness|Store/i.test(ty)) {
        if (j.name && !B.marca.nome) B.marca.nome = j.name;
        if (j.telephone) B.contato.telefones.push({ texto: j.telephone, fonte: f });
        if (j.address) B.contato.endereco.push({ texto: typeof j.address === 'string' ? j.address : [j.address.streetAddress, j.address.addressLocality, j.address.addressRegion].filter(Boolean).join(', '), fonte: f });
        for (const s of [].concat(j.sameAs || [])) B.contato.redes.push({ texto: s, fonte: f });
      }
    }
  }
  return true;
}

// confere se um site candidato é mesmo da marca do Instagram (link recíproco ou nome/handle no site)
async function verificarSite(siteUrl, handle) {
  try {
    const r = await fetch(siteUrl, { headers: { 'user-agent': UA }, redirect: 'follow' });
    const h = (await r.text()).toLowerCase();
    if (handle && h.includes(`instagram.com/${handle}`)) return 'link_reciproco';
    if (handle && h.includes(handle.replace(/[_.]/g, ''))) return 'nome_no_site';
    if (B.marca.nome && h.includes(B.marca.nome.toLowerCase().split(' ')[0])) return 'nome_no_site';
    return 'nao_verificado';
  } catch (e) { return 'inacessivel'; }
}

function capturaVisual(siteUrl) {
  if (opt['no-capture']) { B.lacunas.push('Identidade visual do site não capturada (--no-capture)'); return; }
  const dir = path.join(OUT, 'site');
  const r = spawnSync('node', [path.join(MM, 'brand.mjs'), siteUrl, dir], { encoding: 'utf8', timeout: 240000 });
  const bj = path.join(dir, 'brand.json');
  if (r.status !== 0 || !fs.existsSync(bj)) { B.lacunas.push(`brand.mjs falhou no site: ${(r.stderr || '').trim().split('\n').pop()}`); return; }
  const b = JSON.parse(fs.readFileSync(bj, 'utf8'));
  const c = b.colors || {};
  const cor = (role, x) => (x ? [].concat(x).map((v) => ({ papel: v?.role ? `${role}: ${v.role}` : role, hex: v?.hex || v })).filter((v) => typeof v.hex === 'string') : []);
  B.identidade.cores = [...cor('fundo', c.ground), ...cor('tinta', c.ink), ...cor('tinta-suave', c.inkSoft), ...cor('destaque', c.accents),
    ...(c.accents?.length ? [] : cor('destaque (imagem)', c.accentCandidates?.items))].slice(0, 12);
  const roles = b.fonts?.roles || {};
  B.identidade.fontes = uniq(Object.entries(roles).map(([k, f]) => (f?.primaryFamily ? `${f.primaryFamily} ${f.weight || ''} (${k})`.replace(/\s+/g, ' ') : null)));
  B.identidade.tema = c.theme || null;
  for (const ct of b.copy?.ctas || []) if (ct.text) B.comunicacao.ctas.push({ texto: ct.text, fonte: siteUrl });
  if (b.copy?.heroLine) B.comunicacao.frases.unshift({ texto: b.copy.heroLine, origem: 'linha principal do site', fonte: siteUrl });
  const logo = ['logo.svg', 'logo.png'].map((f) => path.join(dir, 'logo', f)).find(fs.existsSync);
  if (logo) B.identidade.logo = path.relative(OUT, logo);
  if (fs.existsSync(path.join(dir, 'board.png'))) B.identidade.board = 'site/board.png';
  B.identidade.fonte = siteUrl;
  for (const f of fs.existsSync(path.join(dir, 'media')) ? fs.readdirSync(path.join(dir, 'media')) : [])
    B.imagens.push({ arquivo: `site/media/${f}`, origem: siteUrl, tipo: 'imagem do site', fonte: siteUrl });
}

// ---------------------------------------------------------------- main
const br = await launchChrome({ width: 1440, height: 1000 });
try {
  if (alvo.tipo === 'instagram') await instagram(br, alvo.handle);
  else { B.marca.site = alvo.url; B.marca.site_verificacao = 'url_fornecida'; }
  if (opt.site) { B.marca.site = normUrl(opt.site).href; B.marca.site_verificacao = alvo.tipo === 'instagram' ? await verificarSite(B.marca.site, alvo.handle) : 'url_fornecida'; }
  else if (alvo.tipo === 'instagram' && B.marca.site) {
    const v = await verificarSite(B.marca.site, alvo.handle);
    if (v === 'link_reciproco') B.marca.site_verificacao = 'link_da_bio+link_reciproco';
  }
  if (B.marca.site) {
    const ok = await website(br, B.marca.site);
    if (ok) capturaVisual(B.marca.site);
  } else {
    B.acesso.site = 'nao_encontrado';
    B.lacunas.push('Site oficial não encontrado no perfil. Procure por busca na web (nome + cidade + "site oficial"), confirme e rode de novo com --site URL');
  }
} finally { await br.close(); }

if (B.marca.site_verificacao && /nao_verificado|inacessivel/.test(B.marca.site_verificacao))
  B.lacunas.push(`Site ${B.marca.site} NÃO foi confirmado como da marca (${B.marca.site_verificacao}): só use o que for confirmado por outra fonte`);
if (!B.identidade.cores.length) B.lacunas.push('Cores da marca não extraídas automaticamente: amostre do logo/avatar/posts e diga que foi amostrado');
if (!B.oferta.candidatos.length) B.lacunas.push('Produtos/serviços não identificados nas fontes acessadas');
B.comunicacao.frases = B.comunicacao.frases.filter((f, i, a) => a.findIndex((x) => x.texto === f.texto) === i).slice(0, 40);
B.comunicacao.ctas = B.comunicacao.ctas.filter((f, i, a) => a.findIndex((x) => x.texto === f.texto) === i);
for (const k of Object.keys(B.contato)) B.contato[k] = B.contato[k].filter((f, i, a) => a.findIndex((x) => x.texto === f.texto) === i);
B.provas = B.provas.filter((f, i, a) => a.findIndex((x) => x.texto === f.texto) === i).slice(0, 15);
const anos = uniq(B.provas.map((p) => /(\d+)\s*anos/i.exec(p.texto)?.[1]));
if (anos.length > 1) B.lacunas.push(`CONFLITO nas fontes: tempo de mercado aparece como ${anos.map((a) => a + ' anos').join(' e ')}; não use no roteiro sem confirmar com a pessoa`);
B.leitura_estrategica = { _instrucao: 'Preencha a partir dos fatos acima; marque cada item como FATO (com fonte) ou INFERÊNCIA', diferenciais: null, publico_alvo: null, tom_de_voz: null, oferta_principal: null, promessa: null, nao_fazer: null };
fs.writeFileSync(path.join(OUT, 'briefing.json'), JSON.stringify(B, null, 2));
fs.writeFileSync(path.join(OUT, 'fontes.json'), JSON.stringify(fontes, null, 2));

// ---------------------------------------------------------------- BRIEFING.md
const L = [], li = (x) => `- ${x.texto}${x.origem ? ` _(${x.origem})_` : ''} — ${x.fonte}`;
L.push(`# Briefing de marca: ${B.marca.nome || slug}`, '', `Gerado em ${agora} a partir de \`${pos[0]}\` pelo \`brand_url.mjs\`. Reutilizável: produções futuras leem este arquivo e \`briefing.json\`.`, '');
L.push('## Fontes e acesso', `- Instagram: **${B.acesso.instagram}**${alvo.handle ? ` (@${alvo.handle})` : ''}`, `- Site: **${B.acesso.site}** ${B.marca.site || ''} ${B.marca.site_verificacao ? `(verificação: ${B.marca.site_verificacao})` : ''}`, '');
if (B.comunicacao.bio) L.push('## Bio do Instagram', '```', B.comunicacao.bio.texto, '```', `Fonte: ${B.comunicacao.bio.fonte}${B.comunicacao.seguidores ? ` · ${B.comunicacao.seguidores.texto} seguidores` : ''}`, '');
if (B.comunicacao.destaques.length) L.push(`Destaques: ${B.comunicacao.destaques.join(' · ')}`, '');
L.push('## Identidade visual');
L.push(B.identidade.cores.length ? B.identidade.cores.map((c) => `- ${c.papel}: \`${c.hex}\``).join('\n') : '- cores: não extraídas');
L.push(`- fontes: ${B.identidade.fontes.join(', ') || 'não identificadas'}`, `- logo: ${B.identidade.logo || (fs.existsSync(path.join(OUT, 'instagram', 'avatar.jpg')) ? 'não capturado do site; ver instagram/avatar.jpg ou rodar fetch_logo.mjs' : 'não capturado; rodar MM/scripts/fetch_logo.mjs ou pedir o arquivo')}`, `- tema: ${B.identidade.tema || '-'}`, `- board: ${B.identidade.board || '-'} (OLHE antes de decidir paleta)`, '');
L.push('## Produtos e serviços (candidatos, com fonte)', B.oferta.candidatos.slice(0, 30).map(li).join('\n') || '- nenhum', '');
L.push('## Comunicação (frases reais)', B.comunicacao.frases.slice(0, 20).map(li).join('\n') || '- nenhuma', '');
if (B.comunicacao.ctas.length) L.push('CTAs usados: ' + uniq(B.comunicacao.ctas.map((c) => c.texto)).join(' · '), '');
if (B.comunicacao.posts.length) L.push('## Posts visíveis', B.comunicacao.posts.map((p) => `- ${p.imagem || '(sem imagem)'}: ${(p.legenda_ou_alt || p.legenda || '').slice(0, 160)} — ${p.link}`).join('\n'), '');
L.push('## Provas que a marca afirma (não inventar outras)', B.provas.map(li).join('\n') || '- nenhuma', '');
L.push('## Contato', ...Object.entries(B.contato).filter(([, v]) => v.length).map(([k, v]) => `- ${k}: ${uniq(v.map((x) => x.texto)).slice(0, 5).join(', ')}`), '');
L.push('## Imagens disponíveis', B.imagens.length ? B.imagens.map((i) => `- \`${i.arquivo}\` (${i.tipo}) — ${i.fonte}`).join('\n') : '- nenhuma', '',
  '> Uso: material público da PRÓPRIA marca, só para peça dessa marca com autorização do cliente. Não use foto com pessoas identificáveis, logos de terceiros ou imagem de banco/terceiros sem confirmação. Nada gerado por IA é mostrado como produto real.', '');
L.push('## Lacunas (não acessado / não confirmado — NÃO inventar)', B.lacunas.map((x) => `- ${x}`).join('\n') || '- nenhuma', '');
L.push('## Leitura estratégica (preenchida pelo Claude; marque FATO + fonte ou INFERÊNCIA)', '- Oferta principal:', '- Diferenciais:', '- Público-alvo:', '- Tom de voz:', '- Promessa do comercial:', '- O que a marca nunca faria:', '');
fs.writeFileSync(path.join(OUT, 'BRIEFING.md'), L.join('\n'));

const algo = B.acesso.instagram.startsWith('ok') || B.acesso.site === 'ok';
console.log(`instagram: ${B.acesso.instagram} | site: ${B.acesso.site} ${B.marca.site || ''} (${B.marca.site_verificacao || '-'})`);
console.log(`marca: ${B.marca.nome || '?'} | cores ${B.identidade.cores.length} | fontes ${B.identidade.fontes.length} | oferta ${B.oferta.candidatos.length} | provas ${B.provas.length} | imagens ${B.imagens.length} | lacunas ${B.lacunas.length}`);
for (const x of B.lacunas) console.log('  lacuna: ' + x);
console.log(`briefing: ${path.join(OUT, 'BRIEFING.md')}`);
process.exit(algo ? 0 : 1);
