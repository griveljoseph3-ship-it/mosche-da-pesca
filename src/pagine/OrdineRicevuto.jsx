import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { cancellaOrdine } from '../stato/ordine.js';
import { Logo } from '../componenti/Icone.jsx';

export default function OrdineRicevuto() {
  const [o] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('riale-ultimo-ordine') || 'null'); } catch { return null; }
  });
  useEffect(() => cancellaOrdine(), []);
  return (
    <div className="pagina ordine-ricevuto">
      <div className="contenitore stretto centrato">
        <div className="cerchi" aria-hidden="true"><i /><i /><i /><Logo size={56} /></div>
        <p className="occhiello">{t.demo}</p>
        <h1 className="titolo-1">{t.cassa.ricevutoTitolo}</h1>
        {o && <p className="titolo-3 corsivo">Grazie, {o.nome.split(' ')[0]}.</p>}
        <p className="lead">{t.cassa.ricevutoTesto}</p>
        {o && (
          <dl className="ordine-dati">
            <div><dt>{t.cassa.numero}</dt><dd>{o.numero}</dd></div>
            <div><dt>{t.carrello.totale}</dt><dd>{euro(o.totale)} (demo)</dd></div>
          </dl>
        )}
        <Link to="/" className="btn">{t.cassa.tornaFiume}</Link>
      </div>
    </div>
  );
}
