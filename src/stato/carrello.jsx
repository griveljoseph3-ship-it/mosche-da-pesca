import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { perSlug } from '../data/catalogo.js';

const CHIAVE = 'riale-carrello-v1';
const SOGLIA_GRATIS = 60;
const Ctx = createContext(null);

function leggi() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHIAVE) || '[]');
    return Array.isArray(raw) ? raw.filter((r) => perSlug[r.slug] && r.qta > 0) : [];
  } catch {
    return [];
  }
}

export const chiaveRiga = (slug, amo) => `${slug}${amo ? `@${amo}` : ''}`;

export function CarrelloProvider({ children }) {
  const [righe, setRighe] = useState(leggi);
  const [aperto, setAperto] = useState(false);
  const [ultimo, setUltimo] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(CHIAVE, JSON.stringify(righe)); } catch { /* storage pieno o bloccato */ }
  }, [righe]);

  // sincronizza tra schede
  useEffect(() => {
    const f = (e) => { if (e.key === CHIAVE) setRighe(leggi()); };
    window.addEventListener('storage', f);
    return () => window.removeEventListener('storage', f);
  }, []);

  const aggiungi = useCallback((slug, { amo = null, qta = 1, apri = true } = {}) => {
    setRighe((rs) => {
      const k = chiaveRiga(slug, amo);
      const i = rs.findIndex((r) => chiaveRiga(r.slug, r.amo) === k);
      if (i >= 0) return rs.map((r, j) => (j === i ? { ...r, qta: Math.min(99, r.qta + qta) } : r));
      return [...rs, { slug, amo, qta }];
    });
    setUltimo({ slug, amo, t: Date.now() });
    if (apri) setAperto(true);
  }, []);

  const imposta = useCallback((k, qta) => {
    setRighe((rs) => rs.map((r) => (chiaveRiga(r.slug, r.amo) === k ? { ...r, qta: Math.max(1, Math.min(99, qta)) } : r)));
  }, []);
  const rimuovi = useCallback((k) => setRighe((rs) => rs.filter((r) => chiaveRiga(r.slug, r.amo) !== k)), []);
  const svuota = useCallback(() => setRighe([]), []);

  const valore = useMemo(() => {
    const dettagli = righe.map((r) => ({ ...r, chiave: chiaveRiga(r.slug, r.amo), prodotto: perSlug[r.slug], totale: perSlug[r.slug].prezzo * r.qta }));
    const subtotale = dettagli.reduce((s, r) => s + r.totale, 0);
    const pezzi = righe.reduce((s, r) => s + r.qta, 0);
    const costoSpedizione = (metodo = 'standard') => (subtotale === 0 ? 0 : metodo === 'espressa' ? 9.9 : subtotale >= SOGLIA_GRATIS ? 0 : 4.9);
    return { righe: dettagli, subtotale, pezzi, costoSpedizione, soglia: SOGLIA_GRATIS, aggiungi, imposta, rimuovi, svuota, aperto, setAperto, ultimo };
  }, [righe, aperto, ultimo, aggiungi, imposta, rimuovi, svuota]);

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>;
}

export const useCarrello = () => useContext(Ctx);
