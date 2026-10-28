// Catalogo demo: dati indipendenti dalla lingua. I testi sono in catalogo.it.js.
// Prezzi e prodotti sono inventati (sito dimostrativo).
import testiIt from './catalogo.it.js';

const TUTTE = ['primavera', 'estate', 'autunno', 'inverno'];

const base = [
  // ——— Mosche secche ———
  { slug: 'adams-classica', cat: 'secca', foto: 'mosche/secca-adams', prezzo: 2.9, ami: [12, 14, 16, 18], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], top: true },
  { slug: 'adams-wulff', cat: 'secca', foto: 'mosche/secca-adams-wulff', prezzo: 3.2, ami: [10, 12, 14], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente'] },
  { slug: 'elk-hair-caddis', cat: 'secca', foto: 'mosche/secca-elk-hair-caddis', prezzo: 2.8, ami: [12, 14, 16], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], top: true },
  { slug: 'klinkhammer-special', cat: 'secca', foto: 'mosche/secca-klinkhammer', prezzo: 3.4, ami: [12, 14, 16, 18], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['temolo', 'trota'], acque: ['torrente'], top: true },
  { slug: 'royal-wulff', cat: 'secca', foto: 'mosche/secca-royal-wulff', prezzo: 3.2, ami: [10, 12, 14], stagioni: ['estate'], pesci: ['trota'], acque: ['torrente'] },
  { slug: 'stimulator', cat: 'secca', foto: 'mosche/secca-stimulator', prezzo: 3.6, ami: [8, 10, 12], stagioni: ['estate'], pesci: ['trota'], acque: ['torrente'] },
  { slug: 'sparkle-dun-olive', cat: 'secca', foto: 'mosche/secca-sparkle-dun', prezzo: 2.9, ami: [16, 18, 20], stagioni: ['primavera', 'autunno'], pesci: ['temolo', 'trota'], acque: ['torrente', 'lago'] },
  { slug: 'black-wulff', cat: 'secca', foto: 'mosche/secca-black-wulff', prezzo: 3.1, ami: [10, 12, 14], stagioni: ['estate', 'autunno'], pesci: ['trota'], acque: ['torrente', 'lago'] },

  // ——— Mosche sommerse ———
  { slug: 'royal-coachman', cat: 'sommersa', foto: 'mosche/sommersa-royal-coachman', prezzo: 3.0, ami: [10, 12, 14], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente', 'lago'], top: true },
  { slug: 'starna-e-fagiano', cat: 'sommersa', foto: 'mosche/sommersa-starna-fagiano', prezzo: 2.7, ami: [12, 14, 16], stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente'], top: true },
  { slug: 'grizzly-king', cat: 'sommersa', foto: 'mosche/sommersa-grizzly-king', prezzo: 3.0, ami: [10, 12, 14], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['lago', 'torrente'] },
  { slug: 'alexandra', cat: 'sommersa', foto: 'mosche/sommersa-alexandra', prezzo: 3.2, ami: [10, 12], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota'], acque: ['lago'] },
  { slug: 'green-highlander', cat: 'sommersa', foto: 'mosche/salmone-green-highlander', prezzo: 12.5, ami: [4, 6, 8], stagioni: ['primavera', 'autunno'], pesci: ['trota'], acque: ['lago'] },
  { slug: 'soft-hackle-olive', cat: 'ninfa', foto: 'mosche/ninfa-soft-hackle', prezzo: 2.6, ami: [12, 14, 16], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['temolo', 'trota'], acque: ['torrente'] },

  { slug: 'tris-salmone', cat: 'sommersa', foto: 'mosche/salmone-su-piume', prezzo: 24, ami: [4, 6, 8], stagioni: ['primavera', 'autunno'], pesci: ['trota'], acque: ['lago'] },

  // ——— Ninfe ———
  { slug: 'prince-testa-oro', cat: 'ninfa', foto: 'mosche/ninfa-prince-testa-oro', prezzo: 2.6, ami: [10, 12, 14, 16], stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], top: true },
  { slug: 'orecchio-di-lepre', cat: 'ninfa', foto: 'mosche/ninfa-orecchio-di-lepre', prezzo: 2.4, ami: [12, 14, 16, 18], stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], top: true },
  { slug: 'montana-stone', cat: 'ninfa', foto: 'mosche/ninfa-montana-stone', prezzo: 3.2, ami: [6, 8, 10], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente'] },
  { slug: 'perlide-nera', cat: 'ninfa', foto: 'mosche/ninfa-perlide-nera', prezzo: 3.4, ami: [6, 8, 10], stagioni: ['primavera', 'estate'], pesci: ['trota'], acque: ['torrente'] },
  { slug: 'march-brown', cat: 'ninfa', foto: 'mosche/ninfa-march-brown', prezzo: 2.6, ami: [12, 14], stagioni: ['primavera'], pesci: ['trota', 'temolo'], acque: ['torrente'] },

  // ——— Streamer ———
  { slug: 'woolly-bugger', cat: 'streamer', foto: 'mosche/streamer-woolly-bugger', prezzo: 3.5, ami: [6, 8, 10], stagioni: TUTTE, pesci: ['trota'], acque: ['torrente', 'lago'], top: true },
  { slug: 'clouser-chartreuse', cat: 'streamer', foto: 'mosche/streamer-clouser', prezzo: 3.8, ami: [4, 6, 8], stagioni: ['estate', 'autunno'], pesci: ['trota'], acque: ['lago'] },
  { slug: 'muddler-minnow', cat: 'streamer', foto: 'mosche/streamer-muddler', prezzo: 3.9, ami: [4, 6, 8, 10], stagioni: ['estate', 'autunno'], pesci: ['trota'], acque: ['torrente', 'lago'], top: true },
  { slug: 'mickey-finn', cat: 'streamer', foto: 'mosche/streamer-mickey-finn', prezzo: 3.6, ami: [6, 8, 10], stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota'], acque: ['lago', 'torrente'] },
  { slug: 'white-minnow', cat: 'streamer', foto: 'mosche/streamer-white-minnow', prezzo: 3.7, ami: [4, 6, 8], stagioni: ['primavera', 'autunno', 'inverno'], pesci: ['trota'], acque: ['lago'] },

  // ——— Kit e regali ———
  { slug: 'kit-primo-torrente', cat: 'kit', foto: 'canne-attrezzatura/kit-principiante', prezzo: 189, regalo: true, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente'], scatola: '#3b4a33', top: true },
  { slug: 'scatola-alto-torrente', cat: 'kit', foto: 'canne-attrezzatura/scatola-mosche-sacramento', prezzo: 79, regalo: true, stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota'], acque: ['torrente'], scatola: '#6a4a2c' },
  { slug: 'cofanetto-secche-classiche', cat: 'kit', foto: 'mosche/secche-su-piume', prezzo: 42, regalo: true, stagioni: ['primavera', 'estate', 'autunno'], pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], scatola: '#1f2a22' },
  { slug: 'kit-costruzione-primo-banco', cat: 'kit', foto: 'canne-attrezzatura/morsa-costruzione', prezzo: 129, regalo: true, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], scatola: '#2a2a2a' },
  { slug: 'buono-regalo', cat: 'kit', foto: 'fiumi-ambientazioni/torrente-sudtirolo', prezzo: 50, regalo: true, stagioni: TUTTE, pesci: ['trota', 'temolo'], acque: ['torrente', 'lago'], scatola: '#1f2a22' },
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
// percorso del negozio per ogni tipo: /negozio/secche, /negozio/ninfe, ...
export const SLUG_CAT = { secca: 'secche', sommersa: 'sommerse', ninfa: 'ninfe', streamer: 'streamer', kit: 'kit-e-regali', attrezzatura: 'attrezzatura' };
export const CAT_DA_SLUG = Object.fromEntries(Object.entries(SLUG_CAT).map(([k, v]) => [v, k]));
export const urlCategoria = (cat) => `/negozio/${SLUG_CAT[cat]}`;
export const STAGIONI = ['primavera', 'estate', 'autunno', 'inverno'];
export const PESCI = ['trota', 'temolo'];
export const ACQUE = ['torrente', 'lago'];
export const AMI = [4, 6, 8, 10, 12, 14, 16, 18, 20];

export const prodotti = base
  .map((p, i) => ({ ...p, ordine: i, ...testiIt[p.slug] }))
  .sort((a, b) => CATEGORIE.indexOf(a.cat) - CATEGORIE.indexOf(b.cat) || a.ordine - b.ordine);
export const perSlug = Object.fromEntries(prodotti.map((p) => [p.slug, p]));
export const eMosca = (p) => MOSCHE.includes(p.cat);

export function correlati(p, n = 4) {
  const stessi = prodotti.filter((q) => q.slug !== p.slug && q.cat === p.cat);
  const altri = prodotti.filter((q) => q.slug !== p.slug && q.cat !== p.cat && q.top);
  return [...stessi.slice(0, n - 1), ...altri].slice(0, n);
}
