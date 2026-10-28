import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { euro, testi as t } from '../i18n/index.js';
import { correlati, eMosca, perSlug, urlCategoria } from '../data/catalogo.js';
import { useCarrello } from '../stato/carrello.jsx';
import { movimentoRidotto, url } from '../lib/qualita.js';
import Foto, { infoFoto } from '../componenti/Foto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import SchedaProdotto, { amoPredefinito } from '../componenti/SchedaProdotto.jsx';
import QuantitaInput from '../componenti/QuantitaInput.jsx';
import { Indietro, Lente, Spunta } from '../componenti/Icone.jsx';
import NonTrovata from './NonTrovata.jsx';

// Foto macro: al clic o al tocco l'ingrandimento segue il puntatore (o il dito)
// per vedere piume, filo e amo da vicino.
function FotoMacro({ p }) {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(false);
  const info = infoFoto(p.foto);
  const grande = url(`img/${p.foto}-${info ? info.sizes[info.sizes.length - 1] : 960}.webp`);
  const sposta = (x, y) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--px', (x - 0.5).toFixed(3));
    el.style.setProperty('--py', (y - 0.5).toFixed(3));
    el.style.setProperty('--zx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--zy', `${(y * 100).toFixed(1)}%`);
  };
  const muovi = (e) => {
    const r = ref.current.getBoundingClientRect();
    sposta(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  const esci = () => { if (!zoom) sposta(0.5, 0.5); };
  const tasti = (e) => {
    if (!zoom) return;
    const el = ref.current;
    const x = parseFloat(el.style.getPropertyValue('--zx') || '50') / 100;
    const y = parseFloat(el.style.getPropertyValue('--zy') || '50') / 100;
    const d = 0.08;
    const mappa = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
    if (mappa[e.key]) { e.preventDefault(); sposta(Math.min(1, Math.max(0, x + mappa[e.key][0])), Math.min(1, Math.max(0, y + mappa[e.key][1]))); }
    if (e.key === 'Escape') setZoom(false);
  };
  return (
    <div
      className={`foto-macro ${zoom ? 'zoom' : ''} ${movimentoRidotto() ? 'fermo' : ''}`}
      ref={ref}
      onPointerMove={muovi}
      onPointerDown={muovi}
      onPointerLeave={esci}
      style={{ '--grande': `url(${grande})` }}
    >
      <div className="fm-primo" onClick={() => setZoom((z) => !z)}>
        <Foto nome={p.foto} alt={`${p.nome}, ${t.categorie[p.cat].toLowerCase()}: foto macro`} sizes="(min-width: 960px) 52vw, 100vw" priorita />
        <span className="fm-lente" aria-hidden="true" />
      </div>
      <button type="button" className="fm-btn" onClick={() => setZoom((z) => !z)} onKeyDown={tasti} aria-pressed={zoom}>
        <Lente size={16} /> {zoom ? t.prodotto.zoomEsci : t.prodotto.zoom}
      </button>
    </div>
  );
}

export default function Prodotto() {
  const { slug } = useParams();
  const p = perSlug[slug];
  const { aggiungi } = useCarrello();
  const mosca = p && eMosca(p);
  const [amo, setAmo] = useState(() => (p ? amoPredefinito(p) : null));
  const [qta, setQta] = useState(1);
  const [fatto, setFatto] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    setAmo(p ? amoPredefinito(p) : null);
    setQta(1);
    setFatto(false);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!p) return <NonTrovata testo={t.prodotto.nonTrovato} />;

  const compra = () => {
    aggiungi(p.slug, { amo: mosca ? amo : null, qta });
    setFatto(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFatto(false), 1800);
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
          <Link to={urlCategoria(p.cat)} className="tenue">{t.categoriePlurale[p.cat]}</Link>
        </nav>
        <div className="prodotto-griglia">
          <div className="galleria">
            <div className="galleria-palco">
              <FotoMacro p={p} />
              <span className="badge-demo galleria-badge">{t.demo}</span>
            </div>
            <div className="galleria-schede">
              <p className="piccolo tenue galleria-aiuto">{t.prodotto.istruzioniFoto}</p>
            </div>
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
