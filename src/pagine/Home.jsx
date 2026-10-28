import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { prodotti, urlCategoria } from '../data/catalogo.js';
import { livelloQualita, movimentoRidotto } from '../lib/qualita.js';
import { profondita as profonditaSuono } from '../lib/suono.js';
import { statoFiume } from '../fiume/statoFiume.js';
import { SCENE } from '../fiume/scene.js';
import Foto from '../componenti/Foto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import SchedaProdotto from '../componenti/SchedaProdotto.jsx';
import ScatolaRegalo from '../componenti/ScatolaRegalo.jsx';
import CalendarioMini from '../componenti/CalendarioMini.jsx';
import { Freccia, FrecciaGiu } from '../componenti/Icone.jsx';
import { vaiA } from '../lib/scorrimento.js';

const FiumeFoto = lazy(() => import('../fiume/FiumeFoto.jsx'));

const CAT_LIVELLO = { secche: 'secca', sommerse: 'sommersa', ninfe: 'ninfa', streamer: 'streamer' };

function Titolo() {
  const [a, b] = t.home.titolo;
  const parole = (s, base) =>
    s.split(' ').map((w, i) => (
      <span className="parola" key={i} style={{ '--i': base + i }}>
        <span>{w}</span>
      </span>
    ));
  return (
    <h1 className="display hero-titolo">
      <span className="riga">{parole(a, 0)}</span>
      <span className="riga corsivo">{parole(b, 2)}</span>
    </h1>
  );
}

