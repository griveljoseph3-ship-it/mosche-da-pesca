import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { useCarrello } from '../stato/carrello.jsx';
import { leggiOrdine } from '../stato/ordine.js';
import Passi from '../componenti/Passi.jsx';
import Riepilogo from '../componenti/Riepilogo.jsx';
import { Indietro } from '../componenti/Icone.jsx';

export default function Conferma() {
  const { righe, subtotale, costoSpedizione, svuota } = useCarrello();
  const naviga = useNavigate();
  const [d] = useState(leggiOrdine);
  const [invio, setInvio] = useState(false);

  useEffect(() => {
    if (!righe.length && !invio) naviga('/carrello', { replace: true });
    else if (!d.nome) naviga('/cassa', { replace: true });
  }, [righe.length, d.nome, naviga, invio]);

  const conferma = () => {
    setInvio(true);
    const numero = `RIALE-DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const totale = subtotale + costoSpedizione(d.metodo);
    sessionStorage.setItem('riale-ultimo-ordine', JSON.stringify({ numero, totale, nome: d.nome, email: d.email }));
    setTimeout(() => {
      svuota();
      naviga('/ordine-ricevuto', { replace: true, viewTransition: true });
    }, 900);
  };

  return (
    <div className="pagina tema-chiaro cassa">
      <div className="contenitore">
        <Passi attuale={3} />
        <h1 className="titolo-1">{t.cassa.confermaTitolo}</h1>
        <div className="cassa-griglia">
          <div className="conferma-dati">
            <section>
              <div className="conferma-riga">
                <h2 className="occhiello">{t.cassa.spedireA}</h2>
                <Link to="/cassa" className="link-sottile piccolo">{t.cassa.modifica}</Link>
              </div>
              <p>{d.nome}<br />{d.indirizzo}<br />{d.cap} {d.citta}<br />{d.email}</p>
              <p className="piccolo">{d.metodo === 'espressa' ? t.cassa.espressa : t.cassa.standard}</p>
            </section>
            <section className="pagamento-demo">
              <h2 className="occhiello">Pagamento</h2>
              <p>{t.cassa.pagamentoDemo}</p>
            </section>
            <div className="modulo-azioni">
              <Link to="/cassa" className="link-freccia"><Indietro /> {t.cassa.indietro}</Link>
              <button type="button" className="btn btn-scuro" onClick={conferma} disabled={invio} aria-busy={invio}>
                {invio ? '…' : `${t.cassa.conferma} · ${euro(subtotale + costoSpedizione(d.metodo))}`}
              </button>
            </div>
          </div>
          <Riepilogo righe={righe} subtotale={subtotale} spedizione={costoSpedizione(d.metodo)} />
        </div>
      </div>
    </div>
  );
}
