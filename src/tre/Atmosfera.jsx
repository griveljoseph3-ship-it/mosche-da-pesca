import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { U, NEBBIA } from './ambiente.js';
import { RUMORE } from './glsl.js';
import { casuale, centroFiume } from './terreno.js';

// ——— Particelle: pollini e piccoli insetti sopra l'acqua, bolle e sospensione sotto ———
function Particelle({ quante, tipo, seme }) {
  const geo = useMemo(() => {
    const rnd = casuale(seme);
    const pos = new Float32Array(quante * 3);
    const dati = new Float32Array(quante * 4);
    for (let i = 0; i < quante; i++) {
      let x, y, z;
      if (tipo === 0) {
        z = 7 - rnd() * 22; x = centroFiume(z) + (rnd() - 0.5) * 10; y = 0.15 + Math.pow(rnd(), 1.6) * 3.2;
      } else if (tipo === 1) {
        z = 3.5 - rnd() * 8; x = centroFiume(z) + (rnd() - 0.5) * 5; y = 0.25 + rnd() * 1.2;
      } else {
        z = -6 - rnd() * 30; x = centroFiume(z) + (rnd() - 0.5) * 7; y = -0.1 - rnd() * 2.3;
      }
      pos.set([x, y, z], i * 3);
      dati.set([rnd(), rnd(), rnd(), rnd()], i * 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aDati', new THREE.BufferAttribute(dati, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -10), 100);
    return g;
  }, [quante, tipo, seme]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        defines: { TIPO: tipo },
        uniforms: { ...U, uPixel: { value: Math.min(window.devicePixelRatio, 2) } },
        vertexShader: /* glsl */ `
          attribute vec4 aDati;
          uniform float uTempo, uPixel, uSottacqua;
          uniform vec3 uSole;
          varying float vA;
          varying float vLuce;
          void main() {
            vec3 p = position;
            float t = uTempo;
            #if TIPO == 0
              p += vec3(sin(t * (0.13 + aDati.x * 0.2) + aDati.y * 6.28) * 0.6, sin(t * (0.21 + aDati.z * 0.2) + aDati.w * 6.28) * 0.25, sin(t * 0.09 + aDati.x * 9.0) * 0.5 - mod(t * 0.05 * (0.5 + aDati.y), 2.0));
              float sz = 2.0 + aDati.z * 3.0;
              vA = (1.0 - uSottacqua) * (0.35 + 0.65 * aDati.w);
            #elif TIPO == 1
              float k = t * (1.8 + aDati.x * 1.6) + aDati.y * 30.0;
              p += vec3(sin(k) * 0.5 + sin(k * 2.3) * 0.15, sin(k * 1.7) * 0.18 + sin(t * 0.4 + aDati.z * 6.0) * 0.2, cos(k * 0.9) * 0.4);
              float sz = 2.6 + aDati.z * 1.5;
              vA = (1.0 - uSottacqua) * 0.9;
            #else
              float alto = 2.35;
              p.y = -2.4 + mod(p.y + 2.4 + t * (0.12 + aDati.x * 0.3), alto);
              p.x += sin(t * (1.0 + aDati.y) + aDati.z * 6.28) * 0.04;
              float sz = 1.5 + aDati.w * 4.0;
              vA = uSottacqua * (0.4 + 0.6 * aDati.z) * smoothstep(-0.02, -0.25, p.y);
            #endif
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vec3 dirV = normalize((modelMatrix * vec4(p, 1.0)).xyz - cameraPosition);
            vLuce = pow(max(dot(dirV, uSole), 0.0), 5.0);
            gl_PointSize = sz * uPixel * (6.0 / max(-mv.z, 0.4));
            vA *= smoothstep(0.25, 1.2, -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColoreSole, uAmbiente;
          varying float vA;
          varying float vLuce;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            #if TIPO == 2
              float a = smoothstep(0.5, 0.36, d) * (0.25 + smoothstep(0.22, 0.42, d) * 0.9);
              vec3 col = vec3(0.75, 0.95, 0.9) * 0.55;
            #else
              float a = smoothstep(0.5, 0.0, d);
              a *= a;
              vec3 col = uColoreSole * (0.08 + vLuce * 0.9) + uAmbiente * 0.05;
            #endif
            gl_FragColor = vec4(col * a * vA, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [tipo],
  );
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={8} />;
}

// ——— Nebbia sull'acqua: strati orizzontali e veli verticali che si muovono piano ———
const nebbiaVert = /* glsl */ `
  varying vec3 vMondo;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vMondo = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

function materialeNebbia(verticale, forza) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { ...U, uForza: { value: forza } },
    vertexShader: nebbiaVert,
    fragmentShader: /* glsl */ `
      uniform float uTempo, uSottacqua, uForza;
      uniform vec3 uNebbia, uColoreSole, uSole;
      varying vec3 vMondo;
      varying vec2 vUv;
      ${RUMORE}
      void main() {
        vec2 q = vMondo.xz * 0.16 + vec2(uTempo * 0.012, uTempo * 0.006);
        ${verticale ? 'q = vec2(vMondo.x * 0.2 + uTempo * 0.015, vMondo.y * 0.5 + vMondo.z * 0.07);' : ''}
        float n = fbm(q) * 0.65 + fbm(q * 2.7 - uTempo * 0.01) * 0.35;
        float a = smoothstep(${verticale ? '0.35, 0.8' : '0.2, 0.95'}, n);
        ${verticale
          ? 'a *= smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, vUv.y) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);'
          : 'a *= smoothstep(1.0, 0.6, length(vUv - 0.5) * 2.0);'}
        float dist = distance(vMondo, cameraPosition);
        a *= smoothstep(${verticale ? '1.2, 5.0' : '3.0, 12.0'}, dist) * (1.0 - uSottacqua) * uForza;
        vec3 v = normalize(vMondo - cameraPosition);
        float fw = pow(max(dot(v, uSole), 0.0), 4.0);
        vec3 col = mix(uNebbia * 1.05, uColoreSole * 0.6, fw * 0.6);
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

function Nebbia({ qualita }) {
  const strato = useMemo(() => materialeNebbia(false, 0.32), []);
  const velo = useMemo(() => materialeNebbia(true, 0.38), []);
  const veli = useRef([]);
  const posizioni = useMemo(() => {
    const rnd = casuale(3);
    const n = qualita === 'pieno' ? 9 : 4;
    return Array.from({ length: n }, (_, i) => {
      const z = -4 - i * 3.6 - rnd() * 2;
      return [centroFiume(z) + (rnd() - 0.5) * 6, 0.9 + rnd() * 0.6, z];
    });
  }, [qualita]);
  useFrame(({ camera }) => {
    veli.current.forEach((m) => m && (m.rotation.y = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z)));
  });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[-1.5, 0.22, -10]} material={strato} renderOrder={6}>
        <planeGeometry args={[30, 40]} />
      </mesh>
      {qualita === 'pieno' && (
        <mesh rotation-x={-Math.PI / 2} position={[-1.5, 0.62, -12]} material={strato} renderOrder={6}>
          <planeGeometry args={[34, 44]} />
        </mesh>
      )}
      {posizioni.map((p, i) => (
        <mesh key={i} ref={(m) => (veli.current[i] = m)} position={p} material={velo} renderOrder={7}>
          <planeGeometry args={[9, 2.4]} />
        </mesh>
      ))}
    </group>
  );
}

// ——— Raggi di luce: tra gli alberi sopra, dalla superficie sotto ———
function Raggi({ qualita }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: U,
        vertexShader: nebbiaVert,
        fragmentShader: /* glsl */ `
          uniform float uTempo, uSottacqua;
          uniform vec3 uColoreSole;
          varying vec3 vMondo;
          varying vec2 vUv;
          ${RUMORE}
          void main() {
            float strisce = vnoise(vec2(vUv.x * 6.0 + uTempo * 0.05, 0.5)) * 0.7 + vnoise(vec2(vUv.x * 13.0 - uTempo * 0.08, 2.0)) * 0.3;
            float a = smoothstep(0.25, 1.0, strisce);
            a *= pow(sin(vUv.x * 3.14159), 2.0);
            a *= smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
            a *= (1.0 - uSottacqua) * 0.03;
            gl_FragColor = vec4(uColoreSole * a, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  const matSotto = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: U,
        vertexShader: nebbiaVert,
        fragmentShader: /* glsl */ `
          uniform float uTempo, uSottacqua;
          uniform vec3 uColoreSole, uAcquaChiara;
          varying vec3 vMondo;
          varying vec2 vUv;
          ${RUMORE}
          void main() {
            float s = vnoise(vec2(vUv.x * 7.0 + sin(uTempo * 0.3) * 1.2, uTempo * 0.2)) * 0.65 + vnoise(vec2(vUv.x * 15.0 - uTempo * 0.15, 1.0)) * 0.35;
            float a = smoothstep(0.3, 1.0, s);
            a *= pow(sin(vUv.x * 3.14159), 2.0);
            a *= smoothstep(0.0, 1.0, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
            a *= uSottacqua * 0.09;
            gl_FragColor = vec4(mix(uColoreSole, uAcquaChiara * 3.0, 0.5) * a, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  const sopra = useMemo(() => {
    const rnd = casuale(9);
    const n = qualita === 'pieno' ? 4 : 2;
    return Array.from({ length: n }, (_, i) => {
      const z = -14 - i * 7 - rnd() * 3;
      return { p: [centroFiume(z) + (rnd() - 0.5) * 9, 4.5, z], r: [0, rnd() * 0.6 - 0.3, -0.4 + rnd() * 0.12], s: [2.2 + rnd() * 1.5, 11, 1] };
    });
  }, [qualita]);
  const sotto = useMemo(() => {
    const rnd = casuale(13);
    return Array.from({ length: qualita === 'pieno' ? 9 : 5 }, (_, i) => {
      const z = -7 - i * 3.3 - rnd() * 2;
      return { p: [centroFiume(z) + (rnd() - 0.5) * 4, -1.3, z], r: [0, rnd() * 3, 0.22 + rnd() * 0.1], s: [2.4 + rnd() * 1.5, 2.2, 1] };
    });
  }, [qualita]);
  return (
    <group>
      {sopra.map((r, i) => (
        <mesh key={i} position={r.p} rotation={r.r} scale={r.s} material={mat} renderOrder={9}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
      {sotto.map((r, i) => (
        <mesh key={`s${i}`} position={r.p} rotation={r.r} scale={r.s} material={matSotto} renderOrder={9}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Atmosfera({ qualita }) {
  const pieno = qualita === 'pieno';
  return (
    <group>
      <Particelle quante={pieno ? 420 : 160} tipo={0} seme={1} />
      <Particelle quante={pieno ? 16 : 8} tipo={1} seme={2} />
      <Particelle quante={pieno ? 320 : 120} tipo={2} seme={3} />
      <Nebbia qualita={qualita} />
      <Raggi qualita={qualita} />
    </group>
  );
}

export { NEBBIA };
