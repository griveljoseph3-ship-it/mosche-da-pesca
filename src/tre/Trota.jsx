import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { U, NEBBIA } from './ambiente.js';
import { RUMORE } from './glsl.js';
import { centroFiume } from './terreno.js';

// Trota fario stilizzata: corpo, pinne e livrea (punti neri e rossi) generati con codice.
const L = 1; // lunghezza (testa a +x)

function profilo(u) {
  // u: -1 coda ... +1 muso
  const a = u > 0.2 ? (u - 0.2) / 0.8 : (0.2 - u) / 1.2;
  let p = Math.sqrt(Math.max(0, 1 - Math.pow(a, 2.2)));
  if (u < -0.62) p = Math.max(p, 0.13 + (u + 1) * 0.12);
  return p;
}

function pinna(punti, x, y, z = 0) {
  const s = new THREE.Shape();
  s.moveTo(punti[0][0], punti[0][1]);
  for (let i = 1; i < punti.length; i++) s.lineTo(punti[i][0], punti[i][1]);
  const g = new THREE.ShapeGeometry(s, 4);
  g.translate(x, y, z);
  return g;
}

function geometriaTrota() {
  const corpo = new THREE.SphereGeometry(1, 56, 28);
  corpo.rotateZ(Math.PI / 2); // asse lungo x
  const pos = corpo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const r = Math.sqrt(Math.max(1e-6, 1 - x * x));
    const p = profilo(x);
    let ny = (y / r) * 0.2 * p;
    if (ny < 0) ny *= 0.88;
    const nz = (z / r) * 0.1 * p * (1 - 0.25 * Math.max(0, -y / r));
    pos.setXYZ(i, x * 0.5 * L, ny + 0.012 * x, nz);
  }
  corpo.computeVertexNormals();
  const parti = [corpo.toNonIndexed()];
  // pinne (piane, doppia faccia)
  parti.push(pinna([[0, 0], [-0.13, 0.06], [-0.2, 0.1], [-0.22, 0.02], [-0.25, -0.1], [-0.2, -0.04], [-0.13, -0.06]], -0.47, 0.0)); // caudale
  parti.push(pinna([[0, 0], [-0.04, 0.09], [-0.12, 0.07], [-0.14, 0]], 0.06, 0.17)); // dorsale
  parti.push(pinna([[0, 0], [-0.025, 0.03], [-0.05, 0]], -0.26, 0.085)); // adiposa
  parti.push(pinna([[0, 0], [-0.03, -0.06], [-0.09, -0.05], [-0.09, 0]], -0.18, -0.07)); // anale
  parti.push(pinna([[0, 0], [-0.04, -0.06], [-0.09, -0.04]], 0.0, -0.11)); // ventrale
  const pett = pinna([[0, 0], [-0.05, -0.05], [-0.11, -0.04], [-0.08, 0]], 0.26, -0.07);
  pett.rotateX(0.5);
  parti.push(pett);
  const fin = parti.slice(1).map((g) => {
    const n = g.toNonIndexed();
    const c = n.attributes.position.count;
    n.setAttribute('aPinna', new THREE.Float32BufferAttribute(new Array(c).fill(1), 1));
    return n;
  });
  const c0 = parti[0].attributes.position.count;
  parti[0].setAttribute('aPinna', new THREE.Float32BufferAttribute(new Array(c0).fill(0), 1));
  fin.forEach((g) => { if (!g.attributes.normal) g.computeVertexNormals(); g.deleteAttribute('uv'); });
  parti[0].deleteAttribute('uv');
  return mergeGeometries([parti[0], ...fin]);
}

