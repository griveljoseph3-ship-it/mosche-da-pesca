import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CarrelloProvider } from './stato/carrello.jsx';
import './stili/globale.css';
import './stili/componenti.css';

// Arrivo da 404.html (percorso sconosciuto a GitHub Pages): ripristina l'URL originale.
const salvato = sessionStorage.getItem('riale-percorso');
if (salvato) {
  sessionStorage.removeItem('riale-percorso');
  history.replaceState(null, '', salvato);
}

// La foto d'apertura pre-generata serve solo alla home
const base = import.meta.env.BASE_URL;
if (location.pathname !== base && location.pathname !== base.replace(/\/$/, '')) document.getElementById('hero-statico')?.remove();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <CarrelloProvider>
        <App />
      </CarrelloProvider>
    </BrowserRouter>
  </StrictMode>,
);
