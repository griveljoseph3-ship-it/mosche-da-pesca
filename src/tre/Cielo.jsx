import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { U } from './ambiente.js';
import { RUMORE } from './glsl.js';

export const CIELO_GLSL = /* glsl */ `
vec3 coloreCielo(vec3 dir, bool conMonti) {
  float e = dir.y;
  vec3 col = mix(uOrizzonte, uMezzo, smoothstep(0.0, 0.12, e));
  col = mix(col, uZenit, smoothstep(0.1, 0.75, e));
  // velature di nuvole
  vec2 q = dir.xz / (max(e, 0.02) + 0.18);
  float nuv = fbm(q * 1.1 + vec2(uTempo * 0.004, 0.0));
  nuv = smoothstep(0.52, 0.85, nuv) * smoothstep(0.02, 0.25, e);
  float s = max(dot(dir, uSole), 0.0);
  vec3 tintaNuv = mix(uMezzo * 1.1, uColoreSole * 0.55, pow(s, 3.0));
  col = mix(col, tintaNuv, nuv * 0.55);
  // sole: alone largo e disco
  col += uColoreSole * (pow(s, 6.0) * 0.22 + pow(s, 48.0) * 0.55);
  col += uColoreSole * smoothstep(0.99955, 0.9998, s) * 6.0;
  if (conMonti) {
    float az = atan(dir.x, -dir.z);
    float picchi1 = abs(fract(az * 5.0 + fbm(vec2(az * 3.0, 4.0)) * 1.5) - 0.5);
    float picchi2 = abs(fract(az * 9.0 + fbm(vec2(az * 6.0, 8.0)) * 1.5) - 0.5);
    float r1 = 0.045 + fbm(vec2(az * 3.5, 1.0)) * 0.12 - picchi1 * 0.05;
    float r2 = 0.02 + fbm(vec2(az * 7.0 + 7.0, 3.0)) * 0.07 - picchi2 * 0.03;
    vec3 m1 = mix(uMonti, uOrizzonte, 0.62 + 0.25 * pow(s, 4.0));
    vec3 m2 = mix(uMonti, uNebbia, 0.55);
    col = mix(col, m1, smoothstep(r1 + 0.003, r1 - 0.003, e));
    col = mix(col, m2, smoothstep(r2 + 0.003, r2 - 0.003, e));
    // all'orizzonte il cielo si scioglie nella foschia (raccordo con la nebbia della scena)
    col = mix(col, uNebbia, smoothstep(0.06, -0.02, e) * 0.92);
  }
  return col;
}
`;

export default function Cielo() {
  const ref = useRef();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: U,
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p.xyww;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTempo;
          uniform vec3 uSole, uColoreSole, uZenit, uMezzo, uOrizzonte, uMonti, uNebbia;
          uniform float uSottacqua;
          varying vec3 vDir;
          ${RUMORE}
          ${CIELO_GLSL}
          void main() {
            vec3 col = coloreCielo(normalize(vDir), true);
            col = mix(col, uNebbia, uSottacqua);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useFrame(({ camera }) => ref.current && ref.current.position.copy(camera.position));
  return (
    <mesh ref={ref} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[150, 48, 24]} />
    </mesh>
  );
}
