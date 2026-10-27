// Dopo la build: crea una pagina HTML per ogni percorso con titolo, descrizione, Open Graph
// e dati strutturati già nel codice (per motori di ricerca e anteprime social), più sitemap, robots e 404.
import fs from 'node:fs';
import path from 'node:path';
import { percorsiProdotti, percorsiStatici, seoPer, SITO, urlAssoluto } from '../src/lib/seo.js';

const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../dist');
const base = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function testa(percorso) {
  const s = seoPer(percorso);
  const righe = [
    `<title>${esc(s.titolo)}</title>`,
    `<meta name="description" content="${esc(s.descrizione)}" />`,
    `<meta name="keywords" content="${esc(s.parole || '')}" />`,
    `<meta name="robots" content="${s.noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${s.url}" />`,
    `<meta property="og:type" content="${s.tipo || 'website'}" />`,
    `<meta property="og:site_name" content="Riale" />`,
    `<meta property="og:locale" content="it_IT" />`,
    `<meta property="og:title" content="${esc(s.titolo)}" />`,
    `<meta property="og:description" content="${esc(s.descrizione)}" />`,
    `<meta property="og:url" content="${s.url}" />`,
    `<meta property="og:image" content="${s.immagine}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (s.jsonld) righe.push(`<script type="application/ld+json" data-seo="1">${JSON.stringify(s.jsonld).replace(/</g, '\\u003c')}</script>`);
  return righe.join('\n    ');
}

// Sulla home: precarica il poster (immagine LCP) nella misura giusta
const POSTER = ['480', '960', '1600'].map((w) => `/mosche-da-pesca/img/render/poster-alba-${w}.avif ${w}w`).join(', ');
const precarica = `<link rel="preload" as="image" type="image/avif" imagesrcset="${POSTER}" imagesizes="100vw" fetchpriority="high" />`;

const sostituisci = (html, percorso) =>
  html.replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, `<!--SEO-->\n    ${testa(percorso)}${percorso === '/' ? `\n    ${precarica}` : ''}\n    <!--/SEO-->`);

const tutti = [...percorsiStatici, ...percorsiProdotti];
for (const p of tutti) {
  const html = sostituisci(base, p);
  const dir = p === '/' ? DIST : path.join(DIST, p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// 404: GitHub Pages lo serve per i percorsi sconosciuti; l'app mostra la pagina "non trovata".
const p404 = base
  .replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, '<title>Pagina non trovata · Riale</title><meta name="robots" content="noindex" />');
fs.writeFileSync(path.join(DIST, '404.html'), p404);

const oggi = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tutti
  .filter((p) => !seoPer(p).noindex)
  .map((p) => `  <url><loc>${urlAssoluto(p)}</loc><lastmod>${oggi}</lastmod><priority>${p === '/' ? '1.0' : p.startsWith('/prodotto') ? '0.7' : '0.8'}</priority></url>`)
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITO}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log(`prerender: ${tutti.length} pagine, sitemap e 404 pronti`);
