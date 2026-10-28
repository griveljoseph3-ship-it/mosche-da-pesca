import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, useParams, useSearchParams } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { ACQUE, AMI, CAT_DA_SLUG, CATEGORIE, eMosca, PESCI, prodotti, SLUG_CAT, STAGIONI, urlCategoria } from '../data/catalogo.js';
import SchedaProdotto from '../componenti/SchedaProdotto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import { Chiudi, Filtri, Freccia } from '../componenti/Icone.jsx';
import { blocca } from '../lib/scorrimento.js';

const GRUPPI = [
  { chiave: 'amo', titolo: t.negozio.amo, valori: AMI.map(String), etichetta: (v) => `#${v}`, campo: (p) => (p.ami || []).map(String), soloMosche: true },
  { chiave: 'stagione', titolo: t.negozio.stagione, valori: STAGIONI, etichetta: (v) => t.stagioni[v], campo: (p) => p.stagioni || [] },
  { chiave: 'pesce', titolo: t.negozio.pesce, valori: PESCI, etichetta: (v) => t.pesci[v], campo: (p) => p.pesci || [] },
  { chiave: 'acqua', titolo: t.negozio.acqua, valori: ACQUE, etichetta: (v) => t.acque[v], campo: (p) => p.acque || [] },
];
const leggi = (sp, k) => (sp.get(k) || '').split(',').filter(Boolean);

