// Prepara gli asset per il web a partire dagli originali in assets/.
// - foto  -> public/img/<cartella>/<nome>-<480|960|1600>.<avif|webp> + src/data/immagini.json
// - crediti da assets/LICENZE.md -> src/data/crediti.json
// Uso: npm run assets   (gli originali restano in assets/)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = path.join(ROOT, 'assets');
const PUB = path.join(ROOT, 'public');
const LARGHEZZE = [480, 960, 1600];
const solo = process.argv[2]; // opzionale: foto | crediti

const mk = (p) => fs.mkdirSync(p, { recursive: true });

async function foto() {
  const manifest = {};
  for (const cartella of ['mosche', 'canne-attrezzatura', 'fiumi-ambientazioni']) {
    const dir = path.join(A, 'foto', cartella);
    if (!fs.existsSync(dir)) continue;
    const out = path.join(PUB, 'img', cartella);
    mk(out);
    for (const f of fs.readdirSync(dir).filter((f) => /\.(jpg|png)$/.test(f)).sort()) {
      const nome = f.replace(/\.(jpg|png)$/, '');
      const src = path.join(dir, f);
      const meta = await sharp(src).metadata();
      const larghezze = LARGHEZZE.filter((w) => w <= meta.width);
      if (larghezze.length < LARGHEZZE.length && !larghezze.includes(meta.width)) larghezze.push(meta.width);
      for (const w of larghezze) {
        const base = path.join(out, `${nome}-${w}`);
        if (!fs.existsSync(`${base}.webp`)) await sharp(src).resize({ width: w }).webp({ quality: 74, effort: 5 }).toFile(`${base}.webp`);
        if (!fs.existsSync(`${base}.avif`)) await sharp(src).resize({ width: w }).avif({ quality: 52, effort: 5 }).toFile(`${base}.avif`);
      }
      const lqip = await sharp(src).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
      const { dominant } = await sharp(src).stats();
      manifest[`${cartella}/${nome}`] = {
        w: meta.width,
        h: meta.height,
        sizes: larghezze,
        lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
        colore: `rgb(${dominant.r},${dominant.g},${dominant.b})`,
      };
      process.stdout.write('.');
    }
  }
  mk(path.join(ROOT, 'src/data'));
  fs.writeFileSync(path.join(ROOT, 'src/data/immagini.json'), JSON.stringify(manifest, null, 1));
  console.log('\nfoto:', Object.keys(manifest).length);
}

function crediti() {
  const md = fs.readFileSync(path.join(A, 'LICENZE.md'), 'utf8');
  const righe = md.split('\n');
  const foto = [];
  const tre = [];
  let sezione = '';
  const link = (s) => {
    const m = s.match(/\[([^\]]+)\]\(([^)]+)\)/);
    return m ? { testo: m[1], url: m[2] } : { testo: s.trim(), url: null };
  };
  for (const r of righe) {
    if (r.startsWith('## ')) sezione = r.slice(3);
    if (!r.startsWith('| ') || r.startsWith('| File') || r.startsWith('| Tipo') || r.startsWith('|---')) continue;
    const c = r.split('|').slice(1, -1).map((x) => x.trim());
    if (sezione.startsWith('Foto')) {
      const lic = link(c[2]);
      foto.push({ file: c[0].replace(/`/g, ''), autore: c[1], licenza: lic.testo, licenzaUrl: lic.url, fonte: link(c[3]).url });
    } else if (sezione.startsWith('3D')) {
      tre.push({ tipo: c[0], file: c[1].replace(/`/g, ''), autore: c[2], licenza: 'CC0 1.0', licenzaUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', fonte: c[3] });
    } else if (sezione.startsWith('Modello creato')) {
      tre.push({ tipo: 'Modello 3D', file: c[0].replace(/`/g, ''), autore: c[1], licenza: 'CC0 1.0', licenzaUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', fonte: null });
    }
  }
  fs.writeFileSync(path.join(ROOT, 'src/data/crediti.json'), JSON.stringify({ foto, tre }, null, 1));
  console.log('crediti:', foto.length, tre.length);
}

const passi = { foto, crediti };
for (const [k, fn] of Object.entries(passi)) if (!solo || solo === k) await fn();