export default function Home() {
  const qualita = useMemo(livelloQualita, []);
  const webgl = qualita !== 'statico';
  const [altre, setAltre] = useState(false);
  const [pronta, setPronta] = useState(false);
  const [tappa, setTappa] = useState(0);
  const fiume = useRef(null);
  const sfondo = useRef(null);
  const strati = useRef([]);
  const radice = useRef(null);
  const indice = useRef(null);
  const quandoPronta = useCallback(() => setPronta(true), []);

  // Le foto delle tappe successive si caricano dopo la pagina
  useEffect(() => {
    const via = () => setTimeout(() => setAltre(true), 200);
    if (document.readyState === 'complete') via();
    else window.addEventListener('load', via, { once: true });
    return () => window.removeEventListener('load', via);
  }, []);

  // Parallasse e dissolvenze con GSAP ScrollTrigger (dopo il caricamento, mai con movimento ridotto)
  useEffect(() => {
    if (movimentoRidotto()) return;
    let stop;
    let vivo = true;
    const via = () => import('../lib/animazioniHome.js').then((m) => { if (vivo) stop = m.avviaAnimazioniHome(radice.current); });
    if (document.readyState === 'complete') setTimeout(via, 300);
    else window.addEventListener('load', via, { once: true });
    return () => { vivo = false; window.removeEventListener('load', via); stop?.(); };
  }, []);

  // Avanzamento nel fiume: ogni tappa è "piena" quando la sua sezione è al centro dello schermo
  useEffect(() => {
    let raf = 0;
    const aggiorna = () => {
      raf = 0;
      const el = fiume.current;
      if (!el) return;
      const h = window.innerHeight;
      const sezioni = [...el.querySelectorAll(':scope > section')];
      const centri = sezioni.map((s, i) => (i === 0 ? 0 : s.offsetTop + s.offsetHeight / 2 - h / 2));
      const y = window.scrollY;
      let sPos = centri.length - 1;
      for (let i = 0; i < centri.length - 1; i++) {
        if (y < centri[i + 1]) { sPos = i + Math.max(0, (y - centri[i]) / (centri[i + 1] - centri[i])); break; }
      }
      const p = sPos / (centri.length - 1);
      statoFiume.p = p;
      const r = el.getBoundingClientRect();
      const usc = Math.min(1, Math.max(0, (h - r.bottom) / (h * 0.6)));
      statoFiume.visibile = r.bottom > -h * 0.2;
      if (sfondo.current) {
        sfondo.current.style.opacity = String(1 - usc);
        sfondo.current.style.visibility = r.bottom < 0 ? 'hidden' : 'visible';
      }
      if (indice.current) indice.current.style.opacity = String(Math.max(0, 1 - usc * 2));
      // senza WebGL: le foto si danno il cambio con una dissolvenza
      strati.current.forEach((s, i) => {
        if (s && i > 0) s.style.opacity = String(Math.min(1, Math.max(0, (sPos - i + 0.7) / 0.4)));
      });
      setTappa(Math.round(sPos));
      profonditaSuono(Math.max(0, (p - 0.4) / 0.6));
    };
    const f = () => { if (!raf) raf = requestAnimationFrame(aggiorna); };
    aggiorna();
    window.addEventListener('scroll', f, { passive: true });
    window.addEventListener('resize', f);
    const mouse = (e) => {
      statoFiume.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      statoFiume.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', mouse, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', f);
      window.removeEventListener('resize', f);
      window.removeEventListener('pointermove', mouse);
      profonditaSuono(0);
    };
  }, [altre]);

  const perLivello = (cat) => prodotti.filter((p) => p.cat === cat).sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0)).slice(0, 4);
  const kit = prodotti.filter((p) => p.cat === 'kit');

  return (
    <div className={`home qualita-${qualita}`} ref={radice}>
      <div className={`fiume-sfondo ${pronta ? 'pronta' : ''}`} ref={sfondo} aria-hidden="true">
        {SCENE.map((s, i) =>
          i === 0 || altre ? (
            <div key={s.foto} className="fiume-strato" ref={(el) => (strati.current[i] = el)} style={{ opacity: i === 0 ? 1 : 0 }}>
              <Foto nome={s.foto} alt="" sizes="100vw" priorita={i === 0} />
            </div>
          ) : null,
        )}
        {webgl && (
          <Suspense fallback={null}>
            <FiumeFoto onPronta={quandoPronta} />
          </Suspense>
        )}
        <div className="fiume-velo" />
      </div>

      <div className="fiume" ref={fiume}>
        <section className="hero" aria-labelledby="hero-titolo">
          <div className="contenitore hero-contenuto">
            <p className="occhiello hero-occhiello">{t.home.occhiello} <span className="badge-demo">{t.demo}</span></p>
            <div id="hero-titolo"><Titolo /></div>
            <p className="lead hero-sotto">{t.home.sottotitolo}</p>
            <div className="hero-azioni">
              <Link to="/negozio" className="btn" viewTransition>{t.home.ctaNegozio} <Freccia /></Link>
              <button type="button" className="btn btn-contorno" onClick={() => vaiA('#secche', { offset: 0 })}>{t.home.ctaScendi} <FrecciaGiu /></button>
            </div>
          </div>
          <div className="hero-scorri" aria-hidden="true"><span>{t.home.scorri}</span><i /></div>
        </section>

        {t.home.livelli.map((l, i) => (
          <section key={l.id} id={l.id} className={`livello livello-${l.id}`} aria-labelledby={`tit-${l.id}`}>
            <div className="contenitore livello-griglia">
              <div className="livello-testo">
                <Rivela>
                  <p className="occhiello"><span className="livello-num">{l.numero}</span> — {l.luogo}</p>
                  <h2 id={`tit-${l.id}`} className="titolo-1">{l.titolo}</h2>
                  <p className="lead">{l.testo}</p>
                  <Link to={urlCategoria(CAT_LIVELLO[l.id])} className="link-freccia" viewTransition>{l.cta} <Freccia /></Link>
                </Rivela>
              </div>
              <div className="livello-prodotti" role="list">
                {perLivello(CAT_LIVELLO[l.id]).map((p, j) => (
                  <div key={p.slug} className="livello-scheda" role="listitem">
                    <Rivela ritardo={(j % 3) + 1}>
                      <SchedaProdotto p={p} scura sizes="(min-width: 1180px) 14vw, (min-width: 800px) 22vw, 44vw" />
                    </Rivela>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {(
        <nav className={`profondimetro tappa-${tappa}`} aria-label="Livelli del fiume" ref={indice}>
          <ol>
            {['hero', ...t.home.livelli.map((l) => l.id)].map((id, i) => (
              <li key={id} className={i === tappa ? 'attiva' : ''}>
                <button type="button" onClick={() => vaiA(i === 0 ? 0 : `#${id}`)} aria-current={i === tappa ? 'step' : undefined}>
                  <span className="sr">{i === 0 ? 'Superficie, inizio' : t.home.livelli[i - 1].titolo}</span>
                  <i aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <section className="dopo-fiume">
        <div className="contenitore impegni">
          {t.home.impegni.map((x, i) => (
            <Rivela key={x.titolo} ritardo={i + 1} className="impegno">
              <p className="titolo-3">{x.titolo}</p>
              <p className="tenue">{x.testo}</p>
            </Rivela>
          ))}
        </div>

        <div className="contenitore blocco-calendario">
          <Rivela className="blocco-testo">
            <p className="occhiello">Gennaio — Dicembre</p>
            <h2 className="titolo-1">{t.home.calendarioTitolo}</h2>
            <p className="lead">{t.home.calendarioTesto}</p>
            <Link to="/calendario" className="btn btn-contorno" viewTransition>{t.home.calendarioCta} <Freccia /></Link>
          </Rivela>
          <Rivela ritardo={1} className="blocco-visuale">
            <CalendarioMini />
          </Rivela>
        </div>
      </section>

      <section className="tema-crema sezione blocco-kit">
        <div className="contenitore kit-griglia">
          <Rivela className="kit-scatola">
            <ScatolaRegalo prodotto={kit[2]} automatica />
          </Rivela>
          <Rivela ritardo={1} className="blocco-testo">
            <p className="occhiello">{t.nav.kit}</p>
            <h2 className="titolo-1">{t.home.kitTitolo}</h2>
            <p className="lead">{t.home.kitTesto}</p>
            <Link to="/kit" className="btn btn-scuro" viewTransition>{t.home.kitCta} <Freccia /></Link>
          </Rivela>
        </div>
      </section>

      <section className="blocco-storia">
        <Foto nome="fiumi-ambientazioni/pescatore-savinja" alt="Un pescatore a mosca guada un torrente limpido e lancia verso la corrente" className="storia-foto" sizes="100vw" />
        <div className="contenitore storia-testo">
          <Rivela>
            <p className="occhiello">{t.home.storiaOcchiello}</p>
            <h2 className="titolo-1">{t.home.storiaTitolo}</h2>
            <p className="lead">{t.home.storiaTesto}</p>
            <Link to="/storia" className="btn" viewTransition>{t.home.storiaCta} <Freccia /></Link>
          </Rivela>
        </div>
      </section>
    </div>
  );
}
