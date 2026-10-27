// Dati della cassa demo: restano solo nella sessione del browser.
const CHIAVE = 'riale-cassa-v1';
export const leggiOrdine = () => {
  try { return JSON.parse(sessionStorage.getItem(CHIAVE) || '{}'); } catch { return {}; }
};
export const salvaOrdine = (d) => {
  try { sessionStorage.setItem(CHIAVE, JSON.stringify(d)); } catch { /* niente */ }
};
export const cancellaOrdine = () => {
  try { sessionStorage.removeItem(CHIAVE); } catch { /* niente */ }
};
