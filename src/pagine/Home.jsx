import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { prodotti, urlCategoria } from '../data/catalogo.js';
import Foto from '../componenti/Foto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import SchedaProdotto from '../componenti/SchedaProdotto.jsx';
import CalendarioMini from '../componenti/CalendarioMini.jsx';
import { Freccia, FrecciaGiu } from '../componenti/Icone.jsx';
import { vaiA } from '../lib/scorrimento.js';

// Il fiume dalla superficie al fondo: una foto vera per ogni tipo di mosca
const TIPI = [
  { cat: 'secca', foto: 'fiumi-ambientazioni/pescatore-soca', alt: 'Un pescatore a mosca lancia nel fiume Soča, con le Alpi sullo sfondo', pos: '50% 60%' },
  { cat: 'sommersa', foto: 'fiumi-ambientazioni/pescatore-savinja', alt: 'Un pescatore nell’acqua limpida della Savinja, i ciottoli si vedono sul fondo', pos: '50% 50%' },
  { cat: 'ninfa', foto: 'fiumi-ambientazioni/torrente-alpino-nz', alt: 'Un torrente alpino che corre tra grandi sassi coperti di muschio', pos: '50% 70%' },
  { cat: 'streamer', foto: 'fiumi-ambientazioni/trota-fario-sott-acqua', alt: 'Una grande trota fario ripresa sott’acqua, tra le alghe del fondo', pos: '40% 50%' },
];
const ALTRI = [
  { cat: 'kit', foto: 'canne-attrezzatura/scatola-mosche-sacramento', alt: 'Una scatola di bambù piena di mosche disposte in file', pos: '50% 40%' },
  { cat: 'attrezzatura', foto: 'canne-attrezzatura/canna-e-mulinello-su-foglie', alt: 'Una canna da mosca con mulinello appoggiata tra le foglie', pos: '50% 50%' },
];

function Riquadro({ x, grande, livello }) {
  const n = prodotti.filter((p) => p.cat === x.cat).length;
  return (
    <Link to={urlCategoria(x.cat)} className={`riquadro ${grande ? 'grande' : ''}`} viewTransition>
      <Foto nome={x.foto} alt={x.alt} sizes={grande ? '(min-width: 800px) 50vw, 100vw' : '(min-width: 800px) 50vw, 100vw'} posizione={x.pos} />
      <span className="riquadro-testo">
        {livello && <span className="occhiello">{livello.numero} — {livello.luogo}</span>}
        <span className="riquadro-titolo">{t.categoriePlurale[x.cat]}</span>
        <span className="riquadro-desc">{t.descrizioniCategorie[x.cat]}</span>
        <span className="link-freccia">{t.home.vedi(n)} <Freccia /></span>
      </span>
    </Link>
  );
}

export default function Home() {
  // Se la foto d'apertura è già nella pagina (HTML pre-generato) la usiamo; altrimenti la disegna React.
  const [statica] = useState(() => !!document.getElementById('hero-statico'));
  useEffect(() => () => document.getElementById('hero-statico')?.remove(), []);
  const scelti = ['secca', 'sommersa', 'ninfa', 'streamer'].flatMap((c) => prodotti.filter((p) => p.cat === c && p.top).concat(prodotti.filter((p) => p.cat === c && !p.top)).slice(0, 2));
  return (
    <div className="home">
      <section className={`hero ${statica ? 'su-statica' : ''}`} aria-labelledby="hero-titolo">
        {statica ? (
          <span className="sr">Un torrente di montagna che scorre veloce nel bosco, tra sassi coperti di muschio.</span>
        ) : (
          <Foto nome="fiumi-ambientazioni/torrente-bosco-oirase" alt="Un torrente di montagna che scorre veloce nel bosco, tra sassi coperti di muschio" className="hero-foto" sizes="100vw" priorita />
        )}
        <div className="contenitore hero-contenuto">
          <p className="occhiello hero-occhiello">{t.home.occhiello} <span className="badge-demo">{t.demo}</span></p>
          <h1 id="hero-titolo" className="display hero-titolo">
            {t.home.titolo[0]}<br /><span className="corsivo">{t.home.titolo[1]}</span>
          </h1>
          <p className="lead hero-sotto">{t.home.sottotitolo}</p>
          <div className="hero-azioni">
            <button type="button" className="btn" onClick={() => vaiA('#tipi')}>{t.home.ctaScendi} <FrecciaGiu /></button>
            <Link to="/negozio" className="btn btn-contorno" viewTransition>{t.home.ctaNegozio} <Freccia /></Link>
          </div>
        </div>
      </section>

      <section id="tipi" className="sezione tipi" aria-labelledby="tit-tipi">
        <div className="contenitore">
          <Rivela className="sezione-intesta">
            <p className="occhiello">{t.home.tipiOcchiello}</p>
            <h2 id="tit-tipi" className="titolo-1">{t.home.tipiTitolo}</h2>
            <p className="lead">{t.home.tipiTesto}</p>
          </Rivela>
          <div className="riquadri">
            {TIPI.map((x, i) => <Riquadro key={x.cat} x={x} grande livello={t.home.livelli[i]} />)}
          </div>
          <div className="riquadri riquadri-piccoli">
            {ALTRI.map((x) => <Riquadro key={x.cat} x={x} />)}
          </div>
        </div>
      </section>

      <section className="sezione tema-chiaro scelti" aria-labelledby="tit-scelti">
        <div className="contenitore">
          <div className="sezione-testa">
            <h2 id="tit-scelti" className="titolo-2">{t.home.piuSceltiTitolo}</h2>
            <Link to="/negozio" className="link-freccia" viewTransition>{t.home.piuSceltiCta} <Freccia /></Link>
          </div>
          <div className="griglia-prodotti quattro">
            {scelti.map((p) => <SchedaProdotto key={p.slug} p={p} />)}
          </div>
          <div className="impegni">
            {t.home.impegni.map((x) => (
              <div key={x.titolo} className="impegno">
                <p className="titolo-3">{x.titolo}</p>
                <p className="tenue">{x.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sezione blocco-calendario-sez" aria-labelledby="tit-cal">
        <div className="contenitore blocco-calendario">
          <Rivela className="blocco-testo">
            <p className="occhiello">Gennaio — Dicembre</p>
            <h2 id="tit-cal" className="titolo-1">{t.home.calendarioTitolo}</h2>
            <p className="lead">{t.home.calendarioTesto}</p>
            <Link to="/calendario" className="btn btn-contorno" viewTransition>{t.home.calendarioCta} <Freccia /></Link>
          </Rivela>
          <CalendarioMini />
        </div>
      </section>

      <section className="blocco-storia" aria-labelledby="tit-storia">
        <Foto nome="fiumi-ambientazioni/pescatore-ain" alt="Un pescatore a mosca in mezzo a un fiume verde tra gli alberi" className="storia-foto" sizes="100vw" />
        <div className="contenitore storia-testo">
          <p className="occhiello">{t.home.storiaOcchiello}</p>
          <h2 id="tit-storia" className="titolo-1">{t.home.storiaTitolo}</h2>
          <p className="lead">{t.home.storiaTesto}</p>
          <Link to="/storia" className="btn" viewTransition>{t.home.storiaCta} <Freccia /></Link>
        </div>
      </section>
    </div>
  );
}
