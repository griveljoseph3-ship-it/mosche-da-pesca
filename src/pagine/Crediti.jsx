import crediti from '../data/crediti.json';
import { testi as t } from '../i18n/index.js';
import Rivela from '../componenti/Rivela.jsx';
import Foto from '../componenti/Foto.jsx';

const nomeFoto = (file) => file.replace(/\.jpg$/, '');

const altri = [
  { cosa: 'Cormorant Garamond (titoli)', autore: 'Christian Thalmann, Catharsis Fonts', licenza: 'SIL Open Font License 1.1', url: 'https://github.com/CatharsisFonts/Cormorant' },
  { cosa: 'Inter (testi)', autore: 'Rasmus Andersson', licenza: 'SIL Open Font License 1.1', url: 'https://github.com/rsms/inter' },
  { cosa: 'Acqua, cielo, nebbia, abeti, trota e particelle 3D (shader e geometrie procedurali)', autore: 'Creati con codice per questo progetto', licenza: 'CC0 1.0', url: null },
  { cosa: 'Mosche 3D procedurali (ninfe e streamer) e render “Perdigón Fario” e “Matuka Fario”', autore: 'Creati con codice per questo progetto', licenza: 'CC0 1.0', url: null },
  { cosa: 'Suono del torrente (sintetizzato con Web Audio)', autore: 'Creato con codice per questo progetto', licenza: 'CC0 1.0', url: null },
  { cosa: 'Icone e logo SVG', autore: 'Disegnati per questo progetto', licenza: 'CC0 1.0', url: null },
];

export default function Crediti() {
  const gruppi = [
    ['Mosche', crediti.foto.filter((f) => /^(secca|secche|ninfa|streamer|sommersa|salmone)/.test(f.file)), 'mosche'],
    ['Canne e attrezzatura', crediti.foto.filter((f) => /^(scatol|vassoio|canne|canna|mulinell|coda|kit|morsa|costruzione)/.test(f.file)), 'canne-attrezzatura'],
    ['Fiumi e ambientazioni', crediti.foto.filter((f) => /^(torrente|soca|val-|nebbia|pescatore|trota|effimera)/.test(f.file)), 'fiumi-ambientazioni'],
  ];
  return (
    <div className="pagina tema-chiaro crediti">
      <header className="contenitore pagina-intesta">
        <Rivela>
          <p className="occhiello">Riale</p>
          <h1 className="titolo-1">{t.crediti.titolo}</h1>
          <p className="lead">{t.crediti.intro}</p>
          <p className="piccolo tenue">{t.crediti.nota}</p>
        </Rivela>
      </header>
      <div className="contenitore crediti-corpo">
        <h2 className="titolo-2">{t.crediti.foto}</h2>
        {gruppi.map(([titolo, lista, dir]) => (
          <section key={titolo} className="crediti-gruppo">
            <h3 className="occhiello">{titolo}</h3>
            <ul className="crediti-lista">
              {lista.map((f) => (
                <li key={f.file}>
                  <Foto nome={`${dir}/${nomeFoto(f.file)}`} alt="" sizes="72px" />
                  <div>
                    <p className="crediti-file">{nomeFoto(f.file).replace(/-/g, ' ')}</p>
                    <p className="piccolo">
                      {t.crediti.autore}: {f.autore} · {t.crediti.licenza}:{' '}
                      {f.licenzaUrl ? <a href={f.licenzaUrl} className="link-sottile" target="_blank" rel="noopener noreferrer license">{f.licenza}</a> : f.licenza} ·{' '}
                      <a href={f.fonte} className="link-sottile" target="_blank" rel="noopener noreferrer">{t.crediti.fonte}: Wikimedia Commons</a>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="piccolo tenue">Le foto di mulinelli con marchi visibili (Fladen, British Fly Reels) sono incluse solo come materiale del progetto e non rappresentano prodotti in vendita di quei marchi.</p>

        <h2 className="titolo-2">{t.crediti.tre}</h2>
        <table className="tabella-crediti">
          <thead><tr><th>Tipo</th><th>{t.crediti.file}</th><th>{t.crediti.autore}</th><th>{t.crediti.licenza}</th><th>{t.crediti.fonte}</th></tr></thead>
          <tbody>
            {crediti.tre.map((m) => (
              <tr key={m.file}>
                <td>{m.tipo}</td>
                <td>{m.file.split('/').filter(Boolean).slice(-1)[0]}</td>
                <td>{m.autore}</td>
                <td><a href={m.licenzaUrl} className="link-sottile" target="_blank" rel="noopener noreferrer license">{m.licenza}</a></td>
                <td>{m.fonte ? <a href={m.fonte} className="link-sottile" target="_blank" rel="noopener noreferrer">Poly Haven</a> : 'Questo progetto'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="titolo-2">{t.crediti.altro}</h2>
        <ul className="crediti-altri">
          {altri.map((a) => (
            <li key={a.cosa}>
              <p className="crediti-file">{a.cosa}</p>
              <p className="piccolo">{a.autore} · {a.licenza}{a.url && <> · <a href={a.url} className="link-sottile" target="_blank" rel="noopener noreferrer">{t.crediti.fonte}</a></>}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
