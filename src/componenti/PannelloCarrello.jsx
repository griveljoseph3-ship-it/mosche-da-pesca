import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { useCarrello } from '../stato/carrello.jsx';
import { blocca } from '../lib/scorrimento.js';
import Foto from './Foto.jsx';
import QuantitaInput from './QuantitaInput.jsx';
import { Chiudi, Freccia } from './Icone.jsx';

export function RigheCarrello({ righe, imposta, rimuovi, compatto }) {
  return (
    <ul className={`righe-carrello ${compatto ? 'compatte' : ''}`}>
      {righe.map((r) => (
        <li key={r.chiave} className="riga-carrello">
          <Link to={`/prodotto/${r.slug}`} className="riga-foto" tabIndex={-1} aria-hidden="true">
            <Foto nome={r.prodotto.foto} alt="" sizes="96px" />
          </Link>
          <div className="riga-testo">
            <Link to={`/prodotto/${r.slug}`} className="riga-nome serif">{r.prodotto.nome}</Link>
            <p className="piccolo tenue">
              {t.categorie[r.prodotto.cat]}{r.amo ? ` · amo ${r.amo}` : ''} <span className="badge-demo mini">{t.demo}</span>
            </p>
            <div className="riga-azioni">
              <QuantitaInput piccolo valore={r.qta} onChange={(q) => imposta(r.chiave, q)} etichetta={`${t.prodotto.quantita}: ${r.prodotto.nome}`} />
              <button type="button" className="link-sottile piccolo" onClick={() => rimuovi(r.chiave)}>{t.carrello.rimuovi}<span className="sr"> {r.prodotto.nome}</span></button>
            </div>
          </div>
          <p className="riga-prezzo">{euro(r.totale)}</p>
        </li>
      ))}
    </ul>
  );
}

export function BarraGratis({ subtotale, soglia }) {
  const manca = Math.max(0, soglia - subtotale);
  return (
    <div className="barra-gratis">
      <p className="piccolo">{manca > 0 ? t.carrello.mancanoPerGratis(euro(manca)) : t.carrello.spedizioneGratis}</p>
      <div className="barra" aria-hidden="true"><span style={{ transform: `scaleX(${Math.min(1, subtotale / soglia)})` }} /></div>
    </div>
  );
}

export default function PannelloCarrello() {
  const { righe, subtotale, pezzi, aperto, setAperto, imposta, rimuovi, soglia } = useCarrello();
  const pannello = useRef(null);
  const prima = useRef(null);
  const naviga = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => setAperto(false), [pathname, setAperto]);

  useEffect(() => {
    blocca(aperto);
    if (!aperto) return;
    prima.current = document.activeElement;
    const id = setTimeout(() => pannello.current?.querySelector('button')?.focus(), 60);
    const tasti = (e) => {
      if (e.key === 'Escape') setAperto(false);
      if (e.key !== 'Tab') return;
      const f = pannello.current.querySelectorAll('a[href], button:not([disabled]), input, select');
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    window.addEventListener('keydown', tasti);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', tasti);
      prima.current?.focus?.();
    };
  }, [aperto, setAperto]);

  return (
    <div className={`carrello-velo ${aperto ? 'aperto' : ''}`} aria-hidden={!aperto} inert={!aperto ? true : undefined}>
      <div className="carrello-sfondo" onClick={() => setAperto(false)} />
      <aside ref={pannello} className="carrello-pannello tema-chiaro" role="dialog" aria-modal="true" aria-labelledby="titolo-carrello">
        <div className="carrello-testa">
          <h2 id="titolo-carrello" className="titolo-3">{t.carrello.titolo} <span className="tenue piccolo">({t.carrello.articoli(pezzi)})</span></h2>
          <button type="button" className="btn-icona" onClick={() => setAperto(false)} aria-label={t.nav.chiudi}><Chiudi /></button>
        </div>
        {righe.length === 0 ? (
          <div className="carrello-vuoto">
            <p className="titolo-3 corsivo">{t.carrello.vuoto}</p>
            <Link to="/negozio" className="btn btn-scuro">{t.carrello.vuotoCta}</Link>
          </div>
        ) : (
          <>
            <div className="carrello-corpo">
              <BarraGratis subtotale={subtotale} soglia={soglia} />
              <RigheCarrello righe={righe} imposta={imposta} rimuovi={rimuovi} compatto />
            </div>
            <div className="carrello-piede">
              <div className="totale-riga"><span>{t.carrello.subtotale}</span><strong>{euro(subtotale)}</strong></div>
              <button type="button" className="btn btn-scuro btn-pieno" onClick={() => naviga('/carrello', { viewTransition: true })}>
                {t.carrello.procedi} <Freccia />
              </button>
              <p className="piccolo tenue centrato">{t.avvisoDemo}</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
