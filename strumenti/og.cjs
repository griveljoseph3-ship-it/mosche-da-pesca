// Immagine per le anteprime social (1200×630) da una foto vera del repository.
// Uso (serve Playwright): node strumenti/og.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const R = path.join(__dirname, '..');
  const b64 = (f) => fs.readFileSync(path.join(R, f)).toString('base64');
  const html = `<!doctype html><html><head><style>
    @font-face { font-family: C; src: url(data:font/woff2;base64,${b64('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2')}); }
    @font-face { font-family: CI; src: url(data:font/woff2;base64,${b64('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2')}); }
    @font-face { font-family: I; src: url(data:font/woff2;base64,${b64('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}); }
    body { margin: 0; width: 1200px; height: 630px; overflow: hidden; color: #f1e9d8;
      background: #0a0e0b url(data:image/jpeg;base64,${b64('assets/foto/fiumi-ambientazioni/torrente-bosco-oirase.jpg')}) center 60% / cover; }
    .v { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8,12,9,.82), rgba(8,12,9,.25) 70%); }
    .t { position: absolute; left: 80px; bottom: 90px; }
    .o { font: 500 18px I; letter-spacing: .24em; text-transform: uppercase; color: #dcc394; margin: 0 0 24px; }
    h1 { font: 400 104px/0.95 C; margin: 0; }
    h1 em { font-family: CI; font-style: normal; }
    .m { position: absolute; left: 80px; top: 64px; font: 400 44px C; letter-spacing: .06em; }
    .d { display: inline-block; font: 600 14px I; letter-spacing: .16em; background: #dcc394; color: #0a0e0b; padding: 6px 12px; border-radius: 99px; margin-left: 14px; vertical-align: middle; }
  </style></head><body><div class="v"></div><div class="m">Riale</div>
  <div class="t"><p class="o">Mosche da pesca legate a mano <span class="d">DEMO</span></p><h1>Il fiume<br><em>comincia all’alba.</em></h1></div></body></html>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(R, 'public/og.jpg'), type: 'jpeg', quality: 86 });
  await browser.close();
  console.log('public/og.jpg pronto');
})();
