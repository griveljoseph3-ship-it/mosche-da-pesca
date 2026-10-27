import { euro, testi as t } from '../i18n/index.js';
import Foto from './Foto.jsx';

export default function Riepilogo({ righe, subtotale, spedizione }) {
  return (
    <aside className="riepilogo" aria-label="Riepilogo ordine">
      <ul>
        {righe.map((r) => (
          <li key={r.chiave}>
            <span className="riepilogo-foto"><Foto nome={r.prodotto.foto} alt="" sizes="56px" /><span className="riepilogo-qta">{r.qta}</span></span>
            <span className="riepilogo-nome">{r.prodotto.nome}{r.amo ? <span className="tenue piccolo"> · amo {r.amo}</span> : null}</span>
            <span>{euro(r.totale)}</span>
          </li>
        ))}
      </ul>
      <div className="totale-riga"><span>{t.carrello.subtotale}</span><span>{euro(subtotale)}</span></div>
      <div className="totale-riga"><span>{t.carrello.spedizione}</span><span>{spedizione === 0 ? t.carrello.gratis : euro(spedizione)}</span></div>
      <div className="totale-riga grande"><span>{t.carrello.totale}</span><strong>{euro(subtotale + spedizione)}</strong></div>
      <p className="piccolo tenue">{t.avvisoDemo}</p>
    </aside>
  );
}
