import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { insetti } from '../data/schiuse.js';
import { perSlug } from '../data/catalogo.js';
import Rivela from '../componenti/Rivela.jsx';
import SchedaProdotto from '../componenti/SchedaProdotto.jsx';
import Foto from '../componenti/Foto.jsx';
import { Freccia, Indietro } from '../componenti/Icone.jsx';

export default function Calendario() {
  const [mese, setMese] = useState(() => new Date().getMonth());
  const linea = useRef(null);
  const attivi = useMemo(() => insetti.filter((x) => x.mesi[mese] > 0).sort((a, b) => b.mesi[mese] - a.mesi[mese]), [mese]);
  const consigliate = useMemo(() => {
    const punteggio = {};
    attivi.forEach((x) => x.mosche.forEach((s, i) => { punteggio[s] = (punteggio[s] || 0) + x.mesi[mese] * 3 - i; }));
    return Object.entries(punteggio).sort((a, b) => b[1] - a[1]).map(([s]) => perSlug[s]).filter(Boolean).slice(0, 4);
  }, [attivi, mese]);

  const tasti = (e) => {
    if (e.key === 'ArrowRight') { setMese((m) => (m + 1) % 12); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { setMese((m) => (m + 11) % 12); e.preventDefault(); }
    requestAnimationFrame(() => linea.current?.querySelector('[aria-selected="true"]')?.focus());
  };

  return (
    <div className="pagina calendario">
      <header className="cal-testa">
        <Foto nome="fiumi-ambientazioni/effimera-adulta" alt="Un’effimera adulta posata su un filo d’erba" className="cal-foto" sizes="100vw" priorita />
        <div className="contenitore pagina-intesta">
          <Rivela>
            <p className="occhiello">Gennaio — Dicembre</p>
            <h1 className="titolo-1">{t.calendario.titolo}</h1>
            <p className="lead">{t.calendario.intro}</p>
          </Rivela>
        </div>
      </header>

      <section className="contenitore cal-corpo" aria-label={t.calendario.titolo}>
        <div className="cal-linea" role="tablist" aria-label="Mesi" ref={linea} onKeyDown={tasti}>
          {t.calendario.mesi.map((m, i) => {
            const forza = insetti.reduce((s, x) => s + x.mesi[i], 0);
            return (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={i === mese}
                tabIndex={i === mese ? 0 : -1}
                aria-controls="cal-pannello"
                className={`cal-mese ${i === mese ? 'on' : ''}`}
                onClick={() => setMese(i)}
                style={{ '--forza': forza / 16 }}
              >
                <span className="cal-mese-barra" aria-hidden="true" />
                <span className="cal-mese-nome"><span className="solo-desktop">{m}</span><span className="solo-mobile">{t.calendario.mesiBrevi[i]}</span></span>
              </button>
            );
          })}
        </div>

        <div className="cal-griglia-insetti" aria-hidden="true">
          {insetti.map((x) => (
            <div key={x.id} className="cal-riga">
              <span className="cal-riga-nome">{x.nome}</span>
              <span className="cal-riga-barre">
                {x.mesi.map((v, i) => (
                  <i key={i} style={{ '--v': v, '--c': x.colore }} className={i === mese ? 'on' : ''} onClick={() => setMese(i)} />
                ))}
              </span>
            </div>
          ))}
        </div>

        <div id="cal-pannello" role="tabpanel" className="cal-pannello" aria-live="polite">
          <div className="cal-pannello-testa">
            <button type="button" className="btn-icona" onClick={() => setMese((m) => (m + 11) % 12)} aria-label={t.calendario.precedente}><Indietro /></button>
            <h2 className="titolo-2 corsivo">{t.calendario.mesi[mese]}</h2>
            <button type="button" className="btn-icona" onClick={() => setMese((m) => (m + 1) % 12)} aria-label={t.calendario.successivo}><Freccia /></button>
          </div>
          <div className="cal-pannello-griglia">
            <div>
              <h3 className="occhiello">{t.calendario.attivi}</h3>
              <ul className="cal-insetti">
                {attivi.map((x) => (
                  <li key={x.id} style={{ '--c': x.colore }}>
                    <p className="titolo-3">{x.nome}</p>
                    <p className="piccolo cal-gruppo">{x.gruppo} · <strong>{t.calendario.intensita[x.mesi[mese]]}</strong></p>
                    <p className="tenue">{x.nota}</p>
                    <p className="piccolo cal-link">
                      {x.mosche.map((s) => perSlug[s] && (
                        <Link key={s} to={`/prodotto/${s}`} className="link-sottile">{perSlug[s].nome}</Link>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="occhiello">{t.calendario.consigliate}</h3>
              <div className="griglia-prodotti due">
                {consigliate.map((p) => <SchedaProdotto key={p.slug} p={p} scura sizes="(min-width: 960px) 18vw, 46vw" />)}
              </div>
            </div>
          </div>
          <p className="piccolo tenue cal-nota">{t.calendario.nota}</p>
        </div>
      </section>
    </div>
  );
}
