import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './componenti/Header.jsx';
import Footer from './componenti/Footer.jsx';
import PannelloCarrello from './componenti/PannelloCarrello.jsx';
import Cursore from './componenti/Cursore.jsx';
import Home from './pagine/Home.jsx';
import useSeo from './lib/useSeo.js';
import { avviaScorrimento, getLenis } from './lib/scorrimento.js';
import { testi as t } from './i18n/index.js';

const Negozio = lazy(() => import('./pagine/Negozio.jsx'));
const Prodotto = lazy(() => import('./pagine/Prodotto.jsx'));
const Calendario = lazy(() => import('./pagine/Calendario.jsx'));
const Kit = lazy(() => import('./pagine/Kit.jsx'));
const Storia = lazy(() => import('./pagine/Storia.jsx'));
const Contatti = lazy(() => import('./pagine/Contatti.jsx'));
const Crediti = lazy(() => import('./pagine/Crediti.jsx'));
const Testo = lazy(() => import('./pagine/Testo.jsx'));
const Carrello = lazy(() => import('./pagine/Carrello.jsx'));
const Cassa = lazy(() => import('./pagine/Cassa.jsx'));
const Conferma = lazy(() => import('./pagine/Conferma.jsx'));
const OrdineRicevuto = lazy(() => import('./pagine/OrdineRicevuto.jsx'));
const NonTrovata = lazy(() => import('./pagine/NonTrovata.jsx'));

function Attesa() {
  return (
    <div className="attesa" role="status">
      <span className="attesa-onda" aria-hidden="true" />
      <span className="sr">{t.caricamento}</span>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  useSeo(pathname);

  useEffect(() => { avviaScorrimento(); }, []);
  useEffect(() => {
    const l = getLenis();
    if (l) l.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#contenuto" className="salta">{t.saltaContenuto}</a>
      <Cursore />
      <Header />
      <main id="contenuto" tabIndex={-1}>
        <Suspense fallback={<Attesa />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/negozio" element={<Negozio />} />
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
