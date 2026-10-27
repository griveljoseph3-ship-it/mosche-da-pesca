// Scorrimento morbido con Lenis (disattivato con prefers-reduced-motion).
import Lenis from 'lenis';
import { movimentoRidotto } from './qualita.js';

let lenis = null;
const ascoltatori = new Set();

export function avviaScorrimento() {
  if (lenis || movimentoRidotto()) return null;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 3.2), smoothWheel: true, touchMultiplier: 1.4 });
  const loop = (t) => {
    lenis.raf(t);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  lenis.on('scroll', (e) => ascoltatori.forEach((f) => f(e)));
  return lenis;
}

export const getLenis = () => lenis;
export function suScroll(f) {
  ascoltatori.add(f);
  return () => ascoltatori.delete(f);
}
export function vaiA(target, opzioni = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, ...opzioni });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: opzioni.immediate ? 'auto' : 'smooth' });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}
export function blocca(si) {
  if (!lenis) {
    document.documentElement.style.overflow = si ? 'hidden' : '';
    return;
  }
  si ? lenis.stop() : lenis.start();
}
