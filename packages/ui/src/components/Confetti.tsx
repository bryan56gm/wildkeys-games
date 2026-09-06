import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './Confetti.module.css';

export interface ConfettiProps {
  /** Número de partículas; 90 es lo que pide el diseño. */
  pieces?: number;
  /** Semilla opcional para que los tests o el SSR den siempre lo mismo. */
  seed?: number;
}

interface Piece {
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly driftX: number;
  readonly rotation: number;
  readonly duration: number;
  readonly delay: number;
  readonly round: boolean;
  readonly colorIndex: number;
}

const COLOR_COUNT = 6;

/**
 * Lluvia de confeti de la pantalla de victoria. Puramente decorativa
 * (`aria-hidden`) y sin estado: se monta al ganar y se desmonta al salir.
 * Con `prefers-reduced-motion` no se anima (regla global de tokens).
 *
 * Se dibuja en el `body` mediante un portal, no donde se declara: cualquier
 * ancestro con `transform` —como la propia animación de entrada de la pantalla
 * de victoria— se convierte en el marco de referencia de `position: fixed`, y
 * el confeti caería dentro de esa tarjeta en vez de sobre toda la pantalla.
 */
export function Confetti({ pieces = 90, seed = 1 }: ConfettiProps) {
  const items = useMemo(() => buildPieces(pieces, seed), [pieces, seed]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.host} aria-hidden="true">
      {items.map((piece, index) => (
        <i
          key={index}
          className={`${styles.piece} wk-anim-fall`}
          data-color={piece.colorIndex}
          style={{
            left: `${piece.left}vw`,
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            borderRadius: piece.round ? 'var(--wk-radius-pill)' : '2px',
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            ['--wk-fall-x' as string]: `${piece.driftX}vw`,
            ['--wk-fall-rot' as string]: `${piece.rotation}deg`,
          }}
        />
      ))}
    </div>,
    document.body
  );
}

/** PRNG determinista (mulberry32): mismo `seed`, mismo confeti. */
function buildPieces(count: number, seed: number): readonly Piece[] {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return Array.from({ length: count }, (_, index) => {
    const size = 6 + random() * 7;
    return {
      left: Math.round(random() * 100),
      width: Math.round(size),
      height: Math.round(size * (random() > 0.5 ? 1 : 2)),
      driftX: Math.round(random() * 60 - 30),
      rotation: Math.round(random() * 1080 - 540),
      duration: Number((2.4 + random() * 2).toFixed(2)),
      delay: Number((random() * 0.8).toFixed(2)),
      round: random() > 0.6,
      colorIndex: index % COLOR_COUNT,
    };
  });
}
