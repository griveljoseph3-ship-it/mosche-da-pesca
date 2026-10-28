const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Freccia = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const FrecciaGiu = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M12 4v15M6 13l6 6 6-6" /></svg>
);
export const Indietro = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M20 12H5M11 6l-6 6 6 6" /></svg>
);
export const Borsa = ({ size = 22, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}>
    <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </svg>
);
export const Chiudi = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const Menu = ({ size = 22, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M4 9h16M4 15h16" /></svg>
);
export const Piu = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const Meno = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M5 12h14" /></svg>
);
export const Filtri = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
);
export const Spunta = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const Cubo = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></svg>
);
export const Foto = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><rect x="3" y="5" width="18" height="14" rx="1.5" /><circle cx="12" cy="12" r="3.5" /></svg>
);
export const Lente = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5M10.5 8v5M8 10.5h5" /></svg>
);
export const Altoparlante = ({ size = 18, attivo = false, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}>
    <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
    {attivo ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 5 5M21 9.5l-5 5" />}
  </svg>
);
export const Onda = ({ size = 18, attivo = false, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s} {...p}>
    {attivo ? (
      <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0 M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0 M2 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    ) : (
      <path d="M2 12h20" />
    )}
  </svg>
);

// Marchio: una piccola mosca secca stilizzata
export const Logo = ({ size = 28, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" {...p}>
    <path d="M9 22c0 6 4.5 10 10 10s8-3 8-7" />
    <path d="M27 25l-1.6-2.2" />
    <path d="M9 22h19" />
    <path d="M24 22 31 8M22 22l4-15" />
    <path d="M25 18c-3-1-7-1-9 0M26 15c-3-1.2-6.5-1.4-9-.4" opacity=".7" />
    <path d="M9 22 3 19.5M9 22l-6 0.5" />
    <circle cx="29" cy="22" r="1.4" />
  </svg>
);
