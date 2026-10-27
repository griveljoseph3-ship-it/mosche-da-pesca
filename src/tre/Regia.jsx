import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { paletteGiorno, U } from './ambiente.js';
import { statoFiume } from './statoFiume.js';
import { centroFiume as c } from './terreno.js';

// Percorso della telecamera: dall'alba sopra l'acqua fino alla corrente profonda.
// [avanzamento, posizione, punto guardato]
const TAPPE_CAMERA = [
  [0.0, [c(4.2), 0.62, 4.2], [c(-6), 0.1, -6]],
  [0.25, [c(0.8) + 0.8, 0.3, 0.8], [c(-4) - 0.3, 0.0, -4.5]],
  [0.37, [c(-3.6) + 0.2, 0.06, -3.6], [c(-9), -0.45, -9]],
  [0.5, [c(-8.2), -0.6, -8.2], [c(-13.5), -0.85, -13.5]],
  [0.74, [c(-16.6) - 0.4, -1.5, -16.6], [c(-21) + 0.3, -2.05, -21]],
  [1.0, [c(-24.2), -1.15, -24.2], [c(-31), -1.3, -31]],
];

const curvaPos = new THREE.CatmullRomCurve3(TAPPE_CAMERA.map((t) => new THREE.Vector3(...t[1])), false, 'centripetal');
const curvaGuardo = new THREE.CatmullRomCurve3(TAPPE_CAMERA.map((t) => new THREE.Vector3(...t[2])), false, 'centripetal');

function parametro(p) {
  const n = TAPPE_CAMERA.length;
  for (let i = 0; i < n - 1; i++) {
    const a = TAPPE_CAMERA[i][0];
    const b = TAPPE_CAMERA[i + 1][0];
    if (p <= b) {
      const u = (p - a) / (b - a);
      const s = u * u * (3 - 2 * u);
      return (i + s * 0.85 + u * 0.15) / (n - 1);
    }
  }
  return 1;
}

const VELOCITA = typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('velocita')) || 1 : 1;
const colAcquaSopra = new THREE.Color('#2a6458');
const colAcquaSotto = new THREE.Color('#174640');
const colAcquaTramonto = new THREE.Color('#2a3a2e');

export default function Regia({ qualita }) {
  const { camera, scene, gl } = useThree();
  const stato = useMemo(
    () => ({
      zenit: new THREE.Color(), mezzo: new THREE.Color(), orizzonte: new THREE.Color(), monti: new THREE.Color(),
      sole: new THREE.Color(), nebbia: new THREE.Color(), amb: new THREE.Color(), dir: new THREE.Vector3(), soleInt: 1,
    }),
    [],
  );
  const luce = useRef();
  const emi = useRef();
  const mouse = useRef(new THREE.Vector2());
  const pos = useMemo(() => new THREE.Vector3(), []);
  const guardo = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  if (!scene.fog) scene.fog = new THREE.FogExp2('#c7b5a6', 0.03);

  useFrame((st, dt) => {
    const d = Math.min(dt, 0.1) * VELOCITA;
    U.uTempo.value += d;
    const t = U.uTempo.value;
    statoFiume.pLiscio = THREE.MathUtils.damp(statoFiume.pLiscio, statoFiume.p, 2.6, d);
    const p = statoFiume.pLiscio;

    // telecamera
    const k = parametro(p);
    curvaPos.getPoint(k, pos);
    curvaGuardo.getPoint(k, guardo);
    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, statoFiume.mouseX, 2, d);
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, statoFiume.mouseY, 2, d);
    pos.x += mouse.current.x * 0.22;
    pos.y += -mouse.current.y * 0.08 + Math.sin(t * 0.6) * 0.012;
    guardo.x += mouse.current.x * 0.35;
    camera.position.copy(pos);
    camera.lookAt(guardo);
    if (pos.y < 0) camera.rotateZ(Math.sin(t * 0.4) * 0.008);

    // luce del giorno: alba -> tramonto
    const sottoPrima = THREE.MathUtils.smoothstep(-pos.y, -0.02, 0.18);
    paletteGiorno(p, stato);
    U.uZenit.value.copy(stato.zenit);
    U.uMezzo.value.copy(stato.mezzo);
    U.uOrizzonte.value.copy(stato.orizzonte);
    U.uMonti.value.copy(stato.monti);
    U.uSole.value.copy(stato.dir);
    U.uColoreSole.value.copy(stato.sole).multiplyScalar(stato.soleInt);
    U.uAmbiente.value.copy(stato.amb).multiplyScalar(0.9 + sottoPrima * 0.5);
    U.uLuceCaustiche.value.copy(stato.sole).multiplyScalar(1.4);

    const sotto = THREE.MathUtils.smoothstep(-pos.y, -0.02, 0.18);
    U.uSottacqua.value = sotto;
    const acqua = tmp.copy(colAcquaSopra).lerp(colAcquaSotto, THREE.MathUtils.clamp((-pos.y - 0.5) / 1.2, 0, 1)).lerp(colAcquaTramonto, p * 0.6);
    U.uAcquaProfonda.value.copy(colAcquaSotto).lerp(colAcquaTramonto, p * 0.5);
    U.uNebbia.value.copy(stato.nebbia).lerp(acqua, sotto);
    const densAria = THREE.MathUtils.lerp(0.036, 0.024, THREE.MathUtils.smoothstep(p, 0, 0.3));
    U.uDensita.value = THREE.MathUtils.lerp(densAria, 0.135, sotto);
    scene.fog.color.copy(U.uNebbia.value);
    scene.fog.density = U.uDensita.value;

    if (luce.current) {
      luce.current.position.copy(stato.dir).multiplyScalar(30).add(pos);
      luce.current.target.position.copy(pos);
      luce.current.target.updateMatrixWorld();
      luce.current.color.copy(stato.sole);
      luce.current.intensity = stato.soleInt * (1 - sotto * 0.55);
    }
    if (emi.current) {
      emi.current.color.copy(stato.zenit).lerp(stato.mezzo, 0.5);
      emi.current.groundColor.copy(stato.amb).multiplyScalar(0.4);
      emi.current.intensity = 0.9;
    }
    scene.environmentIntensity = THREE.MathUtils.lerp(0.75, 0.45, sotto);
    gl.toneMappingExposure = THREE.MathUtils.lerp(0.92, 1.25, sotto);
  });

  return (
    <>
      <directionalLight ref={luce} intensity={2.4} />
      <hemisphereLight ref={emi} intensity={0.9} />
    </>
  );
}
