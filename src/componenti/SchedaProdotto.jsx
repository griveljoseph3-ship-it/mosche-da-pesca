import { Link } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { useCarrello } from '../stato/carrello.jsx';
import { eMosca } from '../data/catalogo.js';
import Foto from './Foto.jsx';
import { Piu } from './Icone.jsx';

export const amoPredefinito = (p) => (p.ami ? p.ami[Math.floor((p.ami.length - 1) / 2)] : null);

// Scheda prodotto: foto, tipo, nome, prezzo e aggiunta rapida al carrello.
export default function SchedaProdotto({ p, sizes = '(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw', priorita = false, scura = false }) {
  const { aggiungi } = useCarrello();

  return (
    <article className={`scheda ${scura ? 'scheda-scura' : ''}`}>
      <Link to={`/prodotto/${p.slug}`} className="scheda-link" viewTransition aria-label={`${p.nome}, ${euro(p.prezzo)}`}>
        <div className="scheda-palco">
          <div className="scheda-mosca">
            <Foto nome={p.foto} alt={`${p.nome}: ${t.categorie[p.cat].toLowerCase()} fotografata in macro`} sizes={sizes} priorita={priorita} />
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
