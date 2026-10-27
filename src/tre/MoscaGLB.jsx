import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { url } from '../lib/qualita.js';

useGLTF.setDecoderPath(url('draco/'));
export const FILE_MOSCA = url('3d/modelli/mosca-secca.glb');

// Colori di base (Adams) e materiali per ogni parte del modello mosca-secca.glb
const PARTI = {
  amo: { chiave: 'amo', metal: 0.92, rough: 0.28 },
  ardiglione: { chiave: 'amo', metal: 0.92, rough: 0.28 },
  corpo: { chiave: 'corpo', metal: 0, rough: 0.85, sheen: 0.6 },
  filo: { chiave: 'filo', metal: 0.55, rough: 0.35 },
  coda: { chiave: 'coda', metal: 0, rough: 0.8, sheen: 0.8 },
  ala_dx: { chiave: 'ali', metal: 0, rough: 0.6, trasp: 0.92, sheen: 0.4 },
  ala_sx: { chiave: 'ali', metal: 0, rough: 0.6, trasp: 0.92, sheen: 0.4 },
  hackle_marrone: { chiave: 'hackle', metal: 0, rough: 0.7, sheen: 1 },
  hackle_grizzly: { chiave: 'hackle2', metal: 0, rough: 0.7, sheen: 1 },
  testa: { chiave: 'testa', metal: 0.1, rough: 0.35, clear: 1 },
};
const PREDEFINITI = { amo: '#3a3b40', corpo: '#7d7a76', filo: '#c9a35a', coda: '#6b4a32', ali: '#9a9a9c', hackle: '#7a4f2c', hackle2: '#d2cec4', testa: '#1a1a1a' };

// Geometrie con normali calcolate una volta sola
const cacheGeo = new WeakMap();
function geoConNormali(g) {
  if (!cacheGeo.has(g)) {
    const c = g.clone();
    c.deleteAttribute('normal');
    c.computeVertexNormals();
    cacheGeo.set(g, c);
  }
  return cacheGeo.get(g);
}

// Mosca 3D a partire da mosca-secca.glb, con varianti di colore e stile (secca o sommersa con ali all'indietro).
export default function MoscaGLB({ v = {}, envIntensity = 1, ...props }) {
  const { nodes } = useGLTF(FILE_MOSCA);
  const sommersa = v.stile === 'sommersa';
  const parti = useMemo(() => {
    return Object.entries(PARTI)
      .filter(([nome]) => nodes[nome]?.geometry)
      .map(([nome, d]) => {
        const colore = new THREE.Color(v[d.chiave] || PREDEFINITI[d.chiave]);
        const mat = new THREE.MeshPhysicalMaterial({
          color: colore,
          metalness: d.metal,
          roughness: d.rough,
          sheen: d.sheen || 0,
          sheenRoughness: 0.5,
          sheenColor: colore.clone().lerp(new THREE.Color('#ffffff'), 0.35),
          clearcoat: d.clear || 0,
          clearcoatRoughness: 0.2,
          side: THREE.DoubleSide,
          transparent: !!d.trasp,
          opacity: d.trasp || 1,
          envMapIntensity: envIntensity,
        });
        return { nome, geo: geoConNormali(nodes[nome].geometry), mat };
      });
  }, [nodes, v, envIntensity]);

  return (
    <group {...props}>
      {parti.map(({ nome, geo, mat }) => {
        const ala = nome.startsWith('ala');
        if (sommersa && ala) {
          // ali raccolte sopra il corpo, inclinate all'indietro
          return (
            <group key={nome} position={[0.2, 0.18, 0]} rotation={[0, 0, 1.05]}>
              <mesh geometry={geo} material={mat} position={[-0.2, -0.18, 0]} scale={[1, 1, nome === 'ala_dx' ? 0.35 : 0.35]} />
            </group>
          );
        }
        if (sommersa && nome === 'hackle_grizzly') return null;
        return <mesh key={nome} geometry={geo} material={mat} />;
      })}
    </group>
  );
}

