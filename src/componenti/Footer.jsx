import { Link } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { Logo } from './Icone.jsx';

export default function Footer() {
  return (
    <footer className="piede">
      <div className="contenitore">
        <div className="piede-alto">
          <div className="piede-marchio">
            <Logo size={40} />
            <p className="titolo-2">{t.marchio}</p>
            <p className="tenue">{t.footer.descrizione}</p>
          </div>
          <nav className="piede-col" aria-label={t.footer.negozio}>
            <p className="occhiello">{t.footer.negozio}</p>
            <Link to="/negozio?tipo=secca">{t.categoriePlurale.secca}</Link>
            <Link to="/negozio?tipo=sommersa">{t.categoriePlurale.sommersa}</Link>
            <Link to="/negozio?tipo=ninfa">{t.categoriePlurale.ninfa}</Link>
            <Link to="/negozio?tipo=streamer">{t.categoriePlurale.streamer}</Link>
            <Link to="/kit">{t.nav.kit}</Link>
            <Link to="/negozio?tipo=attrezzatura">{t.categoriePlurale.attrezzatura}</Link>
          </nav>
          <nav className="piede-col" aria-label={t.footer.aiuto}>
            <p className="occhiello">{t.footer.aiuto}</p>
            <Link to="/calendario">{t.nav.calendario}</Link>
            <Link to="/storia">{t.nav.storia}</Link>
            <Link to="/contatti">{t.nav.contatti}</Link>
            <Link to="/spedizioni-e-resi">{t.nav.spedizioni}</Link>
            <Link to="/privacy">{t.nav.privacy}</Link>
            <Link to="/crediti">{t.nav.crediti}</Link>
          </nav>
        </div>
        <hr className="linea" />
        <div className="piede-basso">
          <p className="avviso-demo"><span className="badge-demo">{t.demo}</span> {t.avvisoDemo}.</p>
          <p className="tenue piccolo">
            {t.footer.diritti} · <Link to="/crediti" className="link-sottile">{t.nav.crediti}: foto Wikimedia Commons, 3D Poly Haven</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
