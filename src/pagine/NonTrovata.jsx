import { Link } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';

export default function NonTrovata({ testo }) {
  return (
    <div className="pagina tema-chiaro non-trovata">
      <div className="contenitore pagina-intesta">
        <p className="occhiello">404</p>
        <h1 className="titolo-1">{t.nonTrovata.titolo}</h1>
        <p className="lead">{testo || t.nonTrovata.testo}</p>
        <Link to="/" className="btn btn-scuro">{t.nonTrovata.cta}</Link>
      </div>
    </div>
  );
}
