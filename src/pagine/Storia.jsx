import { Link } from 'react-router-dom';
import Foto from '../componenti/Foto.jsx';
import Rivela from '../componenti/Rivela.jsx';
import { Freccia } from '../componenti/Icone.jsx';
import { testi as t } from '../i18n/index.js';

const capitoli = [
  {
    anno: '1987',
    titolo: 'Una morsa sul tavolo di cucina',
    testo: 'Tutto comincia d’inverno, con una morsa prestata e un libro di ricette inglesi. Le prime mosche sono storte. Le trote del torrente sotto casa le prendono lo stesso.',
    foto: 'canne-attrezzatura/morsa-costruzione',
    alt: 'Mani che legano una mosca alla morsa, con forbici e materiali sul tavolo',
  },
  {
    anno: '1996',
    titolo: 'Il banco in valle',
    testo: 'Una stanza con una finestra sul fiume diventa la bottega. Piume di gallo selezionate, ami forgiati, seta. Le ricette cambiano a ogni stagione, a ogni schiusa.',
    foto: 'canne-attrezzatura/costruzione-mosca-primo-piano',
    alt: 'Primo piano di una mosca in costruzione stretta nella morsa',
  },
  {
    anno: 'Oggi',
    titolo: 'Provate in acqua, sempre',
    testo: 'Ogni nuova mosca passa una stagione nelle nostre scatole prima di arrivare nella tua. Se non funziona sui nostri torrenti, non la vendiamo.',
    foto: 'fiumi-ambientazioni/trota-presa-a-mosca',
    alt: 'Una trota fario appena presa con una ninfa soft hackle, sullo sfondo il fiume',
  },
];

export default function Storia() {
  return (
    <div className="pagina storia">
      <header className="storia-testa">
        <Foto nome="fiumi-ambientazioni/nebbia-mattino" alt="Nebbia del mattino su un lago di montagna" className="storia-testa-foto" sizes="100vw" priorita />
        <div className="contenitore">
          <Rivela>
            <p className="occhiello">{t.home.storiaOcchiello}</p>
            <h1 className="display">La nostra<br /><span className="corsivo">storia</span></h1>
          </Rivela>
        </div>
      </header>
      <div className="contenitore storia-intro">
        <Rivela>
          <p className="titolo-2 corsivo">“Una mosca è giusta quando la trota la crede viva per un secondo. Il nostro lavoro è quel secondo.”</p>
          <p className="tenue">— Il banco di Riale (testo di esempio)</p>
        </Rivela>
      </div>
      {capitoli.map((c, i) => (
        <section key={c.anno} className={`capitolo ${i % 2 ? 'inverso' : ''}`}>
          <div className="contenitore capitolo-griglia">
            <Rivela className="capitolo-foto">
              <Foto nome={c.foto} alt={c.alt} sizes="(min-width: 900px) 50vw, 100vw" />
            </Rivela>
            <Rivela ritardo={1} className="capitolo-testo">
              <p className="capitolo-anno serif">{c.anno}</p>
              <h2 className="titolo-2">{c.titolo}</h2>
              <p className="lead">{c.testo}</p>
            </Rivela>
          </div>
        </section>
      ))}
      <section className="contenitore sezione storia-fine">
        <Rivela>
          <h2 className="titolo-1">Il fiume ti aspetta.</h2>
          <Link to="/negozio" className="btn" viewTransition>{t.home.ctaNegozio} <Freccia /></Link>
        </Rivela>
      </section>
    </div>
  );
}
