import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { casuale } from './terreno.js';

// Ninfe e streamer costruiti con geometrie procedurali (amo, testina, corpo segmentato, fibre).
// Asse lungo x, occhiello dell'amo verso +x.

const METALLI = { oro: '#d9ab3e', rame: '#c0703c', nero: '#1c1c1e', argento: '#d6d6da' };

function curvaAmo(lungo = 1) {
  const pts = [];
  const sx = 0.56 * lungo, ex = -0.34;
  for (let i = 0; i <= 10; i++) pts.push(new THREE.Vector3(sx + (ex - sx) * (i / 10), 0, 0));
  const r = 0.17, cy = -r;
  for (let i = 1; i <= 16; i++) {
    const a = Math.PI / 2 + (i / 16) * Math.PI;
    pts.push(new THREE.Vector3(ex + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
  }
  pts.push(new THREE.Vector3(ex + 0.1, -0.33, 0));
  pts.push(new THREE.Vector3(ex + 0.2, -0.27, 0));
  return new THREE.CatmullRomCurve3(pts);
}

function Amo({ lungo = 1 }) {
  const geo = useMemo(() => new THREE.TubeGeometry(curvaAmo(lungo), 80, 0.011, 8, false), [lungo]);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#2b2c30', metalness: 0.95, roughness: 0.22, clearcoat: 0.6 }), []);
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      <mesh material={mat} position={[0.56 * lungo + 0.035, 0.02, 0]}>
        <torusGeometry args={[0.032, 0.01, 8, 24]} />
      </mesh>
      <mesh material={mat} position={[-0.13, -0.285, 0]} rotation={[0, 0, -2.2]}>
        <coneGeometry args={[0.012, 0.05, 6]} />
      </mesh>
    </group>
  );
}

// corpo a fuso lungo x, con segmenti
function corpoGeo(x0, x1, r0, r1, segmenti = 0, pancia = 0.6) {
  const pts = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    let r = THREE.MathUtils.lerp(r0, r1, Math.pow(u, pancia));
    if (segmenti) r *= 1 + 0.09 * Math.pow(Math.abs(Math.sin(u * Math.PI * segmenti)), 0.6);
    if (i === 0 || i === n) r *= 0.6;
    pts.push(new THREE.Vector2(r, THREE.MathUtils.lerp(x0, x1, u)));
  }
  const g = new THREE.LatheGeometry(pts, 28);
  g.rotateZ(-Math.PI / 2);
  return g;
}

