import * as THREE from 'three';
import { SUBACQUEO_DICH, SUBACQUEO_FRAMMENTO } from './glsl.js';

// Uniform condivise da tutti i materiali della scena del fiume.
export const U = {
  uTempo: { value: 0 },
  uSole: { value: new THREE.Vector3(0, 0.2, -1).normalize() },
  uColoreSole: { value: new THREE.Color('#ffd2a0') },
  uZenit: { value: new THREE.Color() },
  uMezzo: { value: new THREE.Color() },
  uOrizzonte: { value: new THREE.Color() },
  uMonti: { value: new THREE.Color() },
  uNebbia: { value: new THREE.Color() },
  uDensita: { value: 0.03 },
  uSottacqua: { value: 0 },
  uAssorbimento: { value: new THREE.Color('#3f6a5c') },
  uAcquaProfonda: { value: new THREE.Color('#0d2a26') },
  uAcquaChiara: { value: new THREE.Color('#5d8a72') },
  uLuceCaustiche: { value: new THREE.Color('#fff1d0') },
  uAmbiente: { value: new THREE.Color('#6a7a8a') },
  uIncrespature: { value: [new THREE.Vector4(0, 0, -100, 0), new THREE.Vector4(0, 0, -100, 0), new THREE.Vector4(0, 0, -100, 0), new THREE.Vector4(0, 0, -100, 0)] },
  uRocce: { value: Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, 0, 0)) },
};

// Palette lungo la giornata: alba -> giorno -> tramonto
const tavolozze = [
  { t: 0, zenit: '#27324f', mezzo: '#a88a95', orizzonte: '#f6b877', monti: '#5f5a72', sole: '#ffc27e', soleInt: 2.8, nebbia: '#b39784', elev: 0.07, az: -0.12, amb: '#6f6f84' },
  { t: 0.5, zenit: '#41679a', mezzo: '#8fb0c8', orizzonte: '#dfe6e2', monti: '#7f93a0', sole: '#fff2dc', soleInt: 3.2, nebbia: '#b9c7c6', elev: 0.55, az: 0.1, amb: '#8a9cab' },
  { t: 1, zenit: '#262a4a', mezzo: '#b1636a', orizzonte: '#f79a54', monti: '#5a4a5e', sole: '#ffa45e', soleInt: 2.5, nebbia: '#c08c76', elev: 0.05, az: 0.35, amb: '#7a6672' },
];
const tmp = { a: new THREE.Color(), b: new THREE.Color() };

export function paletteGiorno(k, out) {
  const i = k < 0.5 ? 0 : 1;
  const A = tavolozze[i];
  const B = tavolozze[i + 1];
  const f = THREE.MathUtils.smootherstep((k - A.t) / (B.t - A.t), 0, 1);
  const mix = (ka) => tmp.a.set(A[ka]).lerp(tmp.b.set(B[ka]), f);
  out.zenit.copy(mix('zenit'));
  out.mezzo.copy(mix('mezzo'));
  out.orizzonte.copy(mix('orizzonte'));
  out.monti.copy(mix('monti'));
  out.sole.copy(mix('sole'));
  out.nebbia.copy(mix('nebbia'));
  out.amb.copy(mix('amb'));
  out.soleInt = A.soleInt + (B.soleInt - A.soleInt) * f;
  const elev = A.elev + (B.elev - A.elev) * f;
  const az = A.az + (B.az - A.az) * f;
  out.dir.set(Math.sin(az) * Math.cos(elev), Math.sin(elev), -Math.cos(az) * Math.cos(elev)).normalize();
  return out;
}

// Aggiunge tinta subacquea e caustiche a un materiale standard (rocce, piante).
export function patchSubacqueo(mat) {
  mat.onBeforeCompile = (s) => {
    s.uniforms.uTempo = U.uTempo;
    s.uniforms.uAssorbimento = U.uAssorbimento;
    s.uniforms.uLuceCaustiche = U.uLuceCaustiche;
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRialeMondo;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 rialeM = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          rialeM = instanceMatrix * rialeM;
        #endif
        vRialeMondo = (modelMatrix * rialeM).xyz;`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\n${SUBACQUEO_DICH}`)
      .replace('#include <fog_fragment>', `${SUBACQUEO_FRAMMENTO}\n#include <fog_fragment>`);
  };
  mat.customProgramCacheKey = () => 'riale-subacqueo';
  return mat;
}

// Nebbia condivisa dai materiali personalizzati (stessa formula di THREE.FogExp2)
export const NEBBIA = /* glsl */ `
vec3 applicaNebbia(vec3 col, float dist) {
  float f = 1.0 - exp(-uDensita * uDensita * dist * dist);
  return mix(col, uNebbia, clamp(f, 0.0, 1.0));
}
`;
