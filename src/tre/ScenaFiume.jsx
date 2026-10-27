import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import * as THREE from 'three';
import Cielo from './Cielo.jsx';
import Terreno from './Terreno.jsx';
import Acqua from './Acqua.jsx';
import Alberi from './Alberi.jsx';
import { Rocce, Piante, registraSchiuma } from './Rocce.jsx';
import Atmosfera from './Atmosfera.jsx';
import Trota from './Trota.jsx';
import MoscheGalleggianti from './MoscheGalleggianti.jsx';
import Regia from './Regia.jsx';
import { statoFiume } from './statoFiume.js';
import { url } from '../lib/qualita.js';

// Luce d'ambiente dagli HDRI Poly Haven: alba sopra l'acqua, tramonto quando siamo già sotto.
function Ambiente({ qualita }) {
  const { gl, scene } = useThree();
  const r = qualita === 'pieno' ? '1k' : '512';
  const [alba, tramonto] = useLoader(HDRLoader, [url(`3d/hdri/kiara_1_dawn-${r}.hdr`), url(`3d/hdri/kiara_8_sunset-${r}.hdr`)]);
  const mappe = useRef(null);
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const a = pm.fromEquirectangular(alba).texture;
    const b = pm.fromEquirectangular(tramonto).texture;
    pm.dispose();
    mappe.current = [a, b];
    scene.environment = a;
    return () => { a.dispose(); b.dispose(); scene.environment = null; };
  }, [gl, scene, alba, tramonto]);
  useFrame(() => {
    if (!mappe.current) return;
    const m = statoFiume.pLiscio > 0.55 ? mappe.current[1] : mappe.current[0];
    if (scene.environment !== m) scene.environment = m;
  });
  return null;
}

function Pronta({ onPronta }) {
  const n = useRef(0);
  useFrame(() => {
    n.current++;
    if (n.current === 3) {
      statoFiume.pronta = true;
      onPronta?.();
    }
  });
  return null;
}

// Mette in pausa il disegno quando la scena non si vede
function Pausa() {
  const { set } = useThree();
  useEffect(() => {
    let attiva = true;
    const id = setInterval(() => {
      const v = statoFiume.visibile;
      if (v !== attiva) {
        attiva = v;
        set({ frameloop: v ? 'always' : 'never' });
      }
    }, 250);
    return () => clearInterval(id);
  }, [set]);
  return null;
}

export default function ScenaFiume({ qualita = 'pieno', onPronta }) {
  const pieno = qualita === 'pieno';
  const max = Math.min(window.devicePixelRatio || 1, pieno ? 1.6 : 1.25);
  const [dpr, setDpr] = useState(max);
  useEffect(() => registraSchiuma(), []);
  return (
    <Canvas
      className="fiume-canvas"
      dpr={dpr}
      gl={{ antialias: pieno, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 44, near: 0.03, far: 200, position: [0, 0.85, 4.2] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor('#0b120e');
      }}
    >
      <PerformanceMonitor flipflops={3} onIncline={() => setDpr(max)} onDecline={() => setDpr((d) => Math.max(0.75, d * 0.8))} onFallback={() => setDpr(0.75)} />
      <Pausa />
      <Regia qualita={qualita} />
      <Cielo />
      <Suspense fallback={null}>
        <Ambiente qualita={qualita} />
        <Terreno qualita={qualita} />
        <Acqua qualita={qualita} />
        <Alberi qualita={qualita} />
        <Rocce qualita={qualita} />
        {pieno && <Piante qualita={qualita} />}
        <MoscheGalleggianti qualita={qualita} />
        <Trota zCentro={-29} y={-1.25} scala={1.15} />
        {pieno && <Trota zCentro={-33} y={-1.7} scala={0.7} velocita={-0.12} fase={2} />}
        <Atmosfera qualita={qualita} />
        <Pronta onPronta={onPronta} />
      </Suspense>
    </Canvas>
  );
}
