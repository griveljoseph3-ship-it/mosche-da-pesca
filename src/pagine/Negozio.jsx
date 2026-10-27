import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { ACQUE, AMI, CATEGORIE, PESCI, prodotti, STAGIONI } from '../data/catalogo.js';
import SchedaProdotto from '../componenti/SchedaProdotto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import { Chiudi, Filtri } from '../componenti/Icone.jsx';
import { blocca } from '../lib/scorrimento.js';

const GRUPPI = [
  { chiave: 'tipo', titolo: t.negozio.tipo, valori: CATEGORIE, etichetta: (v) => t.categoriePlurale[v], campo: (p) => [p.cat] },
  { chiave: 'amo', titolo: t.negozio.amo, valori: AMI.map(String), etichetta: (v) => `#${v}`, campo: (p) => (p.ami || []).map(String) },
  { chiave: 'stagione', titolo: t.negozio.stagione, valori: STAGIONI, etichetta: (v) => t.stagioni[v], campo: (p) => p.stagioni || [] },
  { chiave: 'pesce', titolo: t.negozio.pesce, valori: PESCI, etichetta: (v) => t.pesci[v], campo: (p) => p.pesci || [] },
  { chiave: 'acqua', titolo: t.negozio.acqua, valori: ACQUE, etichetta: (v) => t.acque[v], campo: (p) => p.acque || [] },
];

const leggi = (sp, k) => (sp.get(k) || '').split(',').filter(Boolean);

export default function Negozio() {
  const [sp, setSp] = useSearchParams();
  const [ordine, setOrdine] = useState('consigliati');
  const [pannello, setPannello] = useState(false);

  const scelti = useMemo(() => Object.fromEntries(GRUPPI.map((g) => [g.chiave, leggi(sp, g.chiave)])), [sp]);
  const attivi = Object.values(scelti).reduce((s, a) => s + a.length, 0);

  const lista = useMemo(() => {
    let l = prodotti.filter((p) => GRUPPI.every((g) => !scelti[g.chiave].length || g.campo(p).some((v) => scelti[g.chiave].includes(v))));
    if (ordine === 'prezzoAsc') l = [...l].sort((a, b) => a.prezzo - b.prezzo);
    if (ordine === 'prezzoDesc') l = [...l].sort((a, b) => b.prezzo - a.prezzo);
    if (ordine === 'nome') l = [...l].sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
    return l;
  }, [scelti, ordine]);

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
    blocca(pannello);
    if (!pannello) return;
    const esc = (e) => e.key === 'Escape' && setPannello(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [pannello]);
  useEffect(() => () => blocca(false), []);

  const tipoUnico = scelti.tipo.length === 1 ? scelti.tipo[0] : null;

  return (
    <div className="pagina tema-chiaro negozio">
      <header className="contenitore pagina-intesta">
        <Rivela>
          <p className="occhiello">Riale · {t.negozio.titolo}</p>
          <h1 className="titolo-1">{tipoUnico ? t.categoriePlurale[tipoUnico] : t.negozio.titolo}</h1>
          <p className="lead">{t.negozio.intro}</p>
        </Rivela>
      </header>

      <div className="contenitore negozio-corpo">
        <aside className={`filtri ${pannello ? 'aperti' : ''}`} aria-label={t.negozio.filtri}>
          <div className="filtri-testa">
            <h2 className="occhiello">{t.negozio.filtri}</h2>
            <button type="button" className="btn-icona solo-mobile" onClick={() => setPannello(false)} aria-label={t.nav.chiudi}><Chiudi /></button>
          </div>
          {GRUPPI.map((g) => (
            <fieldset key={g.chiave} className={`filtro filtro-${g.chiave}`}>
              <legend>{g.titolo}</legend>
              <div className="chips">
                {g.valori.map((v) => {
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

        <section className="negozio-risultati" aria-label="Prodotti">
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
              {lista.map((p, i) => <SchedaProdotto key={p.slug} p={p} priorita={i < 4} />)}
            </div>
          )}
        </section>
      </div>
      {pannello && <div className="filtri-velo" onClick={() => setPannello(false)} aria-hidden="true" />}
    </div>
  );
}
