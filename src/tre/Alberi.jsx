import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { altezza, casuale, centroFiume, MEZZA_LARGHEZZA } from './terreno.js';

// Abeti stilizzati sulle rive: geometria procedurale, un solo draw call.
function geometriaAbete() {
  const parti = [];
  const tronco = new THREE.CylinderGeometry(0.035, 0.06, 0.5, 6);
  tronco.translate(0, 0.25, 0);
  parti.push(tronco);
  const palchi = 7;
  for (let i = 0; i < palchi; i++) {
    const k = i / (palchi - 1);
    const r = 0.62 * (1 - k * 0.82);
    const h = 0.42 * (1 - k * 0.35);
    const cono = new THREE.ConeGeometry(r * (0.9 + Math.sin(i * 2.3) * 0.12), h, 9, 1, true);
    cono.rotateY(i * 0.7);
    cono.translate(0, 0.35 + k * 1.3 + h / 2, 0);
    parti.push(cono);
  }
  const g = mergeGeometries(parti.map((p) => p.toNonIndexed()));
  g.computeVertexNormals();
  return g;
}

export default function Alberi({ qualita }) {
  const ref = useRef();
  const geo = useMemo(geometriaAbete, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#16241a', roughness: 0.95, metalness: 0, flatShading: true, envMapIntensity: 0.35 }), []);
  const istanze = useMemo(() => {
    const rnd = casuale(7);
    const lista = [];
    const passo = qualita === 'pieno' ? 0.9 : 1.5;
    for (let z = 14; z > -110; z -= passo) {
      for (const lato of [-1, 1]) {
        const file = qualita === 'pieno' ? 3 : 2;
        for (let f = 0; f < file; f++) {
          if (rnd() < 0.25) continue;
          if (z > -1 && f < 2) continue;
          const vicino = z > -2 ? (z + 2) * 1.6 : 0;
          const dist = MEZZA_LARGHEZZA + 2.2 + vicino + f * 3.2 + rnd() * 3.4;
          const x = centroFiume(z) + lato * dist;
          const zz = z + (rnd() - 0.5) * passo;
          const h = 4.5 + rnd() * 6 + f * 1.4;
          lista.push({ x, z: zz, y: altezza(x, zz) - 0.15, h, r: rnd() * Math.PI * 2, w: 0.75 + rnd() * 0.5 });
        }
      }
    }
    return lista;
  }, [qualita]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    istanze.forEach((a, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a.r);
      s.set(a.h * 0.42 * a.w, a.h, a.h * 0.42 * a.w);
      p.set(a.x, a.y, a.z);
      m.compose(p, q, s);
      ref.current.setMatrixAt(i, m);
      col.setHSL(0.36 + (i % 7) * 0.006, 0.28, 0.1 + (i % 5) * 0.012);
      ref.current.setColorAt(i, col);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [istanze]);

  return <instancedMesh ref={ref} args={[geo, mat, istanze.length]} frustumCulled={false} />;
}
