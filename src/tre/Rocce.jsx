import { useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { patchSubacqueo, U } from './ambiente.js';
import { altezza, casuale, centroFiume } from './terreno.js';
import { url } from '../lib/qualita.js';

useGLTF.setDecoderPath(url('draco/'));
export const glb = (n) => url(`3d/modelli/${n}.glb`);

const cacheMateriali = new WeakMap();
function materialePatch(m) {
  if (!cacheMateriali.has(m)) {
    const c = m.clone();
    c.envMapIntensity = 0.55;
    patchSubacqueo(c);
    cacheMateriali.set(m, c);
  }
  return cacheMateriali.get(m);
}

// Geometria di un nodo del glTF, centrata e appoggiata a terra, con scala normalizzata.
function useParte(file, nodo) {
  const { nodes } = useGLTF(glb(file));
  return useMemo(() => {
    const n = nodes[nodo];
    const geo = n.geometry.clone();
    geo.computeBoundingBox();
    const b = geo.boundingBox;
    geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
    const dim = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z);
    return { geo, mat: materialePatch(n.material), dim, alto: b.max.y - b.min.y };
  }, [nodes, nodo]);
}

function Pezzo({ file, nodo, x, z, y, size, rot = 0, inclina = 0, affonda = 0.22, emergi }) {
  const { geo, mat, dim, alto } = useParte(file, nodo);
  const s = size / dim;
  // emergi: quanto la cima del sasso esce dal pelo dell'acqua
  const py = emergi !== undefined ? emergi - alto * s : (y ?? altezza(x, z)) - size * affonda;
  return <mesh geometry={geo} material={mat} position={[x, py, z]} rotation={[inclina, rot, 0]} scale={s} />;
}

const off = (o, z) => centroFiume(z) + o;

// Sassi che escono dall'acqua: generano schiuma (raggio al pelo dell'acqua).
export const SASSI_AFFIORANTI = [
  { file: 'rock_moss_set_01', nodo: 'rock_moss_set_01_rock02', o: -2.5, z: 2.0, size: 1.35, rot: 0.6, schiuma: 0.5 },
  { file: 'rock_moss_set_01', nodo: 'rock_moss_set_01_rock05', o: 2.75, z: 0.6, size: 1.7, rot: 2.1, schiuma: 0.62 },
  { file: 'rock_moss_set_01', nodo: 'rock_moss_set_01_rock04', o: 0.9, z: -2.6, size: 0.95, rot: 1.2, schiuma: 0.33 },
  { file: 'stone_01', nodo: 'stone_01', o: -0.9, z: -5.4, size: 0.85, rot: 0.3, schiuma: 0.28, emergi: 0.1 },
  { file: 'rock_moss_set_01', nodo: 'rock_moss_set_01_rock01', o: 3.3, z: -6.4, size: 1.9, rot: 4.0, schiuma: 0.6 },
  { file: 'rock_moss_set_01', nodo: 'rock_moss_set_01_rock03', o: -3.1, z: -9.0, size: 1.4, rot: 2.6, schiuma: 0.45 },
  { file: 'boulder_01', nodo: 'boulder_01', o: 1.8, z: -12.5, size: 2.6, rot: 1.0, schiuma: 0.9, emergi: 0.5 },
];

export function registraSchiuma() {
  SASSI_AFFIORANTI.forEach((s, i) => {
    U.uRocce.value[i].set(off(s.o, s.z), s.z, s.schiuma, 1);
  });
}

