// Forma del torrente: centro, profondità e altezza del terreno (stesse formule dello shader).
export const MEZZA_LARGHEZZA = 4.4;

export const centroFiume = (z) => Math.sin(z * 0.06) * 1.2 + Math.sin(z * 0.023 + 1.0) * 1.5 - 1.25;

export const profonditaFiume = (z) => {
  const t = Math.min(1, Math.max(0, (2 - z) / 16));
  const s = t * t * (3 - 2 * t);
  return 0.55 + (2.35 - 0.55) * s;
};

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
export function rumore(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export function fbm(x, y, ottave = 4) {
  let s = 0, a = 0.5;
  for (let i = 0; i < ottave; i++) {
    s += a * rumore(x, y);
    x = x * 2.03 + 1.7;
    y = y * 2.03 + 9.2;
    a *= 0.5;
  }
  return s;
}

export function altezza(x, z) {
  const c = centroFiume(z);
  const d = Math.abs(x - c);
  const W = MEZZA_LARGHEZZA;
  const D = profonditaFiume(z);
  let y;
  if (d < W) {
    const k = d / W;
    y = -D * (1 - Math.pow(k, 2.4)) + 0.04;
    y += (fbm(x * 0.7, z * 0.7) - 0.5) * 0.35 * (0.4 + k);
  } else {
    const e = d - W;
    y = 0.04 + e * 0.42 + e * e * 0.035;
    y += (fbm(x * 0.35 + 4, z * 0.35) - 0.5) * Math.min(1.6, 0.3 + e * 0.25);
  }
  return Math.min(y, 5.5);
}

// generatore pseudo-casuale ripetibile
export function casuale(seme = 1) {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
