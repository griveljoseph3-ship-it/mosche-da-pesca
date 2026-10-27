import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { useCarrello } from '../stato/carrello.jsx';
import { leggiOrdine, salvaOrdine } from '../stato/ordine.js';
import Passi from '../componenti/Passi.jsx';
import Riepilogo from '../componenti/Riepilogo.jsx';
import { Freccia, Indietro } from '../componenti/Icone.jsx';

const CAMPI = [
  ['nome', t.cassa.nome, 'name', 'text'],
  ['email', t.cassa.email, 'email', 'email'],
  ['indirizzo', t.cassa.indirizzo, 'street-address', 'text'],
  ['cap', t.cassa.cap, 'postal-code', 'text'],
  ['citta', t.cassa.citta, 'address-level2', 'text'],
  ['telefono', t.cassa.telefono, 'tel', 'tel'],
];

export default function Cassa() {
  const { righe, subtotale, costoSpedizione } = useCarrello();
  const naviga = useNavigate();
  const [d, setD] = useState(() => ({ metodo: 'standard', ...leggiOrdine() }));
  const [errori, setErrori] = useState({});

  useEffect(() => { if (!righe.length) naviga('/carrello', { replace: true }); }, [righe.length, naviga]);

  const campo = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  const avanti = (e) => {
    e.preventDefault();
    const err = {};
    ['nome', 'indirizzo', 'citta'].forEach((k) => { if (!d[k]?.trim()) err[k] = t.cassa.obbligatorio; });
    if (!/^\S+@\S+\.\S+$/.test(d.email || '')) err.email = t.cassa.emailNonValida;
    if (!/^\d{5}$/.test(d.cap || '')) err.cap = t.cassa.capNonValido;
    setErrori(err);
    if (Object.keys(err).length) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    salvaOrdine(d);
    naviga('/cassa/conferma', { viewTransition: true });
  };

  return (
    <div className="pagina tema-chiaro cassa">
      <div className="contenitore">
        <Passi attuale={2} />
        <h1 className="titolo-1">{t.cassa.datiTitolo}</h1>
        <div className="cassa-griglia">
          <form className="modulo" onSubmit={avanti} noValidate>
            <div className="modulo-griglia">
              {CAMPI.map(([k, label, ac, type]) => (
                <div key={k} className={`campo campo-${k}`}>
                  <label htmlFor={`f-${k}`}>{label}</label>
                  <input
                    id={`f-${k}`}
                    name={k}
                    type={type}
                    autoComplete={ac}
                    inputMode={k === 'cap' ? 'numeric' : undefined}
                    value={d[k] || ''}
                    onChange={campo(k)}
                    aria-invalid={!!errori[k]}
                    aria-describedby={errori[k] ? `e-${k}` : undefined}
                    required={k !== 'telefono'}
                  />
                  {errori[k] && <p id={`e-${k}`} className="errore">{errori[k]}</p>}
                </div>
              ))}
            </div>
            <fieldset className="metodi">
              <legend>{t.cassa.metodo}</legend>
              {[['standard', t.cassa.standard], ['espressa', t.cassa.espressa]].map(([v, l]) => {
                const c = v === 'espressa' ? 9.9 : costoSpedizione('standard');
                return (
                  <label key={v} className={`metodo ${d.metodo === v ? 'on' : ''}`}>
                    <input type="radio" name="metodo" value={v} checked={d.metodo === v} onChange={campo('metodo')} />
                    <span>{l}</span>
                    <strong>{c === 0 ? t.carrello.gratis : euro(c)}</strong>
                  </label>
                );
              })}
            </fieldset>
            <div className="modulo-azioni">
              <Link to="/carrello" className="link-freccia"><Indietro /> {t.cassa.indietro}</Link>
              <button type="submit" className="btn btn-scuro">{t.cassa.continua} <Freccia /></button>
            </div>
          </form>
          <Riepilogo righe={righe} subtotale={subtotale} spedizione={costoSpedizione(d.metodo)} />
        </div>
      </div>
    </div>
  );
}
