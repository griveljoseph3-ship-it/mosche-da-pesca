// Scorrimento nativo del browser (niente scroll "morbido": è più rapido e prevedibile).
export function vaiA(target) {
  const liscio = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: liscio ? 'smooth' : 'auto' });
  else document.querySelector(target)?.scrollIntoView({ behavior: liscio ? 'smooth' : 'auto' });
}

// Blocca lo scorrimento della pagina sotto menu, carrello e filtri aperti
export function blocca(si) {
  document.documentElement.style.overflow = si ? 'hidden' : '';
}
