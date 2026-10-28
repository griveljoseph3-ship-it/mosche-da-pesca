import { useEffect, useRef } from 'react';
import { SCENE } from './scene.js';
import { statoFiume } from './statoFiume.js';
import { movimentoRidotto, url } from '../lib/qualita.js';

// Il fiume fatto con le foto vere: WebGL anima solo l'acqua (corrente, riflessi, bolle),
// passa da una foto all'altra con una dissolvenza "liquida" e scalda la luce dall'alba al tramonto.

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uA, uB;
uniform vec2 uRisA, uRisB, uSchermo, uMouse, uFlussoA, uFlussoB;
uniform vec4 uAcquaA, uAcquaB;
uniform float uMix, uTempo, uLuce, uZoomA, uZoomB;
out vec4 colore;

float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float rumore(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * rumore(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }

// coordinate "cover" della foto sullo schermo (y dall'alto), con zoom lento e parallasse del puntatore
vec2 copri(vec2 uv, vec2 ris, float zoom) {
  float rs = uSchermo.x / uSchermo.y, ri = ris.x / ris.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s / zoom + 0.5 + uMouse * 0.006;
}

// l'acqua che scorre: piccole increspature allungate nel verso della corrente, solo nella zona d'acqua
vec3 campiona(sampler2D t, vec2 uv, vec2 ris, float zoom, vec4 acqua, vec2 flusso) {
  vec2 p = copri(uv, ris, zoom);
  float m = smoothstep(acqua.x - 0.03, acqua.x + 0.1, p.y) * (1.0 - smoothstep(acqua.y - 0.02, acqua.y + 0.02, p.y));
  vec2 d = normalize(flusso + 1e-4);
  vec2 n = vec2(-d.y, d.x);
  vec2 q = vec2(dot(p, d) * 9.0, dot(p, n) * 34.0) - vec2(uTempo * 1.4, 0.0);
  float a = rumore(q), b = rumore(q * 1.9 + 4.3 - vec2(uTempo * 0.7, 0.0));
  vec2 off = (d * (a - 0.5) * 0.5 + n * (b - 0.5)) * 0.0055 * acqua.z * m;
  if (acqua.w > 0.5) off += vec2(sin(p.y * 9.0 + uTempo * 0.8), cos(p.x * 7.0 + uTempo * 0.6)) * 0.0028;
  vec3 c = texture(t, p + off).rgb;
  // scintillio sui riflessi già chiari della foto
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float g = pow(rumore(q * 2.7 + 11.0), 7.0) * smoothstep(0.55, 0.9, lum) * m * (1.0 - acqua.w);
  c += g * 0.35;
  if (acqua.w > 0.5) {
    // bolle che salgono e luce che tremola
    vec2 bq = vec2(uv.x * 26.0, uv.y * 14.0 + uTempo * 0.6);
    vec2 ci = floor(bq), cf = fract(bq) - 0.5;
    float h = hash(ci);
    float bolla = step(0.93, h) * smoothstep(0.12, 0.06, abs(length(cf + (vec2(hash(ci + 3.0), hash(ci + 5.0)) - 0.5) * 0.5) - 0.12));
    c += bolla * 0.18;
    c *= 0.94 + 0.08 * fbm(uv * 4.0 + vec2(uTempo * 0.15, uTempo * 0.1));
  }
  return c;
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uSchermo.x, 1.0 - gl_FragCoord.y / uSchermo.y);
  // dissolvenza liquida
  // la nuova foto sale dal basso come l'acqua, con un bordo irregolare che si deforma
  float n = fbm(uv * 3.0 + uTempo * 0.05);
  float k = n * 0.55 + (1.0 - uv.y) * 0.45;
  float bordo = mix(-0.12, 1.12, uMix);
  float w = smoothstep(bordo + 0.05, bordo - 0.05, k);
  float vicino = 1.0 - smoothstep(0.0, 0.18, abs(k - bordo));
  vec2 spinta = (vec2(n, fbm(uv * 3.0 + 9.0)) - 0.5) * 0.05 * vicino;
  vec3 a = campiona(uA, uv + spinta, uRisA, uZoomA, uAcquaA, uFlussoA);
  vec3 b = campiona(uB, uv - spinta, uRisB, uZoomB, uAcquaB, uFlussoB);
  vec3 c = mix(a, b, w);
  c += vec3(0.9, 0.95, 1.0) * vicino * 0.06 * step(0.001, uMix) * step(uMix, 0.999);

  // luce dall'alba (calda, morbida) al giorno (neutra) al tramonto (arancio)
  vec3 alba = vec3(1.07, 0.98, 0.88), giorno = vec3(1.0, 1.0, 1.0), tramonto = vec3(1.07, 0.97, 0.88);
  vec3 tinta = uLuce < 0.5 ? mix(alba, giorno, uLuce * 2.0) : mix(giorno, tramonto, uLuce * 2.0 - 1.0);
  c *= tinta;
  float alone = smoothstep(0.9, 0.0, distance(uv, vec2(0.62, 0.05)));
  c += vec3(1.0, 0.75, 0.45) * alone * 0.05 * abs(uLuce - 0.5) * 2.0;
  // vignettatura e grana leggera
  c *= mix(0.72, 1.0, smoothstep(1.05, 0.35, distance(uv, vec2(0.5, 0.48))));
  c += (hash(uv * uSchermo + uTempo) - 0.5) * 0.018;
  colore = vec4(c, 1.0);
}`;

function compila(gl, tipo, src) {
  const s = gl.createShader(tipo);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function caricaImmagine(nome, larghezza) {
  return new Promise((ok, ko) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => ok(img)) : ok(img));
    img.onerror = ko;
    img.src = url(`img/${nome}-${larghezza}.webp`);
  });
}

export default function FiumeFoto({ onPronta }) {
  const ref = useRef(null);
  const pronta = useRef(onPronta);
  pronta.current = onPronta;

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compila(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compila(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      console.warn('Fiume: effetto WebGL non disponibile', e);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ['uA', 'uB', 'uRisA', 'uRisB', 'uSchermo', 'uMouse', 'uFlussoA', 'uFlussoB', 'uAcquaA', 'uAcquaB', 'uMix', 'uTempo', 'uLuce', 'uZoomA', 'uZoomB'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    gl.uniform1i(U.uA, 0);
    gl.uniform1i(U.uB, 1);

    const texture = SCENE.map(() => null);
    const misure = SCENE.map(() => [1, 1]);
    const larghezza = window.innerWidth * Math.min(devicePixelRatio, 2) > 1300 ? 1600 : 960;
    let vivo = true;
    const carica = (i) =>
      caricaImmagine(SCENE[i].foto, larghezza).then((img) => {
        if (!vivo) return;
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        texture[i] = t;
        misure[i] = [img.naturalWidth, img.naturalHeight];
      });
    // prima la foto dell'apertura, poi le altre in ordine
    carica(0)
      .then(() => { if (vivo) { disegna(performance.now()); pronta.current?.(); } })
      .then(() => SCENE.slice(1).reduce((p, _, k) => p.then(() => carica(k + 1)), Promise.resolve()))
      .catch(() => {});

    const ridotto = movimentoRidotto();
    const mouse = [0, 0];
    let tempo = 0;
    let ultimo = performance.now();
    let raf = 0;

    const dimensiona = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
    };

    function scena(i) {
      const s = SCENE[i];
      return { t: texture[i] || texture[0], ris: texture[i] ? misure[i] : misure[0], s: texture[i] ? s : SCENE[0] };
    }

    function disegna(ora) {
      if (!texture[0]) return;
      const dt = Math.min(0.1, (ora - ultimo) / 1000);
      ultimo = ora;
      if (!ridotto) tempo += dt;
      dimensiona();
      const p = statoFiume.p;
      const sPos = p * (SCENE.length - 1);
      const i = Math.min(SCENE.length - 2, Math.floor(sPos));
      const f = sPos - i;
      const mix = Math.min(1, Math.max(0, (f - 0.3) / 0.4));
      const A = scena(i), B = scena(i + 1);
      mouse[0] += ((statoFiume.mouseX || 0) - mouse[0]) * 0.05;
      mouse[1] += ((statoFiume.mouseY || 0) - mouse[1]) * 0.05;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, B.t);
      gl.uniform2f(U.uRisA, ...A.ris);
      gl.uniform2f(U.uRisB, ...B.ris);
      gl.uniform2f(U.uSchermo, canvas.width, canvas.height);
      gl.uniform2f(U.uMouse, ridotto ? 0 : mouse[0], ridotto ? 0 : mouse[1]);
      gl.uniform2f(U.uFlussoA, ...A.s.flusso);
      gl.uniform2f(U.uFlussoB, ...B.s.flusso);
      gl.uniform4f(U.uAcquaA, A.s.acqua[0], A.s.acqua[1], A.s.forza, A.s.sotto);
      gl.uniform4f(U.uAcquaB, B.s.acqua[0], B.s.acqua[1], B.s.forza, B.s.sotto);
      gl.uniform1f(U.uMix, mix);
      gl.uniform1f(U.uTempo, tempo);
      gl.uniform1f(U.uLuce, p);
      gl.uniform1f(U.uZoomA, 1.04 + f * 0.04);
      gl.uniform1f(U.uZoomB, 1.04 + Math.max(0, f - 0.5) * 0.04);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const loop = (ora) => {
      raf = requestAnimationFrame(loop);
      if (!statoFiume.visibile || document.hidden) return;
      disegna(ora);
    };
    if (ridotto) {
      const su = () => requestAnimationFrame(disegna);
      window.addEventListener('scroll', su, { passive: true });
      window.addEventListener('resize', su);
      return () => { vivo = false; window.removeEventListener('scroll', su); window.removeEventListener('resize', su); };
    }
    raf = requestAnimationFrame(loop);
    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      texture.forEach((t) => t && gl.deleteTexture(t));
      gl.deleteProgram(prog);
    };
  }, []);

  return <canvas ref={ref} className="fiume-canvas" aria-hidden="true" />;
}
