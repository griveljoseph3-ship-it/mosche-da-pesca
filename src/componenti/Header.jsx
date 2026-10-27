import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { useCarrello } from '../stato/carrello.jsx';
import { attivaSuono, suCambioSuono, suonoAttivo } from '../lib/suono.js';
import { blocca } from '../lib/scorrimento.js';
import { Borsa, Chiudi, Logo, Menu, Onda } from './Icone.jsx';

const voci = [
  ['/negozio', t.nav.negozio],
  ['/calendario', t.nav.calendarioBreve],
  ['/kit', t.nav.kit],
  ['/storia', t.nav.storiaBreve],
];

export default function Header() {
  const { pezzi, setAperto, ultimo } = useCarrello();
  const { pathname } = useLocation();
  const [scorso, setScorso] = useState(false);
  const [menu, setMenu] = useState(false);
  const [suono, setSuono] = useState(suonoAttivo());
  const [pulsa, setPulsa] = useState(false);

  useEffect(() => {
    const f = () => setScorso(window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => suCambioSuono(setSuono), []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    blocca(menu);
    if (!menu) return;
    const esc = (e) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [menu]);
  useEffect(() => {
    if (!ultimo) return;
    setPulsa(true);
    const id = setTimeout(() => setPulsa(false), 700);
    return () => clearTimeout(id);
  }, [ultimo]);

  const trasparente = pathname === '/' && !scorso && !menu;

  return (
    <header className={`testata ${trasparente ? 'trasparente' : ''} ${menu ? 'menu-aperto' : ''}`}>
      <div className="testata-riga">
        <Link to="/" className="marchio" aria-label={`${t.marchio}, ${t.nav.home}`} viewTransition>
          <Logo size={30} />
          <span className="marchio-nome">{t.marchio}</span>
        </Link>
        <nav className="nav-principale" aria-label="Principale">
          {voci.map(([to, nome]) => (
            <NavLink key={to} to={to} className="nav-voce" viewTransition>{nome}</NavLink>
          ))}
        </nav>
        <div className="testata-azioni">
          <button
            type="button"
            className={`btn-icona suono ${suono ? 'on' : ''}`}
            onClick={() => attivaSuono(!suono)}
            aria-pressed={suono}
            aria-label={suono ? t.suono.disattiva : t.suono.attiva}
            title={suono ? t.suono.disattiva : t.suono.attiva}
          >
            <Onda attivo={suono} />
            <span className="suono-testo">{t.suono.etichetta}</span>
          </button>
          <button type="button" className={`btn-carrello ${pulsa ? 'pulsa' : ''}`} onClick={() => setAperto(true)} aria-label={`${t.carrello.apri}, ${t.carrello.articoli(pezzi)}`}>
            <Borsa />
            <span className="conta" aria-hidden="true">{pezzi}</span>
          </button>
          <button type="button" className="btn-icona btn-menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="menu-mobile" aria-label={menu ? t.nav.chiudi : t.nav.menu}>
            {menu ? <Chiudi /> : <Menu />}
          </button>
        </div>
      </div>
      <div id="menu-mobile" className="menu-mobile" hidden={!menu}>
        <nav aria-label="Menu">
          {[...voci, ['/contatti', t.nav.contatti]].map(([to, nome], i) => (
            <Link key={to} to={to} style={{ '--i': i }} className="menu-voce" viewTransition>{nome}</Link>
          ))}
        </nav>
        <p className="menu-piede piccolo tenue">{t.avvisoDemo}</p>
      </div>
    </header>
  );
}
