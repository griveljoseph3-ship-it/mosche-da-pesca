import { Link } from 'react-router-dom';
import { insetti } from '../data/schiuse.js';
import { testi as t } from '../i18n/index.js';

// Anteprima del calendario: una riga per insetto, intensità per mese.
export default function CalendarioMini() {
  const mese = new Date().getMonth();
  return (
    <Link to="/calendario" className="cal-mini" aria-label={t.home.calendarioCta} viewTransition>
      <div className="cal-mini-mesi" aria-hidden="true">
        {t.calendario.mesiBrevi.map((m, i) => <span key={m} className={i === mese ? 'ora' : ''}>{m[0]}</span>)}
      </div>
      {insetti.slice(0, 7).map((x) => (
        <div key={x.id} className="cal-mini-riga">
          <span className="cal-mini-nome">{x.nome.split(' (')[0]}</span>
          <span className="cal-mini-barre" aria-hidden="true">
            {x.mesi.map((v, i) => (
              <i key={i} style={{ '--v': v, '--c': x.colore }} className={i === mese ? 'ora' : ''} />
            ))}
          </span>
        </div>
      ))}
    </Link>
  );
}
