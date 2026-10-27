// Crea le immagini "render" (CC0) a partire dalle scene 3D del sito, con il server di anteprima avviato:
//   npm run build && npx vite preview --port 4173   poi   node strumenti/render.cjs
// Output in assets/foto/render/ (poi: npm run assets -- foto)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:4173/mosche-da-pesca';
const OUT = path.join(__dirname, '../assets/foto/render');
const NASCONDI = '.testata,.hero-contenuto,.hero-scorri,.profondimetro,.galleria-badge,.galleria-nota,.cursore,.cursore-punto,.barra-acquisto-mobile{display:none!important} .fiume-velo{opacity:.35}';
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const solo = process.argv[2];
  const browser = await chromium.launch({ args: ARGS });

  if (solo === 'og') return browser.close();
  if (!solo || solo === 'prodotti') {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });
    for (const slug of ['perdigon-fario', 'matuka-fario']) {
      await page.goto(`${BASE}/prodotto/${slug}?render`, { waitUntil: 'load' });
      await page.addStyleTag({ content: NASCONDI + ' .galleria{position:static!important}' });
      await page.waitForSelector('.visore.pronto', { timeout: 60000 });
      await page.waitForTimeout(9000);
      const el = await page.$('.galleria-palco');
      await el.screenshot({ path: path.join(OUT, `${slug}.png`), timeout: 180000 });
      console.log('render', slug);
    }
    await page.close();
  }

  if (!solo || solo === 'poster') {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto(`${BASE}/?qualita=pieno&velocita=5`, { waitUntil: 'load' });
    await page.addStyleTag({ content: NASCONDI });
    await page.waitForSelector('.fiume-sfondo.pronta', { timeout: 180000 });
    await page.waitForTimeout(Number(process.env.ATTESA || 40000));
    await page.screenshot({ path: path.join(OUT, 'poster-alba.png'), timeout: 300000 });
    console.log('render poster');
  }
  await browser.close();
})();

// Immagine per le anteprime social (1200×630): node strumenti/render.cjs og
if (process.argv[2] === 'og') {
  (async () => {
    const font = (f) => fs.readFileSync(path.join(__dirname, '../node_modules', f)).toString('base64');
    const poster = fs.readFileSync(path.join(OUT, 'poster-alba.png')).toString('base64');
    const html = `<!doctype html><html><head><style>
      @font-face { font-family: C; src: url(data:font/woff2;base64,${font('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2')}); }
      @font-face { font-family: CI; src: url(data:font/woff2;base64,${font('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2')}); }
      @font-face { font-family: I; src: url(data:font/woff2;base64,${font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}); }
      body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #0a0e0b url(data:image/png;base64,${poster}) center/cover; color: #f1e9d8; }
      .v { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8,12,9,.85), rgba(8,12,9,.2) 70%); }
      .t { position: absolute; left: 80px; bottom: 90px; }
      .o { font: 500 18px I; letter-spacing: .24em; text-transform: uppercase; color: #c6a66b; margin: 0 0 24px; }
      h1 { font: 400 104px/0.95 C; margin: 0; letter-spacing: -.01em; }
      h1 em { font-family: CI; font-style: normal; }
      .m { position: absolute; left: 80px; top: 64px; font: 400 44px C; letter-spacing: .06em; }
      .d { display: inline-block; font: 600 14px I; letter-spacing: .16em; background: #dcc394; color: #0a0e0b; padding: 6px 12px; border-radius: 99px; margin-left: 14px; vertical-align: middle; }
    </style></head><body><div class="v"></div><div class="m">Riale</div>
    <div class="t"><p class="o">Mosche da pesca legate a mano <span class="d">DEMO</span></p><h1>Il fiume<br><em>comincia all’alba.</em></h1></div></body></html>`;
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(__dirname, '../public/og.jpg'), type: 'jpeg', quality: 86 });
    await browser.close();
    console.log('og.jpg pronto');
  })();
}
