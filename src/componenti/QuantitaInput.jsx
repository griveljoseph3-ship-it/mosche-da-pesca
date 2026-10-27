import { testi as t } from '../i18n/index.js';
import { Meno, Piu } from './Icone.jsx';

export default function QuantitaInput({ valore, onChange, piccolo = false, etichetta }) {
  return (
    <div className={`quantita ${piccolo ? 'piccola' : ''}`} role="group" aria-label={etichetta || t.prodotto.quantita}>
      <button type="button" onClick={() => onChange(valore - 1)} disabled={valore <= 1} aria-label={t.prodotto.diminuisci}><Meno size={14} /></button>
      <output aria-live="polite">{valore}</output>
      <button type="button" onClick={() => onChange(valore + 1)} disabled={valore >= 99} aria-label={t.prodotto.aumenta}><Piu size={14} /></button>
    </div>
  );
}
