import { useMemo } from 'react';
import * as THREE from 'three';
import { U, NEBBIA } from './ambiente.js';
import { FIUME, RUMORE } from './glsl.js';
import { CIELO_GLSL } from './Cielo.jsx';

// Acqua del torrente: corrente che scorre, riflessi del cielo e degli alberi, scintillio del sole,
// schiuma attorno ai sassi e lungo le rive, cerchi quando la mosca si posa. Da sotto: finestra di Snell.
export default function Acqua({ qualita }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: U,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        defines: { STRATI: qualita === 'pieno' ? 4 : 3 },
        vertexShader: /* glsl */ `
          varying vec3 vMondo;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vMondo = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTempo, uDensita, uSottacqua;
          uniform vec3 uSole, uColoreSole, uZenit, uMezzo, uOrizzonte, uMonti, uNebbia, uAmbiente;
          uniform vec3 uAcquaProfonda, uAcquaChiara;
          uniform vec4 uIncrespature[4];
          uniform vec4 uRocce[12];
          varying vec3 vMondo;
          ${RUMORE}
          ${FIUME}
          ${CIELO_GLSL}
          ${NEBBIA}

          vec3 riflessoMondo(vec3 R) {
            vec3 col = coloreCielo(R, false);
            float az = atan(R.x, -R.z);
            // profilo degli abeti riflessi: punte irregolari, più alti ai lati
            float lato = abs(sin(az));
            float punte = abs(fract(az * 9.0 + fbm(vec2(az * 3.0, 2.0)) * 2.0) - 0.5) * 2.0;
            float linea = 0.05 + lato * 0.22 + fbm(vec2(az * 5.0, 0.5)) * 0.1 - punte * 0.045;
            vec3 alberi = mix(vec3(0.012, 0.022, 0.016), uNebbia * 0.55, 0.25 + 0.35 * (1.0 - lato));
            col = mix(col, alberi, smoothstep(linea + 0.02, linea - 0.02, R.y));
            return col;
          }

          void main() {
            vec2 p = vMondo.xz;
            float dist = distance(vMondo, cameraPosition);
            float c = centroFiume(p.y);
            float d = abs(p.x - c);
            float veloc = mix(0.85, 0.25, smoothstep(0.0, MEZZA_LARGHEZZA, d));
            // scorrimento uniforme (niente deformazione nel tempo); la corrente più forte al centro rende l'acqua più mossa
            float vs = 0.6;
            float mosso = mix(0.65, 1.2, veloc);
            float t = uTempo;

            // normali dalla somma di strati di rumore che scorrono a valle (verso -z)
            vec2 g = vec2(0.0);
            vec3 n1 = vnoised(vec2(p.x * 0.55, (p.y + t * vs * 1.1) * 1.25));
            g += n1.yz * vec2(0.55, 1.25) * 0.1;
            vec3 n2 = vnoised(vec2(p.x * 1.9 + 3.1, (p.y + t * vs * 1.5) * 2.6));
            g += n2.yz * vec2(1.9, 2.6) * 0.15;
            // filoni di corrente allungati nel verso del flusso
            vec3 nf = vnoised(vec2(p.x * 3.2 + 1.3, (p.y + t * vs * 1.3) * 0.7));
            g += nf.yz * vec2(3.2, 0.7) * 0.05;
            vec3 n3 = vnoised(vec2(p.x * 4.8 - 7.0, (p.y + t * vs * 1.9) * 5.6) + vec2(t * 0.08, 0.0));
            g += n3.yz * vec2(4.8, 5.6) * 0.045;
            #if STRATI > 3
            vec3 n4 = vnoised(vec2(p.x * 11.0, (p.y + t * vs * 2.4) * 12.0) - vec2(t * 0.2, 0.0));
            g += n4.yz * vec2(11.0, 12.0) * 0.016;
            #endif

            // cerchi delle mosche che si posano
            float anello = 0.0;
            for (int i = 0; i < 4; i++) {
              vec4 r = uIncrespature[i];
              float eta = t - r.z;
              if (eta > 0.0 && eta < 7.0) {
                vec2 dv = p - r.xy;
                dv.y += eta * 0.12;
                float rr = length(dv) + 1e-4;
                float fase = rr - eta * 0.32;
                float inv = exp(-fase * fase * 30.0) * exp(-eta * 0.7) * r.w * smoothstep(1.6, 0.2, rr);
                float onda = cos(fase * 46.0) * inv;
                g += (dv / rr) * onda * 0.42;
                anello += sin(fase * 46.0) * inv;
              }
            }

            g *= mosso;
            float att = 1.0 / (1.0 + dist * 0.07);
            vec3 Vt = normalize(cameraPosition - vMondo);
            att *= mix(0.45, 1.0, smoothstep(0.02, 0.35, abs(Vt.y)));
            vec3 N = normalize(vec3(-g.x * att, 1.0, -g.y * att));

            // schiuma attorno ai sassi e nella scia
            float sch = 0.0;
            for (int i = 0; i < 12; i++) {
              vec4 r = uRocce[i];
              if (r.z <= 0.0) continue;
              vec2 dv = p - r.xy;
              float dr = length(dv) - r.z;
              sch += (1.0 - smoothstep(0.0, 0.32, dr)) * r.w;
              float dz = r.y - p.y;
              if (dz > 0.0) {
                float lat = abs(dv.x) / (r.z * (0.9 + dz * 0.16));
                sch += (1.0 - smoothstep(0.3, 1.0, lat)) * exp(-dz * 0.5) * r.w * 0.9;
              }
            }
            float striature = fbm(vec2(p.x * 5.5, (p.y + t * vs * 1.2) * 1.4));
            float bordo = smoothstep(MEZZA_LARGHEZZA - 0.7, MEZZA_LARGHEZZA + 0.15, d);
            float schiuma = smoothstep(0.5, 0.95, (sch + bordo * 0.22) * (0.35 + striature * 1.1));
            schiuma *= smoothstep(40.0, 8.0, dist);

            vec3 col;
            float alpha;
            if (gl_FrontFacing) {
              vec3 V = normalize(cameraPosition - vMondo);
              float nv = max(dot(N, V), 0.0);
              float fres = 0.02 + 0.98 * pow(1.0 - nv, 5.0);
              vec3 R = reflect(-V, N);
              R.y = abs(R.y);
              vec3 rifl = riflessoMondo(R) * 0.82;
              float s = max(dot(R, uSole), 0.0);
              vec3 spec = uColoreSole * (pow(s, 900.0) * 18.0 + pow(s, 120.0) * 1.4 + pow(s, 18.0) * 0.12);
              vec3 tras = mix(uAcquaChiara, uAcquaProfonda, smoothstep(0.0, 1.0, 1.0 - nv)) * (uAmbiente * 0.6 + uColoreSole * 0.15);
              col = mix(tras, rifl, fres) + spec * (1.0 - schiuma);
              col += uColoreSole * max(anello, 0.0) * 0.12;
              alpha = clamp(0.3 + fres * 1.05 + smoothstep(5.0, 30.0, dist) * 0.55, 0.0, 1.0);
              alpha *= mix(1.0, 0.55, bordo);
              vec3 luceSch = uAmbiente * 0.85 + uColoreSole * 0.32;
              col = mix(col, luceSch, schiuma * 0.92);
              alpha = max(alpha, schiuma * 0.95);
            } else {
              // da sotto: cielo nella finestra di Snell, riflesso totale fuori
              vec3 I = normalize(vMondo - cameraPosition);
              vec3 Nd = vec3(N.x, -N.y, N.z);
              vec3 T = refract(I, Nd, 1.33);
              float fuori = length(T) < 0.01 ? 1.0 : 0.0;
              float bordoFin = smoothstep(0.45, 0.78, 1.0 - abs(I.y));
              vec3 cielo = coloreCielo(normalize(T + vec3(0.0, 0.001, 0.0)), false) * 0.75;
              float s = max(dot(normalize(T), uSole), 0.0);
              cielo += uColoreSole * pow(s, 30.0) * 0.8;
              // da sotto il cielo si vede tremolante e smorzato dall'acqua
              cielo = mix(cielo, uAcquaChiara * 2.2, 0.35 + 0.25 * striature);
              vec3 interno = uAcquaProfonda * 1.3 + uAcquaChiara * 0.15 * (0.5 + 0.5 * striature);
              col = mix(cielo, interno, max(fuori, bordoFin));
              col += vec3(1.0) * schiuma * 0.25;
              alpha = 1.0;
            }
            col = applicaNebbia(col, dist);
            gl_FragColor = vec4(col, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [qualita],
  );

  return (
    <mesh rotation-x={-Math.PI / 2} position={[-2, 0, -48]} material={mat} renderOrder={5}>
      <planeGeometry args={[56, 140, 1, 1]} />
    </mesh>
  );
}
