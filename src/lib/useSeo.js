import { useEffect } from 'react';
import { seoPer } from './seo.js';

function meta(attr, chiave, valore) {
  let el = document.head.querySelector(`meta[${attr}="${chiave}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, chiave);
    document.head.appendChild(el);
  }
  el.setAttribute('content', valore);
}

// Aggiorna titolo, descrizione, Open Graph e dati strutturati quando cambia pagina.
export default function useSeo(percorso) {
  useEffect(() => {
    const s = seoPer(percorso);
    document.title = s.titolo;
    meta('name', 'description', s.descrizione);
    if (s.parole) meta('name', 'keywords', s.parole);
    meta('name', 'robots', s.noindex ? 'noindex, follow' : 'index, follow');
    meta('property', 'og:title', s.titolo);
    meta('property', 'og:description', s.descrizione);
    if (s.url) meta('property', 'og:url', s.url);
    if (s.immagine) meta('property', 'og:image', s.immagine);
    meta('property', 'og:type', s.tipo || 'website');
    let can = document.head.querySelector('link[rel="canonical"]');
    if (can && s.url) can.setAttribute('href', s.url);
    document.head.querySelectorAll('script[data-seo]').forEach((n) => n.remove());
    if (s.jsonld) {
      const sc = document.createElement('script');
      sc.type = 'application/ld+json';
      sc.dataset.seo = '1';
      sc.textContent = JSON.stringify(s.jsonld);
      document.head.appendChild(sc);
    }
  }, [percorso]);
}