export default function Trota({ zCentro = -30.5, y = -1.35, scala = 0.95, velocita = 0.16, fase = 0 }) {
  const ref = useRef();
  const geo = useMemo(geometriaTrota, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: { ...U, uNuoto: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float aPinna;
          uniform float uNuoto;
          varying vec3 vLoc;
          varying vec3 vMondo;
          varying vec3 vN;
          varying float vPinna;
          void main() {
            vec3 p = position;
            float coda = smoothstep(0.35, -0.6, p.x);
            float onda = sin(uNuoto * 6.0 - p.x * 7.0);
            p.z += onda * (0.012 + coda * coda * 0.11);
            vLoc = position;
            vPinna = aPinna;
            vec4 w = modelMatrix * vec4(p, 1.0);
            vMondo = w.xyz;
            vN = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTempo, uDensita;
          uniform vec3 uSole, uColoreSole, uAmbiente, uNebbia, uAssorbimento, uLuceCaustiche;
          varying vec3 vLoc;
          varying vec3 vMondo;
          varying vec3 vN;
          varying float vPinna;
          ${RUMORE}
          ${NEBBIA}
          float punti(vec2 q, float r) {
            vec2 i = floor(q); vec2 f = fract(q); float m = 9.0;
            for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
              vec2 g = vec2(float(x), float(y));
              vec2 o = hash22(i + g) * 0.8 + 0.1;
              m = min(m, length(g + o - f) / (0.55 + hash12(i + g) * 0.6));
            }
            return 1.0 - smoothstep(r - 0.05, r + 0.05, m);
          }
          void main() {
            float yN = vLoc.y / 0.2; // -1 ventre .. +1 dorso
            vec3 dorso = vec3(0.10, 0.10, 0.045);
            vec3 fianco = vec3(0.50, 0.36, 0.09);
            vec3 ventre = vec3(0.78, 0.7, 0.48);
            vec3 col = mix(ventre, fianco, smoothstep(-0.75, -0.15, yN));
            col = mix(col, dorso, smoothstep(0.05, 0.75, yN));
            vec2 q = vec2(vLoc.x * 26.0, vLoc.y * 24.0);
            float nero = punti(q, 0.32) * smoothstep(-0.35, 0.1, yN) * smoothstep(-0.55, -0.25, vLoc.x);
            float rosso = punti(q * 0.62 + 11.0, 0.3) * (1.0 - smoothstep(0.08, 0.32, abs(yN + 0.08))) * smoothstep(-0.4, 0.0, vLoc.x);
            float alone = punti(q * 0.62 + 11.0, 0.48) * (1.0 - smoothstep(0.08, 0.32, abs(yN + 0.08))) * smoothstep(-0.4, 0.0, vLoc.x);
            col = mix(col, vec3(0.86, 0.8, 0.66), alone * 0.7);
            col = mix(col, vec3(0.55, 0.06, 0.03), rosso);
            col = mix(col, vec3(0.02, 0.018, 0.012), nero * 0.92);
            // occhio
            float occhio = 1.0 - smoothstep(0.012, 0.018, length(vec2(vLoc.x - 0.41, vLoc.y - 0.035)));
            col = mix(col, vec3(0.01), occhio);
            if (vPinna > 0.5) {
              col = mix(vec3(0.32, 0.24, 0.08), vec3(0.12, 0.1, 0.05), smoothstep(0.0, 0.15, abs(vLoc.y)));
              col = mix(col, vec3(0.02), punti(vec2(vLoc.x, vLoc.y) * 40.0, 0.25) * 0.6);
            }
            vec3 N = normalize(vN);
            vec3 V = normalize(cameraPosition - vMondo);
            if (!gl_FrontFacing) N = -N;
            float dif = max(dot(N, normalize(vec3(0.2, 1.0, 0.1))), 0.0);
            float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
            vec3 luce = uAmbiente * 0.65 + uColoreSole * dif * 0.38;
            vec3 c = col * luce;
            c += uLuceCaustiche * caustica(vMondo.xz * 1.4, uTempo) * 0.18 * max(N.y, 0.0) * col;
            c += vec3(0.7, 0.85, 0.75) * rim * 0.12;
            c += vec3(0.9) * pow(max(dot(reflect(-V, N), vec3(0.0, 1.0, 0.0)), 0.0), 24.0) * 0.12 * (1.0 - vPinna);
            float prof = max(0.0, -vMondo.y);
            c *= mix(vec3(1.0), uAssorbimento, 1.0 - exp(-prof * 0.9));
            c = applicaNebbia(c, distance(vMondo, cameraPosition));
            gl_FragColor = vec4(c, vPinna > 0.5 ? 0.88 : 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        transparent: false,
      }),
    [],
  );

  const a = useRef(fase);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = Math.min(dt, 0.1);
    a.current += d * velocita;
    const t = a.current;
    const cx = centroFiume(zCentro);
    const rx = 2.4, rz = 1.5;
    const x = cx + Math.sin(t) * rx;
    const z = zCentro + Math.sin(t * 2) * rz * 0.5 - Math.cos(t) * 0.4;
    const dx = Math.cos(t) * rx;
    const dz = Math.cos(t * 2) * rz + Math.sin(t) * 0.4;
    g.position.set(x, y + Math.sin(t * 1.7) * 0.12, z);
    g.rotation.y = Math.atan2(-dz, dx);
    mat.uniforms.uNuoto.value += d * (1.2 + Math.abs(Math.cos(t)) * 0.8);
  });

  return <mesh ref={ref} geometry={geo} material={mat} scale={scala} />;
}