// Barra dei tipi: sempre visibile in cima al negozio
function BarraTipi() {
  return (
    <nav className="barra-tipi" aria-label={t.negozio.tipiDiMosca}>
      <div className="contenitore barra-tipi-riga">
        <NavLink to="/negozio" end className="tipo-voce">{t.negozio.tuttoIlNegozio}</NavLink>
        {CATEGORIE.map((c) => (
          <NavLink key={c} to={urlCategoria(c)} className="tipo-voce">
            {t.categoriePlurale[c]} <span className="tipo-conta">{prodotti.filter((p) => p.cat === c).length}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// /negozio: tutto il catalogo, diviso per tipo
function Panoramica() {
  return (
    <div className="pagina tema-chiaro negozio">
      <header className="contenitore pagina-intesta">
        <Rivela>
          <p className="occhiello">Riale · {t.negozio.titolo}</p>
          <h1 className="titolo-1">{t.negozio.titolo}</h1>
          <p className="lead">{t.negozio.intro}</p>
        </Rivela>
      </header>
      <BarraTipi />
      <div className="contenitore negozio-sezioni">
        {CATEGORIE.map((c) => {
          const lista = prodotti.filter((p) => p.cat === c);
          return (
            <section key={c} className="negozio-sezione" aria-labelledby={`sez-${c}`} id={SLUG_CAT[c]}>
              <div className="sezione-testa">
                <div>
                  <h2 id={`sez-${c}`} className="titolo-2">{t.categoriePlurale[c]}</h2>
                  <p className="tenue">{t.descrizioniCategorie[c]}</p>
                </div>
                <Link to={urlCategoria(c)} className="link-freccia" viewTransition>
                  {t.negozio.tutte} ({lista.length}) <Freccia />
                </Link>
              </div>
              <div className="griglia-prodotti quattro">
                {lista.slice(0, 4).map((p, i) => <SchedaProdotto key={p.slug} p={p} priorita={c === 'secca' && i < 4} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// /negozio/:tipo: un solo tipo, con i filtri
function Categoria({ cat }) {
  const [sp, setSp] = useSearchParams();
  const [ordine, setOrdine] = useState('consigliati');
  const [pannello, setPannello] = useState(false);
  const gruppi = GRUPPI.filter((g) => !g.soloMosche || eMosca({ cat }));
  const delTipo = useMemo(() => prodotti.filter((p) => p.cat === cat), [cat]);
  const amiDelTipo = useMemo(() => new Set(delTipo.flatMap((p) => (p.ami || []).map(String))), [delTipo]);

  const scelti = useMemo(() => Object.fromEntries(gruppi.map((g) => [g.chiave, leggi(sp, g.chiave)])), [sp, cat]); // eslint-disable-line react-hooks/exhaustive-deps
  const attivi = Object.values(scelti).reduce((s, a) => s + a.length, 0);

  const lista = useMemo(() => {
    let l = delTipo.filter((p) => gruppi.every((g) => !scelti[g.chiave].length || g.campo(p).some((v) => scelti[g.chiave].includes(v))));
    if (ordine === 'prezzoAsc') l = [...l].sort((a, b) => a.prezzo - b.prezzo);
    if (ordine === 'prezzoDesc') l = [...l].sort((a, b) => b.prezzo - a.prezzo);
    if (ordine === 'nome') l = [...l].sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
    return l;
  }, [delTipo, scelti, ordine]); // eslint-disable-line react-hooks/exhaustive-deps

  const cambia = (k, v) => {
    const cur = new Set(scelti[k]);
    cur.has(v) ? cur.delete(v) : cur.add(v);
    const n = new URLSearchParams(sp);
    if (cur.size) n.set(k, [...cur].join(','));
    else n.delete(k);
    setSp(n, { replace: true, preventScrollReset: true });
  };
  const azzera = () => setSp(new URLSearchParams(), { replace: true, preventScrollReset: true });

  useEffect(() => {
    if (!pannello) return;
    blocca(true);
    const esc = (e) => e.key === 'Escape' && setPannello(false);
    window.addEventListener('keydown', esc);
    return () => { blocca(false); window.removeEventListener('keydown', esc); };
  }, [pannello]);

  return (
    <div className="pagina tema-chiaro negozio">
      <header className="contenitore pagina-intesta">
        <Rivela>
          <p className="occhiello"><Link to="/negozio" className="link-sottile">{t.negozio.titolo}</Link> · {t.categorie[cat]}</p>
          <h1 className="titolo-1">{t.categoriePlurale[cat]}</h1>
          <p className="lead">{t.descrizioniCategorie[cat]}</p>
        </Rivela>
      </header>
      <BarraTipi />

      <div className="contenitore negozio-corpo">
        <aside className={`filtri ${pannello ? 'aperti' : ''}`} aria-label={t.negozio.filtri}>
          <div className="filtri-testa">
            <h2 className="occhiello">{t.negozio.filtri}</h2>
            <button type="button" className="btn-icona solo-mobile" onClick={() => setPannello(false)} aria-label={t.nav.chiudi}><Chiudi /></button>
          </div>
          {gruppi.map((g) => (
            <fieldset key={g.chiave} className={`filtro filtro-${g.chiave}`}>
              <legend>{g.titolo}</legend>
              <div className="chips">
                {g.valori.filter((v) => g.chiave !== 'amo' || amiDelTipo.has(v)).map((v) => {
                  const on = scelti[g.chiave].includes(v);
                  return (
                    <button key={v} type="button" className={`chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => cambia(g.chiave, v)}>
                      {g.etichetta(v)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="filtri-piede">
            <button type="button" className="link-sottile piccolo" onClick={azzera} disabled={!attivi}>{t.negozio.azzera}</button>
            <button type="button" className="btn btn-scuro solo-mobile" onClick={() => setPannello(false)}>{t.negozio.applica} ({lista.length})</button>
          </div>
        </aside>

        <section className="negozio-risultati" aria-label={t.categoriePlurale[cat]}>
          <div className="barra-risultati">
            <button type="button" className="btn btn-contorno solo-mobile btn-filtri" onClick={() => setPannello(true)} aria-expanded={pannello}>
              <Filtri /> {t.negozio.mostraFiltri}{attivi ? ` (${attivi})` : ''}
            </button>
            <p className="piccolo tenue" aria-live="polite">{t.negozio.risultati(lista.length)}</p>
            <label className="ordina">
              <span className="sr">{t.negozio.ordina}</span>
              <select value={ordine} onChange={(e) => setOrdine(e.target.value)}>
                {Object.entries(t.negozio.ordinamenti).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          {lista.length === 0 ? (
            <div className="vuoto">
              <p className="titolo-3 corsivo">{t.negozio.nessuno}</p>
              <button type="button" className="btn btn-scuro" onClick={azzera}>{t.negozio.azzera}</button>
            </div>
          ) : (
            <div className="griglia-prodotti">
              {lista.map((p, i) => <SchedaProdotto key={p.slug} p={p} priorita={i < 3} />)}
            </div>
          )}
        </section>
      </div>
      {pannello && <div className="filtri-velo" onClick={() => setPannello(false)} aria-hidden="true" />}
    </div>
  );
}

export default function Negozio() {
  const { tipo } = useParams();
  const [sp] = useSearchParams();
  // vecchi link ?tipo=secca -> /negozio/secche
  const vecchio = sp.get('tipo');
  if (!tipo && vecchio && SLUG_CAT[vecchio.split(',')[0]]) return <Navigate to={urlCategoria(vecchio.split(',')[0])} replace />;
  if (!tipo) return <Panoramica />;
  const cat = CAT_DA_SLUG[tipo];
  if (!cat) return <Navigate to="/negozio" replace />;
  return <Categoria key={cat} cat={cat} />;
}
