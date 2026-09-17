/**
 * Iconos compartidos por varias pantallas.
 *
 * Los que solo usa un componente viven dentro de él; aquí llegan los que se
 * repiten, y su razón de estar juntos es que un mismo concepto se dibuje
 * siempre igual: la casa es volver al inicio en todas partes, la copa es la
 * clasificación en todas partes. Un icono que cambia de significado entre
 * pantallas confunde más que no poner ninguno.
 */

interface IconProps {
  size?: number;
}

function Icon({ size = 18, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Casa: volver al inicio. */
export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </Icon>
  );
}

/** Triángulo: empezar o continuar una partida. */
export function PlayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4.5v15l12-7.5z" />
    </Icon>
  );
}

/** Flecha en círculo: repetir lo ya jugado. */
export function ReplayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12a9 9 0 1 0 2.6-6.4" />
      <polyline points="3 3 3 8 8 8" />
    </Icon>
  );
}

/** Copa: la clasificación. */
export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 3h8v5a4 4 0 0 1-8 0z" />
      <path d="M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3" />
      <path d="M12 12v4" />
      <path d="M9 21h6l-.5-3h-5z" />
    </Icon>
  );
}

/** Cronómetro: el tiempo, y mejorarlo. */
export function StopwatchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 10v3.5l2 1.5" />
      <path d="M9.5 2h5" />
    </Icon>
  );
}

/** Candado: el reto aún no está abierto. */
export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}
