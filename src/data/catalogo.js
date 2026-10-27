// Catalogo demo: dati indipendenti dalla lingua. I testi sono in catalogo.it.js.
// Prezzi e prodotti sono inventati (sito dimostrativo).
import testiIt from './catalogo.it.js';

const TUTTE = ['primavera', 'estate', 'autunno', 'inverno'];

// v3d: parametri della vista 3D procedurale.
//  - secca / sommersa: varianti di colore del modello mosca-secca.glb (corpo, filo, coda, ali, hackle, hackle2, testa)
//  - ninfa / streamer: geometria procedurale (vedi src/tre/MoscaProcedurale.jsx)
const base = [
  // ——— Mosche secche ———
  { slug: 'adams-classica', cat: 'secca', foto: 'mosche/secca-adams', prezzo: 2.9, ami: [12, 14, 16, 18], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], v3d: { corpo: '#7d7a76', filo: '#c9a35a', coda: '#6b4a32', ali: '#9a9a9c', hackle: '#7a4f2c', hackle2: '#d2cec4', testa: '#1a1a1a' }, top: true },
  { slug: 'adams-wulff', cat: 'secca', foto: 'mosche/secca-adams-wulff', prezzo: 3.2, ami: [10, 12, 14], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente'], v3d: { corpo: '#8a8580', filo: '#c9a35a', coda: '#5b3d26', ali: '#e9e4da', hackle: '#6a4528', hackle2: '#cfcac0', testa: '#151515' } },
  { slug: 'elk-hair-caddis', cat: 'secca', foto: 'mosche/secca-elk-hair-caddis', prezzo: 2.8, ami: [12, 14, 16], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], v3d: { corpo: '#6b5a3c', filo: '#b8a074', coda: '#6b5a3c', ali: '#c8ad7f', hackle: '#8a5a32', hackle2: '#8a5a32', testa: '#c8ad7f' }, top: true },
  { slug: 'klinkhammer-special', cat: 'secca', foto: 'mosche/secca-klinkhammer', prezzo: 3.4, ami: [12, 14, 16, 18], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['temolo', 'trota'], acque: ['torrente'], v3d: { corpo: '#c9a86a', filo: '#7a5a34', coda: '#c9a86a', ali: '#ffffff', hackle: '#6e4a2a', hackle2: '#6e4a2a', testa: '#3a2a1a' }, top: true },
  { slug: 'royal-wulff', cat: 'secca', foto: 'mosche/secca-royal-wulff', prezzo: 3.2, ami: [10, 12, 14], stagioni: ['estate'], pesci: ['trota'], acque: ['torrente'], v3d: { corpo: '#b3202a', filo: '#2a5a32', coda: '#5b3d26', ali: '#f4f1ea', hackle: '#7a3e1e', hackle2: '#7a3e1e', testa: '#141414' } },
  { slug: 'stimulator', cat: 'secca', foto: 'mosche/secca-stimulator', prezzo: 3.6, ami: [8, 10, 12], stagioni: ['estate'], pesci: ['trota'], acque: ['torrente'], v3d: { corpo: '#c7832a', filo: '#7a5222', coda: '#b6a27c', ali: '#b6a27c', hackle: '#8a6a44', hackle2: '#d8d0bc', testa: '#d17a1e' } },
  { slug: 'sparkle-dun-olive', cat: 'secca', foto: 'mosche/secca-sparkle-dun', prezzo: 2.9, ami: [16, 18, 20], stagioni: ['primavera', 'autunno'], pesci: ['temolo', 'trota'], acque: ['torrente', 'lago'], v3d: { corpo: '#6f7448', filo: '#8c8f5a', coda: '#d9c896', ali: '#d9c896', hackle: '#cdbb8a', hackle2: '#cdbb8a', testa: '#5a5c38' } },
  { slug: 'black-wulff', cat: 'secca', foto: 'mosche/secca-black-wulff', prezzo: 3.1, ami: [10, 12, 14], stagioni: ['estate', 'autunno'], pesci: ['trota'], acque: ['torrente', 'lago'], v3d: { corpo: '#1d1d1f', filo: '#3a3a3a', coda: '#2a2622', ali: '#2c2a28', hackle: '#25211e', hackle2: '#3b3631', testa: '#111' } },

  // ——— Mosche sommerse ———
  { slug: 'royal-coachman', cat: 'sommersa', foto: 'mosche/sommersa-royal-coachman', prezzo: 3.0, ami: [10, 12, 14], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente', 'lago'], v3d: { stile: 'sommersa', corpo: '#a3141f', filo: '#1f4a1c', coda: '#c9a24a', ali: '#f7f6f2', hackle: '#6b2f17', hackle2: '#6b2f17', testa: '#0e0e0e' }, top: true },
  { slug: 'starna-e-fagiano', cat: 'sommersa', foto: 'mosche/sommersa-starna-fagiano', prezzo: 2.7, ami: [12, 14, 16], stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente'], v3d: { stile: 'sommersa', corpo: '#7a3f1f', filo: '#c9a35a', coda: '#7a3f1f', ali: '#8f8a7e', hackle: '#9a8a70', hackle2: '#5a4c3c', testa: '#1a1410' }, top: true },
  { slug: 'grizzly-king', cat: 'sommersa', foto: 'mosche/sommersa-grizzly-king', prezzo: 3.0, ami: [10, 12, 14], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['lago', 'torrente'], v3d: { stile: 'sommersa', corpo: '#1f6b3a', filo: '#d0d0d0', coda: '#d6312a', ali: '#cfc9bd', hackle: '#bdb7aa', hackle2: '#6a6a6a', testa: '#151515' } },
  { slug: 'alexandra', cat: 'sommersa', foto: 'mosche/sommersa-alexandra', prezzo: 3.2, ami: [10, 12], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota'], acque: ['lago'], v3d: { stile: 'sommersa', corpo: '#d8d8dc', filo: '#ffffff', coda: '#d6312a', ali: '#2f6a3a', hackle: '#111111', hackle2: '#111111', testa: '#0e0e0e' } },
  { slug: 'green-highlander', cat: 'sommersa', foto: 'mosche/salmone-green-highlander', prezzo: 12.5, ami: [4, 6, 8], stagioni: ['primavera', 'autunno'], pesci: ['trota'], acque: ['lago'], v3d: { stile: 'sommersa', corpo: '#3aa63a', filo: '#d8c03a', coda: '#e6c220', ali: '#d7a428', hackle: '#e2d23a', hackle2: '#3aa63a', testa: '#111' } },
  { slug: 'soft-hackle-olive', cat: 'sommersa', foto: 'mosche/ninfa-soft-hackle', prezzo: 2.6, ami: [12, 14, 16], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['temolo', 'trota'], acque: ['torrente'], v3d: { stile: 'sommersa', corpo: '#6c7046', filo: '#c9b98a', coda: '#6c7046', ali: '#77746c', hackle: '#9d968a', hackle2: '#5d574e', testa: '#2e2a20' } },

  // ——— Ninfe ———
  { slug: 'prince-testa-oro', cat: 'ninfa', foto: 'mosche/ninfa-prince-testa-oro', prezzo: 2.6, ami: [10, 12, 14, 16], stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], v3d: { bead: 'oro', corpo: '#2d3a1c', filo: '#d4b04a', torace: '#4a3420', sacca: '#f2efe6', coda: '#5a3a1e', zampe: '#5a3a1e', segmenti: 6 }, top: true },
  { slug: 'orecchio-di-lepre', cat: 'ninfa', foto: 'mosche/ninfa-orecchio-di-lepre', prezzo: 2.4, ami: [12, 14, 16, 18], stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], v3d: { bead: 'oro', corpo: '#9a8264', filo: '#d4b04a', torace: '#6b5640', sacca: '#4a3828', coda: '#7a6448', zampe: '#7a6448', segmenti: 7, peloso: true }, top: true },
  { slug: 'montana-stone', cat: 'ninfa', foto: 'mosche/ninfa-montana-stone', prezzo: 3.2, ami: [6, 8, 10], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente'], v3d: { bead: 'oro', corpo: '#1b1b1b', filo: '#3a3a3a', torace: '#2a2016', sacca: '#1b1b1b', coda: '#1b1b1b', zampe: '#4a3a2a', segmenti: 8 } },
  { slug: 'perlide-nera', cat: 'ninfa', foto: 'mosche/ninfa-perlide-nera', prezzo: 3.4, ami: [6, 8, 10], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente'], v3d: { bead: 'nero', corpo: '#202024', filo: '#9aa0a6', torace: '#2c2c30', sacca: '#151515', coda: '#b8662a', zampe: '#8a7a64', segmenti: 8 } },
  { slug: 'march-brown', cat: 'ninfa', foto: 'mosche/ninfa-march-brown', prezzo: 2.6, ami: [12, 14], stagioni: ['primavera'], pesci: ['trota', 'temolo'], acque: ['torrente'], v3d: { bead: null, corpo: '#8a7a3a', filo: '#d8c060', torace: '#6a5a2c', sacca: '#c9b48a', coda: '#7a6a44', zampe: '#9a8a5a', segmenti: 7 } },
  { slug: 'perdigon-fario', cat: 'ninfa', render: true, foto: 'render/perdigon-fario', prezzo: 2.8, ami: [14, 16, 18], stagioni: TUTTE, pesci: ['temolo', 'trota'], acque: ['torrente'], v3d: { bead: 'rame', corpo: '#3d6152', filo: '#d9692e', torace: '#2c4a3d', sacca: '#e0662c', coda: '#c9b48a', zampe: null, segmenti: 6, liscio: true } },

  // ——— Streamer ———
  { slug: 'woolly-bugger', cat: 'streamer', foto: 'mosche/streamer-woolly-bugger', prezzo: 3.5, ami: [6, 8, 10], stagioni: TUTTE, pesci: ['trota'], acque: ['torrente', 'lago'], v3d: { ala: ['#1a1a1a', '#2a1e14'], corpo: '#3a2a1a', tinsel: '#c0c0c0', bead: 'rame', occhi: false, muddler: false, palmer: '#5a3a20' }, top: true },
  { slug: 'clouser-chartreuse', cat: 'streamer', foto: 'mosche/streamer-clouser', prezzo: 3.8, ami: [4, 6, 8], stagioni: ['estate', 'autunno'], pesci: ['trota'], acque: ['lago'], v3d: { ala: ['#e8f0e6', '#c8e23a', '#f2a3c8'], corpo: '#d8e83a', tinsel: '#e8e8e8', bead: null, occhi: true, muddler: false } },
  { slug: 'muddler-minnow', cat: 'streamer', foto: 'mosche/streamer-muddler', prezzo: 3.9, ami: [4, 6, 8, 10], stagioni: ['estate', 'autunno'], pesci: ['trota'], acque: ['torrente', 'lago'], v3d: { ala: ['#d8d2c4', '#3a3a3a', '#8a7a64'], corpo: '#c9a24a', tinsel: '#d4b04a', bead: null, occhi: false, muddler: true }, top: true },
  { slug: 'mickey-finn', cat: 'streamer', foto: 'mosche/streamer-mickey-finn', prezzo: 3.6, ami: [6, 8, 10], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota'], acque: ['lago', 'torrente'], v3d: { ala: ['#f2d23a', '#d6262a', '#f2d23a'], corpo: '#d8d8dc', tinsel: '#e8e8ea', bead: null, occhi: false, muddler: false } },
  { slug: 'white-minnow', cat: 'streamer', foto: 'mosche/streamer-white-minnow', prezzo: 3.7, ami: [4, 6, 8], stagioni: ['primavera', 'autunno', 'inverno'], pesci: ['trota'], acque: ['lago'], v3d: { ala: ['#f4f2ec', '#e8e4da'], corpo: '#f4f2ec', tinsel: '#e8e8ea', bead: null, occhi: true, muddler: true } },
  { slug: 'matuka-fario', cat: 'streamer', render: true, foto: 'render/matuka-fario', prezzo: 4.2, ami: [4, 6, 8], stagioni: ['primavera', 'autunno', 'inverno'], pesci: ['trota'], acque: ['torrente', 'lago'], v3d: { ala: ['#6a5432', '#c9a24a', '#2a2a1a'], corpo: '#b8862a', tinsel: '#d4b04a', bead: 'oro', occhi: false, muddler: false } },

  // ——— Kit e regali ———
  { slug: 'kit-primo-torrente', cat: 'kit', foto: 'canne-attrezzatura/kit-principiante', prezzo: 189, regalo: true, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente'], scatola: '#3b4a33', top: true },
  { slug: 'scatola-alto-torrente', cat: 'kit', foto: 'canne-attrezzatura/scatola-mosche-sacramento', prezzo: 79, regalo: true, stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota'], acque: ['torrente'], scatola: '#6a4a2c' },
  { slug: 'cofanetto-secche-classiche', cat: 'kit', foto: 'mosche/secche-su-piume', prezzo: 42, regalo: true, stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], scatola: '#1f2a22' },
  { slug: 'kit-costruzione-primo-banco', cat: 'kit', foto: 'canne-attrezzatura/morsa-costruzione', prezzo: 129, regalo: true, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], scatola: '#2a2a2a' },
  { slug: 'cofanetto-salmone-classico', cat: 'kit', foto: 'mosche/salmone-su-piume', prezzo: 64, regalo: true, stagioni: ['primavera', 'autunno'], pesci: ['trota'], acque: ['lago'], scatola: '#5a2a1e' },
  { slug: 'assortimento-fario-36', cat: 'kit', foto: 'canne-attrezzatura/vassoio-mosche-trota', prezzo: 89, regalo: false, stagioni: TUTTE, pesci: ['trota'], acque: ['torrente', 'lago'], scatola: '#33402e' },

  // ——— Attrezzatura ———
  { slug: 'canna-fario-86-coda-4', cat: 'attrezzatura', foto: 'canne-attrezzatura/canne-da-mosca', prezzo: 349, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente'], top: true },
  { slug: 'canna-bambu-ottocento', cat: 'attrezzatura', foto: 'canne-attrezzatura/canna-bambu', prezzo: 890, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente'] },
  { slug: 'combo-sottobosco', cat: 'attrezzatura', foto: 'canne-attrezzatura/canna-e-mulinello-su-foglie', prezzo: 420, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'] },
  { slug: 'coda-di-topo-seta-dt4', cat: 'attrezzatura', foto: 'canne-attrezzatura/coda-di-topo-seta', prezzo: 165, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'] },
  { slug: 'scatola-mosche-stagna', cat: 'attrezzatura', foto: 'canne-attrezzatura/scatole-di-mosche', prezzo: 34, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'] },
  { slug: 'morsetto-atelier', cat: 'attrezzatura', foto: 'canne-attrezzatura/costruzione-mosca-primo-piano', prezzo: 145, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'] },
];

export const MOSCHE = ['secca', 'sommersa', 'ninfa', 'streamer'];
export const CATEGORIE = [...MOSCHE, 'kit', 'attrezzatura'];
export const STAGIONI = ['primavera', 'estate', 'autunno', 'inverno'];
export const PESCI = ['trota', 'temolo'];
export const ACQUE = ['torrente', 'lago'];
export const AMI = [4, 6, 8, 10, 12, 14, 16, 18, 20];

export const prodotti = base.map((p, i) => ({ ...p, ordine: i, ...testiIt[p.slug] }));
export const perSlug = Object.fromEntries(prodotti.map((p) => [p.slug, p]));
export const eMosca = (p) => MOSCHE.includes(p.cat);

export function correlati(p, n = 4) {
  const stessi = prodotti.filter((q) => q.slug !== p.slug && q.cat === p.cat);
  const altri = prodotti.filter((q) => q.slug !== p.slug && q.cat !== p.cat && q.top);
  return [...stessi.slice(0, n - 1), ...altri].slice(0, n);
}
