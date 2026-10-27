import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import MoscaGLB from './MoscaGLB.jsx';
import { U } from './ambiente.js';
import { centroFiume } from './terreno.js';
import { perSlug } from '../data/catalogo.js';

const SCALA = 0.12;

// La mosca dell'apertura: scende piano, si posa e lascia cerchi che si allargano. Poi va con la corrente.
function MoscaCadente({ slot = 0, x0, z0, ritardo = 1.2, durata = 4.4, variante, statica, scala = SCALA }) {
  const ref = useRef();
  const st = useRef({ t0: null, posata: false, z: z0, prossima: 0 });
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = U.uTempo.value;
    const s = st.current;
    if (s.t0 === null) s.t0 = t + ritardo;
    const x = centroFiume(s.z) + x0;
    const u = statica ? 1 : Math.min(1, Math.max(0, (t - s.t0) / durata));
    if (u < 1) {
      const e = 1 - Math.pow(1 - u, 3);
      g.position.set(x + Math.sin(u * 5.0) * 0.06 * (1 - e), THREE.MathUtils.lerp(1.6, 0.012, e), s.z + Math.cos(u * 4.0) * 0.05 * (1 - e));
      g.rotation.set(Math.sin(t * 2.1) * 0.12 * (1 - e), 0.9 + Math.sin(u * 3.0) * 0.4 * (1 - e), Math.sin(t * 1.7) * 0.1 * (1 - e));
      g.visible = u > 0;
      return;
    }
    if (!s.posata) {
      s.posata = true;
      U.uIncrespature.value[slot].set(x, s.z, statica ? t - 1.5 : t, 1);
      s.prossima = t + 3 + Math.random() * 2;
    }
    // deriva con la corrente, leggero dondolio
    s.z -= 0.035 / 60;
    if (s.z < z0 - 7) s.z = z0;
    g.visible = true;
    g.position.set(x, 0.012 * scala / SCALA + Math.sin(t * 2.3 + slot) * 0.004, s.z);
    g.rotation.set(Math.sin(t * 1.3 + slot) * 0.05, 0.9 + Math.sin(t * 0.4 + slot) * 0.15, Math.sin(t * 1.9) * 0.04);
    if (t > s.prossima) {
      U.uIncrespature.value[slot].set(x, s.z, t, 0.35);
      s.prossima = t + 4 + Math.random() * 3;
    }
  });
  return (
    <group ref={ref} visible={false}>
      <MoscaGLB v={perSlug[variante].v3d} scale={scala} envIntensity={1.2} />
    </group>
  );
}

export default function MoscheGalleggianti({ qualita }) {
  return (
    <group>
      <MoscaCadente slot={0} x0={0.55} z0={1.6} variante="adams-classica" scala={0.26} />
      <MoscaCadente slot={1} x0={-0.55} z0={-1.2} ritardo={6} durata={3.5} variante="royal-wulff" statica />
      {qualita === 'pieno' && <MoscaCadente slot={2} x0={1.1} z0={-2.6} ritardo={9} durata={3.5} variante="klinkhammer-special" statica />}
      <MoscaCadente slot={3} x0={0.15} z0={-0.1} ritardo={14} durata={3.5} variante="elk-hair-caddis" statica />
    </group>
  );
}
