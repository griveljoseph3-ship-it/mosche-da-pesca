import { useState } from 'react';
import { Link } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { prodotti } from '../data/catalogo.js';
import { useCarrello } from '../stato/carrello.jsx';
import Rivela from '../componenti/Rivela.jsx';
import ScatolaRegalo from '../componenti/ScatolaRegalo.jsx';
import { Freccia } from '../componenti/Icone.jsx';

function SchedaKit({ p, i }) {
  const [aperta, setAperta] = useState(false);
  const { aggiungi } = useCarrello();
  return (
    <Rivela as="article" className={`kit-voce ${i % 2 ? 'inversa' : ''}`}>
      <div
        className="kit-voce-scatola"
        onPointerEnter={() => setAperta(true)}
        onPointerLeave={() => setAperta(false)}
        onFocus={() => setAperta(true)}
        onBlur={() => setAperta(false)}
      >
        <ScatolaRegalo prodotto={p} aperta={aperta} />
        <button type="button" className="link-freccia" onClick={() => setAperta((a) => !a)} aria-pressed={aperta}>
          {aperta ? t.nav.chiudi : t.prodotto.apri}
        </button>
      </div>
      <div className="kit-voce-testo">
        <p className="occhiello">{p.regalo ? t.kit.regalo : t.categorie.kit} <span className="badge-demo">{t.demo}</span></p>
        <h2 className="titolo-2">{p.nome}</h2>
        <p className="lead">{p.descrizione}</p>
        <ul className="ricetta">{p.contenuto.map((c) => <li key={c}>{c}</li>)}</ul>
        <div className="kit-azioni">
          <p className="prodotto-prezzo serif">{euro(p.prezzo)}</p>
          <button type="button" className="btn btn-scuro" onClick={() => aggiungi(p.slug)}>{t.prodotto.aggiungi}</button>
          <Link to={`/prodotto/${p.slug}`} className="link-freccia" viewTransition>Dettagli <Freccia /></Link>
        </div>
      </div>
    </Rivela>
  );
}

export default function Kit() {
  const kit = prodotti.filter((p) => p.cat === 'kit');
  return (
    <div className="pagina tema-crema kit-pagina">
      <header className="contenitore pagina-intesta">
        <Rivela>
          <p className="occhiello">Riale</p>
          <h1 className="titolo-1">{t.kit.titolo}</h1>
          <p className="lead">{t.kit.intro}</p>
        </Rivela>
      </header>
      <div className="contenitore kit-lista">
        {kit.map((p, i) => <SchedaKit key={p.slug} p={p} i={i} />)}
      </div>
    </div>
  );
}
