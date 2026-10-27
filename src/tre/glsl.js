// Funzioni GLSL condivise (scritte per questo progetto, CC0).

export const RUMORE = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}
// rumore con derivate analitiche (per le normali dell'acqua)
vec3 vnoised(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 du = 6.0 * f * (1.0 - f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  float k1 = b - a;
  float k2 = c - a;
  float k4 = a - b - c + d;
  return vec3(a + k1 * u.x + k2 * u.y + k4 * u.x * u.y, du * vec2(k1 + k4 * u.y, k2 + k4 * u.x));
}
// rete cellulare animata: bordi luminosi come le caustiche sul fondo
float cellule(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = hash22(i + g);
      o = 0.5 + 0.42 * sin(t + 6.2831 * o);
      float d = length(g + o - f);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
  }
  return f2 - f1;
}
float caustica(vec2 p, float t) {
  float a = cellule(p * 1.35, t * 0.9);
  float b = cellule(p * 2.1 + 3.7, t * 1.25 + 1.3);
  float c = (1.0 - smoothstep(0.0, 0.2, a)) * 0.7 + (1.0 - smoothstep(0.0, 0.14, b)) * 0.4;
  return c * c * (0.6 + 0.4 * vnoise(p * 0.35 + t * 0.1));
}
`;

// Profilo del letto del fiume: identico alla funzione JS in terreno.js
export const FIUME = /* glsl */ `
float centroFiume(float z) {
  return sin(z * 0.06) * 1.2 + sin(z * 0.023 + 1.0) * 1.5 - 1.25;
}
const float MEZZA_LARGHEZZA = 4.4;
`;

// Patch per i materiali standard: tinta e caustiche sotto il pelo dell'acqua.
export const SUBACQUEO_DICH = /* glsl */ `
uniform float uTempo;
uniform vec3 uAssorbimento;
uniform vec3 uLuceCaustiche;
varying vec3 vRialeMondo;
${RUMORE}
`;
export const SUBACQUEO_FRAMMENTO = /* glsl */ `
{
  float prof = max(0.0, -vRialeMondo.y);
  float sotto = smoothstep(0.0, 0.06, prof);
  gl_FragColor.rgb *= mix(vec3(1.0), uAssorbimento, sotto * (1.0 - exp(-prof * 1.1)));
  float ca = caustica(vRialeMondo.xz * 1.6, uTempo * 0.7);
  gl_FragColor.rgb += mix(uLuceCaustiche, vec3(0.8, 1.1, 1.0), 0.65) * ca * exp(-prof * 0.35) * sotto * 0.3;
}
`;
