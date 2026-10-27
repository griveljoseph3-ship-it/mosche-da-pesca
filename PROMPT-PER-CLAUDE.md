# Prompt per Claude

Copia tutto il testo qui sotto e incollalo a Claude (Claude Code o un altro agente che può lavorare su GitHub).

---

Clona o apri il repository GitHub **griveljoseph3-ship-it/mosche-da-pesca** (https://github.com/griveljoseph3-ship-it/mosche-da-pesca) e costruisci dentro questo repository il sito e-commerce completo di un negozio di mosche da pesca artigianali (mosche secche, ninfe, streamer, sommerse) e attrezzatura.

## Come devi lavorare

- Costruisci **tutto il sito in una volta sola**, dall'inizio alla fine, senza fermarti a chiedere conferme o opinioni. Se devi scegliere qualcosa, scegli tu la soluzione più bella e professionale e vai avanti.
- Alla fine fai commit e push su `main`, pubblica il sito su GitHub Pages (vedi "Tecnologia") e controlla che sia online.
- **L'ultimo messaggio deve essere il link del sito online**: https://griveljoseph3-ship-it.github.io/mosche-da-pesca/ con due righe su cosa c'è dentro.

## Cosa c'è già nel repository (usalo)

- `assets/foto/mosche/`: foto macro di mosche vere (secche, ninfe, streamer, sommerse, da salmone).
- `assets/foto/canne-attrezzatura/`: canne, mulinelli, code di topo, scatole di mosche, costruzione delle mosche.
- `assets/foto/fiumi-ambientazioni/`: torrenti alpini, fiumi, nebbia del mattino, pescatori che lanciano, trote fario, effimere.
- `assets/3d/hdri/`: HDRI Poly Haven CC0 a 2k (alba, tramonto, nebbia, fiume) per luce e riflessi delle scene 3D.
- `assets/3d/texture/`: texture Poly Haven CC0 a 1k (sassi di fiume, ciottoli, muschio, corteccia, foglie) con colore, normal, rugosità e AO.
- `assets/3d/modelli/`: modelli glTF Poly Haven CC0 (sassi con muschio, massi, felce, ceppo, tronco, muschio) e `mosca-secca-stilizzata/mosca-secca.glb`, una mosca secca 3D semplice creata per questo progetto.
- `assets/catalogo-assets.json`: elenco di tutti i file con descrizione, misure e licenza.
- `assets/LICENZE.md`: autore, licenza e fonte di ogni file. **Leggilo prima di iniziare.**
- `anteprima/index.html`: la pagina "In costruzione" che adesso è online. Puoi cancellarla quando il sito vero è pronto.
- `strumenti/pages.yml`: un workflow GitHub Actions già pronto che fa `npm run build` e pubblica `dist/` (o `out/`) su GitHub Pages.
- Adesso GitHub Pages è attivo e pubblica il branch `gh-pages` (cartella principale), dove c'è la pagina "In costruzione".

Regole sugli asset:
- Usa le foto e i modelli di questo repository. Non usare foto prese da negozi o da Google Immagini. Se ti serve altro, usa solo materiale CC0 (per esempio Poly Haven) o crealo tu (shader, geometrie procedurali, SVG) e aggiungilo a `assets/LICENZE.md`.
- Crea una pagina **Crediti** (link nel footer) con autore, licenza e link alla fonte per ogni foto e modello usato, prendendo i dati da `assets/LICENZE.md`. Le foto CC BY e CC BY-SA devono sempre avere il credito.
- Per il web converti le foto in WebP/AVIF in più misure (per esempio 480, 960, 1600 px) con `srcset`, e comprimi i modelli in GLB con Draco (gltf-transform). Gli originali restano in `assets/`.
- I file HDR sono pesanti (circa 6 MB): convertili in versioni più leggere (1k, o environment map precompilata) e caricali solo quando servono.

## Obiettivo

Un sito che lasci tutti a bocca aperta al primo secondo, ma che resti elegante e professionale come un marchio di lusso (pensa ad Apple, Rolex, Patagonia). Gli effetti 3D servono a far desiderare il prodotto, mai a distrarre. Niente look da template.

## Concetto: "Il fiume"

Tutto il sito è un viaggio in un torrente di montagna, dall'alba al tramonto.

- **Apertura (hero):** scena 3D a schermo intero di un torrente alpino all'alba. Nebbia leggera sull'acqua, luce calda che filtra tra gli alberi (usa gli HDRI dell'alba), acqua che scorre in modo realistico con uno shader (riflessi, rifrazione, schiuma leggera vicino ai sassi). Sassi e muschio fatti con i modelli e le texture del repository. Al centro, in primo piano, una mosca secca in macro scende piano e si posa sull'acqua creando cerchi concentrici che si allargano. Il titolo compare con un'animazione lenta e raffinata.
- **Discesa nel fiume:** scorrendo la pagina, la telecamera segue la corrente e scende sotto la superficie. Ogni livello presenta una categoria:
  1. in superficie le **mosche secche**;
  2. a metà acqua le **sommerse**;
  3. sul fondo, tra i sassi, le **ninfe**;
  4. nella corrente profonda gli **streamer**, con una trota che passa (stilizzata, fatta con geometria o shader se non c'è un modello).
- **Luce che cambia:** mentre si scorre, il cielo e la luce passano piano piano dall'alba al tramonto (usa gli HDRI di alba e tramonto).
- **Particelle leggere:** pollini, piccoli insetti in volo, bolle sott'acqua, riflessi. Parallasse discreta. Mai troppe.

## Prodotti (demo)

- Crea un catalogo di **prodotti demo**, con nomi e prezzi inventati, almeno 24 mosche (6 per categoria) più 6 kit e 6 articoli di attrezzatura. Usa le foto del repository.
- Ogni prodotto deve essere segnato chiaramente come demo (per esempio un'etichetta "Demo" e una frase nel footer: "Sito dimostrativo, i prodotti e i prezzi sono di esempio").
- Ogni mosca ha una vista 3D che si può ruotare con il dito o il mouse e ingrandire in macro. Usa `mosca-secca.glb` e crea varianti procedurali (colori diversi di corpo, hackle, ali, coda) per le altre mosche; se il 3D non è adatto per una categoria, usa la foto macro con un effetto di profondità.
- Passando sopra una scheda prodotto, la mosca si gira leggermente e una **luce passa sopra** come un riflesso (light sweep).
- **Filtri:** tipo di mosca, misura dell'amo, stagione, pesce (trota, temolo) e acqua (torrente, lago).
- **Calendario delle schiuse:** una linea del tempo interattiva dei 12 mesi che mostra quali insetti escono in ogni periodo (effimere, tricotteri, plecotteri, chironomidi) e consiglia le mosche giuste, con link ai prodotti.
- **Kit pronti e confezioni regalo**, con una piccola animazione di apertura della scatola.

## Carrello e pagamento (demo)

- Carrello funzionante salvato nel browser (localStorage).
- **Nessun pagamento vero.** Il checkout è una simulazione (mock) oppure Stripe in modalità test. Non inserire chiavi segrete nel codice e non collegare nessun conto vero.
- Il percorso fino alla conferma dell'ordine richiede **al massimo 3 passaggi** (carrello, dati e spedizione, conferma). Alla fine mostra una pagina "Ordine demo ricevuto".
- Il pulsante del carrello si vede **sempre**, su ogni pagina e su telefono.

## Altre pagine

Home (il fiume), Negozio con filtri, Scheda prodotto, Calendario delle schiuse, Kit e regali, La nostra storia (artigianato, costruzione a mano, foto della morsa), Contatti (solo modulo finto, non invia nulla), Crediti, Spedizioni e resi, Privacy (testi di esempio).

## Stile

- **Colori:** verde bosco scuro, crema caldo, rame e oro opaco, nero profondo.
- **Caratteri:** un serif elegante per i titoli (per esempio Cormorant Garamond) e un sans-serif pulito per i testi (per esempio Inter).
- Tanto spazio vuoto, foto e modelli grandi, testi brevi. Movimenti lenti e fluidi, mai a scatti.
- **Dettagli curati:** cursore personalizzato a forma di cerchio che si allarga sui link (solo su computer); **suoni d'acqua** leggerissimi, spenti all'inizio e attivabili con un pulsante; **transizioni** morbide tra le pagine.

## Tecnologia

- **Vite + React** (oppure Next.js con `output: 'export'`), **React Three Fiber** e **drei** (Three.js) per il 3D, **GSAP ScrollTrigger** per le animazioni allo scorrimento, **Lenis** per lo scorrimento morbido.
- Modelli in GLB compressi con **Draco**, caricati solo quando servono (lazy loading), con `Suspense` e un caricamento elegante.
- Sito statico, pubblicato su **GitHub Pages con un workflow GitHub Actions**:
  1. sposta `strumenti/pages.yml` in `.github/workflows/pages.yml` (puoi migliorarlo);
  2. passa GitHub Pages da "branch gh-pages" a "GitHub Actions", per esempio con `gh api -X PUT repos/griveljoseph3-ship-it/mosche-da-pesca/pages -f build_type=workflow`;
  3. fai push su `main` e controlla che il workflow diventi verde.
  - **Piano B:** se GitHub rifiuta il push del file del workflow (manca il permesso `workflow`), non bloccarti: fai la build in locale e pubblica la cartella `dist/` sul branch `gh-pages` (per esempio con `npx gh-pages -d dist --dotfiles`, aggiungendo un file `.nojekyll`). Pages è già configurato per quel branch, quindi il link funziona subito.
- **Base path corretto:** il sito vive su `/mosche-da-pesca/`. Con Vite imposta `base: '/mosche-da-pesca/'`; con Next.js imposta `basePath` e `assetPrefix`. Tutti i link e gli asset devono funzionare su https://griveljoseph3-ship-it.github.io/mosche-da-pesca/ . Per le pagine interne usa un router che funzioni su GitHub Pages (per esempio HashRouter, oppure un `404.html` che reindirizza).
- In **italiano**, con i testi in un file separato così l'inglese si aggiunge facilmente dopo.

## Regole importanti

- **Velocissimo:** punteggio Lighthouse sopra 90 (prestazioni, accessibilità, SEO, best practice) su computer. Controllalo e sistemalo prima di finire.
- **Telefono prima di tutto (mobile-first):** perfetto su telefono, tablet e computer. Sui telefoni lenti usa una versione più leggera dello stesso effetto (immagini, video o una scena 3D semplificata al posto di quella pesante).
- Se il visitatore ha impostato **"riduci movimento"** (`prefers-reduced-motion`), gli effetti si fermano e il sito resta bello e usabile.
- **Accessibilità:** testo alternativo per ogni immagine, contrasto buono, si può usare anche con la tastiera.
- **SEO:** titoli e descrizioni per ogni pagina, dati strutturati Product, sitemap, Open Graph, parole chiave come "mosche da pesca", "mosche secche", "ninfe pesca a mosca", "streamer".
- Comprare dev'essere sempre facile, anche con tutti gli effetti.

## Quando hai finito

1. Fai commit e push su `main`.
2. Controlla che la pubblicazione sia finita (workflow verde, oppure branch `gh-pages` aggiornato con il Piano B) e che il link si apra davvero, con foto e 3D che si caricano.
3. Scrivi a Joseph il link: **https://griveljoseph3-ship-it.github.io/mosche-da-pesca/**
