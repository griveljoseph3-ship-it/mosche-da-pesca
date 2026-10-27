// Prepara gli asset per il web a partire dagli originali in assets/.
// - foto  -> public/img/<cartella>/<nome>-<480|960|1600>.<avif|webp> + src/data/immagini.json
// - modelli glTF -> public/3d/modelli/<nome>.glb (Draco, texture WebP max 1024)
// - texture -> public/3d/texture/<nome>/<mappa>.webp (1024 e 512)
// - HDRI -> public/3d/hdri/<nome>-1k.hdr e -512.hdr (RGBE, RLE)
// - crediti da assets/LICENZE.md -> src/data/crediti.json
// Uso: npm run assets   (gli originali restano in assets/)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = path.join(ROOT, 'assets');
const PUB = path.join(ROOT, 'public');
const LARGHEZZE = [480, 960, 1600];
const solo = process.argv[2]; // opzionale: foto | modelli | texture | hdri | crediti

const mk = (p) => fs.mkdirSync(p, { recursive: true });

async function foto() {
  const manifest = {};
  // 'render': immagini create con la scena 3D di questo progetto (strumenti/render.cjs), CC0
  for (const cartella of ['mosche', 'canne-attrezzatura', 'fiumi-ambientazioni', 'render']) {
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

function modelli() {
  const out = path.join(PUB, '3d/modelli');
  mk(out);
  const cli = path.join(ROOT, 'node_modules/.bin/gltf-transform');
  const lista = [
    ['rock_moss_set_01', 0.002],
    ['boulder_01', 0.004],
    ['stone_01', 0.004],
    ['moss_01', 0.0001],
    ['fern_02', 0.0005],
    ['tree_stump_01', 0.004],
    ['dead_tree_trunk', 0.004],
  ];
  for (const [nome, err] of lista) {
    const src = path.join(A, '3d/modelli', nome, `${nome}_1k.gltf`);
    const dst = path.join(out, `${nome}.glb`);
    execFileSync(cli, ['optimize', src, dst, '--compress', 'draco', '--texture-compress', 'webp', '--texture-size', '1024',
      '--join', 'false', '--flatten', 'false', '--palette', 'false', '--instance', 'false', '--simplify-error', String(err)], { stdio: 'inherit' });
  }
  // La mosca: le parti con nome servono per le varianti di colore, quindi niente join.
  execFileSync(cli, ['optimize', path.join(A, '3d/modelli/mosca-secca-stilizzata/mosca-secca.glb'), path.join(out, 'mosca-secca.glb'),
    '--compress', 'draco', '--join', 'false', '--flatten', 'false', '--palette', 'false', '--instance', 'false', '--simplify', 'false'], { stdio: 'inherit' });
  // decoder Draco servito dal sito (niente CDN esterni)
  const draco = path.join(PUB, 'draco');
  mk(draco);
  for (const f of ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'])
    fs.copyFileSync(path.join(ROOT, 'node_modules/three/examples/jsm/libs/draco/gltf', f), path.join(draco, f));
}

async function texture() {
  const scelte = {
    river_small_rocks: ['diff', 'nor_gl'],
    forest_leaves_02: ['diffuse', 'nor_gl'],
    ganges_river_pebbles: ['diff'],
  };
  for (const [nome, mappe] of Object.entries(scelte)) {
    const out = path.join(PUB, '3d/texture', nome);
    mk(out);
    for (const m of mappe) {
      const src = path.join(A, '3d/texture', nome, `${nome}_${m}_1k.jpg`);
      const tag = m === 'diffuse' ? 'diff' : m;
      await sharp(src).webp({ quality: 80 }).toFile(path.join(out, `${tag}-1k.webp`));
      await sharp(src).resize(512).webp({ quality: 78 }).toFile(path.join(out, `${tag}-512.webp`));
    }
  }
  console.log('texture ok');
}

function hdri() {
  const out = path.join(PUB, '3d/hdri');
  mk(out);
  for (const nome of ['kiara_1_dawn', 'kiara_8_sunset', 'river_rocks']) {
    const src = path.join(A, '3d/hdri', `${nome}_2k.hdr`);
    execFileSync('convert', [src, '-resize', '1024x512', path.join(out, `${nome}-1k.hdr`)]);
    execFileSync('convert', [src, '-resize', '512x256', path.join(out, `${nome}-512.hdr`)]);
  }
  console.log('hdri ok');
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

const passi = { foto, modelli, texture, hdri, crediti };
for (const [k, fn] of Object.entries(passi)) if (!solo || solo === k) await fn();
