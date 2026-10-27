import { useEffect, useRef } from 'react';

let osservatore;
function getOsservatore() {
  if (!osservatore && typeof IntersectionObserver !== 'undefined') {
    osservatore = new IntersectionObserver(
      (voci) => voci.forEach((v) => {
        if (v.isIntersecting) {
          v.target.classList.add('visibile');
          osservatore.unobserve(v.target);
        }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
  }
  return osservatore;
}

// Fa comparire il contenuto con una salita lenta quando entra nello schermo.
export default function Rivela({ as: Tag = 'div', ritardo = 0, className = '', children, ...p }) {
  const ref = useRef(null);
  useEffect(() => {
    const o = getOsservatore();
    if (!o) return ref.current?.classList.add('visibile');
    o.observe(ref.current);
    return () => ref.current && o.unobserve(ref.current);
  }, []);
  return (
    <Tag ref={ref} className={`rivela ${ritardo ? `rivela-ritardo-${ritardo}` : ''} ${className}`} {...p}>
      {children}
    </Tag>
  );
}
