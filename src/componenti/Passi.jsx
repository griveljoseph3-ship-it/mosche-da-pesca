import { Link } from 'react-router-dom';
import { testi as t } from '../i18n/index.js';
import { Spunta } from './Icone.jsx';

const LINK = ['/carrello', '/cassa', '/cassa/conferma'];

export default function Passi({ attuale }) {
  return (
    <nav className="passi" aria-label={t.cassa.passo(attuale)}>
      <ol>
        {t.cassa.passi.map((nome, i) => {
          const n = i + 1;
          const fatto = n < attuale;
          return (
            <li key={nome} className={`${fatto ? 'fatto' : ''} ${n === attuale ? 'ora' : ''}`} aria-current={n === attuale ? 'step' : undefined}>
              {fatto ? (
                <Link to={LINK[i]}><span className="passo-num"><Spunta size={14} /></span> {nome}</Link>
              ) : (
                <span><span className="passo-num">{n}</span> {nome}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
