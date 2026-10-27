// Titoli, descrizioni e dati strutturati per ogni pagina.
// Usato dal sito (useSeo) e dallo script di prerender (strumenti/prerender.mjs).
import { prodotti, perSlug } from '../data/catalogo.js';

export const SITO = 'https://griveljoseph3-ship-it.github.io/mosche-da-pesca';
const MARCHIO = 'Riale';
const PAROLE = 'mosche da pesca, mosche secche, ninfe pesca a mosca, streamer, mosche sommerse, pesca a mosca, mosche artigianali, trota, temolo';

const NOMI_CAT = { secca: 'Mosca secca', sommersa: 'Mosca sommersa', ninfa: 'Ninfa', streamer: 'Streamer', kit: 'Kit e regali', attrezzatura: 'Attrezzatura' };

const pagine = {
  '/': {
    titolo: `${MARCHIO} · Mosche da pesca artigianali: secche, ninfe, streamer`,
    descrizione: 'Mosche da pesca legate a mano: mosche secche, sommerse, ninfe per la pesca a mosca e streamer per trota e temolo. Un viaggio nel torrente, dall’alba al tramonto.',
  },
  '/negozio': {
    titolo: `Negozio di mosche da pesca · ${MARCHIO}`,
    descrizione: 'Tutte le mosche da pesca artigianali: mosche secche, sommerse, ninfe pesca a mosca e streamer, con kit e attrezzatura. Filtra per amo, stagione, pesce e acqua.',
  },
  '/calendario': {
    titolo: `Calendario delle schiuse mese per mese · ${MARCHIO}`,
    descrizione: 'Effimere, tricotteri, plecotteri e chironomidi: quali insetti nascono ogni mese nei torrenti alpini e quali mosche secche e ninfe usare.',
  },
  '/kit': {
    titolo: `Kit di mosche e confezioni regalo · ${MARCHIO}`,
    descrizione: 'Kit pronti per la pesca a mosca e confezioni regalo: scatole di mosche secche, ninfe e streamer, kit per cominciare e per costruire le mosche.',
  },
  '/storia': {
    titolo: `La nostra storia · ${MARCHIO}`,
    descrizione: 'Un banco, una morsa e un torrente sotto casa: come nascono le mosche da pesca Riale, legate a mano e provate in acqua.',
  },
  '/contatti': {
    titolo: `Contatti · ${MARCHIO}`,
    descrizione: 'Scrivici per una mosca, una misura dell’amo o un torrente. Modulo di contatto dimostrativo.',
  },
  '/crediti': {
    titolo: `Crediti di foto e modelli 3D · ${MARCHIO}`,
    descrizione: 'Autori, licenze e fonti delle fotografie e dei modelli 3D usati nel sito.',
  },
  '/spedizioni-e-resi': {
    titolo: `Spedizioni e resi · ${MARCHIO}`,
    descrizione: 'Tempi e costi di spedizione, resi e cambi. Testi di esempio di un sito dimostrativo.',
  },
  '/privacy': {
    titolo: `Privacy · ${MARCHIO}`,
    descrizione: 'Informativa privacy di esempio del sito dimostrativo Riale.',
  },
  '/carrello': { titolo: `Carrello · ${MARCHIO}`, descrizione: 'Il tuo carrello.', noindex: true },
  '/cassa': { titolo: `Dati e spedizione · ${MARCHIO}`, descrizione: 'Dati e spedizione.', noindex: true },
  '/cassa/conferma': { titolo: `Conferma ordine · ${MARCHIO}`, descrizione: 'Conferma ordine demo.', noindex: true },
  '/ordine-ricevuto': { titolo: `Ordine demo ricevuto · ${MARCHIO}`, descrizione: 'Ordine demo ricevuto.', noindex: true },
};

export const percorsiStatici = Object.keys(pagine);
export const percorsiProdotti = prodotti.map((p) => `/prodotto/${p.slug}`);

export function urlAssoluto(percorso) {
  return `${SITO}${percorso === '/' ? '/' : `${percorso}/`}`;
}

function immagineProdotto(p) {
  return `${SITO}/img/${p.foto}-960.webp`;
}

export function seoPer(percorso) {
  const pulito = percorso.replace(/\/+$/, '') || '/';
  const m = pulito.match(/^\/prodotto\/([^/]+)$/);
  if (m) {
    const p = perSlug[m[1]];
    if (!p) return { titolo: `Pagina non trovata · ${MARCHIO}`, descrizione: '', noindex: true };
    const prezzo = p.prezzo.toFixed(2);
    return {
      titolo: `${p.nome} · ${NOMI_CAT[p.cat]} · ${MARCHIO}`,
      descrizione: `${p.nome}: ${p.breve} ${NOMI_CAT[p.cat]} artigianale da ${prezzo} €. Prodotto dimostrativo.`,
      immagine: immagineProdotto(p),
      url: urlAssoluto(pulito),
      parole: `${p.nome}, ${NOMI_CAT[p.cat].toLowerCase()}, ${PAROLE}`,
      tipo: 'product',
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.nome,
        description: p.descrizione,
        image: [immagineProdotto(p)],
        sku: `RIALE-${p.slug.toUpperCase()}`,
        category: NOMI_CAT[p.cat],
        brand: { '@type': 'Brand', name: MARCHIO },
        offers: {
          '@type': 'Offer',
          url: urlAssoluto(pulito),
          priceCurrency: 'EUR',
          price: prezzo,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          description: 'Prodotto e prezzo dimostrativi',
        },
      },
    };
  }
  const d = pagine[pulito];
  if (!d) return { titolo: `Pagina non trovata · ${MARCHIO}`, descrizione: '', noindex: true };
  const base = { ...d, url: urlAssoluto(pulito), immagine: `${SITO}/og.jpg`, parole: PAROLE, tipo: 'website' };
  if (pulito === '/') {
    base.jsonld = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: MARCHIO,
      description: d.descrizione,
      url: urlAssoluto('/'),
      image: `${SITO}/og.jpg`,
      priceRange: '€–€€€',
      address: { '@type': 'PostalAddress', addressLocality: 'Valle (demo)', addressCountry: 'IT' },
    };
  }
  if (pulito === '/negozio') {
    base.jsonld = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Mosche da pesca e attrezzatura',
      itemListElement: prodotti.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: urlAssoluto(`/prodotto/${p.slug}`), name: p.nome })),
    };
  }
  return base;
}
