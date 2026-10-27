import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { correlati, eMosca, perSlug } from '../data/catalogo.js';
import { useCarrello } from '../stato/carrello.jsx';
import { haWebGL, movimentoRidotto } from '../lib/qualita.js';
import Foto from '../componenti/Foto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import SchedaProdotto, { amoPredefinito } from '../componenti/SchedaProdotto.jsx';
import QuantitaInput from '../componenti/QuantitaInput.jsx';
import ScatolaRegalo from '../componenti/ScatolaRegalo.jsx';
import { Cubo, Foto as IconaFoto, Indietro, Spunta } from '../componenti/Icone.jsx';
import NonTrovata from './NonTrovata.jsx';

const Visore3D = lazy(() => import('../tre/Visore3D.jsx'));

// Foto macro con profondità: lo sfondo sfocato e la mosca si muovono a velocità diverse.
function FotoProfonda({ p }) {
  const ref = useRef(null);
  const muovi = (e) => {
    const el = ref.current;
    if (!el || movimentoRidotto()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--px', x.toFixed(3));
    el.style.setProperty('--py', y.toFixed(3));
  };
  const esci = () => {
    ref.current?.style.setProperty('--px', 0);
    ref.current?.style.setProperty('--py', 0);
  };
  return (
    <div className="foto-profonda" ref={ref} onPointerMove={muovi} onPointerLeave={esci}>
      <Foto nome={p.foto} alt="" className="fp-sfondo" sizes="40vw" aria-hidden="true" />
      <div className="fp-primo">
        <Foto nome={p.foto} alt={`${p.nome}, ${t.categorie[p.cat].toLowerCase()} in macro`} sizes="(min-width: 960px) 52vw, 100vw" priorita />
      </div>
      <span className="fp-luce" aria-hidden="true" />
    </div>
  );
}

export default function Prodotto() {
  const { slug } = useParams();
  const p = perSlug[slug];
  const { aggiungi } = useCarrello();
  const mosca = p && eMosca(p);
  const [vista, setVista] = useState('foto');
  const [amo, setAmo] = useState(() => (p ? amoPredefinito(p) : null));
  const [qta, setQta] = useState(1);
  const [fatto, setFatto] = useState(false);
  const webgl = useMemo(() => typeof window !== 'undefined' && haWebGL(), []);

  useEffect(() => {
    setVista(p?.render && webgl ? '3d' : 'foto');
    setAmo(p ? amoPredefinito(p) : null);
    setQta(1);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return <NonTrovata testo={t.prodotto.nonTrovato} />;

  const compra = () => {
    aggiungi(p.slug, { amo: mosca ? amo : null, qta });
    setFatto(true);
    setTimeout(() => setFatto(false), 1800);
  };

  const attr = [
    [t.prodotto.stagioni, (p.stagioni || []).map((s) => t.stagioni[s]).join(', ')],
    [t.prodotto.pesci, (p.pesci || []).map((s) => t.pesci[s]).join(', ')],
    [t.prodotto.acque, (p.acque || []).map((s) => t.acque[s]).join(', ')],
  ];

  return (
    <div className="pagina tema-chiaro prodotto">
      <div className="contenitore">
        <nav className="briciole piccolo" aria-label="Percorso">
          <Link to="/negozio" className="link-sottile" viewTransition><Indietro size={14} /> {t.prodotto.torna}</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/negozio?tipo=${p.cat}`} className="tenue">{t.categoriePlurale[p.cat]}</Link>
        </nav>
        <div className="prodotto-griglia">
          <div className="galleria">
            <div className={`galleria-palco vista-${vista}`}>
              {vista === 'foto' && (p.cat === 'kit' ? <div className="galleria-scatola"><ScatolaRegalo prodotto={p} automatica /></div> : <FotoProfonda p={p} />)}
              {vista === '3d' && (
                <Suspense fallback={<div className="visore-attesa"><span className="attesa-onda" /> {t.prodotto.caricamento3d}</div>}>
                  <Visore3D p={p} />
                </Suspense>
              )}
              <span className="badge-demo galleria-badge">{t.demo}</span>
              {p.render && vista === 'foto' && <span className="galleria-nota piccolo">{t.prodotto.render}</span>}
            </div>
            {(mosca || p.cat === 'kit') && (
              <div className="galleria-schede" role="tablist" aria-label="Viste del prodotto">
                <button type="button" role="tab" aria-selected={vista === 'foto'} className={vista === 'foto' ? 'on' : ''} onClick={() => setVista('foto')}>
                  {p.cat === 'kit' ? <><Cubo /> {t.prodotto.apri}</> : <><IconaFoto /> {t.prodotto.foto}</>}
                </button>
                {mosca && webgl && (
                  <button type="button" role="tab" aria-selected={vista === '3d'} className={vista === '3d' ? 'on' : ''} onClick={() => setVista('3d')}>
                    <Cubo /> {t.prodotto.vista3d}
                  </button>
                )}
                <p className="piccolo tenue galleria-aiuto">{vista === '3d' ? t.prodotto.istruzioni3d : mosca ? t.prodotto.istruzioniFoto : ''}</p>
              </div>
            )}
          </div>

          <div className="scheda-info">
            <Rivela>
              <p className="occhiello">{t.categorie[p.cat]} <span className="badge-demo">{t.demo}</span></p>
              <h1 className="titolo-1 prodotto-nome">{p.nome}</h1>
              <p className="prodotto-prezzo serif">
                {euro(p.prezzo)} {mosca && <span className="piccolo tenue">{t.prodotto.alPezzo}</span>}
              </p>
              <p className="lead">{p.breve}</p>
            </Rivela>

            <div className="acquisto">
              {mosca && (
                <fieldset className="scelta-amo">
                  <legend>{t.prodotto.misura}</legend>
                  <div className="chips">
                    {p.ami.map((a) => (
                      <label key={a} className={`chip ${amo === a ? 'on' : ''}`}>
                        <input type="radio" name="amo" value={a} checked={amo === a} onChange={() => setAmo(a)} className="sr" />
                        #{a}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="acquisto-riga">
                <QuantitaInput valore={qta} onChange={(q) => setQta(Math.max(1, Math.min(99, q)))} />
                <button type="button" className="btn btn-scuro acquisto-btn" onClick={compra}>
                  {fatto ? <><Spunta /> {t.prodotto.aggiunto}</> : <>{t.prodotto.aggiungi} · {euro(p.prezzo * qta)}</>}
                </button>
              </div>
              <p className="piccolo tenue disponibile"><span className="pallino" aria-hidden="true" /> {t.prodotto.disponibile}</p>
            </div>

            <div className="dettagli">
              <h2 className="occhiello">{t.prodotto.dettagli}</h2>
              <p>{p.descrizione}</p>
              {(p.ricetta || p.contenuto) && (
                <>
                  <h3 className="titolo-3">{p.contenuto ? t.prodotto.contenuto : mosca ? t.prodotto.ricetta : 'Scheda tecnica'}</h3>
                  <ul className="ricetta">
                    {(p.contenuto || p.ricetta).map((r) => <li key={r}>{r}</li>)}
                  </ul>
                </>
              )}
              <h3 className="titolo-3">{t.prodotto.quando}</h3>
              <p>{p.quando}</p>
              <dl className="attributi">
                {attr.map(([k, v]) => v && (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="barra-acquisto-mobile" aria-hidden="false">
        <div>
          <p className="serif">{p.nome}</p>
          <p className="piccolo tenue">{mosca ? `Amo #${amo} · ` : ''}{euro(p.prezzo * qta)}</p>
        </div>
        <button type="button" className="btn btn-scuro" onClick={compra}>{fatto ? t.prodotto.aggiunto : t.prodotto.aggiungi}</button>
      </div>

      <section className="contenitore sezione correlati" aria-labelledby="tit-correlati">
        <h2 id="tit-correlati" className="titolo-2">{t.prodotto.consigliati}</h2>
        <div className="griglia-prodotti quattro">
          {correlati(p).map((q) => <SchedaProdotto key={q.slug} p={q} />)}
        </div>
      </section>
    </div>
  );
}
