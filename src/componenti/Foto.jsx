import immagini from '../data/immagini.json';
import { url } from '../lib/qualita.js';

// <picture> con AVIF e WebP in più misure, dimensioni esplicite (niente salti di layout) e anteprima sfocata.
export default function Foto({ nome, alt, sizes = '100vw', className = '', priorita = false, style, posizione, ...resto }) {
  const m = immagini[nome];
  if (!m) return <div className={`foto foto-mancante ${className}`} role="img" aria-label={alt} />;
  const src = (w, ext) => url(`img/${nome}-${w}.${ext}`);
  const set = (ext) => m.sizes.map((w) => `${src(w, ext)} ${w}w`).join(', ');
  const media = m.sizes.includes(960) ? 960 : m.sizes[m.sizes.length - 1];
  return (
    <picture className={`foto ${className}`} style={{ backgroundImage: `url(${m.lqip})`, backgroundColor: m.colore, ...style }}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={src(media, 'webp')}
        alt={alt}
        width={m.w}
        height={m.h}
        loading={priorita ? 'eager' : 'lazy'}
        fetchPriority={priorita ? 'high' : undefined}
        decoding={priorita ? 'sync' : 'async'}
        style={posizione ? { objectPosition: posizione } : undefined}
        {...resto}
      />
    </picture>
  );
}

export const infoFoto = (nome) => immagini[nome];
