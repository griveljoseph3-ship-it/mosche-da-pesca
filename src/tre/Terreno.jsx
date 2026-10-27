import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { U, NEBBIA } from './ambiente.js';
import { RUMORE } from './glsl.js';
import { altezza } from './terreno.js';
import { url } from '../lib/qualita.js';

// Letto del torrente e rive: un'unica superficie con texture Poly Haven (sassi di fiume, foglie, roccia).
export default function Terreno({ qualita }) {
  const r = qualita === 'pieno' ? '1k' : '512';
  const tex = useTexture({
    fondo: url(`3d/texture/river_small_rocks/diff-${r}.webp`),
    fondoN: url(`3d/texture/river_small_rocks/nor_gl-${r}.webp`),
    sassi: url(`3d/texture/ganges_river_pebbles/diff-${r}.webp`),
    riva: url(`3d/texture/forest_leaves_02/diff-${r}.webp`),
    rivaN: url(`3d/texture/forest_leaves_02/nor_gl-${r}.webp`),
  });

  const { geo, mat } = useMemo(() => {
    Object.entries(tex).forEach(([k, t]) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 4;
      t.colorSpace = k.endsWith('N') ? THREE.NoColorSpace : THREE.SRGBColorSpace;
      t.needsUpdate = true;
    });
    const sx = qualita === 'pieno' ? 150 : 80;
    const sz = qualita === 'pieno' ? 300 : 150;
    const geo = new THREE.PlaneGeometry(56, 140, sx, sz);
    geo.rotateX(-Math.PI / 2);
    geo.translate(-2, 0, -48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, altezza(pos.getX(i), pos.getZ(i)));
    geo.computeVertexNormals();

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...U,
        tFondo: { value: tex.fondo },
        tFondoN: { value: tex.fondoN },
        tSassi: { value: tex.sassi },
        tRiva: { value: tex.riva },
        tRivaN: { value: tex.rivaN },
      },
      vertexShader: /* glsl */ `
        varying vec3 vMondo;
        varying vec3 vNormale;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vMondo = w.xyz;
          vNormale = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D tFondo, tFondoN, tSassi, tRiva, tRivaN;
        uniform float uTempo, uDensita, uSottacqua;
        uniform vec3 uSole, uColoreSole, uAmbiente, uAssorbimento, uLuceCaustiche, uNebbia;
        varying vec3 vMondo;
        varying vec3 vNormale;
        ${RUMORE}
        ${NEBBIA}
        void main() {
          vec2 uvF = vMondo.xz * 0.42;
          vec3 fondo = texture2D(tFondo, uvF).rgb;
          vec3 sassi = texture2D(tSassi, vMondo.xz * 0.3 + 0.37).rgb;
          vec3 riva = texture2D(tRiva, vMondo.xz * 0.28).rgb;
          float h = vMondo.y;
          float n = fbm(vMondo.xz * 0.45);
          float kRiva = smoothstep(0.35, 1.0, h + (n - 0.5) * 0.9);
          float kSassi = smoothstep(-0.1, 0.18, h + (n - 0.5) * 0.35) * (1.0 - kRiva);
          vec3 alb = mix(fondo, sassi, kSassi * 0.85);
          alb = mix(alb, riva * vec3(0.8, 0.95, 0.75), kRiva);
          // fondo bagnato più scuro e saturo
          float bagnato = 1.0 - smoothstep(-0.05, 0.3, h);
          alb *= mix(1.0, 0.7, bagnato);

          vec3 nmF = texture2D(tFondoN, uvF).xyz * 2.0 - 1.0;
          vec3 nmR = texture2D(tRivaN, vMondo.xz * 0.28).xyz * 2.0 - 1.0;
          vec3 nm = mix(nmF, nmR, kRiva);
          vec3 N = normalize(normalize(vNormale) + vec3(nm.x, 0.0, -nm.y) * 0.6);

          float dif = max(dot(N, uSole), 0.0);
          vec3 luce = uAmbiente * (0.45 + 0.55 * N.y) + uColoreSole * dif;
          vec3 col = alb * luce;

          float prof = max(0.0, -h);
          float sotto = smoothstep(0.0, 0.05, prof);
          col *= mix(vec3(1.0), uAssorbimento, sotto * (1.0 - exp(-prof * 1.1)));
          float ca = caustica(vMondo.xz * 1.6, uTempo * 0.7);
          vec3 luceCa = mix(uLuceCaustiche, vec3(0.8, 1.1, 1.0), 0.65);
          col += luceCa * ca * exp(-prof * 0.35) * sotto * (0.05 + alb * 0.6) * mix(0.3, 0.9, uSottacqua);

          col = applicaNebbia(col, distance(vMondo, cameraPosition));
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    return { geo, mat };
  }, [tex, qualita]);

  return <mesh geometry={geo} material={mat} />;
}