function Fibre({ quante, origine, lunghezza, spessore = 0.004, colori, seme = 1, distribuisci, oscilla = 0, piega = 0.06 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    // fibra sottile che si affusola e si piega leggermente
    const g = new THREE.CylinderGeometry(spessore * 0.25, spessore, 1, 4, 10, true);
    g.translate(0, 0.5, 0);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      pos.setX(i, pos.getX(i) + y * y * piega);
    }
    g.computeVertexNormals();
    return g;
  }, [spessore, piega]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.75, side: THREE.DoubleSide }), []);
  const dati = useMemo(() => {
    const rnd = casuale(seme);
    return Array.from({ length: quante }, (_, i) => distribuisci(i, rnd));
  }, [quante, seme, distribuisci]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    const su = new THREE.Vector3(0, 1, 0);
    const giro = new THREE.Quaternion();
    dati.forEach((d, i) => {
      q.setFromUnitVectors(su, d.dir.clone().normalize());
      giro.setFromAxisAngle(su, (i * 2.399) % 6.283);
      q.multiply(giro);
      m.compose(d.pos, q, new THREE.Vector3(1, d.len ?? lunghezza, 1));
      ref.current.setMatrixAt(i, m);
      c.set(colori[d.c ?? 0]);
      c.offsetHSL(0, 0, (d.v ?? 0) * 0.08);
      ref.current.setColorAt(i, c);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [dati, colori, lunghezza]);
  useFrame(({ clock }) => {
    if (oscilla && ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.6) * oscilla;
  });
  return <instancedMesh ref={ref} args={[geo, mat, quante]} position={origine} />;
}

function Testina({ tipo, x }) {
  if (!tipo) return null;
  return (
    <mesh position={[x, 0, 0]}>
      <sphereGeometry args={[0.078, 32, 24]} />
      <meshPhysicalMaterial color={METALLI[tipo]} metalness={tipo === 'nero' ? 0.5 : 1} roughness={0.18} clearcoat={1} />
    </mesh>
  );
}

export function Ninfa({ v }) {
  const corpo = useMemo(() => corpoGeo(-0.34, 0.14, 0.03, 0.068, v.segmenti || 6, 0.7), [v.segmenti]);
  const torace = useMemo(() => corpoGeo(0.1, 0.44, 0.07, 0.092, 0, 0.5), []);
  const bx = v.bead ? 0.5 : 0.47;
  const mCorpo = <meshPhysicalMaterial color={v.corpo} roughness={v.liscio ? 0.15 : 0.85} clearcoat={v.liscio ? 1 : 0} sheen={v.liscio ? 0 : 0.6} sheenColor={v.corpo} />;
  const anelli = useMemo(() => Array.from({ length: v.segmenti || 6 }, (_, i) => -0.3 + (i / (v.segmenti || 6)) * 0.42), [v.segmenti]);
  const pelo = useMemo(
    () => (i, rnd) => {
      const a = rnd() * Math.PI * 2;
      const x = 0.12 + rnd() * 0.3;
      return { pos: new THREE.Vector3(x, Math.cos(a) * 0.07, Math.sin(a) * 0.07), dir: new THREE.Vector3(-0.4 - rnd() * 0.4, Math.cos(a), Math.sin(a)), len: 0.05 + rnd() * 0.07, c: 0, v: rnd() - 0.5 };
    },
    [],
  );
  const zampe = useMemo(
    () => (i, rnd) => {
      const lato = i % 2 ? 1 : -1;
      return { pos: new THREE.Vector3(0.36 - Math.floor(i / 2) * 0.09, -0.05, lato * 0.05), dir: new THREE.Vector3(-0.9, -0.55, lato * 0.55), len: 0.17 + rnd() * 0.04, c: 0 };
    },
    [],
  );
  const coda = useMemo(
    () => (i, rnd) => ({ pos: new THREE.Vector3(-0.33, 0, 0), dir: new THREE.Vector3(-1, 0.05 + (rnd() - 0.5) * 0.15, (i - 1) * 0.28), len: 0.2 + rnd() * 0.05, c: 0 }),
    [],
  );
  return (
    <group>
      <Amo />
      <mesh geometry={corpo}>{mCorpo}</mesh>
      {anelli.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.032 + (i / anelli.length) * 0.036, 0.006, 6, 24]} />
          <meshStandardMaterial color={v.filo} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh geometry={torace}>
        <meshPhysicalMaterial color={v.torace} roughness={v.liscio ? 0.2 : 0.9} clearcoat={v.liscio ? 1 : 0} sheen={0.5} sheenColor={v.torace} />
      </mesh>
      <mesh position={[0.27, 0.05, 0]} scale={[0.17, 0.05, 0.075]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color={v.sacca} roughness={0.35} clearcoat={0.7} />
      </mesh>
      <Testina tipo={v.bead} x={bx} />
      {v.coda && <Fibre quante={3} origine={[0, 0, 0]} lunghezza={0.22} spessore={0.006} colori={[v.coda]} distribuisci={coda} seme={3} />}
      {v.zampe && <Fibre quante={6} origine={[0, 0, 0]} lunghezza={0.18} spessore={0.007} colori={[v.zampe]} distribuisci={zampe} seme={4} />}
      {v.peloso && <Fibre quante={90} origine={[0, 0, 0]} lunghezza={0.08} spessore={0.004} colori={[v.corpo, v.torace]} distribuisci={pelo} seme={5} />}
    </group>
  );
}

export function Streamer({ v }) {
  const corpo = useMemo(() => corpoGeo(-0.32, 0.44, 0.04, 0.05, 10, 0.5), []);
  const colori = v.ala;
  const ala = useMemo(
    () => (i, rnd) => {
      const strato = Math.floor((i / 260) * colori.length);
      const k = strato / Math.max(1, colori.length - 1);
      return {
        pos: new THREE.Vector3(0.38 - rnd() * 0.08, 0.02 + k * 0.05 + rnd() * 0.02, (rnd() - 0.5) * 0.06),
        dir: new THREE.Vector3(-1, 0.1 + k * 0.14 + (rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.2),
        len: 1.0 + rnd() * 0.4 - k * 0.12,
        c: strato,
        v: rnd() - 0.5,
      };
    },
    [colori.length],
  );
  const palmer = useMemo(
    () => (i, rnd) => {
      const a = rnd() * Math.PI * 2;
      const x = -0.3 + (i / 60) * 0.7;
      return { pos: new THREE.Vector3(x, Math.cos(a) * 0.05, Math.sin(a) * 0.05), dir: new THREE.Vector3(-0.6, Math.cos(a), Math.sin(a)), len: 0.1 + rnd() * 0.04, c: 0, v: rnd() - 0.5 };
    },
    [],
  );
  const muddler = useMemo(() => {
    const g = new THREE.SphereGeometry(0.12, 28, 20);
    const pos = g.attributes.position;
    const rnd = casuale(9);
    for (let i = 0; i < pos.count; i++) {
      const f = 1 + (rnd() - 0.5) * 0.18;
      pos.setXYZ(i, pos.getX(i) * f * 0.8, pos.getY(i) * f, pos.getZ(i) * f);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <Amo lungo={1.25} />
      <mesh geometry={corpo}>
        <meshPhysicalMaterial color={v.tinsel} metalness={1} roughness={0.25} clearcoat={0.5} />
      </mesh>
      <mesh geometry={corpo} scale={[1, 0.82, 0.82]}>
        <meshStandardMaterial color={v.corpo} roughness={0.7} transparent opacity={0.55} />
      </mesh>
      <Fibre quante={260} origine={[0, 0, 0]} lunghezza={1.2} spessore={0.0042} colori={colori} distribuisci={ala} seme={7} oscilla={0.05} piega={0.13} />
      {v.palmer && <Fibre quante={60} origine={[0, 0, 0]} lunghezza={0.12} spessore={0.005} colori={[v.palmer]} distribuisci={palmer} seme={8} />}
      {v.muddler && (
        <mesh geometry={muddler} position={[0.5, 0.01, 0]}>
          <meshStandardMaterial color={v.ala[0]} roughness={1} />
        </mesh>
      )}
      <Testina tipo={v.bead} x={0.56} />
      {v.occhi &&
        [-1, 1].map((s) => (
          <group key={s} position={[v.muddler ? 0.58 : 0.5, 0.03, s * (v.muddler ? 0.09 : 0.06)]}>
            <mesh>
              <sphereGeometry args={[0.04, 20, 14]} />
              <meshPhysicalMaterial color="#e8e23a" roughness={0.3} clearcoat={1} />
            </mesh>
            <mesh position={[0, 0, s * 0.03]}>
              <sphereGeometry args={[0.02, 16, 12]} />
              <meshPhysicalMaterial color="#0c0c0c" roughness={0.2} clearcoat={1} />
            </mesh>
          </group>
        ))}
    </group>
  );
}
