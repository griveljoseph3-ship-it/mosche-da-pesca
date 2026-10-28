# Riale · Mosche da pesca (sito demo)

**Il sito online:** https://griveljoseph3-ship-it.github.io/mosche-da-pesca/

Negozio dimostrativo di mosche da pesca artigianali. **I prodotti e i prezzi sono di esempio e non si paga davvero.**

## Cosa c'è dentro

- **Home**: una foto d'apertura del torrente, poi i quattro tipi di mosca come grandi foto del fiume (superficie: secche · mezz'acqua: sommerse · fondo tra i sassi: ninfe · corrente profonda: streamer), le mosche più scelte, il calendario e la storia. Niente effetti speciali: foto vere, testi brevi, caricamento rapido.
- **Negozio diviso per tipo**: `/negozio` mostra tutte le sezioni (secche, sommerse, ninfe, streamer, kit e regali, attrezzatura); ogni tipo ha la sua pagina (`/negozio/secche`, `/negozio/ninfe`…) con filtri per misura dell'amo, stagione, pesce e acqua.
- **Schede prodotto** con la foto macro vera e l'ingrandimento che segue il puntatore o il dito.
- **Calendario delle schiuse**, **Kit e regali** (scatola che si apre), **La nostra storia**, **Contatti** (modulo finto), **Crediti**, **Spedizioni e resi**, **Privacy**.
- **Carrello** salvato nel browser e **cassa simulata** in 3 passaggi, fino a "Ordine demo ricevuto".

## Comandi

```bash
npm install
npm run dev      # sviluppo su http://localhost:5173/mosche-da-pesca/
npm run build    # sito in dist/ (con pagine pre-generate, sitemap, robots, 404)
npm run assets   # rigenera le foto WebP/AVIF e i crediti da assets/
```

`npm run assets` serve solo se cambiano i file in `assets/`: i file per il web sono già in `public/`.

## Pubblicazione

Ogni push su `main` avvia `.github/workflows/pages.yml`, che fa la build e pubblica `dist/` sul branch `gh-pages` (servito da GitHub Pages).

## Struttura

- `src/pagine/` le pagine, `src/componenti/` i pezzi dell'interfaccia.
- `src/i18n/it.js` tutti i testi dell'interfaccia; `src/data/catalogo.it.js` i testi dei prodotti. Per l'inglese basta aggiungere `en.js` e `catalogo.en.js`.
- `src/data/catalogo.js` prodotti, prezzi e filtri; `src/data/schiuse.js` il calendario degli insetti.
- `assets/` gli originali (foto, modelli, HDRI) e `assets/LICENZE.md` con autori e licenze.

## Prestazioni e accessibilità

- La foto d'apertura è già nell'HTML della home; il codice delle altre pagine si scarica in sottofondo, così i clic sono istantanei.
- Testo alternativo per le immagini, uso da tastiera, contrasto adeguato.

## Importante

- È un sito **demo**: prodotti e prezzi sono inventati e non si paga davvero.
- Non mettere mai password o chiavi segrete in questo progetto: è pubblico.
