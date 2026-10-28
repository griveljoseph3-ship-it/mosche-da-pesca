import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './componenti/Header.jsx';
import Footer from './componenti/Footer.jsx';
import PannelloCarrello from './componenti/PannelloCarrello.jsx';
import Home from './pagine/Home.jsx';
import useSeo from './lib/useSeo.js';
import { testi as t } from './i18n/index.js';

const pagine = {
  Negozio: () => import('./pagine/Negozio.jsx'),
  Prodotto: () => import('./pagine/Prodotto.jsx'),
  Calendario: () => import('./pagine/Calendario.jsx'),
  Kit: () => import('./pagine/Kit.jsx'),
  Storia: () => import('./pagine/Storia.jsx'),
  Contatti: () => import('./pagine/Contatti.jsx'),
  Crediti: () => import('./pagine/Crediti.jsx'),
  Testo: () => import('./pagine/Testo.jsx'),
  Carrello: () => import('./pagine/Carrello.jsx'),
  Cassa: () => import('./pagine/Cassa.jsx'),
  Conferma: () => import('./pagine/Conferma.jsx'),
  OrdineRicevuto: () => import('./pagine/OrdineRicevuto.jsx'),
  NonTrovata: () => import('./pagine/NonTrovata.jsx'),
};
const Negozio = lazy(pagine.Negozio);
const Prodotto = lazy(pagine.Prodotto);
const Calendario = lazy(pagine.Calendario);
const Kit = lazy(pagine.Kit);
const Storia = lazy(pagine.Storia);
const Contatti = lazy(pagine.Contatti);
const Crediti = lazy(pagine.Crediti);
const Testo = lazy(pagine.Testo);
const Carrello = lazy(pagine.Carrello);
const Cassa = lazy(pagine.Cassa);
const Conferma = lazy(pagine.Conferma);
const OrdineRicevuto = lazy(pagine.OrdineRicevuto);
const NonTrovata = lazy(pagine.NonTrovata);

// Dopo il caricamento scarica in sottofondo il codice delle altre pagine: i clic diventano istantanei.
function precaricaPagine() {
  const via = () => Object.values(pagine).forEach((f) => f().catch(() => {}));
  const quando = () => (window.requestIdleCallback ? requestIdleCallback(via, { timeout: 3000 }) : setTimeout(via, 1500));
  if (document.readyState === 'complete') quando();
  else window.addEventListener('load', quando, { once: true });
}

function Attesa() {
  return (
    <div className="attesa" role="status">
      <span className="sr">{t.caricamento}</span>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  useSeo(pathname);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(precaricaPagine, []);

  return (
    <>
      <a href="#contenuto" className="salta">{t.saltaContenuto}</a>
      <Header />
      <main id="contenuto" tabIndex={-1}>
        <Suspense fallback={<Attesa />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/negozio" element={<Negozio />} />
            <Route path="/negozio/:tipo" element={<Negozio />} />
            <Route path="/prodotto/:slug" element={<Prodotto />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/kit" element={<Kit />} />
            <Route path="/storia" element={<Storia />} />
            <Route path="/contatti" element={<Contatti />} />
            <Route path="/crediti" element={<Crediti />} />
            <Route path="/spedizioni-e-resi" element={<Testo tipo="spedizioni" />} />
            <Route path="/privacy" element={<Testo tipo="privacy" />} />
            <Route path="/carrello" element={<Carrello />} />
            <Route path="/cassa" element={<Cassa />} />
            <Route path="/cassa/conferma" element={<Conferma />} />
            <Route path="/ordine-ricevuto" element={<OrdineRicevuto />} />
            <Route path="*" element={<NonTrovata />} />
          </Routes>
          <Footer />
        </Suspense>
      </main>
      <PannelloCarrello />
    </>
  );
}
