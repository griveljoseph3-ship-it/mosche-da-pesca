// Sceglie quanto 3D mostrare in base al dispositivo.
//  'statico'  -> niente WebGL (prefers-reduced-motion, WebGL assente)
//  'leggero'  -> stessa scena, meno dettagli (telefoni, pochi core, risparmio dati)
//  'pieno'    -> tutto
let cache;

export function movimentoRidotto() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let infoGL;
function leggiGL() {
  if (infoGL !== undefined) return infoGL;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return (infoGL = null);
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    infoGL = { renderer: String(renderer || '') };
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    infoGL = null;
  }
  return infoGL;
}

export function haWebGL() {
  return !!leggiGL();
}

// Rendering software (nessuna GPU): la scena andrebbe a scatti, meglio la versione statica.
export function renderSoftware() {
  const i = leggiGL();
  return !!i && /swiftshader|llvmpipe|software|softpipe|basic render/i.test(i.renderer);
}

export function livelloQualita() {
  if (cache) return cache;
  if (typeof window === 'undefined') return 'statico';
  const forzato = new URLSearchParams(location.search).get('qualita');
  if (forzato) return (cache = forzato);
  if (movimentoRidotto() || !haWebGL() || renderSoftware()) return (cache = 'statico');
  const nav = navigator;
  const pochiCore = (nav.hardwareConcurrency || 4) <= 4;
  const pocaMemoria = nav.deviceMemory && nav.deviceMemory <= 4;
  const risparmio = nav.connection && (nav.connection.saveData || /2g/.test(nav.connection.effectiveType || ''));
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const piccolo = window.innerWidth < 820;
  if (risparmio || pocaMemoria || (touch && piccolo) || (touch && pochiCore)) return (cache = 'leggero');
  return (cache = 'pieno');
}

export const BASE = import.meta.env.BASE_URL;
export const url = (p) => `${BASE}${p.replace(/^\//, '')}`;
