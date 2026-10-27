import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import MoscaGLB from './MoscaGLB.jsx';
import { Ninfa, Streamer } from './MoscaProcedurale.jsx';
import { movimentoRidotto, url } from '../lib/qualita.js';

// Orientamento del modello mosca-secca.glb nel visore
export const ROT_GLB = [0, 0, 0];

// Centra il modello e lo scala perché stia tutto nell'inquadratura
function Adatta({ children, misura = 1.15 }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const g = ref.current;
    g.scale.setScalar(1);
    g.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(g);
    const dim = box.getSize(new THREE.Vector3());
    const k = misura / Math.max(dim.x, dim.y, dim.z);
    const c = box.getCenter(new THREE.Vector3());
    g.scale.setScalar(k);
    g.position.set(-c.x * k, -c.y * k, -c.z * k);
  });
  return <group ref={ref}>{children}</group>;
}

function Modello({ p }) {
  const ref = useRef();
  const v = p.v3d || {};
  useFrame(({ clock }) => {
    if (ref.current && !movimentoRidotto()) ref.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.015;
  });
  let corpo;
  if (p.cat === 'ninfa') corpo = <Ninfa v={v} />;
  else if (p.cat === 'streamer') corpo = <Streamer v={v} />;
  else corpo = <MoscaGLB v={v} rotation={ROT_GLB} envIntensity={1.1} />;
  return (
    <group ref={ref} rotation={[0.12, -0.5, 0]}>
      <Adatta misura={p.cat === 'streamer' ? 1.35 : 1.1}>{corpo}</Adatta>
    </group>
  );
}

export default function Visore3D({ p }) {
  // ?render: inquadratura fissa, usata solo per creare le immagini dei prodotti senza foto
  const perRender = typeof location !== 'undefined' && new URLSearchParams(location.search).has('render');
  const [toccato, setToccato] = useState(false);
  const [pronto, setPronto] = useState(false);
  useEffect(() => setToccato(false), [p.slug]);
  return (
    <div className={`visore ${pronto ? 'pronto' : ''}`}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.18, 2.1], fov: 32, near: 0.01, far: 40 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: perRender }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          setTimeout(() => setPronto(true), 60);
        }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[2, 3, 2]} intensity={2.2} color="#fff1dc" />
        <directionalLight position={[-3, 1, -2]} intensity={1.1} color="#9fc0d8" />
        <Suspense fallback={null}>
          <Environment files={url('3d/hdri/river_rocks-512.hdr')} environmentIntensity={0.9} />
          <Modello p={p} />
          <ContactShadows position={[0, -0.42, 0]} opacity={0.35} scale={3} blur={2.6} far={1} color="#0a120d" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={0.32}
          maxDistance={3.2}
          autoRotate={!toccato && !movimentoRidotto() && !perRender}
          autoRotateSpeed={0.9}
          onStart={() => setToccato(true)}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
