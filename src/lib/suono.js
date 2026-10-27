// Suono del torrente generato al momento con Web Audio (nessun file audio).
// Rumore "marrone" filtrato su più bande che respirano lentamente + piccole gocce.
let ctx = null;
let master = null;
let filtro = null;
let timerGocce = null;
let attivo = false;
const ascoltatori = new Set();

function rumoreMarrone(c, secondi = 4) {
  const n = c.sampleRate * secondi;
  const buf = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let ultimo = 0;
    for (let i = 0; i < n; i++) {
      const b = Math.random() * 2 - 1;
      ultimo = (ultimo + 0.02 * b) / 1.02;
      d[i] = ultimo * 3.2;
    }
  }
  return buf;
}

function costruisci() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0;
  filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 7000;
  filtro.connect(master);
  master.connect(ctx.destination);

  const buf = rumoreMarrone(ctx);
  [
    [260, 0.9, 0.55],
    [700, 1.1, 0.35],
    [1800, 1.4, 0.16],
    [4200, 2, 0.05],
  ].forEach(([f, q, g], i) => {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.playbackRate.value = 1 + i * 0.07;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = g;
    // respiro lento della corrente
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07 + i * 0.053;
    const lfoG = ctx.createGain();
    lfoG.gain.value = g * 0.45;
    lfo.connect(lfoG).connect(gain.gain);
    src.connect(bp).connect(gain).connect(filtro);
    src.start(ctx.currentTime + Math.random());
    lfo.start();
  });
}

function goccia() {
  if (!ctx || !attivo) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const f0 = 900 + Math.random() * 1400;
  o.type = 'sine';
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f0 * 2.2, t + 0.07);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.025 + Math.random() * 0.02, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (pan) pan.pan.value = Math.random() * 1.6 - 0.8;
  o.connect(g);
  (pan ? g.connect(pan) : g).connect(filtro);
  o.start(t);
  o.stop(t + 0.15);
  timerGocce = setTimeout(goccia, 250 + Math.random() * 1600);
}

export async function attivaSuono(si) {
  if (si && !ctx) costruisci();
  if (!ctx) return;
  attivo = si;
  const t = ctx.currentTime;
  if (si) {
    await ctx.resume();
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.16, t + 2.5);
    clearTimeout(timerGocce);
    goccia();
  } else {
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.8);
    clearTimeout(timerGocce);
  }
  ascoltatori.forEach((f) => f(si));
}

// 0 = in superficie, 1 = sul fondo: il suono si fa ovattato
export function profondita(p) {
  if (!ctx || !filtro) return;
  const f = 7000 * Math.pow(1 - Math.min(1, Math.max(0, p)) * 0.93, 2) + 280;
  filtro.frequency.setTargetAtTime(f, ctx.currentTime, 0.25);
}

export const suonoAttivo = () => attivo;
export function suCambioSuono(f) {
  ascoltatori.add(f);
  return () => ascoltatori.delete(f);
}
