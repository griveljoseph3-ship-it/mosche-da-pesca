import { useState } from 'react';
import { testi as t } from '../i18n/index.js';
import Foto from '../componenti/Foto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import { Spunta } from '../componenti/Icone.jsx';

export default function Contatti() {
  const [inviato, setInviato] = useState(false);
  const [errori, setErrori] = useState({});
  const invia = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const err = {};
    if (!d.get('nome')?.trim()) err.nome = t.cassa.obbligatorio;
    if (!/^\S+@\S+\.\S+$/.test(d.get('email') || '')) err.email = t.cassa.emailNonValida;
    if (!d.get('messaggio')?.trim()) err.messaggio = t.cassa.obbligatorio;
    setErrori(err);
    if (Object.keys(err).length) {
      e.currentTarget.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setInviato(true); // modulo finto: non invia nulla
  };
  return (
    <div className="pagina tema-chiaro contatti">
      <div className="contenitore contatti-griglia">
        <div>
          <header className="pagina-intesta">
            <Rivela>
              <p className="occhiello">Riale</p>
              <h1 className="titolo-1">{t.contatti.titolo}</h1>
              <p className="lead">{t.contatti.intro}</p>
            </Rivela>
          </header>
          {inviato ? (
            <div className="conferma-box" role="status">
              <Spunta size={28} />
              <p className="titolo-3">{t.contatti.inviato}</p>
            </div>
          ) : (
            <form className="modulo" onSubmit={invia} noValidate>
              <p className="avviso piccolo">{t.contatti.avvisoForm}</p>
              <div className="campo">
                <label htmlFor="c-nome">{t.contatti.nome}</label>
                <input id="c-nome" name="nome" autoComplete="name" aria-invalid={!!errori.nome} aria-describedby={errori.nome ? 'e-nome' : undefined} />
                {errori.nome && <p id="e-nome" className="errore">{errori.nome}</p>}
              </div>
              <div className="campo">
                <label htmlFor="c-email">{t.contatti.email}</label>
                <input id="c-email" name="email" type="email" autoComplete="email" aria-invalid={!!errori.email} aria-describedby={errori.email ? 'e-email' : undefined} />
                {errori.email && <p id="e-email" className="errore">{errori.email}</p>}
              </div>
              <div className="campo">
                <label htmlFor="c-arg">{t.contatti.argomento}</label>
                <select id="c-arg" name="argomento">{t.contatti.argomenti.map((a) => <option key={a}>{a}</option>)}</select>
              </div>
              <div className="campo">
                <label htmlFor="c-msg">{t.contatti.messaggio}</label>
                <textarea id="c-msg" name="messaggio" aria-invalid={!!errori.messaggio} aria-describedby={errori.messaggio ? 'e-msg' : undefined} />
                {errori.messaggio && <p id="e-msg" className="errore">{errori.messaggio}</p>}
              </div>
              <button type="submit" className="btn btn-scuro">{t.contatti.invia}</button>
            </form>
          )}
        </div>
        <aside className="contatti-lato">
          <Foto nome="fiumi-ambientazioni/torrente-graubuenden" alt="Un piccolo torrente di montagna tra prati e sassi" sizes="(min-width: 900px) 40vw, 100vw" />
          <div className="contatti-info">
            <div>
              <p className="occhiello">{t.contatti.bottega}</p>
              <p>Riale — bottega dimostrativa<br />Via del Torrente 1, Valle (indirizzo di esempio)</p>
              <p>ciao@riale.example</p>
            </div>
            <div>
              <p className="occhiello">{t.contatti.orari}</p>
              <p>Martedì – sabato, 9:00 – 12:30 e 15:00 – 19:00<br />All’alba siamo al fiume.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
