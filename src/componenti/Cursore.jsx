import { useEffect, useRef } from 'react';

// Cerchio che segue il puntatore e si allarga sopra link e pulsanti. Solo su computer (pointer: fine).
export default function Cursore() {
  const anello = useRef(null);
  const punto = useRef(null);
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || ridotto) return;
    let x = -100, y = -100, ax = -100, ay = -100, raf;
    const muovi = (e) => {
      x = e.clientX; y = e.clientY;
      anello.current.classList.add('attivo');
      punto.current.classList.add('attivo');
      punto.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const sopra = e.target.closest?.('a, button, [role="button"], label, select, summary, input[type="range"], .interattivo');
      anello.current.classList.toggle('sopra', !!sopra);
    };
    const esci = () => { anello.current.classList.remove('attivo'); punto.current.classList.remove('attivo'); };
    const loop = () => {
      ax += (x - ax) * 0.18; ay += (y - ay) * 0.18;
      anello.current.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener('pointermove', muovi, { passive: true });
    document.addEventListener('pointerleave', esci);
    document.documentElement.classList.add('cursore-attivo');
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', muovi);
      document.removeEventListener('pointerleave', esci);
      document.documentElement.classList.remove('cursore-attivo');
    };
  }, []);
  return (
    <>
      <div ref={anello} className="cursore" aria-hidden="true" />
      <div ref={punto} className="cursore-punto" aria-hidden="true" />
    </>
  );
}
