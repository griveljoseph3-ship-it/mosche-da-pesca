import { useEffect, useRef, useState } from 'react';
import { testi as t } from '../i18n/index.js';
import Foto from './Foto.jsx';

// Scatola regalo in CSS 3D: il nastro si scioglie, il coperchio si apre e il contenuto sale.
export default function ScatolaRegalo({ prodotto, automatica = false, aperta: apertaEsterna, piccola = false }) {
  const ref = useRef(null);
  const [aperta, setAperta] = useState(false);
  const stato = apertaEsterna ?? aperta;

  useEffect(() => {
    if (!automatica || !ref.current) return;
    const o = new IntersectionObserver(([v]) => {
      if (v.isIntersecting) {
        setTimeout(() => setAperta(true), 500);
        o.disconnect();
      }
    }, { threshold: 0.55 });
    o.observe(ref.current);
    return () => o.disconnect();
  }, [automatica]);

  return (
    <div
      ref={ref}
      className={`scatola ${stato ? 'aperta' : ''} ${piccola ? 'piccola' : ''}`}
      style={{ '--colore': prodotto?.scatola || '#1f2a22' }}
    >
      <div className="scatola-scena">
        <div className="scatola-3d">
          <div className="faccia fondo" />
          <div className="faccia retro" />
          <div className="faccia sx" />
          <div className="faccia dx" />
          <div className="contenuto">
            {prodotto && <Foto nome={prodotto.foto} alt={`${prodotto.nome}, contenuto della confezione`} sizes="320px" />}
          </div>
          <div className="faccia fronte"><span className="scatola-marchio">Riale</span></div>
          <div className="coperchio">
            <div className="faccia c-sopra"><span className="scatola-marchio grande">Riale</span><i className="nastro-v" /><i className="nastro-o" /></div>
            <div className="faccia c-fronte"><i className="nastro-v" /></div>
            <div className="faccia c-retro" />
            <div className="faccia c-sx" />
            <div className="faccia c-dx" />
          </div>
          <div className="fiocco" aria-hidden="true">
            <svg viewBox="0 0 80 40"><path d="M40 20C30 4 10 2 8 14s18 10 32 6Zm0 0c10-16 30-18 32-6s-18 10-32 6Z" /><circle cx="40" cy="20" r="4" /></svg>
          </div>
        </div>
        <div className="scatola-ombra" />
      </div>
      {!automatica && apertaEsterna === undefined && (
        <button type="button" className="link-freccia scatola-btn" onClick={() => setAperta((a) => !a)} aria-pressed={aperta}>
          {aperta ? t.nav.chiudi : t.prodotto.apri}
        </button>
      )}
    </div>
  );
}