export function Rocce({ qualita }) {
  const pieno = qualita === 'pieno';
  return (
    <group>
      {SASSI_AFFIORANTI.map((s, i) => (
        <Pezzo key={i} file={s.file} nodo={s.nodo} x={off(s.o, s.z)} z={s.z} size={s.size} rot={s.rot} emergi={s.emergi ?? 0.22} />
      ))}
      {/* riva: massi, ceppo, tronco */}
      {pieno && <Pezzo file="boulder_01" nodo="boulder_01" x={off(-5.2, -1.5)} z={-1.5} size={3.2} rot={2.2} affonda={0.3} />}
      {pieno && <Pezzo file="tree_stump_01" nodo="tree_stump_01" x={off(-6.4, -4.5)} z={-4.5} size={1.5} rot={0.4} affonda={0.08} />}
      {pieno && <Pezzo file="dead_tree_trunk" nodo="dead_tree_trunk" x={off(5.6, -4)} z={-4} size={6} rot={-0.9} affonda={0.12} />}
      <Pezzo file="rock_moss_set_01" nodo="rock_moss_set_01_rock06" x={off(5.4, 3)} z={3} size={2.2} rot={1.4} affonda={0.25} />

      {/* fondo: sassi per le ninfe e la buca degli streamer */}
      <Pezzo file="rock_moss_set_01" nodo="rock_moss_set_01_rock06" x={off(-1.5, -20.5)} z={-20.5} size={1.5} rot={0.2} affonda={0.2} />
      <Pezzo file="stone_01" nodo="stone_01" x={off(0.7, -19)} z={-19} size={1.0} rot={1.3} affonda={0.3} />
      <Pezzo file="rock_moss_set_01" nodo="rock_moss_set_01_rock02" x={off(1.9, -22.5)} z={-22.5} size={1.3} rot={2.9} affonda={0.2} />
      <Pezzo file="rock_moss_set_01" nodo="rock_moss_set_01_rock03" x={off(-0.2, -16.5)} z={-16.5} size={0.8} rot={4.1} affonda={0.25} />
      {pieno && <Pezzo file="boulder_01" nodo="boulder_01" x={off(-2.6, -25)} z={-25} size={2.6} rot={0.7} affonda={0.25} />}
      <Pezzo file="rock_moss_set_01" nodo="rock_moss_set_01_rock05" x={off(2.6, -28)} z={-28} size={2.0} rot={0.4} affonda={0.25} />
      {pieno && <Pezzo file="dead_tree_trunk" nodo="dead_tree_trunk" x={off(1.2, -33)} y={altezza(off(1.2, -33), -33) + 0.25} z={-33} size={6.5} rot={1.25} inclina={0.08} affonda={0.05} />}
      <Ciottoli quanti={pieno ? 60 : 30} />
    </group>
  );
}

// Ciottoli sparsi sul fondo (istanze dello stesso sasso).
function Ciottoli({ quanti }) {
  const { geo, mat } = useParte('stone_01', 'stone_01');
  const ref = useRef();
  useLayoutEffect(() => {
    const rnd = casuale(21);
    const m = new THREE.Matrix4();
    const e = new THREE.Euler();
    const q = new THREE.Quaternion();
    for (let i = 0; i < quanti; i++) {
      const z = -11 - rnd() * 24;
      const x = off((rnd() - 0.5) * 6.5, z);
      const sz = 0.12 + Math.pow(rnd(), 2) * 0.42;
      e.set(rnd() * 0.5, rnd() * 6.28, rnd() * 0.5);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, altezza(x, z) - sz * 0.35, z), q, new THREE.Vector3(1, 0.7 + rnd() * 0.4, 1).multiplyScalar(sz));
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [quanti]);
  const g = useMemo(() => {
    const c = geo.clone();
    c.computeBoundingBox();
    const b = c.boundingBox;
    const d = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z);
    c.scale(1 / d, 1 / d, 1 / d);
    return c;
  }, [geo]);
  return <instancedMesh ref={ref} args={[g, mat, quanti]} frustumCulled={false} />;
}

// Felci e muschio sulle rive
export function Piante({ qualita }) {
  const { nodes } = useGLTF(glb('fern_02'));
  const muschio = useGLTF(glb('moss_01'));
  const felci = useMemo(() => {
    const rnd = casuale(5);
    const nomi = Object.keys(nodes).filter((k) => nodes[k].geometry);
    const lista = [];
    const n = qualita === 'pieno' ? 34 : 14;
    for (let i = 0; i < n; i++) {
      const z = 6 - rnd() * 22;
      const lato = rnd() < 0.5 ? -1 : 1;
      const x = off(lato * (4.7 + rnd() * 3.2), z);
      lista.push({ nodo: nomi[i % nomi.length], x, z, y: altezza(x, z), s: 0.9 + rnd() * 1.1, r: rnd() * 6.28 });
    }
    return lista;
  }, [nodes, qualita]);
  const tufts = useMemo(() => {
    const rnd = casuale(11);
    const nomi = Object.keys(muschio.nodes).filter((k) => muschio.nodes[k].geometry);
    return Array.from({ length: qualita === 'pieno' ? 40 : 0 }, (_, i) => {
      const z = 5 - rnd() * 14;
      const lato = rnd() < 0.5 ? -1 : 1;
      const x = off(lato * (4.5 + rnd() * 1.6), z);
      return { nodo: nomi[i % nomi.length], x, z, y: altezza(x, z), s: 2 + rnd() * 3, r: rnd() * 6.28 };
    });
  }, [muschio.nodes, qualita]);
  return (
    <group>
      {felci.map((f, i) => (
        <mesh key={i} geometry={nodes[f.nodo].geometry} material={materialePatch(nodes[f.nodo].material)} position={[f.x, f.y - 0.05, f.z]} rotation-y={f.r} scale={f.s} />
      ))}
      {tufts.map((f, i) => (
        <mesh key={`m${i}`} geometry={muschio.nodes[f.nodo].geometry} material={materialePatch(muschio.nodes[f.nodo].material)} position={[f.x, f.y - 0.02, f.z]} rotation-y={f.r} scale={f.s} />
      ))}
    </group>
  );
}
