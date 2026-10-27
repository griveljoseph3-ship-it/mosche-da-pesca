// Animazioni legate allo scroll nella home (GSAP ScrollTrigger), caricate solo quando servono.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from './scorrimento.js';

gsap.registerPlugin(ScrollTrigger);

export function avviaAnimazioniHome(radice) {
  const lenis = getLenis();
  const aggiorna = () => ScrollTrigger.update();
  lenis?.on('scroll', aggiorna);

  const ctx = gsap.context(() => {
    // il titolo sale piano e si dissolve mentre si scende nel fiume
    gsap.to('.hero-contenuto', {
      yPercent: -18,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 25%', scrub: 0.6 },
    });
    gsap.to('.hero-scorri', { opacity: 0, scrollTrigger: { trigger: '.hero', start: 'top top', end: '20% top', scrub: true } });

    // ogni livello: il testo entra con una parallasse discreta, le schede scorrono a velocità diverse
    gsap.utils.toArray('.livello').forEach((sez) => {
      const testo = sez.querySelector('.livello-testo');
      const schede = sez.querySelectorAll('.livello-scheda');
      gsap.fromTo(testo, { y: 60 }, { y: -60, ease: 'none', scrollTrigger: { trigger: sez, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      if (window.innerWidth < 800) return;
      schede.forEach((s, i) => {
        gsap.fromTo(s, { y: 40 + (i % 2) * 50 }, { y: -40 - (i % 2) * 50, ease: 'none', scrollTrigger: { trigger: sez, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
    });

    // la foto della storia si muove più lenta della pagina
    gsap.fromTo('.storia-foto img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.blocco-storia', start: 'top bottom', end: 'bottom top', scrub: true } });
  }, radice);

  return () => {
    lenis?.off('scroll', aggiorna);
    ctx.revert();
  };
}
