import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { useCarrello } from '../stato/carrello.jsx';
import { eMosca } from '../data/catalogo.js';
import Foto from './Foto.jsx';
import { Piu } from './Icone.jsx';

export const amoPredefinito = (p) => (p.ami ? p.ami[Math.floor((p.ami.length - 1) / 2)] : null);

// Scheda prodotto: al passaggio la mosca ruota appena e un riflesso di luce le scorre sopra.
export default function SchedaProdotto({ p, sizes = '(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw', priorita = false, scura = false }) {
  const { aggiungi } = useCarrello();
  const ref = useRef(null);

  const muovi = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty('--lx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--ly', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const esci = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <article className={`scheda ${scura ? 'scheda-scura' : ''}`}>
      <Link to={`/prodotto/${p.slug}`} className="scheda-link" viewTransition aria-label={`${p.nome}, ${euro(p.prezzo)}`}>
        <div className="scheda-palco" ref={ref} onPointerMove={muovi} onPointerLeave={esci}>
          <div className="scheda-mosca">
            <Foto nome={p.foto} alt={`${p.nome}: ${t.categorie[p.cat].toLowerCase()} fotografata in macro`} sizes={sizes} priorita={priorita} />
            <span className="scheda-riflesso" aria-hidden="true" />
          </div>
          <span className="badge-demo scheda-badge">{t.demo}</span>
        </div>
        <div className="scheda-testo">
          <p className="occhiello">{t.categorie[p.cat]}</p>
          <h3 className="scheda-nome">{p.nome}</h3>
          <p className="scheda-prezzo">
            {euro(p.prezzo)}
            {eMosca(p) && <span className="tenue"> {t.prodotto.alPezzo}</span>}
          </p>
        </div>
      </Link>
      <button
        type="button"
        className="scheda-aggiungi"
        onClick={() => aggiungi(p.slug, { amo: amoPredefinito(p) })}
        aria-label={`${t.prodotto.aggiungi}: ${p.nome}${p.ami ? `, amo ${amoPredefinito(p)}` : ''}`}
      >
        <Piu size={18} />
      </button>
    </article>
  );
}
