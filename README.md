# Riale · Mosche da pesca (sito demo)

**Il sito online:** https://griveljoseph3-ship-it.github.io/mosche-da-pesca/

Negozio dimostrativo di mosche da pesca artigianali. **I prodotti e i prezzi sono di esempio e non si paga davvero.**

## Cosa c'è dentro

- **Home "Il fiume"**: una scena 3D (React Three Fiber) di un torrente all'alba. Scorrendo, la telecamera segue la corrente e scende sotto l'acqua: mosche secche in superficie, sommerse a mezz'acqua, ninfe sul fondo, streamer nella corrente profonda con una trota che passa. La luce va dall'alba al tramonto.
- **Negozio** con filtri (tipo, misura dell'amo, stagione, pesce, acqua), **schede prodotto** con vista 3D della mosca da ruotare e ingrandire e foto macro con effetto di profondità.
- **Calendario delle schiuse**, **Kit e regali** (scatola che si apre), **La nostra storia**, **Contatti** (modulo finto), **Crediti**, **Spedizioni e resi**, **Privacy**.
- **Carrello** salvato nel browser e **cassa simulata** in 3 passaggi, fino a "Ordine demo ricevuto".

## Comandi

```bash
npm install
npm run dev      # sviluppo su http://localhost:5173/mosche-da-pesca/
npm run build    # sito in dist/ (con pagine pre-generate, sitemap, robots, 404)
npm run assets   # rigenera foto WebP/AVIF, GLB Draco, texture e HDRI da assets/
```

`npm run assets` serve solo se cambiano i file in `assets/`: i file per il web sono già in `public/`.

## Pubblicazione

Ogni push su `main` avvia `.github/workflows/pages.yml`, che fa la build e pubblica `dist/` su GitHub Pages.

## Struttura

- `src/pagine/` le pagine, `src/componenti/` i pezzi dell'interfaccia, `src/tre/` la scena 3D e il visore delle mosche.
- `src/i18n/it.js` tutti i testi dell'interfaccia; `src/data/catalogo.it.js` i testi dei prodotti. Per l'inglese basta aggiungere `en.js` e `catalogo.en.js`.
- `src/data/catalogo.js` prodotti, prezzi e filtri; `src/data/schiuse.js` il calendario degli insetti.
- `assets/` gli originali (foto, modelli, HDRI) e `assets/LICENZE.md` con autori e licenze.

## Prestazioni e accessibilità

- Il 3D si carica solo dopo la pagina; su telefoni e computer lenti la scena è più leggera; senza GPU, o con "riduci movimento", al posto del 3D ci sono le foto.
- Testo alternativo per le immagini, uso da tastiera, contrasto adeguato.

## Importante

- È un sito **demo**: prodotti e prezzi sono inventati e non si paga davvero.
- Non mettere mai password o chiavi segrete in questo progetto: è pubblico.
