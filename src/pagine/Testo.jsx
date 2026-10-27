import Rivela from '../componenti/Rivela.jsx';
import { testi as t } from '../i18n/index.js';

const contenuti = {
  spedizioni: {
    titolo: t.nav.spedizioni,
    intro: 'Testi di esempio: questo è un sito dimostrativo e non spedisce nulla.',
    sezioni: [
      ['Tempi', 'Spediamo dal lunedì al venerdì. Gli ordini ricevuti entro le 13 partono in giornata. Consegna in Italia in 48–72 ore con corriere standard, 24 ore con l’espressa.'],
      ['Costi', 'Spedizione standard 4,90 €, gratuita sopra 60 €. Espressa 9,90 €. Le mosche viaggiano in una scatolina rigida che le protegge dagli urti.'],
      ['Resi', 'Hai 30 giorni per restituire i prodotti non usati, nella confezione originale. Le mosche su misura non si possono restituire.'],
      ['Cambi di misura', 'Se l’amo che hai scelto non va bene, scrivici entro 30 giorni: cambiamo la misura senza costi.'],
      ['Garanzia', 'Canne, mulinelli e morse hanno la garanzia di legge di 24 mesi. Per le canne in bambù offriamo anche la riparazione in bottega.'],
    ],
  },
  privacy: {
    titolo: t.nav.privacy,
    intro: 'Informativa di esempio per un sito dimostrativo.',
    sezioni: [
      ['Cosa salviamo', 'Questo sito non raccoglie dati personali e non li invia a nessun server. Il carrello è salvato solo nel tuo browser (localStorage) per ritrovarlo quando torni.'],
      ['Moduli', 'Il modulo di contatto e la cassa sono dimostrativi: i dati che scrivi restano sul tuo dispositivo per la durata della sessione e non vengono inviati.'],
      ['Cookie', 'Non usiamo cookie di profilazione né strumenti di analisi. I caratteri e gli script sono serviti dallo stesso sito.'],
      ['Suoni', 'Il suono del torrente è generato nel browser e parte solo se premi il pulsante “Suono”.'],
      ['I tuoi diritti', 'Puoi cancellare in ogni momento i dati del carrello svuotandolo o cancellando i dati del sito dal browser.'],
    ],
  },
};

export default function Testo({ tipo }) {
  const c = contenuti[tipo];
  return (
    <div className="pagina tema-chiaro testo-legale">
      <div className="contenitore stretto">
        <header className="pagina-intesta">
          <Rivela>
            <p className="occhiello">Riale <span className="badge-demo">{t.demo}</span></p>
            <h1 className="titolo-1">{c.titolo}</h1>
            <p className="lead">{c.intro}</p>
          </Rivela>
        </header>
        {c.sezioni.map(([h, p]) => (
          <section key={h} className="testo-sezione">
            <h2 className="titolo-3">{h}</h2>
            <p>{p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
