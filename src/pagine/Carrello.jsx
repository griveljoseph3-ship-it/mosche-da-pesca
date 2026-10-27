import { Link, useNavigate } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { useCarrello } from '../stato/carrello.jsx';
import Passi from '../componenti/Passi.jsx';
import { BarraGratis, RigheCarrello } from '../componenti/PannelloCarrello.jsx';
import { Freccia } from '../componenti/Icone.jsx';

export default function Carrello() {
  const { righe, subtotale, imposta, rimuovi, soglia, costoSpedizione } = useCarrello();
  const naviga = useNavigate();
  const sped = costoSpedizione('standard');
  return (
    <div className="pagina tema-chiaro cassa">
      <div className="contenitore">
        <Passi attuale={1} />
        <h1 className="titolo-1">{t.carrello.titolo}</h1>
        {righe.length === 0 ? (
          <div className="vuoto">
            <p className="titolo-3 corsivo">{t.carrello.vuoto}</p>
            <Link to="/negozio" className="btn btn-scuro">{t.carrello.vuotoCta}</Link>
          </div>
        ) : (
          <div className="cassa-griglia">
            <div>
              <RigheCarrello righe={righe} imposta={imposta} rimuovi={rimuovi} />
              <Link to="/negozio" className="link-freccia">{t.carrello.continua}</Link>
            </div>
            <aside className="riepilogo">
              <BarraGratis subtotale={subtotale} soglia={soglia} />
              <div className="totale-riga"><span>{t.carrello.subtotale}</span><span>{euro(subtotale)}</span></div>
              <div className="totale-riga"><span>{t.carrello.spedizione}</span><span>{sped === 0 ? t.carrello.gratis : euro(sped)}</span></div>
              <div className="totale-riga grande"><span>{t.carrello.totale}</span><strong>{euro(subtotale + sped)}</strong></div>
              <button type="button" className="btn btn-scuro btn-pieno" onClick={() => naviga('/cassa', { viewTransition: true })}>{t.cassa.continua} <Freccia /></button>
              <p className="piccolo tenue">{t.avvisoDemo}</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
